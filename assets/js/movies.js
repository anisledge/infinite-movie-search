$("document").ready(function() {
		
		/*HELPER FUNCTIONS*/
		var makeLi = function(movie) {
			var listItem = '<li>';
			listItem += '<h3>' + movie.Title + '</h3>';
			listItem += '<p>' + movie.Year + '</p>';
			listItem += '<a href="http://www.imdb.com/title/' + movie.imdbID + '/">Details on IMDb</a>';
			listItem += '</li>';
			return listItem;
		}
		
		var doAJAX = function(page) {
			currentPage += 1;
			
			$.ajax({
				url: "http://www.omdbapi.com/",
				method: 'GET',
				data: $("#searchForm").serialize() + "&page=" + page
			}).done(function(data) {
				if (data && data.Search && data.Response == "True") {
					
					responseLength = data.totalResults;
					
					var movies = '<ul>';
					$.each(data.Search, function(i, movie) {
						movies += makeLi(movie);
					});
					movies += "</ul>";
					$results.append(movies);
				
				} else {
					
					$results.append("<p class='error'>Sorry, we couldn't find any movies like that!</p><p class='error'>Please try a different search.</p>");
					$(window).off("scroll");
				}
				console.log(data);

			}).fail(function() {
				$results.append("<p class='error'>Sorry, your search failed due to a server error.</p>");
				$(window).off("scroll");
			});
			
		}

		var scrollToBottom = function() {
			if ($(window).scrollTop() + $(window).height() === $(document).height()) {
				if (currentPage <= Math.ceil(responseLength / 10)) {
					doAJAX(currentPage);
				} else {
					$(window).off("scroll");
				}
			}
		}	
		
		var addError = function() {
			$titleError.show();
			$titleArea.addClass("highlight");
			$titleField.addClass("highlight");
		}
		
		var removeError = function() {
			$titleError.hide();
			$titleArea.removeClass("highlight");
			$titleField.removeClass("highlight");
		}

		/*GLOBAL VARIABLES*/
		var currentPage = 1;
		var responseLength = 1;
		
		var $results = $("#results");
		var $loadingIcon = $( "#loadingIcon" );
		var $titleField = $("#titleField");
		var $titleArea = $("#searchArea");
		var $titleError = $("#titleError");
		
		/*EVENT HANDLERS*/
		$titleField.on("focus", function() {
			$titleArea.addClass("outline");
			
			$titleField.on("blur", function() {
				$titleArea.removeClass("outline");
			});
		});
		$(document).ajaxStart(function() {
			$loadingIcon.show();
		});
		$(document).ajaxStop(function() {
			$loadingIcon.hide();
		})
		$(document).ajaxComplete(function(event, request, settings) {
			var errorMsg = '{"Response":"False","Error":"Movie not found!"}';
			
			if (currentPage > Math.ceil(responseLength / 10) && (request.responseText !== errorMsg) && (request.readyState === 4)) {
				$results.append("<p>End of results</p>");	
			}
		});
		
		$('#searchForm').on('submit', function(e) {

			e.preventDefault();
			currentPage = 1;
			$results.empty();
			removeError();
			
			$titleField.val($.trim($titleField.val()));
			
			if ($titleField.val().length > 1) {	
				
				removeError();
				$titleField.removeClass("highlight");
				$results.append('<h2>Search results for "' + $titleField.val() + '":</h2>');
			
				doAJAX(currentPage);
			
				$(window).scroll(function() {
					scrollToBottom();
				});
			} else {
				addError();
			}
		});
		
});