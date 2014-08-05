/*global module */

module.exports = function (data) {
	"use strict";

	var amr,
		all_converted = [],
		mangas_added = [];

	data = data.replace(/(\\")+/g, '"');
	data = data.replace(/("\[)+/g, '[');
	data = data.replace(/(\]")+/g, ']');

	amr = JSON.parse(data);

	amr.mangas.forEach(function (manga, key) {

		// console.log(manga);

		if (mangas_added.indexOf(manga.name) === -1) {
			mangas_added.push(manga.name);

			all_converted.push({
				id: key,
				name: manga.name,
				mirror: manga.mirror,
				url: manga.url,
				urlOfLatestRead: manga.lastChapterReadURL,
				isTracked: (manga.display === 0 ? true : false),
				latestRead: (manga.lastChapterReadURL.match(/(\/|c)?([0-9]{3})(\.[0-9])?/))[0].substr(1),
				latest: '999',
				tags: manga.cats,
				chapter_list: [['999', '999', manga.url]]
			});
		}

	});

	// console.log('all_converted', all_converted);
	return all_converted;

};