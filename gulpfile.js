const gulp = require( 'gulp' );
const plumber = require( 'gulp-plumber' );
const babel = require( 'gulp-babel' );
const uglify = require( 'gulp-uglify' );
const cssnext = require( 'gulp-cssnext' );


const plumberOptions = {
	errorHandler: function handleError( error ) {
		console.log( error.message );
		this.emit( 'end' );
	},
};
const babelOptions = {
	presets: [ 'es2015' ],
};


gulp.task( 'manifest', function copyManifest() {
	gulp.src( 'src/manifest.json' ).pipe( gulp.dest( 'ext' ) );
} );


gulp.task( 'icons', function copyIcons() {
	gulp.src( 'src/icons/**/*' ).pipe( gulp.dest( 'ext/icons' ) );
} );


gulp.task( 'html', function copyHTML() {
	gulp.src( 'src/html/**/*.html' ).pipe( gulp.dest( 'ext/html' ) );
} );


gulp.task( 'css', function processCSS() {
	gulp.src( 'src/styles/*.css' )
		.pipe( cssnext( {
			compress: {
				zindex: false,
				discardComments: {
					removeAll: true,
				},
			},
		} ) )
		.pipe( gulp.dest( 'ext/styles' ) );
} );


gulp.task( 'scripts', function processJS() {
	return gulp.src( 'src/scripts/**/*.js' )
		.pipe( plumber( plumberOptions ) )
		.pipe( babel( babelOptions ) )
		.pipe( uglify() )
		.pipe( gulp.dest( 'ext/scripts/' ) );
} );

gulp.task( 'parsers', function processParsers() {
	return gulp.src( 'src/parsers/**/*.js' )
		.pipe( plumber( plumberOptions ) )
		.pipe( babel( babelOptions ) )
		.pipe( uglify() )
		.pipe( gulp.dest( 'ext/parsers/' ) );
} );


gulp.task( 'build', [ 'manifest', 'icons', 'html', 'parsers', 'scripts', 'css' ] );


gulp.task( 'watch', [ 'build' ], function watchFiles() {
	gulp.watch( 'src/parsers/**/*.js', [ 'parsers' ] );
	gulp.watch( 'src/scripts/**/*.js', [ 'scripts' ] );
	gulp.watch( 'src/styles/**/*.css', [ 'css' ] );
	gulp.watch( 'src/icons/**/*', [ 'icons' ] );
	gulp.watch( 'src/html/**/*.html', [ 'html' ] );
	gulp.watch( 'src/manifest.json', [ 'manifest' ] );
} );


gulp.task( 'default', [ 'build' ] );
