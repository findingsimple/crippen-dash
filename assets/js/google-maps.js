function googleInit(address) {
	var geocoder = new google.maps.Geocoder();

	geocoder.geocode( { 'address': address}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			loadMap(results[0].geometry.location);
			document.getElementById('map_canvas').className = "";
		}
	});
}

function loadMap(location) {
	var options = {
		zoom: 16,
		center: location,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	var map = new google.maps.Map(document.getElementById('map_canvas'), options);

	var marker = new google.maps.Marker({
		map: map,
		position: location
	});

	google.maps.event.addListener(marker, 'click', function() {
		map.setZoom(16);
		map.setCenter(marker.position);
	});
}