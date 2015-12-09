var io = require('socket.io-client')('http://192.168.0.24:7000');
//var socket = require('socket.io');
var fs = require('fs');
var ss = require('socket.io-stream');

// Fonction qui liste les noms de fichiers, précédés du chemin fourni et les retourne dans une variable fileList.
function getFileList(dirName, callback) {
    fs.readdir(dirName, function(err,items) {
        if (err) throw err;
        callback(items);
    });
}

// La variable path est le deuxième argument fournit dans le processus
var path = process.argv[2];
// La variable printList est une fonction anonyme qui console.log l'argument fourni.
var printList = function(liste) {
    console.log(liste);
}
// La variable sendList est une fonction anonyme qui envoie la liste récupérée via socket.io.
var sendList = function(liste) {
    console.log("j'ai envoyé liste");
    console.log(liste);
    io.emit('list', liste);
}

// Discussion avec le serveur distant :
// Quand Socket.IO reçoit un message de type 'getList', il déclenche une fonction qui a pour paramètre le message envoyé par le serveur, inutile ici. A la place, on récupère la liste.
//io.on('connection', function(socket){

  io.emit('list', ['test']);
//});

console.log("j'ai envoyé liste test");

  io.on('getList',function(){
    console.log("j'ai recu getLIst");
    // On déclenche la fonction getFileList avec la variable path comme argument dirName et la fonction contenue dans la variable sendList comme argument callback.
    getFileList(path,function(listeA) {
        sendList(listeA);
    });
  });

//});

// On déclenche la fonction getFileList avec la variable path comme argument dirName et la fonction contenue dans la variable printList comme argument callback.
//getFileList(path,printList);


// On créé un stream.
//var stream = ss.createStream();
