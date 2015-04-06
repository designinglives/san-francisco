var gmapFreshStyle = [{
	"featureType": "landscape.man_made",
	"elementType": "geometry",
	"stylers": [{
		"color": "#f7f1df"
	}]
}, {
	"featureType": "landscape.natural",
	"elementType": "geometry",
	"stylers": [{
		"color": "#d0e3b4"
	}]
}, {
	"featureType": "landscape.natural.terrain",
	"elementType": "geometry",
	"stylers": [{
		"visibility": "off"
	}]
}, {
	"featureType": "poi",
	"elementType": "labels",
	"stylers": [{
		"visibility": "off"
	}]
}, {
	"featureType": "poi.business",
	"elementType": "all",
	"stylers": [{
		"visibility": "off"
	}]
}, {
	"featureType": "poi.medical",
	"elementType": "geometry",
	"stylers": [{
		"color": "#fbd3da"
	}]
}, {
	"featureType": "poi.park",
	"elementType": "geometry",
	"stylers": [{
		"color": "#bde6ab"
	}]
}, {
	"featureType": "road",
	"elementType": "geometry.stroke",
	"stylers": [{
		"visibility": "off"
	}]
}, {
	"featureType": "road",
	"elementType": "labels",
	"stylers": [{
		"visibility": "off"
	}]
}, {
	"featureType": "road.highway",
	"elementType": "geometry.fill",
	"stylers": [{
		"color": "#ffe15f"
	}]
}, {
	"featureType": "road.highway",
	"elementType": "geometry.stroke",
	"stylers": [{
		"color": "#efd151"
	}]
}, {
	"featureType": "road.arterial",
	"elementType": "geometry.fill",
	"stylers": [{
		"color": "#ffffff"
	}]
}, {
	"featureType": "road.local",
	"elementType": "geometry.fill",
	"stylers": [{
		"color": "black"
	}]
}, {
	"featureType": "transit.station.airport",
	"elementType": "geometry.fill",
	"stylers": [{
		"color": "#cfb2db"
	}]
}, {
	"featureType": "water",
	"elementType": "geometry",
	"stylers": [{
		"color": "#a2daf2"
	}]
}]; // End of style array
$.ajax({
	url: "http://sf.designinglives.net/index.php/ajax/getMarkers/category/1",
	async: false,
	type: 'GET',
	cache: false,
	timeout: 30000,
	success: function($data) {
		$data = $.parseJSON($data);
		centerPoint = new google.maps.LatLng($data[0]['latitude'], $data[0]['longitude']);
	}
});
console.log(centerPoint);
//Map parametrs
var mapOptions = {
	zoom: 14,
	styles: gmapFreshStyle,
	center: centerPoint,
	mapTypeId: google.maps.MapTypeId.ROADMAP,
	mapTypeControl: false,
	mapTypeControlOptions: {
		style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
		position: google.maps.ControlPosition.BOTTOM_CENTER
	},
	panControl: false,
	panControlOptions: {
		position: google.maps.ControlPosition.TOP_RIGHT
	},
	zoomControl: true,
	zoomControlOptions: {
		style: google.maps.ZoomControlStyle.LARGE,
		position: google.maps.ControlPosition.TOP_RIGHT
	},
	scaleControl: false,
	scaleControlOptions: {
		position: google.maps.ControlPosition.TOP_LEFT
	},
	streetViewControl: true,
	streetViewControlOptions: {
		position: google.maps.ControlPosition.LEFT_TOP
	}
}
//map
var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
//category
var cook = 'assets/img/icon/01.png';
var cook2 = 'assets/img/icon/02.png';
//variables
var point;
var marker;
var cpoint;
var cmarker;
var selectedPoint;
var geolocate;
var directionsService = new google.maps.DirectionsService();
var directionsDisplay = new google.maps.DirectionsRenderer();
var directionsService2 = new google.maps.DirectionsService();
var directionsDisplay2 = new google.maps.DirectionsRenderer();
directionsDisplay = new google.maps.DirectionsRenderer({
	suppressMarkers: true
});
directionsDisplay.setMap(map);
directionsDisplay2 = new google.maps.DirectionsRenderer({
	suppressMarkers: true
});
directionsDisplay2.setMap(map);
$.ajax({
	url: "http://sf.designinglives.net/ajax/getMarkers/category/1",
	async: false,
	type: 'GET',
	cache: false,
	timeout: 30000,
	success: function($data) {
		$data = $.parseJSON($data);
		cpoint = new google.maps.LatLng($data[0]['latitude'], $data[0]['longitude']);
		cmarker = new google.maps.Marker({
			position: cpoint,
			map: map,
			category: $data[0]['category'],
			icon: $data[0]['category_image'],
			title: $data[0]['title']
		});
		selectedPoint = 'marker';
	}
});
$.ajax({
	url: "http://sf.designinglives.net/ajax/getMarkers/no-category/1",
	async: false,
	type: 'GET',
	cache: false,
	timeout: 30000,
	success: function($data) {
		$data = $.parseJSON($data);
		$.each($data, function($index, $value) {
			point = new google.maps.LatLng($value['latitude'], $value['longitude']);
			marker = new google.maps.Marker({
				position: point,
				map: map,
				category: $value['category'],
				icon: $value['category_image'],
				title: $value['title']
			});
			google.maps.event.addListener(marker, 'click', function() {
				getDirections(this);
			});
		});
	}
});
/*
	    {exp:channel:entries channel="markers" category="not 1"}
	    
		    //positions
		    point = new google.maps.LatLng({latitude}, {longitude});
		
			 //markers
		    marker = new google.maps.Marker({
		        position: point,
		        map: map,
		        category: '{categories}{category_name}{/categories}',
		        icon: '{categories}{category_image}{/categories}',
		        title: "{title}"
		    });
	    
			 google.maps.event.addListener(marker, 'click', function(){
			    getDirections(this);
		    });
	    {/exp:channel:entries}*/
