require('./db');

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const flash = require('connect-flash');
const axios = require('axios');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
require("./db");
const PORT = process.env.PORT || 3000;
let secret;
let captchaSecret;
const captchaUrl = "https://www.google.com/recaptcha/api/siteverify"
const mongoose = require("mongoose");
mongoose.set('useFindAndModify', false);
const User = mongoose.model("User");
const Guild = mongoose.model("Guild");
const Game = mongoose.model("Game");
const ChatRoom = mongoose.model("ChatRoom");
function hashFunc(val){
  return crypto.createHash('sha256').update(val).digest("hex");
}
//setup secret
if(process.env.NODE_ENV === 'PRODUCTION'){
  secret = process.env.SECRET;
  captchaSecret = process.env.CAPTCHA_SECRET;
}
else{
  const fs = require("fs");
  const path = require("path");
  const fn = path.join(__dirname,"config.json");
  const data = fs.readFileSync(fn);
  const conf = JSON.parse(data);
  secret = conf.secret;
  captchaSecret = conf.captchaSecret;
}





// enable sessions
const session = require('express-session');
const sessionOptions = {
    secret: secret,
    resave: true,
    saveUninitialized: true
};
app.use(session(sessionOptions));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// body parser setup
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

//flashing info for login
app.use(flash());

//passport options
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (hashFunc(password) !== user.hash) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

//middleware to add user to every template
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});

//error handling
app.use((err, req, res, next) => {
     console.log('congrats you hit the error middleware');
     console.log(err);
});

app.get('/', (req, res) => {
  const searchOptions = {};
  Game.find(searchOptions,(err,val)=>{
    if(err){
      throw err;
    }
    const context = {
      arr:val,
      user: req.user
    };
    res.render("index",context);
  });
});

//login, lougout and registration
app.get('/login',(req,res)=>{
  const flashMsg = {
    msg: req.flash("error")
  }
  res.render("login",flashMsg);
});

app.post('/login', passport.authenticate('local', {successRedirect: '/',
                                                   failureRedirect: '/login',
                                                   failureFlash: "Invalid Username or Password."}),
                                                   (req,res)=>{
    res.redirect("/");
});
app.get("/register",(req,res)=>{
  res.render("register");
});

app.post("/register",(req,res)=>{
  const captcha = req.body["g-recaptcha-response"];
  const name = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;
  const email = req.body.email;
  const error = {};
  if(password !== password2){
    error.msg = "Passwords not matching.";
    res.render("register",error);
  }
  else if(name === undefined || name.trim().length < 2){
    error.msg = "Error, Username must be at least 2 characters long.";
    res.render("register",error);
  }
  else if(password === undefined || password.trim().length < 6){
    error.msg = "Error, Password must be at least 6 characters long.";
    res.render("register",error);
  }
  else{
    axios.post(captchaUrl, undefined, {params: {
      secret: captchaSecret,
      response: captcha
      }
    })
    .then(cres => {
      if(cres.data.success){
          User.countDocuments({username:name},function(err,count){
            if(count > 0){
              error.msg= "Username already taken.";
              res.render("register",error);
            }
            else{
              const user = new User({
                username: req.body.username,
                hash: hashFunc(req.body.password),
                status: "online"
              });
              user.save(function(err){
                if(err){
                  throw err;
                }
                res.redirect("/");
              })
            }
          });
      }
      else{
        error.msg = "Failed Captcha Challenge";
        res.render("register",error);
      }
    })
    .catch(error => {
      console.error(error)
    });
  }
});

app.get("/logout",(req,res)=>{
  req.logout();
  res.redirect("/");
});


//guild stuff
app.get('/inguild', (req, res) => {
  if(!req.user){
    res.render("inguild");
  }
  else{
    const id = req.query.guild;
    Guild.findOne({_id: id}, function(err,guild){
        if (err) { return err; }
        const context = {
          guild: guild
        }
        console.log(guild);
        if(guild.members.includes(req.user.username) || guild.admins.includes(req.user.username)){
          res.render('inguild',context);
        }
        else{
          res.redirect('/notinguild?guild='+guild._id);
        }
      });
    }
});

app.post('/inguild', (req, res) => {
  res.render('inguild');
});

app.get('/notinguild', (req, res) => {
  const id = req.query.guild;
  Guild.findOne({_id: id}, function(err,guild){
    if(err){
      throw err;
    }
    const context = {
      guild: guild
    }
    res.render('notinguild',context);
  });
});

app.post('/notinguild',(req,res)=>{
  if(!req.user){
    res.render("/");
  }
  const id = req.body.guild;
  const memberCount = req.body.memberCount;
  Guild.findOneAndUpdate({_id: id},{$push : {members : req.user.username}, $set : {memberCount: Number(memberCount) + 1}}, { new: true }, function(err,updated){
    User.updateOne(
      {username:req.user.username},
      {$push: {guilds: updated}},
      function (err, raw) {
        if (err) throw err;
        res.redirect("/inguild?guild=" + id);
      }
    );
  });
});

