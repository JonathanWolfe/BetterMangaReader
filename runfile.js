import { run, watch } from 'runjs';

export function clean() {
	return run( 'rm -rf ./ext' );
}

export function initEmpty() {
	return run( 'mkdir -p ./ext/parsers ./ext/scripts ./ext/icons ./ext/html ./ext/styles' );
}

export function copyFiles() {
	run( 'cp -R -f ./src/parsers ./ext/parsers' );
	run( 'cp -R -f ./src/scripts ./ext/scripts' );

	run( 'cp -R -f ./src/icons ./ext/icons' );

	run( 'cp -R -f ./src/html ./ext/html' );

	run( 'cp -R -f ./src/manifest.json ./ext/manifest.json' );
}

export function css() {
	return run( 'postcss --config postcss.config.json --dir ./ext/styles ./src/styles/**/*' );
}

export function observeFiles() {
	console.log( '' )
	watch( 'src/parsers/**/*.js', copyFiles );
	watch( 'src/scripts/**/*.js', copyFiles );
	watch( 'src/icons/**/*', copyFiles );
	watch( 'src/html/**/*.html', copyFiles );
	watch( 'src/manifest.json', copyFiles );

	watch( 'src/styles/**/*.css', css );
	console.log( '' )
}

export function build() {
	clean();
	initEmpty();

	copyFiles();
	css();
}

export function develop() {
	build();

	observeFiles();
}
