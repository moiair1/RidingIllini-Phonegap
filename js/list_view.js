$(document).ready(function() {
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
})
$( document ).on( 'click', '.favorites1', function () {
	var id=event.target.id;
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
	$('#first').html(text+"<img class='favorites2' id='"+id+"'src='img/favorite-white.png' height='50px' width='50px'/>");
})
$( document ).on( 'click', '.favorites2', function () {
	var id=event.target.id;
	var favorites=JSON.parse(localStorage.getItem("favorites"));
	if(favorites!=null){
		favorites.push({
			id:id
		});
	}
	else
		favorites=[];
	var jsonStr = JSON.stringify(favorites);
	localStorage.setItem("favorites",jsonStr);
	var check=$('#first').html();
	var tag = check.substring(check.indexOf("<"));
	var text = check.substring(0,check.indexOf("<"));
	var id = $(tag).attr('id');
	$('#first').html(text+"<img class='favorites1' id='"+id+"'src='img/favorite-yellow.png' height='50px' width='50px'/>");
})
function autosuggestValues(text){
	var url = "http://www.cumtd.com/autocomplete/stops/v1.0/json/search?query="+text;
	$.ajax({
		cache : false,
		url : url,
		type : 'GET',
		crossDomain : true,
		dataType :'jsonp',
		async:false,
		complete: function (data) {
			addToSearchList(data["responseJSON"]);
		},
		error : function(jqXHR, textStatus, errorThrown) {
			alert('request failed');
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
	$('#departure_wrap').show();
	$('#wrap_autosuggest').hide();
	$.ajax({
		cache : false,
		url : url,
		type : 'GET',
		crossDomain : true,
		async:false,
		complete: function (data) {
			$('#departure_list').empty();
			var favorites=JSON.parse(localStorage.getItem("favorites"));
			var flag=false;
			if(favorites!=null){
				for(var i=0; i<favorites.length;i++){
					if(favorites[i]!=null&&favorites[i]["id"]==id)
						flag=true;
				}
			}
			if(flag){
				
				var stopName="<li class='departures' id='first'>"+text+"<img class='favorites1' id='"+id+"'src='img/favorite-yellow.png' height='50px' width='50px'/>"+"</li>";
			}
			else{
				var stopName="<li class='departures' id='first'>"+text+"<img class='favorites2' id='"+id+"'src='img/favorite-white.png' height='50px' width='50px'/>"+"</li>";
			}
			//var stopName="<li class='departures'>"+text+"</li>";
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
				$("#departure_list").append("No departures");
			}
		},
		error : function(jqXHR, textStatus, errorThrown) {
			alert('request failed');
			console.log(jqXHR);
			console.log(textStatus);
			console.log(errorThrown);
		}
	});
}