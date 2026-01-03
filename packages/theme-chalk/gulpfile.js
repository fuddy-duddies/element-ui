'use strict';

const { series, src, dest } = require('gulp');
const gulpSass = require('gulp-sass');
const sass = require('node-sass');
const autoprefixer = require('gulp-autoprefixer');
const cssmin = require('gulp-cssmin');

function compile() {
  return src('./src/*.scss')
    .pipe(gulpSass(sass).sync())
    .pipe(autoprefixer({
      browsers: ['ie > 9', 'last 2 versions'],
      cascade: false
    }))
    .pipe(cssmin())
    .pipe(dest('./lib'));
}

function copyfont() {
  return src('./src/fonts/**')
    .pipe(cssmin())
    .pipe(dest('./lib/fonts'));
}

exports.build = series(compile, copyfont);
