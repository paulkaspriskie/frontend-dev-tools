/* Global declarations */
const fs = require('fs');
const path = require('path');
const envType = process.env.NODE_ENV;



/**
 * Invokes function devServer().
 * When NODE_ENV is not set to production, devServer() is called.
 * Serves all static files within ./dist/dev directory to port 3000.
 */
function devServer() {

  const express = require('express');
  const app = express();
  const http = require('http').Server(app);
  const dirDev = path.join(__dirname, '../dist');

  app.use(express.static(dirDev));

  http.listen(3000, () => {
    console.info('\x1b[37m', '🌎 Dev-Server: Listening on port 3000, open browser to http://localhost:3000/');
  });

}



/**
 * Invokes function compileSCSS().
 * When called, uses Dart-Sass to compile scss to css.
 * Input: ./src/scss/app.scss.
 * output: ./dist/dev || ./dist/prod depending on NODE_ENV.
 */
function compileSCSS() {

  const sass = require('sass');
  const postcss = require('postcss');
  const autoprefixer = require('autoprefixer');

  console.info('\x1b[36m','😻 Rendering sass...');

  sass.render({
      file: './src/scss/app.scss',
      outputStyle: envType !== 'production' ? "expanded" : 'compressed',
      sourceMap: false,
      outFile: './dist/css/app.css',
    },
    function(error, result) {
      if (!error) {

        postcss([ autoprefixer ])
          .process(result.css, { from: undefined, to: 'dist/css/app.css' })
          .then(result => {

            fs.writeFile('./dist/css/app.css', result.css, err => {
              !err ? console.info('\x1b[32m',`🍕 CSS written to file!`) : null;
            });

          });

      } else {

        console.error(error);

      }
    });

}



/**
 * Invokes function compileECMA().
 * When called, uses browserify/babelify to compile ECMA script to js.
 * Input: ./src/js/app.js.
 * output: ./dist/dev || ./dist/prod depending on NODE_ENV.
 */
function compileECMA() {

  console.info('\x1b[36m','😻 transforming ECMA script...');

  const browserify = require("browserify");
  const babelify = require("babelify");

  browserify({ debug: false })
    .transform(babelify, {
       presets: ["@babel/preset-env"],
       comments: false,
       minified: envType !== 'production' ? false : true
     })
    .require("./src/js/index.js", { entry: true })
    .bundle()
    .on("error", function (err) { console.log("Error: " + err.message); })
    .pipe(fs.createWriteStream("./dist/js/bundle.js").on('finish', () => {
       console.log('\x1b[32m','🍕 Transform complete!');
     }));

}



/**
 * Invokes function taskWatcher().
 * Watches ./src folder for file changes.
 * Gets file extension name of file.
 * conditionally compileECMA or compileSCSS depending on changed files ext's type.
 */
function taskWatcher() {

  console.info('\x1b[37m', '👀 Dev-tools: watching for changes.')

  const chokidar = require('chokidar');
  const dirSrc = path.join(__dirname, '../src');

  chokidar.watch(dirSrc).on('change', path => {

    let extType = path.split('.').pop();

    if (extType === 'js') {

      compileECMA();

    } else if (extType === 'scss') {

      compileSCSS();

    }

  });

}



/**
 * Self invoking function, called on start.js files execution.
 * Calls devServer() and taskWatcher() when NODE_ENV != set to production.
 * Calls compileECMA() and compileSCSS() when NODE_ENV === set to production.
 */
(function() {

  if (envType !== 'production') {

    devServer();
    taskWatcher();

  } else if (envType === 'production') {

    compileSCSS();
    compileECMA();

  }

})();
