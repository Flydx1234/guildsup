require('./db');

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

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
  res.render('index');
});

app.get('/inguild', (req, res) => {
  res.render('inguild');
});

app.post('/inguild', (req, res) => {
  res.render('inguild');
});

app.get('/guilds', (req, res) => {
  res.render('guilds');
});

app.get('/notinguild', (req, res) => {
  res.render('notinguild');
});
app.listen(3000);
