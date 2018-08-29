var path = require('path');
var fs = require("graceful-fs");
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

app.listen(3000, () => console.info('\x1b[37m', '🌎  Listening on port 3000, open browser to http://localhost:3000/'));



/**
 * Node-sass compiler/watcher:
 * compiles scss files to css and watches scss files for changes
 */
function render() {
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
scssWatcher.on('init', render);
scssWatcher.on('update', render);
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

compileJs();
