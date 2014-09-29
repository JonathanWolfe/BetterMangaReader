/* global chrome, window */

function backup(data) {

	if (typeof data === 'string') {
		data = JSON.parse(data);
	}

	console.log("data being back-ed up", data);

	chrome.bookmarks.search('BMR Back-up', function (results) {
		if (results.length > 0) {

			window.bmr_storage.updateBackup(JSON.stringify(data), results[0]);

		} else {

			window.bmr_storage.createBackup(JSON.stringify(data));

		}
	});

	window.bmr_storage.state = data;

}

function already_tracked(search_name) {
	var found = false,
		index;

	for (var i = 0; i < window.bmr_storage.state.length; i++) {
		if (window.bmr_storage.state[i].name === search_name) {
			if (window.bmr_storage.state[i].isTracked) {
				found = true;
			}
			index = i;
			break;
		}
	}

	return [found, index];
}

function update_icon_number() {
	var icon_number = 0;

	window.bmr_storage.state.forEach(function (manga) {
		if (parseFloat(manga.latest, 10) > parseFloat(manga.latestRead, 10) && manga.isTracked) {
			icon_number += 1;
		}
	});

	chrome.browserAction.setBadgeText({
		'text': (icon_number < 1) ? '' : '' + icon_number
	});

	console.log('new icon number', icon_number);
}

function expandMangas() {
	var updated = window.bmr_storage.expandMangaData(window.bmr_storage.state);
	console.log('updated mangas', updated);
}

// window.bmr_storage.loadExample();
window.bmr_storage.loadState();

(function backgroundInit() {

	console.log("Storage state", window.bmr_storage.state);

	if (window.bmr_storage.state.length > 0) {

		var backup_interval = window.setInterval(function () {
			backup(window.bmr_storage.state);
		}, 60000); // every min

		update_icon_number();

		window.setTimeout(expandMangas, 60000);
		var expandedDelay = window.setInterval(expandMangas, 600000);

	} else {

		console.log('No manga yet. Will try again.');

		var retry = window.setTimeout(backgroundInit, 200);

	}
})();



// Called when the user clicks on the browser action icon.
chrome.browserAction.onClicked.addListener(function () {

	var optionspage = 'src/pages/index.html',
		optionsUrl = chrome.extension.getURL(optionspage);

	chrome.tabs.query({}, function (extensionTabs) {
		var found = false;

		for (var i = 0; i < extensionTabs.length; i++) {
			if (optionsUrl == extensionTabs[i].url) {
				found = true;
				chrome.tabs.update(extensionTabs[i].id, {
					"selected": true
				});
			}
		}
		if (!found) {
			chrome.tabs.create({
				url: optionspage
			});
		}
	});

});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

	console.log('request recieved', request);

	var this_manga;

	if (request.isMangaTracked !== undefined) {
		sendResponse(already_tracked(request.isMangaTracked));
	}

	if (request.updateMangaReadChapter !== undefined) {
		this_manga = window.bmr_storage.state[request.updateMangaReadChapter.id];

		this_manga.latestRead = request.updateMangaReadChapter.info.currentChapter;
		this_manga.urlOfLatestRead = request.updateMangaReadChapter.info.currentChapterURL;

		sendResponse('updated read chapter');
	}

	if (request.markMangaAsRead !== undefined) {
		this_manga = window.bmr_storage.state[already_tracked(request.markMangaAsRead)[1]];



		this_manga.latestRead = this_manga.latest;
		this_manga.urlOfLatestRead = this_manga.chapter_list[0][2];

		sendResponse('Manga marked as read');
	}

	if (request.resetMangaReading !== undefined) {
		this_manga = window.bmr_storage.state[already_tracked(request.resetMangaReading)[1]];

		this_manga.latestRead = '0';
		this_manga.urlOfLatestRead = this_manga.url;

		sendResponse('Manga marked as read');
	}

	if (request.mangaToTrack !== undefined) {

		console.log('attempting to save new manga');

		var new_manga = request.mangaToTrack,
			is_tracked = already_tracked(new_manga.name);
		
		console.log(is_tracked);

		if (!is_tracked[0]) {

			new_manga.id = window.bmr_storage.state.length;
			window.bmr_storage.state.push(new_manga);

			console.log('item not found');

		} else {

			window.bmr_storage.state[is_tracked[1]].isTracked = true;

			console.log('item found', window.bmr_storage.state[is_tracked[1]]);

		}

		sendResponse('Now Tracking Manga');

	}

	if (request.mangaToStopTracking !== undefined) {

		console.log('attempting to stop tracking manga');

		var found = already_tracked(request.mangaToStopTracking);

		if (found[0] === true) {
			window.bmr_storage.state[found[1]].isTracked = false;
		}

		sendResponse('Have Stopped Tracking');
	}

	update_icon_number();

});