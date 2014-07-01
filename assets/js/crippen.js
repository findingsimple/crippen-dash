(function($) {

var delay = (function(){
	var timer = 0;
	return function(callback, ms){
		clearTimeout (timer);
		timer = setTimeout(callback, ms);
	};
})();

var $container = $('.event-list');

$(window).load(function() {

	delay(function(){
		// initialize Masonry after all images have loaded  
		$container.imagesLoaded( function() {

		// initialize
		$container.masonry({
		  columnWidth: 312,
		  gutter: 12,
		  itemSelector: 'li'
		});

		});

    }, 200);

	/**
	 * Make whole event panel clickable - including summary overlay
	 
	$(".event-list li").click(function(){
    	window.location=$(this).find(".event-title a").attr("href");
    	return false;
	});
	*/

});

})(jQuery);