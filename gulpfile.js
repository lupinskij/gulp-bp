var gulp        = require('gulp'),
    gutil       = require('gulp-util'),
    stylus      = require('gulp-stylus'),
    prefixer    = require('gulp-autoprefixer');
    minifyCSS   = require('gulp-minify-css'),
    jade        = require('gulp-jade'),
    changed     = require('gulp-changed'),
    cached      = require('gulp-cached'),
    filter      = require('gulp-filter'),
    inherit     = require('gulp-jade-inheritance'),
    coffee      = require('gulp-coffee'),
    uglify      = require('gulp-uglify'),
    concat      = require('gulp-concat'),
    rename      = require('gulp-rename'),
    flatten     = require('gulp-flatten'),
    marked      = require('marked'),
    path        = require('path'),
    plumber     = require('gulp-plumber'),
    notify      = require('gulp-notify'),
    webserver   = require('gulp-webserver'),
    _if         = require('gulp-if'),
    isWindows   = /^win/.test(require('os').platform());

// --- Stylus ---
gulp.task('stylus', function () {
  gulp.src('./dev/styles/**/*.styl')
    .pipe(stylus())
  .on('error', notify.onError({
    title: 'Fail',
    message: 'Stylus error'
  }))
  .on('error', function (err) {
    return console.log(err);
  })
    .pipe(prefixer({browsers: ['last 2 versions']}))
    .pipe(minifyCSS())
    .pipe(concat('styles.css'))
    .pipe(gulp.dest('./build/css'))

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
  gulp.src('bower_components/**/lt-ie-9.min.js')
    .pipe(rename('lt-ie-9.js'))
    .pipe(gulp.dest('./build/js/vendor'));
});

// --- Scripts ---
gulp.task('coffee', function() {
  gulp.src('./dev/scripts/**/*.coffee')
    .pipe(coffee({bare: true}))
  .on('error', notify.onError({
    title: 'Fail',
    message: 'Coffee error'
  }))
  .on('error', function (err) {
    return console.log(err);
  })
    .pipe( uglify() )
    .pipe( gulp.dest('./build/js'))
    .pipe(_if(!isWindows, notify({
      title: 'Sucess',
      message: 'Javascript compiled'
    })));
});

// --- Vendor ---
gulp.task('vendor', function() {
  return gulp.src('bower_components/**/modernizr.js')
    .pipe(flatten())
    .pipe(uglify())
    .pipe(gulp.dest('build/js/vendor'));
});

// --- Jade ---
gulp.task('templates', function() {
  return gulp.src('./dev/**/*.jade')
    .pipe(changed('dist', {extension: '.html'}))
    .pipe(_if(global.isWatching, cached('jade')))
    .pipe(inherit({basedir: './dev'}))
    .pipe(filter(function(file) {
      return !/\/_/.test(file.path) || !/^_/.test(file.relative);
    }))
    .pipe(jade())
    .pipe(gulp.dest('./build'))
    .pipe(_if(!isWindows, notify({
      title: 'Sucess',
      message: 'Jade compiled'
    })));
});

// --- Server ---
gulp.task('server', function() {
  gulp.src('./build')
    .pipe(webserver({
      livereload: true,
      open: true,
      port: 4000
    }));
});

// --- Watch ---
gulp.task('watch', function() {
  gulp.watch(['./dev/styles/**/*.styl'], ['stylus']);
  gulp.watch(['./dev/scripts/**/*.coffee'], ['coffee']);
  gulp.watch(['./dev/**/*.jade'], ['templates']);
});

// --- Default task ---
gulp.task('default', ['coffee','vendor','rename','stylus','templates','server','watch']);
