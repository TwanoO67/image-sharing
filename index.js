var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var ss = require('socket.io-stream');
var path = require('path');
var fs = require('fs');
var port = 7000;

var tmp_folder = "./tmp_server/";

function createDirOrUse(path,cb){
  fs.mkdir(path,function(e){
    if(!e || (e && e.code === 'EEXIST')){
        //do something with contents
        cb();
    } else {
        //debug
        console.log(e);
    }
  });
}

//partie socket io pour echanger avec les clients
io.on('connection', function(socket){
  console.log('user connexion');
  var user_id = null;
  var user_type = "web_client";

  socket.on('identity',function(data){
    console.log("reception d'une identité");
    console.log(data);
    var user_id = data.user_id;
    var user_type = data.user_type;
  })


  //retransmission des messages
  socket.on('list', function(list){
    console.log("j'ai retransmis liste");
    io.emit('list', list);
  });

  socket.on('getList', function(user){
    console.log("j'ai demande getList à chaque user");
    io.emit('getList', user);
  });

  socket.on('serverLoadImage', function(path){
    console.log("j'ai retransmis serverLoadImage");
    io.emit('serverLoadImage', path);
  });

  ss(socket).on('sendImageToServer', function(stream, data) {
    console.log('sendImageToServer');
    var user = data.user;

    var dirname = path.join(__dirname,tmp_folder,user);
    var filename = path.join(dirname,data.name);

    createDirOrUse(dirname,function(){
      stream.pipe(fs.createWriteStream(filename, {autoClose: true}));
      io.emit('serverHasLoadedImage', {
        user: user,
        path: data.name
      });
    });

  });

});

//Partie express pour servir les data web
app.get('/', function(req, res){
  res.sendFile(path.join(__dirname,'index.html'));
});

//servir les images
app.get('/image/:user_id/:filename', function (req, res, next) {
  var user = req.params.user_id;
  var filename = req.params.filename;
  var filepath = path.join(__dirname,tmp_folder,user,filename);
  res.contentType('image/jpeg');//filepath);
  res.sendFile(filepath);
});

app.get('/lib/:file',function(req,res,next){
  res.sendFile(path.join(__dirname,'lib',req.params.file));
});

http.listen(port , function(){
  console.log('listening on *:'+port );
});
