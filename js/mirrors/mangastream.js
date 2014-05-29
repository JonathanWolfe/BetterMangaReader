var Mirror = {

	mirrorName: "MangaStream",
	languages: "en",

	// Gets the chapter list from inside a manga
	getChaptersFromPage: function (page) {
		return $('select[onchange="change_chapter(this)]"', page);
	},

	/**
	 *  Find the list of all chapters of the manga represented by the urlManga parameter
	 *  This list must be an Array of [["chapter Number", "chapter name", "url"], ...]
	 *  This list must be sorted descending. The first element must be the most recent.
	 */
	getChapterList: function (manga) {
		var encodedURL = encodeURIComponent(manga.url),
			chapter_data = [];

		$.ajax({
			async: false,
			url: "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22" + encodedURL + "%22"
		})
		.done(function (returned_data) {

			$(returned_data).find(".table-striped a").each(function () {
				var chapter_name = $(this).text().trim(),
					chapter_num = /([0-9]+(?:\.[0-9])?) /.exec(chapter_name);

				chapter_data.push([chapter_num, chapter_name, $(this).attr("href")]);
			});

		});
		
		// console.log(manga);
		// console.log(chapter_data);
		return chapter_data;
	},

	/**
	 *  This method must return (throught callback method) an object like :
	 *  {"name" : Name of current manga,
	 *  "currentChapter": Name of thee current chapter (one of the chapters returned by getListChaps),
	 *  "currentMangaURL": Url to access current manga,
	 *  "currentChapterURL": Url to access current chapter}
	 */
	getInformationFromCurrentPage: function (page) {
		var name,
			currentChapter,
			currentMangaURL,
			currentChapterURL,
			search = $(".readpage_top .title a", page);



		name = $(search[1]).text().trim();

		if (name.substr(-5) === "Manga") {
			name = name.substr(0, name.length - 5).trim();
		}

		currentChapter = $(search[0]).text();
		currentChapterURL = $(search[0]).attr("href");
		currentMangaURL = $(search[1]).attr("href");

		return {
			"name": name,
			"currentChapter": currentChapter.substr(name.length).trim(),
			"currentMangaURL": currentMangaURL,
			"currentChapterURL": currentChapterURL
		};
	},

	// Returns the list of the pages in this chapter to be used later when making the image urls.
	getPages: function (page) {

		var pages = [];
		$('select[onchange="change_page(this)"] option', page).each(function () {
			pages.push($(this).val());
		});

		return pages;
	},

	//Remove the banners from the current page
	removeRedundant: function (page) {
		$(".readpage_top .go-page span.right", page).remove();
	},

	/**
	 *  This method returns the place to write the full chapter in the document
	 *  The returned element will be totally emptied.
	 */
	whereDoIWriteScans: function (page) {
		return $("#viewer", page);
	},

	//Return true if the current page is a page containing scan.
	isCurrentPageAChapterPage: function (page) {
		return ($("#image", page).size() > 0);
	},

	//This method is called before displaying full chapters in the page
	doSomethingBeforeWritingScans: function (page) {
		$("#viewer", page).empty();
		$("#viewer", doc).css({
			"width": "auto",
			"background-color": "black",
			"padding-top": "10px"
		});
	},

	// Write the image from the the url returned by the getPages() function.
	getImageFromPage: function (page) {
		Mirror.ajaxPage(page);

		return $("#image", Mirror.loadedPage).attr("src");
	},

	//This function is called when the manga is full loaded. Just do what you want here...
	doAfterMangaLoaded: function (page) {
		//This function runs in the DOM of the current consulted page.
		$("body > div:empty", page).remove();
	}
};

module.exports = Mirror;