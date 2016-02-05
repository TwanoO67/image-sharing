//var io = require('socket.io-client')('http://localhost:7000');
//var socket = require('socket.io');
var fs = require('fs');
var ss = require('socket.io-stream');

var io = require('socket.io-client');
var socket = io.connect('http://localhost:7000');
var folder = "./client_local_data/";

// Fonction qui liste les noms de fichiers, précédés du chemin fourni et les retourne dans une variable fileList.
function getFileList(dirName, callback) {
    fs.readdir(dirName, function(err,items) {
        if (err) throw err;
        callback(items);
    });
}

// La variable user_id est le deuxième argument fournit dans le processus
var user_id = process.argv[2];

if(!user_id){
  console.log('merci de preciser votre nom de user en argument, exemple: node client.js test_user');
  exit();//devrais etre une fonction de process, mais j'ai pas le net... alors je laisse planter
}

socket.emit("identity",{
  user_id: user_id,
  user_type: "node_client"
});

// La variable printList est une fonction anonyme qui console.log l'argument fourni.
var printList = function(liste) {
    console.log(liste);
}
// La variable sendList est une fonction anonyme qui envoie la liste récupérée via socket.io.
var sendList = function(liste) {
    console.log("j'ai envoyé ma liste de fichier");
    console.log(liste);
    socket.emit('list', {
      list: liste,
      user: user_id
    });
}

socket.on('getList',function(){
  console.log("j'ai recu getList");
  // On déclenche la fonction getFileList avec la variable path comme argument dirName et la fonction contenue dans la variable sendList comme argument callback.
  getFileList(folder,function(listeA) {
      sendList(listeA);
  });
});

socket.on('serverLoadImage',function(path){
  console.log("j'ai recu serverLoadImage");
  var filename = folder+path;
  var stream = ss.createStream();
  ss(socket).emit('sendImageToServer', stream, {user: user_id,name: path});
  fs.createReadStream(filename).pipe(stream);
});

console.log("en attente de requete");
