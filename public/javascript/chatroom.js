let chat, messages;
function main() {
  chat = document.getElementById("chat");
  messages = document.getElementById("messages");
  const chatRooms = document.getElementsByClassName("chatRoom");
  const createRoom = document.getElementById("createRoom");
  const guildName = document.getElementById("guildName").textContent;
  createRoom.addEventListener("submit",function(event){
    event.preventDefault();
    const roomName = document.getElementById("roomName");
    const roomReq = new XMLHttpRequest();
    roomReq.open("POST","/createRoom");
    roomReq.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    roomReq.addEventListener("load",function(){
      if(roomReq.status >= 200 && roomReq.status < 400) {
        const obj = JSON.parse(roomReq.responseText);
        console.log(obj);
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
      }
    });

    roomReq.send(`name=${roomName.value}&guild=${guildName}`);
  });
  /*const req = new XMLHttpRequest();
  //req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  req.open("POST","/chatRoom");
  req.addEventListener('load', function() {
  });
  req.send();*/
  for(room of chatRooms){
    room.addEventListener("submit",showChat(event, room));
  }
}


function showChat(event, room){
  event.preventDefault();
  document.getElementById("chat").classList.remove("hidden");
  while(messages.firstChild){
    messages.removeChild(messages.firstChild);
  }
  const _id = room.firstElementChild.value;
  const req = new XMLHttpRequest();
  req.open("GET",`/chatRoom?id=${_id}`);
  req.addEventListener('load', function() {
    if(req.status >= 200 && req.status < 400) {
      const info = JSON.parse(req.responseText);
      info.messages.forEach((mess)=>{
        const tr = document.createElement("tr");
        const sender = document.createElement("td");
        const sentText = document.createElement("td");
        const sentTime = document.createElement("td");
        sender.appendChild(document.createTextNode(mess.name));
        sentText.appendChild(document.createTextNode(mess.text));
        sentTime.appendChild(document.createTextNode(mess.time));
        tr.appendChild(sender);
        tr.appendChild(sentText);
        tr.appendChild(sentTime);
        messages.appendChild(tr);
      });
    }
  });
  req.send();
}
document.addEventListener("DOMContentLoaded", main);
