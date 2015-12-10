var gulp = require( 'gulp' );
var plumber = require( 'gulp-plumber' );
var babel = require( 'gulp-babel' );
var uglify = require( 'gulp-uglify' );
var cssnext = require( 'gulp-cssnext' );


gulp.task( 'manifest', function () {
	gulp.src( 'src/manifest.json' ).pipe( gulp.dest( 'ext' ) );
} );


gulp.task( 'icons', function () {
	gulp.src( 'src/icons/**/*' ).pipe( gulp.dest( 'ext/icons' ) );
} );


gulp.task( 'html', function () {
	gulp.src( 'src/html/**/*.html' ).pipe( gulp.dest( 'ext/html' ) );
} );


gulp.task( 'css', function () {
	gulp.src( 'src/styles/*.css' )
		.pipe( cssnext( {
			compress: true
		} ) )
		.pipe( gulp.dest( 'ext/styles' ) )
} );


gulp.task( 'scripts', function () {
	return gulp.src( 'src/scripts/**/*.js' )
		.pipe( plumber( {
			errorHandler: function ( error ) {
				console.log( error.message );
				this.emit( 'end' );
			}
		} ) )
		.pipe( babel( {
			presets: [ 'es2015' ]
		} ) )
		.pipe( uglify() )
		.pipe( gulp.dest( 'ext/scripts/' ) )
} );


gulp.task( 'build', [ 'manifest', 'icons', 'html', 'scripts', 'css' ] );


gulp.task( 'watch', [ 'build' ], function () {
	gulp.watch( 'src/scripts/**/*.js', [ 'scripts' ] );
	gulp.watch( 'src/styles/**/*.css', [ 'css' ] );
	gulp.watch( 'src/icons/**/*', [ 'icons' ] );
	gulp.watch( 'src/html/**/*.html', [ 'html' ] );
	gulp.watch( 'src/manifest.json', [ 'manifest' ] );
} );


gulp.task( 'default', [ 'build' ] );
