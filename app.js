require('./db');

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const flash = require('connect-flash');
const axios = require('axios')
const app = express();
require("./db");
const PORT = process.env.PORT || 3000;
let secret;
const captchaUrl = "https://www.google.com/recaptcha/api/siteverify"
const mongoose = require("mongoose");
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
}
else{
  const fs = require("fs");
  const path = require("path");
  const fn = path.join(__dirname,"config.json");
  const data = fs.readFileSync(fn);
  const conf = JSON.parse(data);
  secret = conf.secret;
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
  const error = {}
  axios.post(captchaUrl, {
    secret: '6LfSjuAZAAAAAC7AUH_5F5OZQWzwGxtNC1yitYAl',
    response: captcha
  })
  .then(cres => {
    if(cres.success){
      if(password !== password2){
        error.msg = "Passwords not matching.";
        res.render("register",error);
      }
      User.count({username:name},function(err,count){
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
});

app.get("/logout",(req,res)=>{
  req.logout();
  res.redirect("/");
});


//guild stuff
app.get('/inguild', (req, res) => {
  res.render('inguild');
});

app.post('/inguild', (req, res) => {
  res.render('inguild');
});

app.get('/notinguild', (req, res) => {
  res.render('notinguild');
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
      games: val
    }
    res.render("createGuild",info);
  });
});

app.post('/createGuild',(req,res)=>{
  if(!req.user){
    res.redirect("/");
  }
  else{
    const name = req.body.name;
    Guild.countDocuments({name:name, game: req.body.game},function(err,count){
      if(count > 0){
        const error ={};
        error.msg= "Guild already exists.";
        res.render("createGuild",error);
      }
      else{
        const d = new Date();
        const guild = new Guild({
          name: name,
          game: req.body.game,
          description: req.body.desc,
          state: "public",
          memberLimit: 50,
          dateCreated: d.getFullYear() + "/" +  d.getMonth() + "/" + d.getDate(),
          members: [req.user.username]
        });
        guild.save(function(err){
          if(err){
            throw err;
          }
          Game.update(
            {game:req.body.game},
            {$push: {guilds:  mongoose.Types.ObjectId(guild._id)}},
            function (err, raw) {
             if (err) return handleError(err);
            }
          );
          User.update(
            {username:req.user.username},
            {$push: {ownGuilds: guild}},
            function (err, raw) {
             if (err) return handleError(err);
            }
          );
          res.redirect("/");
        });
      }
    });
  }
});

app.get('/addGame',(req,res)=>{
  res.render('addGame');
});

app.post('/addGame',(req,res)=>{
  const name = req.body.name.trim().toLowerCase();
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
      res.render("user",info);
    });
  }
  else{
    res.redirect("/");
  }
});

app.listen(PORT);
