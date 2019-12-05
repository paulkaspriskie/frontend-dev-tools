var path = require('path');
var fs = require("graceful-fs");
var chokidar = require('chokidar');
var express = require('express');
var browserify = require("browserify");
var babelify = require("babelify");
var sass = require('node-sass');
var Watcher = require('node-sass-watcher');
var open = require('open');



/**
 * Express Dev server:
 * Implements dev server with livereload
 * serves public directory to port 3000
 */
var app = express();
var http = require('http').Server(app);
var publicDir = path.join(__dirname, './../public');

if (app.get('env') === 'development') {

  app.use(express.static(publicDir));
  http.listen(3000, () => console.info('\x1b[37m', '🌎  Listening on port 3000, open browser to http://localhost:3000/'));
  open('http://localhost:3000');

  // Sass file watcher: *only runs when in dev.
  var scssWatcher = new Watcher('./src/scss/app.scss');
  scssWatcher.on('init', renderSass);
  scssWatcher.on('update', renderSass);
  scssWatcher.run();

  // es file watcher: *only runs when in dev.
  const appJs = chokidar.watch('./src/js/**/*.js', {
    ignored: /^\./,
    persistent: true,
    awaitWriteFinish: true
  });

  const bundleJs = chokidar.watch('./public/js/bundle.js', {
    ignored: /^\./,
    persistent: true,
    awaitWriteFinish: true
  });

  appJs.on('change', (path, stats) => {
    console.info('\x1b[36m','JS file changed, bundling js...');
    compileJs();
  });

  bundleJs.on('change', (path, stats) => {
    console.info('\x1b[32m',`JS written to file: ${path}`);
  });


} else if (app.get('env') === 'production') {

  console.info("\x1b[37m", 'Starting build...');
  const prodDirWatcher = chokidar.watch('./public/', {
    ignored: /^\./,
    persistent: true,
    awaitWriteFinish: true
  });


  if (app.get('env') === 'production') {
    if (!fs.existsSync('./build/')) {
      fs.mkdir('./build/', function() {
        var createDir = new Promise(() => fs.mkdirSync('./build/js/'));
        createDir.then(fs.writeFile('./build/js/bundle.js'));
      });
    }
  }

  renderSass();
  setTimeout(compileJs, 1000);

  prodDirWatcher.on('change', (path, stats) => {
    console.info('\x1b[32m',`🎉  Bulid Complete! ${path}`);
    prodDirWatcher.close();
  });

}



/**
 * Node-sass compiler:
 * compiles scss files to css.
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



/**
 * ECMA script compiler:
 * Uses browserify/babelify to compile ecma script 6 to browser readable js.
 */
function compileJs() {

  var jsOutput = app.get('env') === 'development' ? "./public/js/bundle.js" : "./build/js/bundle.js";

  browserify({ debug: true })
    .require("./src/js/index.js", { comments: false, entry: true })
    .transform(babelify, { presets: ["@babel/preset-env", "@babel/preset-react"] })
    .transform('uglifyify', { sourceMap: false })
    .bundle()
    .on("error", function (err) { console.log("Error: " + err.message); })
    .pipe(fs.createWriteStream(jsOutput));

}