function getDirections(destination) {
	if (selectedPoint == 'marker') {
		var start = cmarker.getPosition();
	} else {
		var start = selectedPoint.getPosition();
	}
	console.log(start);
	var dest = destination.getPosition();
	var request = {
		origin: start,
		destination: dest,
		travelMode: google.maps.TravelMode.WALKING
	};
	directionsService.route(request, function(result, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			directionsDisplay.setDirections(result);
			$kilometers = result.routes[0].legs[0].distance.value / 1000
			$('.title').html(destination.title);
			$.getJSON("https://ajax.googleapis.com/ajax/services/search/images?callback=?", {
				q: destination.title + ' san francisco',
				v: '1.0'
			}, function(data) {
				$("#image").html('<img width="200px" src="' + data.responseData.results[0].url + '">');
			});
			$.getJSON("https://ajax.googleapis.com/ajax/services/search/web?callback=?", {
				q: destination.title + ' san francisco',
				v: '1.0'
			}, function(data) {
				$('.title').html('<a target="_blank" href="' + data.responseData.results[0].url + '" title="' + data.responseData.results[0].content + '">' + destination.title + '</a>');
			});
			if ($kilometers > 1) {
				$('.total').html($kilometers.toFixed(2) + 'km - ' + secondsTimeSpanToHMS(result.routes[0].legs[0].duration.value));
			} else {
				$kilometers = $kilometers * 1000;
				$('.total').html($kilometers + 'm - ' + secondsTimeSpanToHMS(result.routes[0].legs[0].duration.value));
			}
			$('.steps').empty();
			$i = 1;
			$(result.routes[0].legs[0].steps).each(function(index, value) {
				$('.steps').append('<li><span>' + $i + '</span> <div style="margin-left: 40px;">' + value.instructions + '</div></li>');
				$i++;
			});
		}
	});
	$('.side-bar').animate({
		marginLeft: '50px'
	});
}

function secondsTimeSpanToHMS(s) {
	var h = Math.floor(s / 3600); //Get whole hours
	s -= h * 3600;
	var m = Math.floor(s / 60); //Get remaining minutes
	s -= m * 60;
	//return h+":"+(m < 10 ? '0'+m : m)+":"+(s < 10 ? '0'+s : s); //zero padding on minutes and seconds
	return h + "h:" + (m < 10 ? '0' + m : m) + "m"; //zero padding on minutes and seconds
} /* Show map */
$('#map_open').click(function() {
	$('.side-bar').animate({
		marginLeft: '-190px'
	});
}); /* Get current address */
$('#determine').click(function() {
	navigator.geolocation.getCurrentPosition(function(position) {
		geolocate = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
		selectedPoint = new google.maps.Marker({
			position: geolocate,
			map: map,
			category: cook,
			icon: cook,
			title: "Current Point"
		});
		$.ajax({
			url: 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + position.coords.latitude + ',' + position.coords.longitude,
			success: function(data) {
				$('.formatedAddress').html(data.results[0].formatted_address);
			}
		});
		map.setCenter(geolocate);
	});
	//selectedPoint = 'currentPoint';
});