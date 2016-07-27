// FOUNDATION FOR APPS TEMPLATE GULPFILE
// -------------------------------------
// This file processes all of the assets in the "client" folder, combines them with the Foundation for Apps assets, and outputs the finished files in the "build" folder as a finished app.

// 1. LIBRARIES
// - - - - - - - - - - - - - - -

var $ = require('gulp-load-plugins')(),
  argv = require('yargs')(['production1']).argv,
  gulp = require('gulp'),
  rimraf = require('rimraf'),
  router = require('front-router'),
  sequence = require('run-sequence'),
  imagemin = require('gulp-imagemin'),
  cache = require('gulp-cache');

// Check for --production flag
var isProduction = argv._[0] === 'production';

// 2. FILE PATHS
// - - - - - - - - - - - - - - -

var paths = {
  assets: [
    './client/**/*.*',
    '!./client/templates/**/*.*',
    '!./client/assets/{css,scss,js,img}/**/*.*'
  ],
  // Sass will check these folders for files when you use @import.
  sass: [
    'client/assets/scss',
    'bower_components/foundation-apps/scss'
  ],
  css: [
    'client/assets/css/oa.css',
    'bower_components/foundation-apps/dist/css/foundation-apps.min.css',
    'bower_components/material-date-picker/app/styles/mbdatepicker.css',
  ],
  font: [
    'client/assets/css/font/*.*'
  ],
  // These files include Foundation for Apps and its dependencies
  vendorJs: [
    'bower_components/angular/angular.js',
    'bower_components/angular-resource/angular-resource.js',
    'bower_components/angular-animate/angular-animate.js',
    'bower_components/angular-ui-router/release/angular-ui-router.js',
    'bower_components/foundation-apps/js/angular/**/*.js',
    '!bower_components/foundation-apps/js/angular/app.js',
    'client/assets/js/adaptation.js',
    'client/assets/js/ngStorage.min.js',
    'bower_components/moment/min/moment.min.js',
    'bower_components/material-date-picker/build/mbdatepicker.js',

  ],
  //requirejs
  requireJs: [
    'client/assets/js/main.js',
  ],
  // These files are for your app's JavaScript
  appJS: [
    'client/assets/js/app.js',
    'client/assets/js/FileSaver.js',
  ],
  controllerJS: [
    'client/assets/js/controllers/*.js',
  ],
  serviceJS: [
    'client/assets/js/services/*.js'
  ]
}

// 3. TASKS
// - - - - - - - - - - - - - - -

// Cleans the build directory
gulp.task('clean', function (cb) {
  rimraf('./build', cb);
});

// Copies everything in the client folder except templates, Sass, and JS
gulp.task('copy', function () {
  return gulp.src(paths.assets, {
    base: './client/'
  })
    .pipe(gulp.dest('./build'))
    ;
});

// Copies your app's page templates and generates URLs for them
gulp.task('copy:templates', function () {
  return gulp.src('./client/templates/**/*.html')
    .pipe(router({
      path: 'build/assets/js/routes.js',
      root: 'client'
    }))
    .pipe(gulp.dest('./build/templates'))
    ;
});

// Compiles the Foundation for Apps directive partials into a single JavaScript file
gulp.task('copy:foundation', function (cb) {
  gulp.src('bower_components/foundation-apps/js/angular/components/**/*.html')
    .pipe($.ngHtml2js({
      prefix: 'components/',
      moduleName: 'foundation',
      declareModule: false
    }))
    .pipe($.uglify())
    .pipe($.concat('templates.js'))
    .pipe(gulp.dest('./build/assets/js'))
  ;

  cb();
});

// Compiles Sass
gulp.task('sass', function () {
  var cssmin = $.if(isProduction, $.minifyCss()
    .on('error', function (e) {
      console.log(e);
    }));

  return gulp.src('client/assets/scss/app.scss')
    .pipe($.sass({
      includePaths: paths.sass,
      outputStyle: (isProduction ? 'compressed' : 'nested'),
      errLogToConsole: true
    }))
    .pipe($.autoprefixer({
      browsers: ['last 2 versions', 'ie 10']
    }))
    .pipe(cssmin)
    .pipe(gulp.dest('./build/assets/css/'));
});

