// Lead off with jQuery
window.$ = require('jquery');

// Almost everything depends on mirrors
window.mirrors = require('./register-mirrors');
window.mirrors_keys = Object.keys(mirrors);

// depends on mirrors, mirrors_keys
window.bmr_storage = require('./storage');

// depends on storage
window.messages = require('./messages');

// No dependency
window.amr_converter = require('./amr-converter');