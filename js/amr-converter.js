module.exports = function (data) {
	"use strict";

	var amr,
		all_converted = [];

	if (data instanceof Array) {
		var content = data[0].url.substr(17);

		content = content.substr(0, content.length - 28);
		content = content.replace(/(\\")+/g, '"');
		content = content.replace(/("\[)+/g, '[');
		content = content.replace(/(\]")+/g, ']');

		amr = JSON.parse(content);
	} else {
		amr = JSON.parse(data);
	}
	
	amr.mangas.forEach(function (manga, key) {

		console.log(manga);

		all_converted[key] = {
			id: key,
			name: manga.name,
			mirror: manga.mirror,
			url: manga.url,
			urlOfLatestRead: manga.lastChapterReadURL,
			isTracked: (manga.display === 0 ? true : false),
			latestRead: (manga.lastChapterReadURL.match(/\/c?([0-9]{1,3})(\.[0-9])?\//)[0]),
			latest: '999',
			tags: manga.cats
		};

	});

	// console.log(all_converted);
	return all_converted;

};