var my_longitude,my_latitude,my_data,map,departureString,boxList=[];
$(document).ready(function() {
	initialize();
	setInterval(function(){ relocate(); }, 60000);
})
function initialize() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(draw);
	} else {
		alert("Location services are not active.");
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
function relocate(){
	GMaps.geolocate({
		success: function(position) {
			var distance=distanceCalc(my_latitude,my_longitude,position.coords.latitude,position.coords.longitude)*1000;
			console.log(distance);
			if(distance>200){
				console.log(2);
				my_longitude=position.coords.longitude;
				my_latitude=position.coords.latitude;
				map.setCenter(my_latitude,my_longitude);	
				map.removeMarkers();
				addYouMarker();
				getStopsByPosition()
				addStopMarkers();	
			}
			else
				console.log(3);
		}
	});
}
function addYouMarker(){
	map.addMarker({
		icon : 'http://gmaps-samples.googlecode.com/svn/trunk/markers/orange/blank.png',
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
	+ "&count=50";
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
			alert('Network connection not found. Please restart the app.');
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
		var marker;
		for(var j=0; j<my_data["stops"][i]["stop_points"].length; j++){
			var stop_name=my_data["stops"][i]["stop_points"][j]["stop_name"];
			var stop_lat=my_data["stops"][i]["stop_points"][j]["stop_lat"];
			var stop_lon=my_data["stops"][i]["stop_points"][j]["stop_lon"];
			var stop_id=my_data["stops"][i]["stop_points"][j]["stop_id"];
			var string_creator="<div style='min-height:20vh; max-height:70vh;min-width:30vh; font-size:1em;'><em><u><p>"
			+stop_name+"</p></em></u></div>";
			marker=map.addMarker({
				icon : 'http://gmaps-samples.googlecode.com/svn/trunk/markers/blue/blank.png',
				lat: stop_lat,
				lng: stop_lon,
				title: stop_id+";"+stop_name,
				infoWindow: {
					content: string_creator
				}
			});

			google.maps.event.addListener(marker, "click", function() {
				getStopDepartures(this.title);
				this.infoWindow.setContent(departureString);
			});
		}
	}
}
function getStopDepartures(input) {
	var res = input.split(";");
	var stop_id=res[0];
	var stop_name=res[1];
	var url = "https://developer.cumtd.com/api/v2.2/json/GetDeparturesByStop?key=39bfe08574c744a3829de15047a0d527&count=40&pt=60&stop_id="
	+stop_id;
	//+"iu";
	$.ajax({
		cache : false,
		url : url,
		type : 'GET',
		crossDomain : true,
		async:true,
		complete: function (data) {
			var length=data["responseJSON"]["departures"].length;
			if(length>0){
				var ret;
				for(var i=0;i<length;i++){
					var headsign=data["responseJSON"]["departures"][i]["headsign"];
					var expected_mins=data["responseJSON"]["departures"][i]["expected_mins"]
					var is_istop=data["responseJSON"]["departures"][i]["is_istop"];
					console.log(is_istop+"  " +i );
					if(i>0){
						if(is_istop)
							ret+=headsign+" : "+expected_mins+" minute(s) <img src='img/iStop.png' height='20px' width='20px'><br>";
						else
							ret+=headsign+" : "+expected_mins+" minute(s)<br>";
					}
					else{
						if(is_istop)
							ret=headsign+" : "+expected_mins+" minute(s) <img src='img/iStop.png' height='20px' width='20px'><br>";
						else
							ret=headsign+" : "+expected_mins+" minute(s)<br>";
					}
				}
				console.log(ret);
				departureString= ret;
			}
			else{
				departureString="No Departures";
			}
			departureString="<div style='min-height:20vh; max-height:70vh;min-width:30vh; font-size:2em;'><em><u><p>"
			+stop_name+"</p></em></u><p>"+departureString+"</p></div>";
		},
		error : function(jqXHR, textStatus, errorThrown) {
			alert('Network connection not found. Please restart the app.');
			console.log(jqXHR);
			console.log(textStatus);
			console.log(errorThrown);
		}
	});
}
function  distanceCalc(lat1, lon1, lat2, lon2) {
	var r = 6371.009; 
	lat1 *= Math.PI / 180;
	lon1 *= Math.PI / 180;
	lat2 *= Math.PI / 180;
	lon2 *= Math.PI / 180;
	var lonDelta = lon2 - lon1;
	var a = Math.pow(Math.cos(lat2) * Math.sin(lonDelta) , 2) + Math.pow(Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lonDelta) , 2);
	var b = Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lonDelta);
	var angle = Math.atan2(Math.sqrt(a) , b);

	return angle * r;
}