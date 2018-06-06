var path = require('path');
var fs = require('fs');
var chokidar = require('chokidar');
var express = require('express');
var browserify = require("browserify");
var babelify = require("babelify");
var sass = require('node-sass');
var Watcher = require('node-sass-watcher');



/**
 * Express Dev server:
 * serves public directory to port 3000
 */
var app = express();
var publicDir = path.join(__dirname, './../public');

app.use(express.static(publicDir));
app.set('port', process.env.PORT || 3000);

app.get('/', function (req, res) {
  res.sendFile(path.join(publicDir, 'index.html'))
});

app.listen(3000, () => console.info('\x1b[37m', '🌎  Listening on port 3000, open browser to http://localhost:3000/'))



/**
 * Node-sass compiler/watcher:
 * compiles scss files to css and watches scss files for changes
 */
function compileJs() {
  browserify({ debug: true })
    .transform(babelify)
    .require("./app/src/js/app.js", { entry: true })
    .bundle()
    .on("error", function (err) { console.log("Error: " + err.message); })
    .pipe(fs.createWriteStream("./public/js/bundle.js"));
}

compileJs();
var esWatcher = chokidar.watch('./app/src/js', {ignored: /^\./, persistent: true});
var bundleWatcher = chokidar.watch('./public/js', {ignored: /^\./, persistent: true});

esWatcher
  .on('ready', () => { console.info('\x1b[36m','Bundling JS...'); })
  .on('change', function(path) { console.info('\x1b[36m','Bundling JS...'); compileJs(); })
  .on('error', function(error) { console.error('Error happened', error); });

bundleWatcher
  .on('change', function(path) { console.info('\x1b[32m','💾  JS written to file! ' + path); })
  .on('error', function(error) { console.error('Error happened', error); });



/**
 * Node-sass compiler/watcher:
 * compiles scss files to css and watches scss files for changes
 */
function render() {
  console.info('\x1b[36m','Rendering sass...');
  sass.render({
    file: './app/src/scss/app.scss',
    outFile: './public/css/app.css',
    outputStyle: 'compressed',
    sourceMap: true
  },
  function(error, result) {
    if (!error) {
      fs.writeFile('./public/css/app.css', result.css, function(err){
        if (!err) { console.info('\x1b[32m','💾  CSS written to file!'); }
      });
    }
  });
}

// watches sass
var scssWatcher = new Watcher('./app/src/scss/app.scss');
scssWatcher.on('init', render);
scssWatcher.on('update', render);
scssWatcher.run();
