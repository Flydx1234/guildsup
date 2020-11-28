let chat, messages;
function main() {
  chat = document.getElementById("chat");
  messages = document.getElementById("messages");
  const chatRooms = document.getElementsByClassName("chatRoom");
  const req = new XMLHttpRequest();
  req.open("POST",postUrl);
  req.addEventListener('load', function() {
  });
  req.send();

  for(room of chatRooms){
    room.addEventListener("onsubmit",showChat(event, room));
  }
}


function showChat(event, room){
  event.preventDefault();
  while(messages.firstChild){
    messages.removeChild(messages.firstChild);
  }
  const _id = room.firstElementChild.value;
  const req = new XMLHttpRequest();
  req.open("GET",getUrl);
  req.addEventListener('load', function() {
  });
  req.send();
}
document.addEventListener("DOMContentLoaded", main);
