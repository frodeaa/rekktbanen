const stopToyen = 3010600;
const stopAvlos = 2190280;
const stopKolsas = 2190450;
const stopMajorstua = 3010200;
const stopGronland = 3010610;
const stopJernbaneTorget = 3010011;
const stopNational = 3010031;
const stopStoro = 3012120;
const eastDirection = '1';
const westDirection = '2';
const urlRoot = 'https://reisapi.ruter.no/StopVisit/GetDepartures/';

const departures = [
	{ group: "s-select", origin: stopStoro, originName: "Storo", direction: westDirection, destinationName: "Jernbanetorget", lines: [4, 5] },
	{ group: "s-select", origin: stopAvlos, originName: "Avløs", direction: eastDirection, destinationName: "Jernbanetorget", lines: [3] },
	{ group: "s-select", origin: stopToyen, originName: "Tøyen", direction: eastDirection, destinationName: "Nøklevann", lines: [3] },
	{ group: "s-select", origin: stopJernbaneTorget, originName: "Jernbanetorget", direction: eastDirection, destinationName: "Avløs", lines: [3] },
	{ group: "hm-select", origin: stopKolsas, originName: "Kolsås", direction: eastDirection, destinationName: "Majorstua", lines: [3] },
	{ group: "hm-select", origin: stopMajorstua, originName: "Majorstua", direction: westDirection, destinationName: "Kolsås", lines: [3] },
	{ group: "hm-select", origin: stopNational, originName: "Nationaltheatret", direction: westDirection, destinationName: "Kolsås", lines: [3] },
	{ group: "hm-select", origin: stopGronland, originName: "Grønland", direction: westDirection, destinationName: "Kolsås", lines: [3] },
];

function callAjax(url, callback) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function(){
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
            callback(xmlhttp.responseText);
        }
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
};

function toDoubleDigit(n){
    return n > 9 ? "" + n: "0" + n;
}

function getDeparturesFromStop(url, direction) {
	var callback = function(returnData) {
		var jsonReturn = JSON.parse(returnData);
		var topData = [];
		for (var i = 0; i < jsonReturn.length; i++) {
			if (jsonReturn[i].MonitoredVehicleJourney.DirectionRef === direction) {
				var timeDiff = (new Date(jsonReturn[i].MonitoredVehicleJourney.MonitoredCall.ExpectedDepartureTime) - new Date()) / 1000;
				var readableTime = Math.floor(timeDiff / 60) + '.' + toDoubleDigit(Math.floor(timeDiff % 60));
				topData.push(readableTime);
			}
		}
		
		var rowsEl = document.getElementById('departure-rows');
		for (var j = 0; j < topData.length; j++) {
			var directionEl = document.createElement('div');
			directionEl.classList.add('departure-entry');
			directionEl.innerHTML = topData[j];
			rowsEl.appendChild(directionEl);
			
		}
		//console.log(topData);
		document.getElementById('departure-loader').style.display = 'none';
		document.getElementById('refresh-button').style.display = 'inline-block';
	}
	callAjax(url, callback);
};

function setSelectedStop(element) {
	loadDepartureTimes();
    var selectedStop = document.getElementsByClassName('fa-check')[0];
    if (selectedStop) {
    	selectedStop.classList.remove("fa-check"); // remove class icon
    }
	element.querySelector('.selection-icon').classList.add('fa-check');
};

function loadDepartureTimes() {
	document.getElementById('refresh-button').style.display = 'none';
	document.getElementById('departure-rows').innerHTML = ""; // clear old data;
	document.getElementById('departure-loader').style.display = 'inline-block';
}

window.onload = function (e) {
	var template = document.getElementsByClassName("stop-selector-item-template")[0];
	departures.forEach(function (departure) {
		var el = template.cloneNode(true);
		el.removeAttribute("style");
		el.className = el.className.replace("-template", "");
		el.querySelector(".origin").innerHTML = departure.originName;
		el.querySelector(".destination").innerHTML = departure.destinationName;
		el.dataset.url = urlRoot + departure.origin + '?linenames=' + departure.lines.join(",");
		el.dataset.direction = departure.direction;
		document.getElementById(departure.group).appendChild(el);
		el.addEventListener('click', function () {
			getDeparturesFromStop(el.dataset.url, el.dataset.direction);
			setSelectedStop(this);
		})
	});
	
	document.getElementById('refresh-button').addEventListener('click', function() {
		document.getElementsByClassName("fa-check")[0].click()
	});
	
	if (window.location.hash.indexOf("select=hm") > -1) {
		document.getElementById("s-select").style.display = "none";
	} else {
		document.getElementById("hm-select").style.display = "none";
	}
}
// test to get stop ids 
//callAjax('https://reisapi.ruter.no/Line/GetStopsByLineId/3', function() {})