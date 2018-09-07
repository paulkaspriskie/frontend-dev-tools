var path = require('path');
var fs = require("graceful-fs");
var chokidar = require('chokidar');
var express = require('express');
var browserify = require("browserify");
var babelify = require("babelify");
var sass = require('node-sass');
var Watcher = require('node-sass-watcher');
var opn = require('opn');



/**
 * Express Dev server:
 * Implements dev server with livereload
 * serves public directory to port 3000
 */
var app = express();
var http = require('http').Server(app);
var publicDir = path.join(__dirname, './../public');

if (app.get('env') === 'development') {

  app.get([/\/$/, /.*\.html$/], function (req, res) {
    var filename = publicDir + req.path;
        filename += filename.endsWith('/') ? 'index.html' : '';

    fs.readFile(filename, function (_, data) {
      res.send(data
      + '<script src="/socket.io/socket.io.js"></script>'
      + '<script>'
      + '  var socket = io();'
      + '  socket.on("file-change-event", function () {'
      + '    window.location.reload();'
      + '  });'
      + '</script>'
      );
    });
  });

  app.use(express.static(publicDir));
  http.listen(3000, () => console.info('\x1b[37m', '🌎  Listening on port 3000, open browser to http://localhost:3000/'));
  opn('http://localhost:3000');

  var io = require('socket.io')(http);
  fs.watch(publicDir, { recursive:true }, function() {
    io.emit('file-change-event');
  });

}



/**
 * Node-sass compiler/watcher:
 * compiles scss files to css and watches scss files for changes
 */
function renderSass() {
  console.info('\x1b[36m','Rendering sass...');
  sass.render({
    file: './src/scss/app.scss',
    outFile: './public/css/app.css',
    outputStyle: 'compressed',
    sourceMap: true
  },
  function(error, result) {
    if (!error) {
      fs.writeFile('./public/css/app.css', result.css, function(err){
        if (!err) { console.info('\x1b[32m','CSS written to file!'); }
      });
    } else {
      console.log(error);
    }
  });
}

var scssWatcher = new Watcher('./src/scss/app.scss');
scssWatcher.on('init', renderSass);
scssWatcher.on('update', renderSass);
scssWatcher.run();



/**
 * ECMA script compiler/watcher:
 * Uses browserify/babelify to compile ecma script 6 to browser readable js.
 */
const appJs = chokidar.watch('./src/js/app.js', { ignored: /^\./, persistent: true, awaitWriteFinish: true });
const bundleJs = chokidar.watch('./public/js/bundle.js', { ignored: /^\./, persistent: true, awaitWriteFinish: true });

function compileJs() {
  browserify({ debug: true })
    .require("./src/js/app.js", { entry: true })
    .transform(babelify, { presets: ["env"] })
    .transform('uglifyify', { sourceMap: false })
    .bundle()
    .on("error", function (err) { console.log("Error: " + err.message); })
    .pipe(fs.createWriteStream("./public/js/bundle.js"));
}

appJs.on('change', (path, stats) => {
  console.info('\x1b[36m','JS file changed, bundling js...');
  compileJs();
});

bundleJs.on('change', (path, stats) => {
  console.info('\x1b[32m',`JS written to file: ${path}`);
});