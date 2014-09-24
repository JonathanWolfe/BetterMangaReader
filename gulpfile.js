var browserify = require('browserify'),
	gulp = require('gulp'),
	source = require('vinyl-source-stream');

gulp.task('browserify', function () {
	gulp.task('browserify', function () {
		var bundleStream = browserify('./ext/js/app.js').bundle();

		bundleStream
			.pipe(source('build.js'))
			.pipe(gulp.dest('./ext/js/'));
		
		var buildMirrors = browserify('./ext/js/mirrors/get-all-mirrors.js').bundle();
		
		buildMirrors
			.pipe(source('all-mirrors.js'))
			.pipe(gulp.dest('./ext/js/mirrors/'));
		
		var buildInject = browserify('./ext/src/inject/inject.js').bundle();
		
		buildInject
			.pipe(source('inject-build.js'))
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