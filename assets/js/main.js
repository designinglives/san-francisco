//Map Style
var gmapFreshStyle=[{"featureType":"landscape.man_made","elementType":"geometry","stylers":[{"color":"#f7f1df"}]},{"featureType":"landscape.natural","elementType":"geometry","stylers":[{"color":"#d0e3b4"}]},{"featureType":"landscape.natural.terrain","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi.medical","elementType":"geometry","stylers":[{"color":"#fbd3da"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#bde6ab"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffe15f"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#efd151"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"color":"black"}]},{"featureType":"transit.station.airport","elementType":"geometry.fill","stylers":[{"color":"#cfb2db"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#a2daf2"}]}]; // End of style array

//Extend javascript library
if (Number.prototype.toRadians === undefined) {
	Number.prototype.toRadians = function() { return this * Math.PI / 180; };
}

//Get marker center point (appartment)
$.ajax({
	url: "http://sf.designinglives.net/index.php/ajax/getMarkers/category/1",
	async: false,
	type: 'GET',
	cache: false,
	timeout: 30000,
	success: function(data) {
		data = $.parseJSON(data);
		centerPoint = new google.maps.LatLng(data[0]['latitude'], data[0]['longitude']);
	}
});

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
var travelType = 'walking';
var point;
var marker;
var cpoint;
var cmarker;
var selectedPoint;
var geolocate;
var markersArray = [];
var selectedMarker;
var directionsService = new google.maps.DirectionsService();
var directionsDisplay = new google.maps.DirectionsRenderer();
var directionsService2 = new google.maps.DirectionsService();
var directionsDisplay2 = new google.maps.DirectionsRenderer();

//Initialize the directions display event to the map
directionsDisplay = new google.maps.DirectionsRenderer({
	suppressMarkers: true
});

directionsDisplay.setMap(map);

//Get center point for map (not center point)
$.ajax({
	url: "http://sf.designinglives.net/ajax/getMarkers/category/1",
	async: false,
	type: 'GET',
	cache: false,
	timeout: 30000,
	success: function(data) {
		data = $.parseJSON(data);
		cpoint = new google.maps.LatLng(data[0]['latitude'], data[0]['longitude']);
		cmarker = new google.maps.Marker({
			position: cpoint,
			map: map,
			optimized: false, 
			category: data[0]['category'],
			icon: data[0]['category_image'],
			title: data[0]['title']
		});
		selectedPoint = 'marker';
	}
});

//Get all other points + add event on click
$.ajax({
	url: "http://sf.designinglives.net/ajax/getMarkers/no-category/1",
	async: false,
	type: 'GET',
	cache: false,
	timeout: 30000,
	success: function(data) {
		data = $.parseJSON(data);
		$.each(data, function($index, $value) {
			point = new google.maps.LatLng($value['latitude'], $value['longitude']);
			marker = new google.maps.Marker({
				position: point,
				map: map,
				optimized: false, 
				category: $value['category'],
				icon: $value['category_image'],
				title: $value['title']
			});
			
			markersArray.push(marker);
			
			google.maps.event.addListener(marker, 'click', function() {
				selectedMarker = this;
				
				getDirections(selectedMarker);
			});
		});
	}
});

function getDirections(destination) {
	if (selectedPoint == 'marker') {
		var start = cmarker.getPosition();
	} else {
		var start = selectedPoint.getPosition();
	}
	
	var dest = destination.getPosition();
	
	switch(travelType) {
		case 'walking': 
			var request = {
				origin: start,
				destination: dest,
				travelMode: google.maps.TravelMode.WALKING
			};
		break;
		
		case 'bicyling': 
			var request = {
				origin: start,
				destination: dest,
				travelMode: google.maps.TravelMode.BICYCLING
			};
		break;
		
		case 'driving': 
			var request = {
				origin: start,
				destination: dest,
				travelMode: google.maps.TravelMode.DRIVING
			};
		break;
		
		case 'transit': 
			var request = {
				origin: start,
				destination: dest,
				travelMode: google.maps.TravelMode.TRANSIT
			};
		break;
	}
	
	$('.side-bar').animate({
		marginLeft: '50px'
	});
	
	$margin = parseInt($('#glavmen').css('width')) + parseInt($('#cont').css('width'));
	$width = parseInt($('body').css('width')) - $margin;
	
	$('#map_canvas').animate({
		'width': $width+'px',
		'margin-left': $margin+'px'
	});
	
	directionsService.route(request, function(result, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			directionsDisplay.setDirections(result);
			$kilometers = result.routes[0].legs[0].distance.value / 1000
			$('.title').html(destination.title);
			
			//Get first google image
			$.getJSON("https://ajax.googleapis.com/ajax/services/search/images?callback=?", {
				q: destination.title + ' san francisco',
				v: '1.0'
			}, function(data) {
				$("#image").html('<img width="200px" src="' + decodeURIComponent(data.responseData.results[0].url) + '">');
				
				console.log(decodeURIComponent(data.responseData.results[0].url));
			});
			
			//Get first link on google (to make sure we have a clickable link)
			$.getJSON("https://ajax.googleapis.com/ajax/services/search/web?callback=?", {
				q: destination.title + ' san francisco',
				v: '1.0'
			}, function(data) {
				$('.title').html('<a target="_blank" href="' + decodeURIComponent(data.responseData.results[0].url) + '" title="' + data.responseData.results[0].content + '">' + destination.title + '</a>');
			});
			
			//If category is food, get place details
			var request = {
		   	 query: destination.title+' San Francisco'
		  	};
  
         service = new google.maps.places.PlacesService(map);
		   service.textSearch(request, function(results, status) {
			   if (status == google.maps.places.PlacesServiceStatus.OK) {
				   //Display expensiveness
					textPrice = '';
				   
				   if(results[0]['price_level']) {
					   textPrice = '';

					   for(var i=0; i<results[0]['price_level']; i++) {
						   textPrice = textPrice+'&euro;';
					   }
					   
					   textPrice = textPrice + ' - ';
				   }
				   
				   $('.pricing').html(textPrice);
			   	
				   //Display rating
					textRating = '';
				   
				   if(results[0]['rating']) {
					   for(var i=0; i<Math.round(results[0]['rating']); i++) {
						   textRating = textRating+'<i class="fa fa-star"></i>';
					   }
					   textRating = textRating+'<br><br>';
				   }
				   
				   $('.rating').html(textRating);
			   	
			   	//Check if open now, else display hours
			   	if(results[0]['opening_hours']['open_now']) {
				   	console.log('open now');
			   	} else {
				   	console.log(results[0]['opening_hours']['weekday_text']);
			   	}
			   }
 		   });
			
			//Display meters or km's
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
}

$('.avatar').click(function(){
	for (var i = 0; i < markersArray.length; i++ ) {
     markersArray[i].setMap(null);
   }
   
   markersArray.length = 0;
   
	$.ajax({
		url: "http://sf.designinglives.net/ajax/getMarkers/no-category/1",
		async: false,
		type: 'GET',
		cache: false,
		timeout: 30000,
		success: function(data) {
			data = $.parseJSON(data);
			$.each(data, function($index, $value) {
				point = new google.maps.LatLng($value['latitude'], $value['longitude']);
				marker = new google.maps.Marker({
					position: point,
					map: map,
					optimized: false, 
					category: $value['category'],
					icon: $value['category_image'],
					title: $value['title']
				});
				
				markersArray.push(marker);
				
				google.maps.event.addListener(marker, 'click', function() {
					selectedMarker = this;
					
					getDirections(selectedMarker);
				});
			});
		}
	});
});

$('.gradientmenu').click(function(){
	for (var i = 0; i < markersArray.length; i++ ) {
     markersArray[i].setMap(null);
   }
   
   markersArray.length = 0;
   
   $.ajax({
		url: "http://sf.designinglives.net/ajax/getMarkers/category/"+$(this).attr('data-category'),
		async: false,
		type: 'GET',
		cache: false,
		timeout: 30000,
		success: function(data) {
			data = $.parseJSON(data);
			$.each(data, function($index, $value) {
				point = new google.maps.LatLng($value['latitude'], $value['longitude']);
				marker = new google.maps.Marker({
					position: point,
					map: map,
					optimized: false, 
					category: $value['category'],
					icon: $value['category_image'],
					title: $value['title']
				});
				
				markersArray.push(marker);
				
				google.maps.event.addListener(marker, 'click', function() {
					selectedMarker = this;
					
					getDirections(selectedMarker);
				});
			});
		}
	});
});

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
	
	$('#map_canvas').animate({
		'width': '100%',
		'margin-left': '0px'
	});
}); 

/* Change travel type */
$('.travelType').click(function(){
	$('#travelType .active').removeClass('active');
	travelType = $(this).attr('id');
	$(this).parent().addClass('active');
	
	getDirections(selectedMarker);
});

/* Get current address */
$('#determine').click(function() {
	navigator.geolocation.getCurrentPosition(function(position) {
		geolocate = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
		selectedPoint = new google.maps.Marker({
			position: geolocate,
			map: map,
			optimized: false, 
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