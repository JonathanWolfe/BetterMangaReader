var storage = {
	
	"state": [],

	"loadState": function () {
		var backup_state = "{}";

		chrome.bookmarks.search('BMR Backup', function (results) {

			if (results.length > 0) {
				backup_state = results[0].url.slice(23, -2);
				storage.state = JSON.parse(backup_state);
			} else {
				console.error('No State to get');
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
			console.log(result);
		});

	},

	"updateBackup": function (data, bmr_backup) {
		console.log(bmr_backup);

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

		console.log(bmr);
	},

	"loadExample": function () {
		$.get('../test-json-state-save.json').done(function (data) {

			chrome.bookmarks.search('BMR Backup', function (results) {
				if (results.length > 0) {
					storage.updateBackup(data, results[0]);
				} else {
					storage.createBackup(data);
				}
			});
		});

	}
}

module.exports = storage;