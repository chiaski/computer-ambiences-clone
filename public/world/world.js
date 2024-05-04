const socket = io('/world');

function chance(prob) { return !!prob && Math.random() <= prob; }

function randInt(min, max) {  return Math.floor(Math.random() * (max - min + 1) + min) }

function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }

function write(text) {
  var SPEED = 80;
  var lines = text.split('\n');
  var lineIndex = 0;
  var $caption = $('#caption');
  var interval;

  // Clear any existing typewriter interval
  $caption.empty();
  clearInterval(interval);

  function typeLine() {
    var line = lines[lineIndex];
    var $lineSpan = $('<span></span>');
    $caption.append($lineSpan);

    var i = 0;
    interval = setInterval(function() {
      if (i < line.length) {
        $lineSpan.text($lineSpan.text() + line.charAt(i));
        i++;
      } else {
        clearInterval(interval);
        $caption.append('<br>');
        lineIndex++;
        if (lineIndex < lines.length) {
          setTimeout(typeLine, SPEED); // Wait a bit before typing the next line
        }
      }
    }, SPEED);
  }

  typeLine();
}




var clicked = false;

$(document).one("click", function(){
  
  $("#CLICK").remove();
  
});
//$(document).click(function() {
//  if (!clicked) {
//    playAllAudio();
//    clicked = true;
//  }
//});
//
//
//function playAllAudio() {
//    $('audio').each(function() {
//        this.play();
//    });
//}



//
let Connections = [];

socket.on('connectionsUpdate', function(connections) {
//  console.log("update", connections);
//  updateConnections(connections);
  // handle
  Connections = connections;
  
  connections.forEach(conn => {  
   if($("#" + conn.id).length){
//    console.log("exists");
     dAudio = $(`#${conn.id} audio`);
     
     // check if audio needs replacing
     let checkAudio = conn.audio.startsWith("http://") || conn.audio.startsWith("https://") ? conn.audio : "../" + conn.audio;
     
     if( checkAudio !== $(dAudio).attr("src")){
       console.log("changing source");
        $(dAudio).attr("src", `${checkAudio}`);
     }
     
     // check if image needs replacing
     let checkImage =  conn.image.startsWith("http://") || conn.image.startsWith("https://") ? conn.image : "../" + conn.image;
     
     if( checkImage !== $("#" + conn.id + " img").attr("src")){
       console.log("changing source");
         $("#" + conn.id + " img").attr("src", `${checkImage}`);
     }
     
     
    dAudio[0].playbackRate = conn.audioState.playbackRate;
    dAudio[0].volume = conn.audioState.volume;
    if(conn.audioState.playing){
     dAudio[0].play(); 
    } else{
     dAudio[0].pause(); 
    }
     
     if(conn.styles && conn.styles.length > 1){
        $("#" + conn.id).css(JSON.parse(conn.styles));
     }
     
     return;
     
   } else{  // make a div for that connection
     makeDiv(conn);
   }
    
    
  });
  
  
});

let connectionsDiv = $('#world');
let connectionsWindows = [];


// remove connection
socket.on('removeConnection', function(connection) {
  if($("#" + connection).length){
    $("#" + connection).remove();

    let index = connectionsWindows.findIndex((obj) => obj.id === connection);
    
    if (index !== -1) {
      connectionsWindows[index].window.close();
      connectionsWindows.splice(index, 1);
    }
  }
});

function makeDiv(conn){
  
  let myImage = conn.image.startsWith("http://") || conn.image.startsWith("https://") ? conn.image : "../" + conn.image;
  
  let d = $(`<span object><img src='${myImage}'></span>`)
  .attr("id", conn.id)
  .attr("identity", conn.identity)
  .css("left", `${conn.position.left}%`)
  .css("top", `${conn.position.top}%`)

  // open window
//  
//  let vw = window.innerWidth;
//  let vh = window.innerHeight;
////  let vw = screen.width;
////  let vh = screen.height;
//
//  let l = (vw * conn.position.left) / 100;
//  let t = (vh * conn.position.top) / 100;
//  
//  console.log(vw, ":", l, "//", vh, ":", t)
//  
//  let w = window.open("o.html", "", `popup, width=${100}, height=${100+26}, top=${t + 65 + 88}, left=${l + 80}`);
//  connectionsWindows.push({ id: conn.id, window: w });
//  
//  
//  let dContent = $(d).html();
//  console.log(w, dContent);
//  
//  w.console.log(dContent);
//  setTimeout(function(){ 
//    if(w){
//      w.adjustBG(l + 126, t);
//      w.image(dContent);
//      w.document.title = conn.identity; 
//    }
//  }, 100);
//  
//
//   $(win.document).ready(function() {     
//     win.write(dContent);
//     
////    win.postMessage({ htmlContent: dContent }, '*');
//  });

  dAudio = $(`<audio src='${ conn.audio.startsWith("http://") || conn.audio.startsWith("https://") ? conn.audio : "../" + conn.audio}'>`)
    .prop('autoplay', false).prop('loop', true);


  $(dAudio).appendTo(d);

    dAudio[0].playbackRate = conn.audioState.playbackRate;
    dAudio[0].volume = conn.audioState.volume;
    if(conn.audioState.playing){
     dAudio[0].play(); 
    } else{
     dAudio[0].pause(); 
    }

    $(d).appendTo(connectionsDiv);
}



// make object


$(document).ready(function(){
  write("A new world waits.");
  
  socket.on('connect', function() {
      socket.emit('requestConnections');
  });

  
  
});


