var browserify = require('browserify'),
	gulp = require('gulp'),
	source = require('vinyl-source-stream');

gulp.task('browserify', function () {
	gulp.task('browserify', function () {
		var bundleStream = browserify('./js/app.js').bundle();

		bundleStream
			.pipe(source('./build.js'))
			.pipe(gulp.dest('./js/'));
		
		var buildMirrors = browserify('./js/mirrors/get-all-mirrors.js').bundle();
		
		buildMirrors
			.pipe(source('./all-mirrors.js'))
			.pipe(gulp.dest('./js/mirrors/'));
		
		var buildInject = browserify('./src/inject/inject.js').bundle();
		
		buildInject
			.pipe(source('./inject-build.js'))
			.pipe(gulp.dest('./src/inject/'));
	});
});

gulp.task('watch', function () {
	gulp.watch('./js/app.js', ['browserify']);
	gulp.watch('./js/mirrors/**.js', ['browserify']);
	gulp.watch('./src/inject/inject.js', ['browserify']);
});

gulp.task('default', ['browserify', 'watch']);