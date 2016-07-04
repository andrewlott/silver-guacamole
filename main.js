var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.get('/*', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('room', function(room){
      socket.join(room);
      io.to(room).emit('members', io.sockets.adapter.rooms[room].length);
  });

  socket.on('vote', function(msg){
    var room = msg['room'];
    var vote = msg['vote'];
    io.to(room).emit('vote', vote);
  });

  socket.on('unvote', function(msg){
    var room = msg['room'];
    var unvote = msg['unvote'];
    io.to(room).emit('unvote', unvote);
  });

  socket.on('reset', function(msg){
    var room = msg['room'];
    var reset = msg['reset'];
    io.to(room).emit('reset', reset);
  });

  socket.on('disconnect', function(){
      for (var room in io.sockets.adapter.rooms) {
	  io.to(room).emit('members', io.sockets.adapter.rooms[room].length);	  
      }
  });
});

http.listen(app.get('port'), function() {
  console.log('listening on *:' + app.get('port'));
});
