const { src, dest, watch, parallel, series } = require('gulp');

const sass        = require('gulp-sass',)(require('sass'));
const concat      = require('gulp-concat');
const uglify      = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const clean       = require('gulp-clean');
const pug         = require('gulp-pug');
const plumber     = require('gulp-plumber');

// Сервер
function browserSyncServer() {
  browserSync.init({
      server: {
        baseDir: "./build"
      }
    });
}
// Копируем стили
function styles() {
  return src('./app/scss/main.scss')
    .pipe(concat('main.css'))
    .pipe(sass())
    .pipe(dest('./build/css'))
    .pipe(browserSync.stream())
}
// Копируем изображение
function copyImg() {
  return src('./app/img/**/*.*', { encoding: false })
    .pipe(dest('./build/img/'))
}
// Копируем скрипты
function copyScript() {
  return src(
    [
      './app/js/**/*.js'
    ]
  )
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('./build/js'))
    .pipe(browserSync.stream())
}
// Наблюдение за файлами
function watching() {
  watch(['./app/scss/**/*.scss'], styles);
  watch(['./app/js/*.js'], copyScript);
  watch(['./app/img/**/*.*'], copyImg);

  watch([
    './build/*.html',
    './build/img/**/*.*',
    './build/js/**/*.js',
    './build/css/**/*.css',
  ]).on('change', browserSync.reload);

  watch(['./app/pug/**/*.pug'], pugFiles).on('change', browserSync.reload);
}
// Удаляем папку Build
function cliningBuild() {
  return src('./build')
    .pipe(clean())
}
// Сбор билда
function building() {
  return src(
    [
      './app/css/main.css',
      './app/js/main.js',
      './app/**/*.html'

    ], {base: 'app'})
      .pipe(dest('./build'))
}
// PUG
function pugFiles() {
  return src('./app/pug/pages/**/*.pug')
    .pipe(pug({
      pretty: true
    }))
    .pipe(dest('./build/'))
}

exports.styles            = styles;
exports.watching          = watching;
exports.browserSyncServer = browserSyncServer;
exports.copyScript        = copyScript;
exports.copyImg           = copyImg;
exports.cliningBuild      = cliningBuild;
exports.building          = building;

// Pug 
exports.pugFiles          = pugFiles;

exports.default           = series(
  series(building, cliningBuild, building),
  parallel(styles, copyScript, copyImg, pugFiles), 
  parallel(watching, browserSyncServer)
);