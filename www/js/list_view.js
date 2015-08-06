$(document).ready(function() {
	//$('#loader').html("<img src='img/loading-wheel.gif'/>");
	//$('#loader').show();
	$('#autosuggest').keyup(function(){
		var text=$('#autosuggest').val();
		if(text.length>1){
			autosuggestValues(text);
		}
		else
			$('#stop_search').empty();
	});
	$('#stop_search').click(function(){
		var id = event.target.id;
		var text=$('#'+id).text();
		getStopDepartures(id,text);
	});
	$('#close').click(function(){
		window.location.href="list_view.html";
	});
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(getNearest);
	} else {
		alert("Location services are not active.");
	}
})
$( document ).on( 'click', '.favorites1', function () {
	var id=event.target.id.split(';')[0];
	var favorites=JSON.parse(localStorage.getItem("favorites"));
	for(var i=0;i<favorites.length;i++){
		if(favorites[i]["id"]==id)
			delete favorites[i];
	}
	favorites=favorites.filter(function(e){return e});
	var jsonStr = JSON.stringify(favorites);
	localStorage.setItem("favorites",jsonStr);
	var check=$('#first').html();
	var tag = check.substring(check.indexOf("<"));
	var text = check.substring(0,check.indexOf("<"));
	var id = $(tag).attr('id');
	$('#first').html(text+"<img class='favorites2' id='"+id+"'src='img/favorite-white.png' height='30px' width='30px'/>");
})
$( document ).on( 'click', '.favorites2', function () {
	var id=event.target.id;
	var data=id.split(';');
	var favorites=JSON.parse(localStorage.getItem("favorites"));
	if(favorites==null){
		favorites=[];
	}
	favorites.push({
		id:data[0],
		name:data[1]
	});
	var jsonStr = JSON.stringify(favorites);
	localStorage.setItem("favorites",jsonStr);
	var check=$('#first').html();
	var tag = check.substring(check.indexOf("<"));
	var text = check.substring(0,check.indexOf("<"));
	var id = $(tag).attr('id');
	$('#first').html(text+"<img class='favorites1' id='"+id+"'src='img/favorite-yellow.png' height='30px' width='30px'/>");
})
/*$( document ).on( 'click', '.favorites3', function () {
	var id=event.target.id.split(';')[0];
	var favorites=JSON.parse(localStorage.getItem("favorites"));
	for(var i=0;i<favorites.length;i++){
		if(favorites[i]["id"]==id)
			delete favorites[i];
	}
	favorites=favorites.filter(function(e){return e});
	var jsonStr = JSON.stringify(favorites);
	localStorage.setItem("favorites",jsonStr);
	$('#'+id).remove();
})*/
$( document ).on( 'click', '.stops2', function () {
	var id=event.target.id;
	var text=$('#'+id).text();
	getStopDepartures(id,text);
})
$( document ).on( 'click', '.stops3', function () {
	var id=event.target.id;
	var text=$('#'+id).text();
	getStopDepartures(id,text);
})
function autosuggestValues(text){
	var url = "http://www.cumtd.com/autocomplete/stops/v1.0/json/search?query="+text;
	$.ajax({
		cache : false,
		url : url,
		type : 'GET',
		crossDomain : true,
		dataType :'jsonp',
		async:true,
		complete: function (data) {
			addToSearchList(data["responseJSON"]);
		},
		error : function(jqXHR, textStatus, errorThrown) {
			alert('Network connection not found. Please restart the app.');
			console.log(jqXHR);
			console.log(textStatus);
			console.log(errorThrown);
		}
	});
}
function addToSearchList(data){
	var length=data.length;
	$('#stop_search').empty();
	for(var i=0;i<length;i++){
		var temp="<li class='stops' id='"+data[i]["i"]+"'>"+data[i]["n"]+"</li>";
		$("#stop_search").append(temp);
	}
}
function getStopDepartures(id,text) {
	var url = "https://developer.cumtd.com/api/v2.2/json/GetDeparturesByStop?key=39bfe08574c744a3829de15047a0d527&count=40&pt=60&stop_id="
	+id;
	//+"it";
	$('#wrap_autosuggest').hide();
	$('#wrap_stops').hide();
	$.ajax({
		xhr: function(){
			var xhr = new window.XMLHttpRequest();

			//Download progress
			xhr.addEventListener("progress", function(evt){
				if (evt.lengthComputable) {
					//$('#loader').html("<img src='img/loading-wheel.gif'/>");
					//$('#loader').show();
				}
			}, false);
			return xhr;
		},
		cache : false,
		url : url,
		type : 'GET',
		crossDomain : true,
		async:true,
		complete: function (data) {
			$('#departure_list').empty();
			var favorites=JSON.parse(localStorage.getItem("favorites"));
			//alert(1);
			var flag=false;
			if(favorites!=null){
				for(var i=0; i<favorites.length;i++){
					if(favorites[i]!=null&&favorites[i]["id"]==id)
						flag=true;
				}
			}
			if(flag){
				
				var stopName="<li class='departures' id='first'>"+text+"<img class='favorites1' id='"+id+";"+text+"'src='img/favorite-yellow.png' height='30px' width='30px'/>"+"</li>";
			}
			else{
				var stopName="<li class='departures' id='first'>"+text+"<img class='favorites2' id='"+id+";"+text+"' src='img/favorite-white.png' height='30px' width='30px'/>"+"</li>";
			}
			$("#departure_list").append(stopName);
			var length=data["responseJSON"]["departures"].length;
			if(length>0){
				var ret;
				for(var i=0;i<length;i++){
					var headsign=data["responseJSON"]["departures"][i]["headsign"];
					var expected_mins=data["responseJSON"]["departures"][i]["expected_mins"]
					var is_istop=data["responseJSON"]["departures"][i]["is_istop"];				
					if(is_istop)
						ret="<li class='departures'>"+headsign+" : "+expected_mins+" minute(s) <img src='img/iStop.png' height='20px' width='20px'><br></li>";
					else
						ret="<li class='departures'>"+headsign+" : "+expected_mins+" minute(s)<br></li>";
					$("#departure_list").append(ret);
				}
			}
			else{
				$("#departure_list").append("<li class='departures'>No departures</li>");
			}
			setTimeout("displayDepartures()", 1000);
		},
		error : function(jqXHR, textStatus, errorThrown) {
			alert('Network connection not found. Please restart the app.');
			console.log(jqXHR);
			console.log(textStatus);
			console.log(errorThrown);
		}
	});
}
function displayDepartures(){
	$('#departure_wrap').show();
	//$('#loader').html('');
	//$('#loader').hide('fast','linear');
}
function printFavorites(data){
	if(data!=null){
		for(var i=0;i<data.length;i++){
			var temp="<li class='stops2' id='"+data[i]["id"]+"'>"+data[i]["name"]+
			//"<img class='favorites3'"+//" id='"+data[i]["id"]+";"+data[i]["name"]+"'"+
			//"src='img/favorite-yellow.png' height='50px' width='50px' style='float:right;'/>"+
			"</li>";
			$("#stop_list").append(temp);
		}
	}
}
function getNearest(position){
	var my_longitude=position.coords.longitude,
	my_latitude=position.coords.latitude,
	favorites=JSON.parse(localStorage.getItem("favorites")),count=8;
	if(favorites!=null)
		count=8-favorites.length;
	if(count<3) 
		count=3;
	var url = "https://developer.cumtd.com/api/v2.2/json/GetStopsByLatLon?key=39bfe08574c744a3829de15047a0d527&lat="
	+ my_latitude
	+ "&lon="
	+ my_longitude
	+ "&count="+count;
	$.ajax({
		cache : false,
		url : url,
		type : 'GET',
		crossDomain : true,
		async:true,
		complete: function (data) {
			printNearest(data["responseJSON"]["stops"]);
		},
		error : function(jqXHR, textStatus, errorThrown) {
			alert('Network connection not found. Please restart the app.');
			console.log(jqXHR);
			console.log(textStatus);
			console.log(errorThrown);
		}
	});
}
function printNearest(stops){
	//$('#loader').html('');
	//$('#loader').hide();
	for(var i=0;i<stops.length;i++){
		var temp="<li class='stops3' id='"+stops[i]["stop_id"]+"'>"+stops[i]["stop_name"]
		//"<img src='img/gps.png' height='50px' width='50px' style='float:right;'/>"
		+"</li>";
		$("#stop_list").append(temp);
	}
	printFavorites(JSON.parse(localStorage.getItem("favorites")));
	$('#wrap_stops').show();
}