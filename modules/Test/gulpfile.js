/* global */
'use strict';

var gulp = require('gulp'),
    jade = require('gulp-jade'),
    browserify = require('browserify'),
    vinylSource = require('vinyl-source-stream'),
    uglify = require('gulp-uglify'),
    streamify = require('gulp-streamify'),
    sass = require('gulp-sass'),
    less = require('gulp-less'),
    sourcemaps = require('gulp-sourcemaps'),
    connect = require('gulp-connect'),
    argv = require('optimist').argv,
    gulpif = require('gulp-if');

// var dir_builds = '../../gulp_workfolder/builds';
var dir_builds = '../builds/';
// var dir_components = '../../gulp_workfolder/components';
var dir_components = '';
var dir_jade_comps = dir_components + '**/*.jade';

console.log ('argv: ', argv);

// var env = process.env.NODE_ENV || 'development';
var env = argv.env || 'development';
console.log('env: ', env);


gulp.task('jade', function(){
    return gulp.src(dir_jade_comps)
    .pipe(jade({pretty: true}))
    .pipe(gulp.dest(dir_builds))
    // .pipe(connect.reload());
});

gulp.task('js', function(){
    return browserify({
        entries: ['./src/js/main.js'],
        debug: env === 'development' // only include source map if NODE_ENV is set 'development'
    })
    .bundle()
    .pipe(vinylSource('app.js')) // <-
                    // Gulp work w vinyl-source-obj, it
                    // does not undestand browserify bundle directly.
                    // Thus, need vinyl-source-stream plugin to translate
                    // browserify output to what gulp stream understand
                    //       @Parameter: is the desire name
    // .pipe(uglify())          // << error because uglify does not support streaming.
                                //      Uglify require the entire content of the output to do its work.
                                //      Thus, we need to use gulp-streamify. Gulp-streamify
                                //      save entire stream output in a buffer bf calling uglify plugin.
    .pipe(
        gulpif( env === 'production', streamify(uglify())) // only uglify on production enviroment
     )
    .pipe(gulp.dest(outputDir))
    .pipe(connect.reload());
});

gulp.task('sass', function(){
    var config = {};
    console.log(env);
    if (env === 'development') { config.writeSrcMap = true; }
    if (env === 'production') { config.writeSrcMap = false; }

    return gulp.src('src/sass/main.scss')
    .pipe(sourcemaps.init())   // <--- sourcemaps initialize
    .pipe(sass({errLogToConsole: true}))
    .pipe( gulpif( config.writeSrcMap, sourcemaps.write()))
    // .pipe( gulpif( false, sourcemaps.write()))
    .pipe(gulp.dest(outputDir))
    .pipe(connect.reload());
});



gulp.task('less', function(){
    var config = {};
    console.log(env);
    if (env === 'development') { config.writeSrcMap = true; }
    if (env === 'production') { config.writeSrcMap = false; }

    return gulp.src('src/less/main.less')
    .pipe( sourcemaps.init())   // <--- sourcemaps initialize
    .pipe(less())
    .on('error', function(err){
        //see //https://github.com/gulpjs/gulp/issues/259
        console.log(err);
        this.emit('end');
    })
    // NOTE: the following work too
    // .pipe(less().on('error', function(err){
    //     console.log(err);
    //     this.emit('end');
    // }))
    .pipe( gulpif( config.writeSrcMap, sourcemaps.write()))
    .pipe(gulp.dest(outputDir))
    .pipe(connect.reload());
});

gulp.task('watch', function(){
    gulp.watch('src/templates/**/*.jade', ['jade']);
    // gulp.watch('src/js/**/*.js', ['js']);
    // gulp.watch('src/sass/**/*.scss', ['sass']);
    // gulp.watch('src/less/**/*.less', ['less']);
})

gulp.task('connect', function(){
connect.server({
        root: outputDir,
        // open: { browser: 'Google Chrome'}
        // Option open does not work in gulp-connect v 2.*. Please read "readme" https://github.com/AveVlad/gulp-connect}
        livereload: true
    });
});

// gulp.task('default', ['js', 'jade', 'sass', 'watch', 'connect']);
// gulp.task('default', ['js', 'jade', 'less', 'watch', 'connect']);
gulp.task('default', ['jade']);

// if you need to run your task synchronously look for plugin called 'run-sequence'
