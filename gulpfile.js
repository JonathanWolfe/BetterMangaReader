var gulp = require('gulp');
var browserify = require('gulp-browserify');
var rename = require('gulp-rename');

// Basic usage
gulp.task('scripts', function() {
	// Single entry point to browserify
	gulp.src('js/app.js')
		.pipe(browserify({
			insertGlobals : true,
			debug : !gulp.env.production
		}))
		.pide(rename('build.js')
		.pipe(gulp.dest('js/build.js')
	);
});

// Watch Files For Changes
gulp.task('watch', function() {
	gulp.watch('js/*.js', ['scripts']);
});

// Default Task
gulp.task('default', ['scripts', 'watch']);