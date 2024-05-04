const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

const localIP = '192.168.1.71'; 

app.use(express.static(path.join(__dirname, 'public')));



let connections = [];

const worldNamespace = io.of('/world');


worldNamespace.on('connection', (socket) => {
    socket.on('requestConnections', () => {
      socket.emit('connectionsUpdate', connections);
    });
});

function updateConnections() {
  io.emit('connectionsUpdate', connections); 
  worldNamespace.emit('connectionsUpdate', connections); 
}


io.on('connection', (socket) => {
  
  // IDENTITY
  socket.on('identity', (identity) => {
     socket.user = {
      id: socket.id,
      identity: identity.identity,
      audio: identity.audio, 
      image: identity.image ,
      audioState: {
          playing: identity.audioState.playing,
          playbackRate: identity.audioState.playbackRate,
          volume: identity.audioState.volume,
      },
      position: {
        left: identity.position.left,
        top: identity.position.top,
      }
      };
    connections.push(socket.user); 
    console.log(socket.user);
    updateConnections();
  });
  
  socket.on('disconnect', () => {
    if (socket.user) {
      connections = connections.filter(conn => conn.id !== socket.id); 
      worldNamespace.emit('removeConnection', socket.id); 
      updateConnections(); 
    }
  });
  
  
  
  // BROADCAST DATA
  
  socket.on('sendData', (data) => {
    if (socket.user) {
      socket.broadcast.emit('receiveData', {
        identity: socket.user.identity,
        action: data.action,
        intensity: data.intensity
      });
    }
  });
  
  
  // AUDIO

  socket.on('updateAudio', (audioState) => {
    if (socket.user) {
      socket.user.audioState = audioState;
      updateConnections();
    }
  });
  

  socket.on('changeAudio', (audio) => {
    if (socket.user) {
      socket.user.audio = audio;
      updateConnections();
    }
  });
  
  // VISUALS

  socket.on('updateVisuals', (styles) => {
    if (socket.user) {
      socket.user.styles = styles;
      updateConnections();
    }
  });
  
  socket.on('changeImage', (image) => {
    if (socket.user) {
      socket.user.image = image;
      updateConnections();
    }
  });

});

server.listen(PORT, localIP, () => {
  console.log(`A beautiful world alive on http://${localIP}:${PORT}`);
});
