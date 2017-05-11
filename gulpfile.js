var gulp = require('gulp'),
  nodemon = require('gulp-nodemon'),
  plumber = require('gulp-plumber'),
  livereload = require('gulp-livereload'),
  sass = require('gulp-sass');
  coffee = require('gulp-coffee');
  uglify = require('gulp-uglify');
  changed = require('gulp-changed')

gulp.task('sass', function () {
  gulp.src('./src/sass/*.{sass,scss}')
    .pipe(plumber())
    .pipe(sass({
      outputStyle: 'compressed',
      includePaths: ['node_modules/modularscale-sass/stylesheets', 'node_modules/standard/src/sass']
    }))
    .pipe(gulp.dest('./public/css'))
    .pipe(livereload());
});

gulp.task('watch', function() {
  gulp.watch('./src/sass/*.sass', ['sass']);
  gulp.watch('./src/js/*.coffee',['coffee']);
});

gulp.task('develop', function () {
  livereload.listen();
  nodemon({
    script: 'app.js',
    ext: 'js pug coffee',
    stdout: false
  }).on('readable', function () {
    this.stdout.on('data', function (chunk) {
      if(/^Express server listening on port/.test(chunk)){
        livereload.changed(__dirname);
      }
    });
    this.stdout.pipe(process.stdout);
    this.stderr.pipe(process.stderr);
  });
});

gulp.task('coffee', function() {
  gulp.src('./src/js/*.coffee')
    .pipe(coffee({bare: true}))
    .pipe(uglify())
    .pipe(gulp.dest('./public/js'));
});

gulp.task('assets', function() {
  gulp.src('./src/assets/**/*.*')
    .pipe(gulp.dest('./public/assets'));
});

gulp.task('production', ['assets', 'sass', 'coffee']);

gulp.task('default', [
  'assets',
  'sass',
  'develop',
  'coffee',
  'watch'
]);
