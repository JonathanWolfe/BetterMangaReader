var browserify = require('browserify'),
	gulp = require('gulp'),
	source = require('vinyl-source-stream'),
	buffer = require('vinyl-buffer'),
	uglify = require('gulp-uglify');

gulp.task('browserify', function () {
	gulp.task('browserify', function () {
		var bundleStream = browserify('./ext/js/app.js')
			.bundle()
			.pipe(source('build.js'))
			.pipe(buffer())
			.pipe(uglify())
			.pipe(gulp.dest('./ext/js/'));


		var buildInject = browserify('./ext/src/inject/inject.js')
			.bundle()
			.pipe(source('inject-build.js'))
			.pipe(buffer())
			.pipe(uglify())
			.pipe(gulp.dest('./ext/src/inject/'));
	});
});

gulp.task('watch', function () {
	gulp.watch('./ext/js/app.js', ['browserify']);
	gulp.watch('./ext/js/mirrors/**.js', ['browserify']);
	gulp.watch('./ext/src/inject/inject.js', ['browserify']);
});

gulp.task('default', ['browserify', 'watch']);
gulp.task('bundle', ['browserify']);