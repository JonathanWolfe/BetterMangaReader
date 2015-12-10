/*global chrome, window, module */
var storage = {

	"state": [],

	"loadState": function () {

		chrome.bookmarks.search('BMR Backup', function (results) {

			console.log('search results', results);

			if (results.length) {
				storage.state = JSON.parse(results[0].url.slice(23, -2));
			} else {
				console.log('No State to get. Writing new one.');
				storage.loadExample();
			}
		});
	},

	"backup": function (data) {

		if (typeof data === 'string') {
			data = JSON.parse(data);
		}
		
		data = data || storage.state;

		console.log("data being backed up", data);

		chrome.bookmarks.search('BMR Back-up', function (results) {
			if (results.length) {
				storage.updateBackup(JSON.stringify(data), results[0]);
			} else {
				storage.createBackup(JSON.stringify(data));
			}
		});

		storage.state = data;

	},

	"createBackup": function (data) {

		var date = Date.now(),
			revision = 1;

		chrome.bookmarks.create({
			title: 'BMR Backup.' + date + '.' + revision,
			url: 'javascript:console.log(' + data + ');'
		}, function (result) {
			console.log('created bookmark', result);
		});

	},

	"updateBackup": function (data, bmr_backup) {
		console.log('bmr_backup', bmr_backup);

		var matched = bmr_backup.title.match(/([0-9])+/g),
			bmr = {
				origin_hour: parseFloat(matched[0], 10),
				current_time: Date.now(),
				revision: parseFloat(matched[1], 10),
				new_revision: parseFloat(matched[1], 10) + 1
			};

		if ((bmr.origin_hour + 3600000) > bmr.current_time && bmr.new_revision > 99) {

			console.log('Failed to update back-up data. Too many updates this hour.');

		} else if ((bmr.origin_hour + 3600000) < bmr.current_time) {

			chrome.bookmarks.update(bmr_backup.id, {
				title: 'BMR Backup.' + bmr.current_time + '.' + 1,
				url: 'javascript:console.log(' + data + ');'
			});

		} else {

			chrome.bookmarks.update(bmr_backup.id, {
				title: 'BMR Backup.' + bmr.origin_hour + '.' + bmr.new_revision,
				url: 'javascript:console.log(' + data + ');'
			});

		}

		console.log('bmr update info', bmr);
	},

	"expandMangaData": function (mangas) {

		if (!mangas) {
			mangas = storage.state;
		}

		console.log('expanding manga data');

		window.setTimeout(function () {
			mangas.forEach(function (manga) {

				if (manga.isTracked && Object.keys(window.mirrors).indexOf(manga.mirror.toLowerCase()) !== -1) {
					manga.chapter_list = window.mirrors[manga.mirror.toLowerCase()].getChapterList(manga);

					manga.latest = manga.chapter_list[0][0];
				}

			});
		}, 200);

		storage.state = mangas;
		
		storage.update_icon_number();
		
		return true;

	},

	"loadExample": function () {

		var example = JSON.stringify([{
			"id": 0,
			"name": "Bleach",
			"mirror": "MangaStream",
			"url": "http://mangastream.com/manga/bleach",
			"urlOfLatestRead": "http://readms.com/r/bleach/591/2477/1?t=2&f=1&e=0",
			"isTracked": true,
			"latestRead": "591",
			"latest": "999",
			"tags": [],
			"chapter_list": [["999", "999", "http://mangastream.com/manga/bleach"]]
			}]);

		console.log('example data', example);

		storage.backup(example);

	},

	"already_tracked": function (search_name) {
		var found = false,
			index;

		for (var i = 0; i < storage.state.length; i += 1) {
			if (storage.state[i].name === search_name) {
				if (storage.state[i].isTracked) {
					found = true;
				}
				index = i;
				break;
			}
		}

		return [found, index];
	},

	"update_icon_number": function () {
		var icon_number = 0;

		storage.state.forEach(function (manga) {
			if (parseFloat(manga.latest, 10) > parseFloat(manga.latestRead, 10) && manga.isTracked) {
				icon_number += 1;
			}
		});

		chrome.browserAction.setBadgeText({
			'text': (!icon_number) ? '' : '' + icon_number
		});

		console.log('new icon number', icon_number);
		
		return true;
	}
};

module.exports = storage;