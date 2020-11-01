// 1ST DRAFT DATA MODEL
const mongoose = require('mongoose');

// users
// * our site requires authentication...
// * so users have a username and password
// * they also can have 0 or more guilds

const User = new mongoose.Schema({
  // username provided by authentication plugin
  // password hash provided by authentication plugin
  username: {type:String, required:true},
  hash: {type:String, required:true},// a password hash,
  guilds: [{}], // an array of objects for guilds that the user is in, and the date that they joined
  ownGuilds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Guild' }]}, //an array of guilds objects that the user created
  _id: true
});


// a guild for one specific game, contains many number of users not
// * exceedung the member limit
const Guild = new mongoose.Schema({
  name: {type: String, required: true},
  game: {type: String, required: true},
  state: {type: String, required: true}, //state of the guild, private or public potentially will just be public only to start
  memberLimit: {type: Number, required: true},
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GuildMember' }],
  chatRooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom' }],
  dateCreated: {type:Date,required:true}
  },
  _id: true
});


// a list of games, and guilds for that game
const Game = new mongoose.Schema({
  game: {type: String, required: true},
  guilds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Guild' }],
});

const ChatRoom = new mongoose.Schema({
  name: {type: String, required: true},
  messages: [{}] //an array of messages from users with timestamp
})
// TODO: add remainder of setup for slugs, connection, registering models, etc. below
