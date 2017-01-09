const gulp        = require('gulp');
const sass        = require('gulp-sass');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();

const Paths = {
  build: '/build/',
  build_css: 'build/css/',
  sass_source: [
    'src/scss/*.scss',
    'src/scss/**/*.scss'
  ],
  sass_entry: 'src/scss/main.scss',
  build_js: 'build/js/',
  js_source: [
    'src/js/entry.js'
  ],
};

gulp.task('serve', ['style', 'scripts'], function() {
    browserSync.init({
        server: "./"
    });
    gulp.watch(Paths.sass_source, ['style']);
    gulp.watch(Paths.js_source, ['scripts']);
    gulp.watch("*.html").on('change', browserSync.reload);
});

gulp.task('style', function() {
    return gulp.src(Paths.sass_entry)
        .pipe(sass())
        .pipe(concat('main.css'))
        .pipe(gulp.dest(Paths.build_css))
        .pipe(browserSync.stream());
});

gulp.task('scripts', function (production) {
  return gulp.src(Paths.js_source)
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest(Paths.build_js))
    .pipe(browserSync.stream());
});

gulp.task('default', ['serve']);
