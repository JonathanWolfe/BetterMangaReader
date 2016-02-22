import { run, watch } from 'runjs';

export function clean() {
	return run( 'rm -rf ./ext' );
}

export function initEmpty() {
	return run( 'mkdir -p ./ext/parsers ./ext/scripts ./ext/icons ./ext/html ./ext/styles' );
}

export function parsers() {
	return run( 'cp -R -f ./src/parsers ./ext' );
}
export function scripts() {
	return run( 'cp -R -f ./src/scripts ./ext' );
}

export function icons() {
	return run( 'cp -R -f ./src/icons ./ext' );
}

export function html() {
	return run( 'cp -R -f ./src/html ./ext' );
}

export function manifest() {
	return run( 'cp -R -f ./src/manifest.json ./ext/manifest.json' );
}

export function css() {
	return run( 'postcss --config postcss.config.json --dir ./ext/styles ./src/styles/**/*' );
}

export function observeFiles() {
	console.log( '' );
	watch( 'src/parsers/**/*.js', parsers );
	watch( 'src/scripts/**/*.js', scripts );
	watch( 'src/icons/**/*', icons );
	watch( 'src/html/**/*.html', html );
	watch( 'src/manifest.json', manifest );

	watch( 'src/styles/**/*.css', css );
	console.log( '' );
}

export function build() {
	clean();
	initEmpty();

	parsers();
	scripts();
	icons();
	html();
	manifest();

	css();
}

export function develop() {
	build();

	observeFiles();
}
