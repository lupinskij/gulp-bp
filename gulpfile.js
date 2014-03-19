var gulp        = require('gulp'),
    open        = require("gulp-open"),
    gutil       = require('gulp-util'),
    stylus      = require('gulp-stylus'),
    nib         = require('nib'),
    minifyCSS   = require('gulp-minify-css'),
    uglify      = require('gulp-uglify'),
    jade        = require('gulp-jade'),
    concat      = require('gulp-concat'),
    rename      = require("gulp-rename"),
    flatten     = require('gulp-flatten'),
    marked      = require('marked'), // For :markdown filter in jade
    path        = require('path'),
    plumber     = require('gulp-plumber'),
    notify      = require('gulp-notify'),
    livereload  = require('gulp-livereload'),
    tinylr      = require('tiny-lr'),
    express     = require('express'),
    app         = express(),
    server      = tinylr(),
    _if         = require('gulp-if'),
    isWindows   = /^win/.test(require('os').platform());

// --- Stylus ---
gulp.task('stylus', function () {
    gulp.src('./dev/styles/*.styl')
      .pipe(stylus({
            use: ['nib'],
            import: ['nib']
            }))
    .on('error', notify.onError({
      title: 'Fail',
      message: 'Stylus error'
    }))
    .on('error', function (err) {
      return console.log(err);
    })
      .pipe(minifyCSS())
      .pipe(concat("styles.css"))
      .pipe(gulp.dest('./build/css'))
        .pipe(livereload(server))
        .pipe(_if(!isWindows, notify({
          title: 'Sucess',
          message: 'Stylus compiled'
        })));
});

// --- Normalize ---
gulp.task('rename', function() {
    gulp.src('bower_components/**/normalize.css')
      .pipe(rename('normalize.styl'))
      .pipe(gulp.dest('./dev/styles'));
});

// --- Scripts ---
gulp.task('js', function() {
  return gulp.src('./dev/scripts/*.js')
    .pipe( uglify() )
    .pipe( gulp.dest('./build/js'))
    .pipe(livereload(server))
    .pipe(_if(!isWindows, notify({
      title: 'Sucess',
      message: 'Javascript compiled'
    })));
});

// --- Vendor ---
gulp.task('vendor', function() {
  return gulp.src('bower_components/**/modernizr.js')
      .pipe(flatten())
      .pipe( uglify() )
      // .pipe( concat('vendor.js'))
      .pipe(gulp.dest('build/js'));
});

// --- Jade ---
gulp.task('templates', function() {
  return gulp.src('./dev/*.jade')
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest('./build'))
    .pipe(livereload(server))
    .pipe(_if(!isWindows, notify({
      title: 'Sucess',
      message: 'Jade compiled'
    })));
});

// --- Server ---
gulp.task('server', function() {
  app.use(require('connect-livereload')());
  app.use(express.static(path.resolve('./build')));
  app.listen(4000);
  gutil.log('Listening on localhost:4000');
});

// --- Open ---
gulp.task('open', function(){
  return gulp.src('./build/index.html')
      .pipe(open('', {url:'http://localhost:4000'}));
});

// --- Watch ---
gulp.task('watch', function () {
  server.listen(35729, function (err) {
    if (err) {
      return console.log(err);
    }
    gulp.watch('./dev/styles/*.styl',['stylus']);
    gulp.watch('./dev/scripts/*.js',['js']);
    gulp.watch('./dev/*.jade',['templates']);
  });
});

// --- Default task ---
gulp.task('default', ['js','vendor','rename','stylus', 'templates','server','watch', 'open']);
