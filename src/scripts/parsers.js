/**
 * The collection of available, registered parsers
 * @type {Object}
 */
const collection = {};

/**
 * Add a parser to the Collection
 * @param {Parser} parser The parser object to be added
 */
function register( parser ) {
	if ( !collection[ parser.normalizedName ] ) {
		collection[ parser.normalizedName ] = parser;
	}
}

window.parsers = {
	collection,
	register,
};
