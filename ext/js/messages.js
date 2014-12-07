/* global window, chrome */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

	console.log('request recieved', request);

	var this_manga;

	if (request.isMangaTracked) {
		sendResponse(window.bmr_storage.already_tracked(request.isMangaTracked));
	}

	if (request.updateMangaReadChapter) {
		this_manga = window.bmr_storage.state[request.updateMangaReadChapter.id];

		this_manga.latestRead = request.updateMangaReadChapter.info.currentChapter;
		this_manga.urlOfLatestRead = request.updateMangaReadChapter.info.currentChapterURL;

		sendResponse('updated read chapter');
	}

	if (request.markMangaAsRead) {
		this_manga = window.bmr_storage.state[window.bmr_storage.already_tracked(request.markMangaAsRead)[1]];

		this_manga.latestRead = this_manga.latest;
		this_manga.urlOfLatestRead = this_manga.chapter_list[0][2];

		sendResponse('Manga marked as read');
	}

	if (request.resetMangaReading) {
		this_manga = window.bmr_storage.state[window.bmr_storage.already_tracked(request.resetMangaReading)[1]];

		this_manga.latestRead = '0';
		this_manga.urlOfLatestRead = this_manga.url;

		sendResponse('Manga marked as read');
	}

	if (request.mangaToTrack) {

		console.log('attempting to save new manga');

		var new_manga = request.mangaToTrack,
			is_tracked = window.bmr_storage.already_tracked(new_manga.name);

		console.log(is_tracked);

		if (!is_tracked[1]) {
			new_manga.id = window.bmr_storage.state.length;
			window.bmr_storage.state.push(new_manga);

			console.log('item not found');

		} else {
			window.bmr_storage.state[is_tracked[1]].isTracked = true;
			console.log('item found', window.bmr_storage.state[is_tracked[1]]);
		}

		sendResponse('Now Tracking Manga');

	}

	if (request.mangaToStopTracking) {

		console.log('attempting to stop tracking manga');

		var found = window.bmr_storage.already_tracked(request.mangaToStopTracking);
		if (found[0] === true) {
			window.bmr_storage.state[found[1]].isTracked = false;
		}

		sendResponse('Have Stopped Tracking');
	}

	if (request.deleteManga) {
		window.bmr_storage.state.splice(
			window.bmr_storage.already_tracked(request.deleteManga)[1], 1
		);

		sendResponse('Deleted Manga');
	}

	window.bmr_storage.update_icon_number();

});