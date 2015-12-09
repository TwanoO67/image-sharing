var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var port = 7000;

io.on('connection', function(socket){
  console.log('user connexion');
  //retransmission des messages
  socket.on('list', function(list){
    console.log("j'ai retransmis liste");
    io.emit('list', list);
  });

  socket.on('getList', function(list){
    console.log("j'ai retransmis getList");
    io.emit('getList', list);
  });
});


app.get('/', function(req, res){
  res.sendFile(path.join(__dirname,'index.html'));
});

http.listen(port , function(){
  console.log('listening on *:'+port );
});
