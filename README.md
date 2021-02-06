# Guilds

## Overview

  Tired of not having anyone to play your favorite game with? Well, that's where Guilds comes in!
Guilds is a platform for gamers to create their own communities for their favorite games much like an actual guild in a game such as WoW.
Many games, such as Hearthstone, Genshin Impact, Fortnite, Among Us don't really have a system in place for players to build up a group of friends
to consistently play together and do cool stuff.
With Guilds, users can create their own accounts and keep track of the guilds that they are in for different games. Users can also create guilds of their
own for others to join. The idea is to have a list of games that users can create guilds for, and as more users join the site, they would be able to add
games that are not on the list to create a guild for. Initial goal is to implement at least a chat room for each guild group.


## Data Model

The application will store Users, Guilds, and Games, and Chat

* users can be in multiple guilds
* one guild can have multiple users
* each guild can only revolve around 1 game
* one game can have multiple guilds
* a user can create multiple guilds of different games
* a user can only create 1 guild per game (not implemented for final project)
* a guild can have many chat rooms
* a chat room can only belong to one guild

An Example User:

```javascript
{
  username: "gamerdude123",
  hash: // a password hash,
  status: //is the user online or not
  guilds: // an array of guild objects that the user is in and the date they joined
  ownGuilds: //an array of guilds that the user created
}
```

An Example Guild:

```javascript
{
  guildName: "WoW Raiders",
  game: "Wow",
  state: "private", //not in use for the final project
  description: "We raiding all day",
  imgUrl: img.png, //not in use for the final project
  memberLimit: 50, //not in use for the final project
  memberCount : 3,
  members: [
    { name:"player1", joinDate: //timestamp},
    { name: "player2", joinDate: //timestamp},
  ],
  admins: ["admin"]
  chatRooms: //array of chatrooms that belong to the guild
  createdAt: // timestamp //not in use for the final project
}
```

An Example Game:

```javascript
{
  game: "WoW",
  img: "image.com", //link image that will be shown on the landing page
  guilds: //array of guilds that are related to WoW
}
```

An Example Chat Room:

```javascript
{
  name: //chatroom name
  messages: //array of objects that contains user messages and timestamp
}
```

## [Link to Commented First Draft Schema](https://github.com/nyu-csci-ua-0480-034-fall-2020/Flydx1234-final-project/blob/master/db.js)

## Wireframes

/guilds - page that lists guilds

![list create](documentation/guilds.png)

/index - page showing all games

![list](documentation/index.png)


/login - page for user to login

![list](documentation/login.png)

/register - page for user to register

![list](documentation/register.png)

/user - page that lists the user's guilds and (allows them to change password/email if logged in - not implemented in final project)
![list](documentation/user.png)

/inguild - page shown if user is in the guild

![list](documentation/inguild.png)

/notinguild - page shown if user is not in the guild

![list](documentation/notinguild.png)

/createGuild - page shown when creating a guild

![list](documentation/createguild.png)

## Site map

![list](documentation/sitemap.png)

## User Stories or Use Cases

1. as non-registered user, I can register a new account with the site
2. as non-registered user, I can see the list of games and Guilds
3. as non-registered user, I can see other user's profiles (not implemented in final project)
4. as a user, I can log in to the site
5. as a user, I can create or join a guild
6. as a user, I can add a game to the overall list of games
7. as a guild member, I can see the guild members and chat in the chatroom
8. as a guild member, I can send messages to the chat in the chatroom


## [Link to Initial Main Project File](app.js)