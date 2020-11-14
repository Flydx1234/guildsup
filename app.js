require('./db');

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const flash = require('connect-flash');
const app = express();
require("./db");
const PORT = process.env.PORT || 3000;
const mongoose = require("mongoose");
const User = mongoose.model("User");
const Guild = mongoose.model("Guild");
const Game = mongoose.model("Game");
const ChatRoom = mongoose.model("ChatRoom");
function hashFunc(val){
  return crypto.createHash('sha256').update(val).digest("hex");
}





// enable sessions
const session = require('express-session');
const sessionOptions = {
    secret: 'secret cookie thang (store this elsewhere!)',
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
  const name = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;
  const email = req.body.email;
  const error = {}
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
});

app.get("/logout",(req,res)=>{
  res.render("/");
});
app.get('/inguild', (req, res) => {
  res.render('inguild');
});

app.post('/inguild', (req, res) => {
  res.render('inguild');
});

app.get('/guilds', (req, res) => {
  const name = req.query.name;
  Game.find({game:name},(err,val)=>{
    if(err){
      throw err;
    }
    const guilds = {
      arr:val.guilds
    }
    res.render('guilds',guilds);
  });
});

app.get('/notinguild', (req, res) => {
  res.render('notinguild');
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


app.listen(PORT);
