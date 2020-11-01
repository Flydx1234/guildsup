The content below is an example project proposal / requirements document. Replace the text below the lines marked "__TODO__" with details specific to your project. Remove the "TODO" lines.

(___TODO__: your project name_)

# Shoppy Shoperson

## Overview

(___TODO__: a brief one or two paragraph, high-level description of your project_)


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
* a user can create multiple guilds of different games
* a user can only create 1 guild per game
* a guild can only have many chat rooms
* a chat room can only belong to one guild

An Example User:

```javascript
{
  username: "gamerdude123",
  hash: // a password hash,
  guilds: // an array of guild objects that the user is in and the date they joined
  ownGuilds: //an array of guilds that the user created
}
```

An Example Guild:

```javascript
{
  guildName: "WoW Raiders",
  game: "Wow",
  state: "private",
  memberLimit: 50,
  members: [
    { name: "player1", joinDate: //timestamp},
    { name: "player2", joinDate: //timestamp},
  ],
  chatRooms: //array of chatrooms that belong to the guild
  createdAt: // timestamp
}
```

An Example Game:

```javascript
{
  game: "WoW",
  guilds: //array of guilds that are related to WoW
}

An Example Chat Room:

```javascript
{
  name: //chatroom name
  messages: //array of objects that contains user messages and timestamp
}


## [Link to Commented First Draft Schema](db.js)

(___TODO__: create a first draft of your Schemas in db.js and link to it_)

## Wireframes

(___TODO__: wireframes for all of the pages on your site; they can be as simple as photos of drawings or you can use a tool like Balsamiq, Omnigraffle, etc._)

/list/create - page for creating a new shopping list

![list create](documentation/list-create.png)

/list - page for showing all shopping lists

![list](documentation/list.png)

/list/slug - page for showing specific shopping list

![list](documentation/list-slug.png)

## Site map

(___TODO__: draw out a site map that shows how pages are related to each other_)

Here's a [complex example from wikipedia](https://upload.wikimedia.org/wikipedia/commons/2/20/Sitemap_google.jpg), but you can create one without the screenshots, drop shadows, etc. ... just names of pages and where they flow to.

## User Stories or Use Cases

(___TODO__: write out how your application will be used through [user stories](http://en.wikipedia.org/wiki/User_story#Format) and / or [use cases](https://www.mongodb.com/download-center?jmp=docs&_ga=1.47552679.1838903181.1489282706#previous)_)

1. as non-registered user, I can register a new account with the site
2. as a user, I can log in to the site
3. as a user, I can create a new grocery list
4. as a user, I can view all of the grocery lists I've created in a single list
5. as a user, I can add items to an existing grocery list
6. as a user, I can cross off items in an existing grocery list

## Research Topics

(___TODO__: the research topics that you're planning on working on along with their point values... and the total points of research topics listed_)

* (5 points) Integrate user authentication
    * I'm going to be using passport for user authentication
    * And account has been made for testing; I'll email you the password
    * see <code>cs.nyu.edu/~jversoza/ait-final/register</code> for register page
    * see <code>cs.nyu.edu/~jversoza/ait-final/login</code> for login page
* (4 points) Perform client side form validation using a JavaScript library
    * see <code>cs.nyu.edu/~jversoza/ait-final/my-form</code>
    * if you put in a number that's greater than 5, an error message will appear in the dom
* (5 points) vue.js
    * used vue.js as the frontend framework; it's a challenging library to learn, so I've assigned it 5 points

10 points total out of 8 required points (___TODO__: addtional points will __not__ count for extra credit_)


## [Link to Initial Main Project File](app.js)

(___TODO__: create a skeleton Express application with a package.json, app.js, views folder, etc. ... and link to your initial app.js_)

## Annotations / References Used

(___TODO__: list any tutorials/references/etc. that you've based your code off of_)

1. [passport.js authentication docs](http://passportjs.org/docs) - (add link to source code that was based on this)
2. [tutorial on vue.js](https://vuejs.org/v2/guide/) - (add link to source code that was based on this)
