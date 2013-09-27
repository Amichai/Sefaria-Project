{% load sefaria_tags %}

<script type="text/javascript">
{% autoescape off %}
	var sjs = sjs || {};
	
	$.extend(sjs, {
		books: {{ titlesJSON|default:"[]" }},
		searchBaseUrl: '{{ SEARCH_URL|default:"http://localhost:9200" }}',
		help: {
			videos: {
				intro:       "TaUB0jd0dzI",
				tutorial:    "xXFkweBv7ws",
				sheets:      "iac0GoaH2lY",
				translate:   "rImt5SnNa-8",
				add:         "R4h439Iyk-o",
				edit:        "Go8uJJ9_6ug",
				connections: "Epx-Ou2O_2M",
				newtext:     "gcqsGAP4jfg"
			}
		},
		navQuery: function(query) {
			window.location = "/" + normRef(query);
		}		
	});

	$(function() {
		// Open a text Box
		$("#goto").autocomplete({ source: function( request, response ) {
				var matches = $.map( sjs.books, function(tag) {
						if ( tag.toUpperCase().indexOf(request.term.toUpperCase()) === 0 ) {
							return tag;
						}
					});
				response(matches);
			}
		}).keypress(function(e) {
			if (e.keyCode == 13) {
				handleSearch();
			}
		});
		$("#openText").mousedown(handleSearch);

		var handleSearch = function() {
			$("#goto").focus();
			var query = $("#goto").val();
			if (query) {
				$("#goto").autocomplete("close");
				
				q = parseRef(query);
				if ($.inArray(q.book.replace(/_/g, " "), sjs.books) > 0) {
					sjs.navQuery(query);
					sjs.track.ui("Nav Query");
				} else {
					if (sjs.currentPage !== 'search') {
						window.location="/search?q=" + query.replace(/ /g, "+"); 
					} else {
						History.pushState({q: query}, "Search Jewish Texts | Sefaria.org", "/search?q=" + query);
					}
				}
			}
		};

		/*
		$(document).on("click touch", ".facet", function(e) {
			sjs.currentFacet = $(this).attr("data-facet");
			sjs.search($("#goto").val());
			$(this).addClass("active");
		});
		*/

		// Top Menus showing / hiding
		$("#sefaria, #textsMenu").on("click touch", function(e) {
			e.stopPropagation();
			if ($(this).hasClass("menuOpen")) { 
				if (this.id === "sefaria") { window.location = "/"; }
				return; 
			}
			$(".menuOpen").removeClass("menuOpen");
			$(this).addClass("menuOpen");
		});
		$("#textsMenu .category").on("mouseenter touch", function(e){
			if ($(this).hasClass("menuOpen")) { return; }
			$("#textsMenu .category.menuOpen").removeClass("menuOpen");
			$(this).addClass("menuOpen");
			$(this).parents(".category").addClass("menuOpen");
			e.stopPropagation();
		});
		$(window).click(function(){
			$(".menuOpen").removeClass("menuOpen");
		});

	    // Fill text details in Text Menu with AJAX 
	    $("#textsList .title a").on("click", function(e) {
	        e.preventDefault();
	        e.stopPropagation();

	        var $details = $(this).closest(".text").find(".details");
	        closing = $details.children().length

	        if (closing) {
	            $details.empty()
	            	.closest(".text").removeClass("hasDetails");
	        } else {
		        var url = "/api/counts" + $(this).attr("href");
		        $.getJSON(url, sjs.makeTextDetails);
		        $details.addClass("makeTarget");	        	
	        }

	    });
	    $("#textsList .text").on("click", function() {
	    	if (!$(this).hasClass("hasDetails")) {
	    		$(this).find(".title a").trigger("click");
	    	}
	    });


	    // Help modal - open/close
	    sjs.help.open = function(e){
	    	var vid = $("#helpVideoButtons .btn-success").attr("id").substring(5);
	    	sjs.help.makeVideo(vid);
	    	$("#overlay, #helpModal").show().position({of: window, collision: "fit"});
	    	$(".menuOpen").removeClass("menuOpen");
	    	if (e) {
	    		e.preventDefault();
	    		e.stopPropagation();
	    	}
	    	sjs.track.event("Help", "Open", "");
	    }
	    $("#help").click(sjs.help.open);
	    $("#helpClose").click(function() {
	    	$("#overlay, #helpModal").hide();
    		$("#helpVideo").remove();
	    });

	    // Help modal - switch videos
	    sjs.help.openVideo = function(vid) {
	    	$("#helpVideoButtons .btn").removeClass("btn-success");
	    	$("#help-" + vid).addClass("btn-success");
	    	sjs.help.makeVideo(vid);
	    	sjs.track.event("Help", "Video", vid);
	    };
	    sjs.help.makeVideo = function(vid) {
	    	var url = "http://www.youtube.com/embed/" + 
	    					sjs.help.videos[vid] + 
	    					"?enablejsapi=1&rel=0&autoplay=1";
	    	var html = '<iframe id="helpVideo" src="' + url + '" frameborder="0" allowfullscreen></iframe>'
	    	$("#helpVideoBox").html(html);
	    }
	    $("#helpVideoButtons .btn").click(function(){
	    	var vid = this.id.substring(5); // remove 'help-' from id
	    	sjs.help.openVideo(vid);
	    });


	    // Move Goto box, controls into hidden menu for small screen size 
	    var mobileLayout = function() {
	    	var width = $(window).width();
	    	var $gotoBox = $("#gotoBox");
			var $controls = $("#controls");

			// gotoBox into options bar	    	
	    	if (width >= 500 && $gotoBox.parent().attr("id") === "rightButtons") {
	    		$("#breadcrumbs").before($gotoBox);
	    	} else if (width < 500 && $gotoBox.next().attr("id") === "breadcrumbs") {
	    		$gotoBox.appendTo("#rightButtons");
	    	}

	    	// Source Sheets controls into options bar
	    	if (width >= 800 && $controls.parent().attr("id") === "rightButtons") {
	    		$("#sheet").before($controls);
	    	} else if (width < 800 && $controls.next().attr("id") === "sheet") {
	    		$controls.prependTo("#rightButtons");
	    	}
	    };
	    $(window).resize(mobileLayout);
	    mobileLayout();

	    // Show Options Bar button 
	    var showOptionsBar = function() {
	    	$("#accountBox").appendTo("#rightButtons");
	    	$("#rightButtons").show();
	    };
	    var hideOptionsBar = function() {
	    	$("#accountBox").prependTo("#rightButtons");
	    	$("#rightButtons").css("display", "");
	    };
	    $("#showOptions").click(function(e){
	    	if ($("#rightButtons").is(":visible")) {
	    		hideOptionsBar();
	    	} else {
	    		showOptionsBar();
	    		e.stopPropagation();
	    	}
	    })
	    $("#rightButtons").click(function(e){e.stopPropagation();});
	    $(window).click(hideOptionsBar);
	});
{% endautoescape %}
</script>