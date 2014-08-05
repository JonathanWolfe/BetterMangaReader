/*global chrome, window, module */
var storage = {

	"state": [],

	"loadState": function () {

		chrome.bookmarks.search('BMR Backup', function (results) {

			console.log('search results', results);

			if (results.length > 0) {
				storage.state = JSON.parse(results[0].url.slice(23, -2));
			} else {
				console.log('No State to get. Writing new one.');
				storage.loadExample();
			}
		});
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

		console.log('expanding manga data');

		chrome.runtime.sendMessage({
			expandingMangas: true
		});

		window.setTimeout(function () {
			mangas.forEach(function (manga) {

				if (manga.isTracked) {
					manga.chapter_list = window.use_mirror[manga.mirror].getChapterList(manga);

					manga.latest = manga.chapter_list[0][0];
				}

			});
		}, 200);

		window.update_icon_number();
		
		chrome.runtime.sendMessage({
			expandingMangasDone: true
		});

		return mangas;

	},

	"loadExample": function () {
		chrome.bookmarks.search('BMR Backup', function (results) {

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

			if (results.length > 0) {
				storage.updateBackup(example, results[0]);
			} else {
				storage.createBackup(example);
			}
		});

	}
};

module.exports = storage;