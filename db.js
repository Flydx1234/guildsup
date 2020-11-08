// 1ST DRAFT DATA MODEL
const mongoose = require('mongoose');
let uri;

//envrionmental variables are on the heroku cli
if(process.env.NODE_ENV === 'PRODUCTION'){
  uri = process.env.MONGOD_URI;
}
else{
  const fs = require("fs");
  const path = require("path");
  const fn = path.join(__dirname,"config.json");
  const data = fs.readFileSync(fn);
  const conf = JSON.parse(data);
  uri = conf.uri
}
// users
// * our site requires authentication...
// * so users have a username and password
// * they also can have 0 or more guilds

const User = new mongoose.Schema({
  // username provided by authentication plugin
  // password hash provided by authentication plugin
  username: {type:String, required:true},
  hash: {type:String, required:true},// a password hash,
  status: {type:String, required:true},//online or offline
  guilds: [{}], // an array of objects for guilds that the user is in, and the date that they joined
  ownGuilds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Guild' }] //an array of guilds objects that the user created
  },{_id: true
},{collation: { locale: 'en', strength: 2 }});


// a guild for one specific game, contains many number of users not
// * exceedung the member limit
const Guild = new mongoose.Schema({
  name: {type: String, required: true},
  game: {type: String, required: true},
  state: {type: String, required: true}, //state of the guild, private or public, probably will just be public only to start
  memberLimit: {type: Number, required: true},
  description: String,
  imgUrl: String,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GuildMember' }],
  chatRooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom' }],
  dateCreated: {type:Date,required:true}
  },{_id: true
},{collation: { locale: 'en', strength: 2 }});


// a list of games, and guilds for that game
const Game = new mongoose.Schema({
  game: {type: String, required: true},
  img: {type:String, required:true},
  guilds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Guild' }],
});

const ChatRoom = new mongoose.Schema({
  name: {type: String, required: true},
  pinned:[{}], //pinned messages
  messages: [{}] //an array of messages from users with timestamp
},{collation: { locale: 'en', strength: 2 }})
// TODO: add remainder of setup for slugs, connection, registering models, etc. below

mongoose.model("User", User);
mongoose.model("Game", Game);
mongoose.model("Guild", Guild);
mongoose.model("ChatRoom", ChatRoom);

mongoose.connect(uri,function(err){
  if(err){
    throw err;
  }
});
