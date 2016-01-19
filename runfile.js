import { run, watch } from 'runjs';

export function clean() {
	return run( 'rm -rf ext' );
}

export function parsers() {
	return run( 'babel ./src/parsers --out-dir ./ext/parsers' );;
}

export function scripts() {
	return run( 'babel ./src/scripts --out-dir ./ext/scripts' );;
}

export function css() {
	run( 'mkdir -p ./ext/styles' );
	return run( 'postcss --config postcss.config.json --dir ./ext/styles ./src/styles/**/*' );
}

export function icons() {
	return run( 'cp -R ./src/icons ./ext/icons' );
}

export function html() {
	return run( 'cp -R ./src/html ./ext/html' );
}

export function manifest() {
	return run( 'cp ./src/manifest.json ./ext/manifest.json' );
}

export function observeFiles() {
	watch( 'src/parsers/**/*.js', parsers );
	watch( 'src/scripts/**/*.js', scripts );

	watch( 'src/styles/**/*.css', css );

	watch( 'src/icons/**/*', icons );
	watch( 'src/html/**/*.html', html );
	watch( 'src/manifest.json', manifest );
}

export function build() {
	clean();

	parsers();
	scripts();

	css();

	icons();
	html();
	manifest();
}

export function develop() {
	build();

	observeFiles();
}
