function CoOnLoad() {
	CoSelectPage();
}
window.onhashchange = function() {
	CoSelectPage();
}
function removeHash() { 
	history.pushState("", document.title, window.location.pathname + window.location.search);
}
if(typeof CoCurrentCountry == "undefined") {
	CoCurrentCountry = "Germany";
}
function CoSelectPage() {
	CoClearScreen();
	switch(window.location.hash) {
		case "":
			CoStart();
			break;
		case "#home":
			CoStart();
			break;
		case "#overview":
			CoStart();
			break;
		case "#single-country":
			CoSingle(CoCurrentCountry);
			break;
		case "#data-source":
			CoDataSource();
			break;
		case "#offline":
			CoOffline();
			break;
		default:
			CoSingle(window.location.hash.substr(1).replace("%20", " "));
			break;
	}
}
function CoClearScreen() {
	document.getElementById('page-overview').hidden = true;
	document.getElementById('page-single-country').hidden = true;
	document.getElementById('page-data-source').hidden = true;
	document.getElementById('page-offline').hidden = true;
}
var loading = '<br><center><div class="mdl-spinner mdl-spinner--single-color mdl-js-spinner is-active"></div></center>';
function CoStart() {
	removeHash();
	history.pushState("","","");
	CoClearScreen();
	CoLoadOverview();
	document.getElementById("page-overview").hidden = false;
}
var CoData = '';
function CoLoadOverview() {
	// Get data from server
	var xmlhttp = new XMLHttpRequest();
	var url = "//pomber.github.io/covid19/timeseries.json?time="+new Date().getTime();
	xmlhttp.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200) {
			var JSONresponse = JSON.parse(this.responseText);
			var keys = Object.keys(JSONresponse);
			CoData = JSONresponse;
			var out = '<table id="overview-table-root" class="mdl-data-table mdl-js-data-table mdl-data-table--selectable mdl-shadow--2dp co-table"><thead><tr><th class="mdl-data-table__cell--non-numeric sort" data-sort="country">Country</th><th data-sort="infections" class="sort">Infections</th><th data-sort="deaths" class="sort">Deaths</th><th class="mdl-data-table__cell--non-numeric">Info</th></tr></thead><tbody class="list">';
			for (var i = 0; i < keys.length; i++) {
				out += '<tr><td class="mdl-data-table__cell--non-numeric jwidth country">'+keys[i]+'</td><td class="infections">'+String(JSONresponse[keys[i]][JSONresponse[keys[i]].length-1]['confirmed'])+'</td><td class="deaths">'+String(JSONresponse[keys[i]][JSONresponse[keys[i]].length-1]['deaths'])+'</td>'
					+  '<td class="mdl-data-table__cell--non-numeric info"><button class="mdl-button mdl-js-button mdl-button--icon" onclick="CoSingle('+"'"+String(keys[i])+"'"+')"><i class="material-icons">info</i></button></td>'
					+  '</tr>';
			}
			out += '</tbody></table>';
			document.getElementById("overview-table").innerHTML = out;
			var options = {
				valueNames: [ 'country', 'infections', 'deaths' ]
			};
			var overviewTable = new List('overview-table', options);
			overviewTable.sort('infections', { order: "desc" });
		}
	};
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
}
function CoSingle(countryName) {
	CoCurrentCountry = countryName;
	/*history.pushState("","","#single-country");*/
	history.pushState("","","#"+countryName);
	CoClearScreen();
	document.getElementById("single-overview").innerHTML = "";
	document.getElementById("single-table").innerHTML = loading;
	CoLoadSingle(countryName);
	document.getElementById("page-single-country").hidden = false;
}
// Init Chart
var ctxInit = document.getElementById('single-chart');
			var configInit = {
				type: 'line',
				data: {
					labels: [], //Array mit Strings auf x Achse
					datasets: [
						{
							label: 'Infections',
							backgroundColor: 'rgb(255, 205, 86)',//Yellow
							borderColor: 'rgb(255, 205, 86)',
							data: [], // Array mit ints
							fill: false,
						},
						{
							label: 'Deaths',
							fill: false,
							backgroundColor: 'rgb(255, 99, 132)',//Red
							borderColor: 'rgb(255, 99, 132)',
							data: [], //Array mit ints
						},
						{
							label: 'Recovered',
							backgroundColor: 'rgb(75, 192, 192)',//Green
							borderColor: 'rgb(75, 192, 192)',
							data: [], // Array mit ints
							fill: false,
						},
						{
							label: 'Active Cases',
							backgroundColor: 'rgb(255, 159, 64)', //Orange
							borderColor: 'rgb(255, 159, 64)',
							data: [], // Array mit ints
							fill: false,
						},
					]
				},
				options: {
					responsive: true,
					//maintainAspectRatio: true,
					//aspectRatio: 1,
					title: {
						display: true,
						text: 'Coronavirus Infections in ...'
					},
					tooltips: {
						mode: 'index',
						intersect: false,
					},
					hover: {
						mode: 'nearest',
						intersect: true
					},
					scales: {
						xAxes: [{
							display: true,
							scaleLabel: {
								display: true,
								labelString: 'Date'
							}
						}],
						yAxes: [{
							display: true,
							scaleLabel: {
								display: true,
								labelString: 'Value'
							}
						}]
					}
				}
			};
