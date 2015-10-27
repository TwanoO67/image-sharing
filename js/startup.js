
  "use strict";

  //On commence par la mise en cluster
  var cluster = require('cluster');

  // Code to run if we're in the master process
  if (cluster.isMaster) {

    var gui = require('nw.gui');
    var CustomTrayMenu = require('./js/custom-tray-menu');
    var win = gui.Window.get();
    global.main_win = win;

    // Extend application menu for Mac OS
    if (process.platform == "darwin") {
      var menu = new gui.Menu({type: "menubar"});
      menu.createMacBuiltin && menu.createMacBuiltin(window.document.title);
      win.menu = menu;
    }

    var $ = function (selector) {
      return document.querySelector(selector);
    }

    var customTray;

    customTray = new CustomTrayMenu('views/custom-tray-menu.html', 'public/icon.png', {
      width: 200,
      height: 180
    });


    // Count the machine's CPUs
    var cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
       //console.log('Création du fork ' + i);
       cluster.fork();
    }
    console.log('Création de '+cpuCount+' thread');

    // Listen for dying workers
    cluster.on('exit', function (worker) {
        // Replace the dead worker, we're not sentimental
        //cluster.fork();
        console.log('Remplacement du worker ' + worker.id);
    });

  // Code to run if we're in a worker process
  } else {
    /**
     * Module dependencies.
     */
   var app = require('./js/build_server');
   var debug = require('debug')('plex_webdown:server');
   var http = require('http');

   /**
    * Get port from environment and store in Express.
    */

   var port = normalizePort(process.env.PORT || '3001');
   app.set('port', port);

   /**
    * Create HTTP server.
    */

   var server = http.createServer(app);

   /**
    * Listen on provided port, on all network interfaces.
    */

   server.listen(port);
   server.on('error', onError);
   server.on('listening', onListening);
  }


  /**
  * Normalize a port into a number, string, or false.
  */

  function normalizePort(val) {
   var port = parseInt(val, 10);

   if (isNaN(port)) {
     // named pipe
     return val;
   }

   if (port >= 0) {
     // port number
     return port;
   }

   return false;
  }

  /**
  * Event listener for HTTP server "error" event.
  */

  function onError(error) {
   if (error.syscall !== 'listen') {
     throw error;
   }

   var bind = typeof port === 'string'
     ? 'Pipe ' + port
     : 'Port ' + port;

   // handle specific listen errors with friendly messages
   switch (error.code) {
     case 'EACCES':
       console.error(bind + ' requires elevated privileges');
       process.exit(1);
       break;
     case 'EADDRINUSE':
       console.error(bind + ' is already in use');
       process.exit(1);
       break;
     default:
       throw error;
   }
  }

  /**
  * Event listener for HTTP server "listening" event.
  */

  function onListening() {
   var addr = server.address();
   var bind = typeof addr === 'string'
     ? 'pipe ' + addr
     : 'port ' + addr.port;
   debug('Listening on ' + bind);
  }


  win.hide();
