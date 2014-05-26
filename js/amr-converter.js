function convertAMRBsync(amr) {

	var all_converted = [];

	$.each(amr.mangas, function (key, manga) {

		all_converted[key] = {
			id: key,
			name: manga.name,
			mirror: manga.mirror,
			url: manga.url,
			urlOfLatestRead: manga.lastChapterReadURL,
			isTracked: (manga.display === 0 ? true : false),
			latestRead: (manga.lastChapterReadURL.match(/\/c?([0-9]{1,3})(\.[0-9])?\//))[1],
			latestReadVolume: (manga.lastChapterReadURL.match(/v([0-9]{1,})/) ? manga.lastChapterReadURL.match(/v([0-9]{1,})/)[1] : 0),
			latest: (manga.mirror === "MangaStream") ? 999 : parseFloat(Mirror.getChapterList(manga.url)[0][0].substr(manga.name.length), 10),
			tags: manga.cats
		};

	});

	console.log(JSON.stringify(all_converted));
	return all_converted;
}