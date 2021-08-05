const fs = require('fs');
const path = require('path');



(function() {
  devServer();
  taskWatcher();
})();


function devServer() {

  const express = require('express');
  const app = express();
  const http = require('http').Server(app);
  const dirDev = path.join(__dirname, '../dist');

  app.use(express.static(dirDev));

  http.listen(3000, () => {
    console.info('\x1b[37m', '🌎 Listening on port 3000, open browser to http://localhost:3000/');
  });

}


function compileSCSS() {

  const sass = require('sass');

  console.info('\x1b[36m','😻 Rendering sass...');

  sass.render({
      file: './src/scss/app.scss',
      // outputStyle: 'compressed',
      sourceMap: false,
      outFile: './dist/css/app.css',
    },
    function(error, result) {
      if (!error) {
        fs.writeFile('./dist/css/app.css', result.css, err => {
          !err ? console.info('\x1b[32m',`🍕 CSS written to file!`) : null;
        });
      } else {
        console.error(error);
      }
    });

}


function compileECMA() {

  console.info('\x1b[36m','😻 transforming ECMA script...');

  const browserify = require("browserify");
  const babelify = require("babelify");

  browserify({ debug: false })
    .transform(babelify, {
       presets: ["@babel/preset-env"],
       comments: false,
       minified: false
     })
    .require("./src/js/index.js", { entry: true })
    .bundle()
    .on("error", function (err) { console.log("Error: " + err.message); })
    .pipe(fs.createWriteStream("./dist/js/bundle.js").on('finish', () => {
       console.log('\x1b[32m','🍕 Transform complete!');
     }));

}


function taskWatcher() {

  console.info('\x1b[37m', '👀 Dev-tools: watching for changes.')

  const chokidar = require('chokidar');
  const dirSrc = path.join(__dirname, '../src');

  chokidar.watch(dirSrc).on('change', path => {

    let extType = path.split('.').pop();

    if (extType === 'js') {

      compileECMA()

    } else if (extType === 'scss') {

      compileSCSS();

    }

  });

}
