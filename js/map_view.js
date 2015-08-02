var my_longitude,my_latitude,my_data,map,departureString;
$(document).ready(function() {
	initialize();
	/*GMaps.geolocate({
		success: function(position) {
			if(my_latitude!=position.coords.latitude||my_longitude!=position.coords.longitude)
				my_longitude=position.coords.longitude;
				my_latitude=position.coords.latitude;
				map.setCenter(position.coords.latitude, position.coords.latitude);		
			}
			map.removeMarkers();
			addYouMarker();
			getStopsByPosition();
			addStopMarkers();
		}
	});*/

})
function initialize() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(draw);
	} else {
		alert("Geolocation is not supported by this browser.");
	}
}
function draw(position){
	my_longitude=position.coords.longitude;
	my_latitude=position.coords.latitude;
	map = new GMaps({
		div: '#map',
		lat: my_latitude,
		lng: my_longitude,
		zoom: 18
	});
	addYouMarker();
	getStopsByPosition();
	addStopMarkers();
}
function addYouMarker(){
	map.addMarker({
		icon  : 'img/person-marker.png',
		lat: my_latitude,
		lng: my_longitude,
		title: 'You',
		infoWindow: {
			content: '<p>You</p>'
		}
	});
}
function getStopsByPosition() {
	var url = "https://developer.cumtd.com/api/v2.2/json/GetStopsByLatLon?key=39bfe08574c744a3829de15047a0d527&lat="
	+ my_latitude
	+ "&lon="
	+ my_longitude
	+ "&count=20";
	$.ajax({
		cache : false,
		url : url,
		type : 'GET',
		crossDomain : true,
		async:false,
		complete: function (data) {
			bindData(data["responseJSON"]);
		},
		error : function(jqXHR, textStatus, errorThrown) {
			alert('request failed');
			console.log(jqXHR);
			console.log(textStatus);
			console.log(errorThrown);
		}
	});
}
function bindData(data){
	my_data=data;
}
function addStopMarkers(){
	for (var i = 0; i < my_data["stops"].length; i++) {
		for(var j=0; j<my_data["stops"][i]["stop_points"].length; j++){
			var stop_name=my_data["stops"][i]["stop_points"][j]["stop_name"];
			var stop_lat=my_data["stops"][i]["stop_points"][j]["stop_lat"];
			var stop_lon=my_data["stops"][i]["stop_points"][j]["stop_lon"];
			var stop_id=my_data["stops"][i]["stop_points"][j]["stop_id"];
			getStopDepartures(stop_id);
			var string_creator="<div style='min-height:20vh; max-height:70vh;min-width:30vh; font-size:2em;'><em><u><p>"
			+stop_name+"</p></em></u><p>"+departureString+"</p></div>";
			map.addMarker({
				lat: stop_lat,
				lng: stop_lon,
				title: stop_id,
				infoWindow: {
					content: string_creator
				}
			});
		}
	}
}
function getStopDepartures(stop_id) {
	//console.log(stop_id);
	var url = "https://developer.cumtd.com/api/v2.2/json/GetDeparturesByStop?key=39bfe08574c744a3829de15047a0d527&count=20&pt=60&stop_id="
	+stop_id;
	//+"it";
	$.ajax({
		cache : false,
		url : url,
		type : 'GET',
		crossDomain : true,
		async:false,
		complete: function (data) {
			var length=data["responseJSON"]["departures"].length;
			if(length>0){
				var ret;
				for(var i=0;i<length;i++){
					var headsign=data["responseJSON"]["departures"][i]["headsign"];
					var expected_mins=data["responseJSON"]["departures"][i]["expected_mins"]
					if(i>0)
						ret+=headsign+" : "+expected_mins+" minute(s)<br>";
					else
						ret=headsign+" : "+expected_mins+" minute(s)<br>";
				}
				departureString= ret;
			}
			else{
				departureString="No Departures";
			}
			//console.log(ret);

		},
		error : function(jqXHR, textStatus, errorThrown) {
			alert('request failed');
			console.log(jqXHR);
			console.log(textStatus);
			console.log(errorThrown);
		}
	});
}