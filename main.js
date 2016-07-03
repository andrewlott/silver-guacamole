var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('vote', function(msg){
    io.emit('vote', msg);
    console.log('vote for: ' + msg);
  });
  socket.on('reset', function(msg){
    io.emit('reset', msg);
    console.log('reset!');
  });
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(app.get('port'), function() {
  console.log('listening on *:' + app.get('port'));
});