var singleChart = new Chart(ctxInit, configInit);
// ---
function CoLoadSingle(countryName) {
	document.getElementById("single-heading").innerHTML = "Coronavirus Infections in " + String(countryName);
	document.getElementById("single-chart").hidden = true;
	var xmlhttp = new XMLHttpRequest();
	var url = "//pomber.github.io/covid19/timeseries.json?time="+new Date().getTime();
	xmlhttp.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200) {
			var JSONresponse = JSON.parse(this.responseText);
			CoData = JSONresponse;
			var CurrentCountry = JSONresponse[countryName];
			var CurrentCountryInfectionsArray = [];
			var CurrentCountryDeathsArray = [];
			var CurrentCountryRecoveredArray = [];
			var CurrentCountryDatesArray = [];
			var CurrentCountryActiveCasesArray = [];
			var out = '<table class="mdl-data-table mdl-js-data-table mdl-data-table--selectable mdl-shadow--2dp co-table"><thead><tr><th class="mdl-data-table__cell--non-numeric sort" data-sort="date">Date</th><th class="sort" data-sort="infections">Infections</th><th class="sort" data-sort="deaths">Deaths</th><th class="sort" data-sort="recovered">Recovered</th></tr></thead><tbody class="list">';
			for (var i = 0; i < CurrentCountry.length; i++) {
				CurrentCountryInfectionsArray.push(CurrentCountry[i]['confirmed']);
				CurrentCountryDeathsArray.push(CurrentCountry[i]['deaths']);
				CurrentCountryRecoveredArray.push(CurrentCountry[i]['recovered']);
				CurrentCountryDatesArray.push(CurrentCountry[i]['date']);
				CurrentCountryActiveCasesArray.push(CurrentCountry[i]['confirmed']-CurrentCountry[i]['recovered']-CurrentCountry[i]['deaths']);
				out += '<tr><td class="mdl-data-table__cell--non-numeric date">'+CurrentCountry[i]['date']+'</td><td class="infections">'+CurrentCountry[i]['confirmed']+'</td><td class="deaths">'+CurrentCountry[i]['deaths']+'</td><td class="recovered">'+CurrentCountry[i]['recovered']+'</td>'
					+  '</tr>';
			}
			out += '</tbody></table>';
			document.getElementById("single-table").innerHTML = out;
			// Sort.js
			var options1 = {
				valueNames: [ 'date', 'infections', 'deaths', 'recovered' ]
			};
			var singleTable = new List('single-table', options1);
			singleTable.sort('date', { order: "desc" });
			// Sort.js /
			var CurrentCountryActiveCases = CurrentCountry[CurrentCountry.length-1]['confirmed']-CurrentCountry[CurrentCountry.length-1]['recovered']-CurrentCountry[CurrentCountry.length-1]['deaths'];
			document.getElementById("single-overview").innerHTML = '<table style="margin: 0 auto; padding-bottom: 16px;">'
				+  '<tr><td style="font-size: 18px; width: 100px" class="single-overview-td">Infections</td><td style="font-size: 22px; font-weight: bold; text-align: right;" class="single-overview-td">'+CurrentCountry[CurrentCountry.length-1]['confirmed']+'</td></tr>'
				+  '<tr><td style="font-size: 18px; width: 100px" class="single-overview-td">Deaths</h6></td><td style="font-size: 22px; font-weight: bold; text-align: right;" class="single-overview-td">'+CurrentCountry[CurrentCountry.length-1]['deaths']+'</td></tr>'
				+  '<tr><td style="font-size: 18px; width: 100px" class="single-overview-td">Recovered</h6></td><td style="font-size: 22px; font-weight: bold; text-align: right;" class="single-overview-td">'+CurrentCountry[CurrentCountry.length-1]['recovered']+'</td></tr>'
				+  '<tr><td style="font-size: 16px; width: 150px">Active cases<br><span style="font-size: 11px;">(Infections minus recovered minus deaths)</span></h6></td><td style="font-size: 22px; font-weight: bold; text-align: right;">'+CurrentCountryActiveCases+'</td></tr>'
				+  '</table>';
			/* Chart */
			var ctx = document.getElementById('single-chart');
			var config = {
				type: 'line',
				data: {
					labels: CurrentCountryDatesArray, //Array mit Strings auf x Achse
					datasets: [
						{
							label: 'Infections',
							backgroundColor: 'rgb(255, 205, 86)',//Yellow
							borderColor: 'rgb(255, 205, 86)',
							data: CurrentCountryInfectionsArray, // Array mit ints
							fill: false,
						},
						{
							label: 'Deaths',
							fill: false,
							backgroundColor: 'rgb(255, 99, 132)',//Red
							borderColor: 'rgb(255, 99, 132)',
							data: CurrentCountryDeathsArray, //Array mit ints
						},
						{
							label: 'Recovered',
							backgroundColor: 'rgb(75, 192, 192)',//Green
							borderColor: 'rgb(75, 192, 192)',
							data: CurrentCountryRecoveredArray, // Array mit ints
							fill: false,
						},
						{
							label: 'Active Cases',
							backgroundColor: 'rgb(255, 159, 64)', //Orange
							borderColor: 'rgb(255, 159, 64)',
							data: CurrentCountryActiveCasesArray, // Array mit ints
							fill: false,
						},
					]
				},
				options: {
					responsive: true,
					//maintainAspectRatio: true,
					//aspectRatio: 1,
					title: {
						display: true,
						text: 'Coronavirus Infections in '+String(countryName)
					},
					tooltips: {
						mode: 'index',
						intersect: false,
					},
					hover: {
						mode: 'nearest',
						intersect: true
					},
					scales: {
						xAxes: [{
							display: true,
							scaleLabel: {
								display: true,
								labelString: 'Date'
							}
						}],
						yAxes: [{
							display: true,
							scaleLabel: {
								display: true,
								labelString: 'Value'
							}
						}]
					}
				}
			};
			//singleChart.destroy();
			//var singleChart = new Chart(ctx, config);
			//singleChart.reset();
			document.getElementById("single-chart").hidden = false;
			singleChart.options = config.options;
			singleChart.data = config.data;
			singleChart.update();
			singleChartLog();
		}
	};
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
}
function singleChartLog() {
	var state = document.getElementById("log-checkbox").checked;
	if(state == true) {
		singleChart.options.scales.yAxes[0].type = "logarithmic";
		singleChart.update();
	}
	if(state == false) {
		singleChart.options.scales.yAxes[0].type = "linear";
		singleChart.update();
	}
}
function CoDataSource() {
	CoClearScreen();
	history.pushState("","","#data-source");
	document.getElementById("page-data-source").hidden = false;
}
function CoOffline() {
	CoClearScreen();
	history.pushState("","","#offline");
	document.getElementById("page-offline").hidden = false;
}
/*<table class="mdl-data-table mdl-js-data-table mdl-data-table--selectable mdl-shadow--2dp">
  <thead>
    <tr>
      <th class="mdl-data-table__cell--non-numeric">Material</th>
      <th>Quantity</th>
      <th>Unit price</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="mdl-data-table__cell--non-numeric">Acrylic (Transparent)</td>
      <td>25</td>
      <td>$2.90</td>
    </tr>
    <tr>
      <td class="mdl-data-table__cell--non-numeric">Plywood (Birch)</td>
      <td>50</td>
      <td>$1.25</td>
    </tr>
    <tr>
      <td class="mdl-data-table__cell--non-numeric">Laminate (Gold on Blue)</td>
      <td>10</td>
      <td>$2.35</td>
    </tr>
  </tbody>
</table>*/
