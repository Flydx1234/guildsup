require('./db');

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
require("./db");
const PORT = process.env.PORT || 3000;
const mongoose = require("mongoose");
const User = mongoose.model("User");
const Guild = mongoose.model("Guild");
const Game = mongoose.model("Game");
const ChatRoom = mongoose.model("ChatRoom");

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

app.get('/', (req, res) => {
  const searchOptions = {};
  Game.find(searchOptions,(err,val)=>{
    if(err){
      throw err;
    }
    const context = {
      arr:val
    };
    res.render("index",context);
  });
});


app.get('/login',(req,res)=>{
  res.render("login");
});

app.post('/login',(req,res)=>{
  if(req.body.register === "Register"){
    res.redirect("/register");
  }
  else{
    res.redirect("/");
  }
});

app.get("/register",(req,res)=>{
  res.render("register");
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
