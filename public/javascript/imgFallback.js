function main(){
  const images = Array.from(document.getElementsByTagName("img"));
  images.forEach((img)=>{
    img.addEventListener("error",function(){
      img.src = "https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg";
    });
  });
}

main();