app.get('/guilds', (req, res) => {
  const name = req.query.name;
  Game.findOne({game:name},(err,val)=>{
    if(err){
      throw err;
    }
    const info = {
      arr:[]
    }
    for(guildId of val.guilds){
      Guild.findOne({_id: mongoose.Types.ObjectId(guildId)}, (err,val1)=>{
        if(err){
          throw err;
        }
        info.arr.push(val1);
        if(info.arr.length === val.guilds.length){
          res.render('guilds',info);
        }
      });
    }
    if(val.guilds.length === 0){
      res.render('guilds',info);
    }
  });
});

app.get('/createGuild', (req,res)=>{
  Game.find({}, (err,val)=>{
    if(err){
      throw err;
    }
    const info = {
      games: val,
      msg: req.flash("error")
    }
    res.render("createGuild",info);
  });
});

app.post('/createGuild',(req,res)=>{
  if(!req.user){
    res.redirect("/");
  }
  else{
    const error ={};
    const name = req.body.name;
    if(name === undefined || name.trim().length < 2){
      req.flash("error","Guild name must be at least 2 characters long.");
      res.redirect("/createGuild");
    }
    else{
      Guild.countDocuments({name:name, game: req.body.game},function(err,count){
        if(count > 0){
          req.flash("error","Guild already exists.");
          res.redirect("/createGuild");
        }
        else{
          const d = new Date();
          const guild = new Guild({
            name: name,
            game: req.body.game,
            description: req.body.desc,
            state: "public",
            memberLimit: 50,
            memberCount: 1,
            dateCreated: d.getFullYear() + "/" +  d.getMonth() + "/" + d.getDate(),
            admins: [req.user.username]
          });
          guild.save(function(err){
            if(err){
              throw err;
            }
            Game.updateOne(
              {game:req.body.game},
              {$push: {guilds:  mongoose.Types.ObjectId(guild._id)}},
              function (err, raw) {
               if (err) throw err;
              }
            );
            User.updateOne(
              {username:req.user.username},
              {$push: {ownGuilds: guild}},
              function (err, raw) {
               if (err) throw err;
              }
            );
            res.redirect("/");
          });
        }
      });
    }
  }
});

app.get('/addGame',(req,res)=>{
  res.render('addGame');
});

app.post('/addGame',(req,res)=>{
  const name = req.body.name.trim().toLowerCase();
  const img = req.body.img.trim();
  if(name === undefined || name.length < 1){
    const err = {
      msg: "Invalid game name"
    }
    res.render("addGame",err);
  }
  else if(img === undefined || img.length < 1){
    const err = {
      msg: "Invalid img url"
    }
    res.render("addGame",err);
  }
  else{
    Game.find({game:name},(err,val)=>{
      if(err){
        throw err;
      }
      if(val.length <= 0){
        const entry = new Game({
          game: name,
          img: req.body.img
        });
        entry.save(function(err){
          if(err){
            throw err;
          }
          res.redirect("/");
        });
      }
    });
  }
});

app.get("/user",(req,res)=>{
  if(req.user){
    User.findOne({username:req.user.username}, (err,val)=>{
      if(err){
        throw err;
      }
      const info = {
        username: val.username,
        guilds: val.guilds,
        ownGuilds: val.ownGuilds
      }
      if(val.guilds.length > 0){
        val.guilds.forEach((guild,index)=>{
          Guild.findOne({_id:guild._id},(err,guild)=>{
            info.guilds[index].memberCount = guild.memberCount;
            if(index == info.guilds.length-1){
              res.render("user",info);
            }
          });
        });
      }
      else{
        res.render("user",info);
      }
    });
  }
  else{
    res.redirect("/");
  }
});

app.get("/chatroom",(req,res)=>{
  if(!req.user){
    res.redirect("/");
  }
  ChatRoom.findOne({_id:req.query.id},(err,room)=>{
    res.json(room);
  });
});

app.post("/chatroom",(req,res)=>{
  if(!req.user){
    res.redirect("/");
  }

});

app.post("/createRoom",(req,res)=>{
  if(!req.user){
    res.redirect("/");
  }
  const n = req.body.name;
  const guildId = req.body.guild;
  Guild.find({_id:guildId},function(err,found)=>{
    if(guild.members.includes(req.user.username) || guild.admins.includes(req.user.username)){
      ChatRoom.find({name:n},(err,val)=>{
        if(err){
          throw err;
        }
        if(val.length <= 0){
          const entry = new ChatRoom({
            name: n
          });
          entry.save(function(err){
            if(err){
              throw err;
            }
            console.log(entry);
            Guild.findOneAndUpdate({_id:guildId}, {$push : {chatRooms : entry}},function(err,updated){
              if(err){
                throw err;
              }
              res.json(entry);
            });
          });
        }
      });
    }
    else{
      res.redirect("/");
    }
  });
});

app.listen(PORT);
