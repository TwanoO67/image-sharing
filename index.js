var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var ss = require('socket.io-stream');
var path = require('path');
var port = 7000;

//liste des fichiers en attente
listeDattente = {};

//recuperation du nom de dossier
function getRealDirname(id){
    return "./temp/"+id;
}

//check si quelque veut se fichier et si oui l'envoi
function verifieAttente(file){
  for (var i in listeDattente) {
    if(i == file){
      var res = listeDattente[i];
      //on renvoi a la requete en synchrone
      res.sendFile(file , options, function (err) {
        if (err) {
          console.log(err);
          res.status(err.status).end();
        }
        else {
          console.log('Envoi du fichier:', file);
          listeDattente.splice(i, 1);
        }
      });
    }
  }
}

//enregistrement d'un nouveau fichier
function setFile(file,id,stream){
  var realPath = getRealDirname(id);
  var realFileName = realPath+file;

  stream.pipe(fs.createWriteStream(realFileName));

  var had_error = false;
  stream.on('error', function(err){
    had_error = true;
  });
  stream.on('close', function(){
    //quand le fichier est ecris
    if (!had_error){
      verifieAttente(realFileName);
    }
  });
}

//renvoi fichier en async ou pas selon s'il est dispo
function getFile(res,id,file){

  var realPath = getRealDirname(id);
  var realFileName = realPath+file;

  //ajout en liste d'attente du fichier
  listeDattente[realFileName] = res;

  var fs = require('fs');

  try {
    // Query the entry
    stats = fs.lstatSync(realFileName);

    //Si le fichier existe deja
    if (stats.isFile()) {
      verifieAttente(realFileName);
    }
    //sinon on demande a chercher le fichier
    else{
      //on crée le dossier s'il n'existe pas
      var mkdirp = require('mkdirp');
      mkdirp(realPath, function (err) {
      if (err) console.error(err)
      else {
        console.log("Demande async à "+id+" pour le fichier "+req.param.filename)
        //demande du fichier
        io.in(req.param.id).emit.('getFile',req.param.filename);

      }
      });
    }
  }
  catch (e) {
      // ...
  }



}

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

  //reception des fichier
  ss(socket).on('files', function(stream, data) {
    setFile(data.filename,data.id,stream);
  });

});

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname,'index.html'));
});

app.Router().get('/:nom/:id/:filename', function(req,res,next){
  req.param.filename;

  getFile(res,req.param.id,req.param.filename);

});

http.listen(port , function(){
  console.log('listening on *:'+port );
});
