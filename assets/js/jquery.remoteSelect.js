(function($) {
	$.fn.remoteSelect = function(url, callback) {
		return this.each(function() {
			var self = $(this);

			self.change(function() {
				var data = self.serialize();

				$.getJSON(url, data, callback);
			});
		});
	};
})(jQuery);
