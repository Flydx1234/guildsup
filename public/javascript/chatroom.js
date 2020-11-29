let chat, messages;
const d = new Date();
const socket = io();

function main() {
  chat = document.getElementById("chat");
  messages = document.getElementById("messages");
  const chatRooms = document.getElementsByClassName("chatRoom");
  const createRoomForm = document.getElementById("createRoom");
  const guildName = document.getElementById("guildName").textContent;
  const sendMessage = document.getElementById("sendMessage");
  const username = document.getElementById("username");
  createRoomForm.addEventListener("submit",function(event){
    event.preventDefault();
    const roomName = document.getElementById("roomName");
    const roomReq = new XMLHttpRequest();
    roomReq.open("POST","/createRoom");
    roomReq.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    roomReq.addEventListener("load", function(){
      if(roomReq.status >= 200 && roomReq.status < 400) {
        const obj = JSON.parse(roomReq.responseText);
        createRoom(obj);
        socket.emit("roomCreated", obj._id);
      }
    });
    roomReq.send(`name=${roomName.value}&guild=${guildName}`);
  });

  sendMessage.addEventListener("submit",function(event){
    event.preventDefault();
    const message = document.getElementById("message").value;
    socket.emit("messageSent", message, messages.chatRoomId, username.textContent);
  });

  socket.on("messageReceived",function(data){
    console.log(data);
    document.createElement("tr");
    const tr = document.createElement("tr");
    const sender = document.createElement("td");
    const sentText = document.createElement("td");
    const sentTime = document.createElement("td");
    sender.appendChild(document.createTextNode(data.name));
    sentText.appendChild(document.createTextNode(data.text));
    sentTime.appendChild(document.createTextNode(`Today at ${data.time.hour}:${data.time.minute}`));
    tr.appendChild(sender);
    tr.appendChild(sentText);
    tr.appendChild(sentTime);
    messages.appendChild(tr);
  });

  socket.on("roomCreated", function(data){
    createRoom(data);
  });

  for(room of chatRooms){
    room.addEventListener("submit",showChat);
  }
}


function showChat(event){
  event.preventDefault();
  document.getElementById("chat").classList.remove("hidden");
  while(messages.firstChild){
    messages.removeChild(messages.firstChild);
  }
  const _id = event.currentTarget.firstElementChild.value;
  const req = new XMLHttpRequest();
  req.open("GET",`/chatRoom?id=${_id}`);
  req.addEventListener('load', function() {
    if(req.status >= 200 && req.status < 400) {
      const info = JSON.parse(req.responseText);
      messages.chatRoomId = info._id;
      info.messages.forEach((mess)=>{
        const today = `${d.getMonth()}/${d.getDay()}/${d.getFullYear()}`;
        const tr = document.createElement("tr");
        const sender = document.createElement("td");
        const sentText = document.createElement("td");
        const sentTime = document.createElement("td");
        sender.appendChild(document.createTextNode(mess.name));
        sentText.appendChild(document.createTextNode(mess.text));
        const sentDate = `${mess.time.month}/${mess.time.day}/${mess.time.year}`;
        if(sentDate === today){
          sentTime.appendChild(document.createTextNode(`Today at ${mess.time.hour}:${mess.time.minute}`));
        }
        else{
          sentTime.appendchild(`${mess.time.month}/${mess.time.day}/${mess.time.year}`);
        }
        tr.appendChild(sender);
        tr.appendChild(sentText);
        tr.appendChild(sentTime);
        messages.appendChild(tr);
      });
    }
  });
  req.send();
}

function createRoom(obj){
    const li = document.createElement("li");
    const form = document.createElement("form");
    const input = document.createElement("input");
    const button = document.createElement("button");
    const ul = document.getElementById("chatRoomList");
    form.classList.add("chatRoom");
    form.method = "GET";
    form.action = "showChat";
    li.appendChild(form);
    input.type="hidden";
    input.name = "chatRoom";
    input.value = obj._id;
    form.appendChild(input);
    button.type = "submit";
    button.class = "showChat";
    button.appendChild(document.createTextNode(obj.name));
    form.appendChild(button);
    ul.appendChild(form);
    form.addEventListener("submit",showChat);
}


document.addEventListener("DOMContentLoaded", main);
