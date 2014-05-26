var Mirror = {

	mirrorName: "Manga Here",
	languages: "en",
	
	loadedPage: {},
	
	ajaxCallback: function(loaded) { 
		Mirror.loadedPage = loaded; 
		console.log(loaded); 
		return false;
	},
	
	ajaxPage: function(request_url) {
		console.log(request_url);
		var temp = document.createElement('div');
		$(temp).load(request_url+" body");
		console.log($(temp).html());
		
	},

	// Return the list of the found manga from the mirror
	getMangaList: function (manga) {
		Mirror.ajaxPage("http://www.mangahere.co/search.php?name=" + $(manga.name).serialize());
		
		var manga_found = [];
		$(".result_search dl dt a.manga_info", Mirror.loadedPage).each(function() {
			manga_found = [$(this).text().trim(), $(this).attr("href")];
		});

		return manga_found;
	},
	
	// Gets the chapter list from inside a manga
	getChaptersFromPage: function (page) {
		return $('select[onchange="change_chapter(this)]"', page);
	},

	/**
	 *  Find the list of all chapters of the manga represented by the urlManga parameter
	 *  This list must be an Array of [["chapter name", "url"], ...]
	 *  This list must be sorted descending. The first element must be the most recent.
	 */
	getChapterList: function (manga) {
		console.log(manga);
		Mirror.ajaxPage(manga);
		
		var chapter_data = [];

		$(".detail_list ul li span.left a", Mirror.loadedPage).each(function () {
			chapter_data.push([$(this).text().trim(), $(this).attr("href")]);
		});
		
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
	getPages: function(page) {
		
		var pages = [];
		$('select[onchange="change_page(this)"] option', page).each(function () {
			pages.push($(this).val());
		});

		return pages;
	},

	//Remove the banners from the current page
	removeRedundant: function(page) {
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