//Copy css
gulp.task('css', function () {
  var cssmin = $.if(isProduction, $.minifyCss()
    .on('error', function (e) {
      console.log(e);
    }));

  return gulp.src(paths.css)
    .pipe($.concat('oa.css'))
    .pipe(cssmin)
    .pipe(gulp.dest('./build/assets/css/'));
});

//Copy fonts
gulp.task('font', function () {
   return gulp.src(paths.font)
     .pipe(gulp.dest('./build/assets/css/font/'));
});

//Copy Images
gulp.task('img', function () {
  return gulp.src('client/assets/img/**/*')
    //.pipe(cache(imagemin({optimizationLevel: 3, progressive: true, interlaced: true})))
    .pipe(gulp.dest('./build/assets/img/'));
});

//Copy excel
gulp.task('excel', function () {
  return gulp.src('client/assets/excel/**/*')
    .pipe(gulp.dest('./build/assets/excel/'));
});

// Compiles and copies the Foundation for Apps JavaScript, as well as your app's custom JS
gulp.task('uglify', ['uglify:foundation', 'uglify:requirejs', 'uglify:app', 'uglify:controller', 'uglify:service'])

gulp.task('uglify:foundation', function (cb) {
  var uglify = $.if(isProduction, $.uglify()
    .on('error', function (e) {
      console.log(e);
    }));

  return gulp.src(paths.vendorJs)
    .pipe(uglify)
    .pipe($.concat('vendor.js'))
    .pipe(gulp.dest('./build/assets/js/'))
    ;
});

gulp.task('uglify:requirejs', function () {
  return gulp.src(paths.requireJs)
    .pipe(gulp.dest('./build/assets/js/'))
    ;
});

gulp.task('uglify:app', function () {
  var uglify = $.if(isProduction, $.uglify()
    .on('error', function (e) {
      console.log(e);
    }));

  return gulp.src(paths.appJS)
    .pipe(uglify)
    .pipe(gulp.dest('./build/assets/js/'))
    ;
});

gulp.task('uglify:controller', function () {
  var uglify = $.if(isProduction, $.uglify()
    .on('error', function (e) {
      console.log(e);
    }));

  return gulp.src(paths.controllerJS)
    .pipe(uglify)
    .pipe(gulp.dest('./build/assets/js/controllers/'))
    ;
});

gulp.task('uglify:service', function () {
  var uglify = $.if(isProduction, $.uglify()
    .on('error', function (e) {
      console.log(e);
    }));

  return gulp.src(paths.serviceJS)
    .pipe(uglify)
    .pipe(gulp.dest('./build/assets/js/services/'));
});

// Starts a test server, which you can view at http://localhost:8000
gulp.task('server', ['build'], function () {
  gulp.src('./build')
    .pipe($.webserver({
      port: 8000,
      host: 'localhost',
      fallback: 'index.html',
      livereload: true,
      open: true
    }))
  ;
});

// Builds your entire app once, without starting a server
gulp.task('build', function (cb) {
  sequence('clean', ['copy', 'copy:foundation', 'img', 'excel','css', 'font', 'uglify'], 'copy:templates', cb);
});

// Default task: builds your app, starts a server, and recompiles assets when they change
gulp.task('default', ['server'], function () {
  // Watch Sass
  gulp.watch(['./client/assets/scss/**/*', './scss/**/*'], ['sass']);

  // Watch css
  gulp.watch(['./client/assets/css/**/*', './css/*.css'], ['css']);

  // Watch JavaScript
  gulp.watch(['./client/assets/js/**/*', './js/**/*'], ['uglify:requirejs', 'uglify:app', 'uglify:controller', 'uglify:service']);

  // Watch Images
  gulp.watch('./client/assets/img/**/*', ['img']);

  // Watch static files
  gulp.watch(['./client/**/*.*', '!./client/templates/**/*.*', '!./client/assets/{scss,js,img}/**/*.*'], ['copy']);

  // Watch app templates
  gulp.watch(['./client/templates/**/*.html'], ['copy:templates']);
});
