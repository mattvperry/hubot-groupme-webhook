'use strict';

var gulp = require('gulp');
var clean = require('gulp-clean');
var typings = require('gulp-typings');
var tsc = require('gulp-typescript');
var babel = require('gulp-babel');

gulp.task('default', ['build']);
gulp.task('build', ['clean', 'typings', 'scripts']);

gulp.task('clean', function() {
   return gulp
        .src(['typings', 'lib/**/*.js'])
        .pipe(clean()); 
});

gulp.task('typings', function() {
    return gulp
        .src("./typings.json")
        .pipe(typings()); 
});

gulp.task('scripts', ['typings'], function() {
    return gulp
        .src(['src/**/*.ts', '!src/typings/**/*.d.ts'])
        .pipe(tsc(tsc.createProject("tsconfig.json")))
        .pipe(babel({
            presets: ['es2015'], 
            plugins: ['transform-runtime'] 
        }))
        .pipe(gulp.dest('lib'));
});

gulp.task('watch', function() {
    return gulp.watch('src/**/*.ts', ['scripts'])
});