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
	});
});

gulp.task('watch', function () {
	gulp.watch('./js/**', ['browserify']);
});

gulp.task('default', ['browserify', 'watch']);