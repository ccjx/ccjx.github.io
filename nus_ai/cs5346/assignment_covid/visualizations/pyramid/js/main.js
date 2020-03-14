// var margin = { left:100, right:20, top:10, bottom:100 };
const svgWidth = 500
const svgHeight = 400
// var width = svgWidth - margin.left - margin.right,
//     height = svgHeight - margin.top - margin.bottom;

// https://stackoverflow.com/questions/25044997/creating-population-pyramid-with-d3-js

circleSize = d3
  .scaleThreshold()
  .domain([1, 10, 100, 1000, 10000])
  .range([0, 5, 10, 15, 20, 30])

  var barColor = d3.scaleOrdinal(d3.schemeSet3)
  .range(["#24ad0a", "#9817ff", "#d7011b", "#19a0da", "#e867b8", "#7e6839", "#435fdb", "#12aa84", "#d88111", "#7e6083", "#e47572", "#969c16", "#fb3ef1", "#3d7375", "#d00d5e", "#377927", "#a13eba", "#8b8ee2", "#a65425", "#9f948d", "#604df8", "#fd660a", "#7d9f6f", "#a94b70", "#945b55", "#91529e", "#b98f3b", "#c70799"])

function renderPyramidChart(chartId, exampleData){
	tipM = d3.tip().attr('class', 'd3-tip').html(function(d) { 
		return d.group + "<br>" + d.male + " male(s)" 
	});
	tipF = d3.tip().attr('class', 'd3-tip').html(function(d) { 
		return d.group + "<br>" + d.female + " female(s)" 
	});
	// SET UP DIMENSIONS
	var w = svgWidth,
	h = svgHeight;

	// margin.middle is distance from center line to each y-axis
	var margin = {
	top: 20,
	right: 20,
	bottom: 24,
	left: 20,
	middle: 28
	};

	// the width of each side of the chart
	var regionWidth = w/2 - margin.middle;

	// these are the x-coordinates of the y-axes
	var pointA = regionWidth,
	pointB = w - regionWidth;

	// GET THE TOTAL POPULATION SIZE AND CREATE A FUNCTION FOR RETURNING THE PERCENTAGE
	var totalPopulation = d3.sum(exampleData, function(d) { return d.male + d.female; }),
	percentage = function(d) { return d / totalPopulation; };


	// CREATE SVG
	var svg = d3.select(chartId)
	.attr("class", "chart-container")
	.append('svg')
	.call(tipM)
	.call(tipF)
	.attr('width', margin.left + w + margin.right)
	.attr('height', margin.top + h + margin.bottom)
	// ADD A GROUP FOR THE SPACE WITHIN THE MARGINS
	.append('g')
	.attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

	// find the maximum data value on either side
	//  since this will be shared by both of the x-axes
	var maxValue = Math.max(
	d3.max(exampleData, function(d) { return percentage(d.male); }),
	d3.max(exampleData, function(d) { return percentage(d.female); })
	);

	// SET UP SCALES

	// the xScale goes from 0 to the width of a region
	//  it will be reversed for the left x-axis
	var xScale = d3.scaleLinear()
	.domain([0, maxValue])
	.range([0, regionWidth])
	.nice();


	var xScaleLeft = d3.scaleLinear()
	.domain([0, maxValue])
	.range([regionWidth, 0]);

	var xScaleRight = d3.scaleLinear()
	.domain([0, maxValue])
	.range([0, regionWidth]);

	// var yScale = d3.scaleOrdinal()
	// .domain(exampleData.map(function(d) { return d.group; }))
	// .rangeRoundBands([h,0], 0.1);


	var yScale = d3.scaleBand()
	.domain(exampleData.map(function(d) { return d.group; }))
	.range([h, 0])
	.paddingInner(0.1)

	// SET UP AXES
	var yAxisLeft = d3.axisRight(yScale)
	.tickSize(4,0)
	.tickPadding(margin.middle-4);

	var yAxisRight = d3.axisLeft(yScale)
	.tickSize(4,0)
	.tickFormat('');

	var xAxisRight = d3.axisBottom(xScale)
	.tickFormat(d3.format('.0%'));

	var xAxisLeft = d3.axisBottom(xScale.copy().range([pointA, 0]))
	// REVERSE THE X-AXIS SCALE ON THE LEFT SIDE BY REVERSING THE RANGE
	.tickFormat(d3.format('.0%'));

	// MAKE GROUPS FOR EACH SIDE OF CHART
	// scale(-1,1) is used to reverse the left side so the bars grow left instead of right
	var leftBarGroup = svg.append('g')
	.attr('transform', 'translate(' + pointA + ', 0)' + ' scale(-1,1)');
	var rightBarGroup = svg.append('g')
	.attr('transform', 'translate(' + pointB + ', 0)');

	// DRAW AXES
	svg.append('g')
	.attr('class', 'axis y left')
	.attr('transform', 'translate(' + pointA + ', 0)')
	.call(yAxisLeft)
	.selectAll('text')
	.style('text-anchor', 'middle');

	svg.append('g')
	.attr('class', 'axis y right')
	.attr('transform', 'translate(' + pointB + ', 0)')
	.call(yAxisRight);

	svg.append('g')
	.attr('class', 'axis x left')
	.attr('transform', 'translate(' + 0 + ', ' + h + ')')
	.call(xAxisLeft);

	svg.append('g')
	.attr('class', 'axis x right')
	.attr('transform', 'translate(' + pointB + ', ' + h + ')')
	.call(xAxisRight);

	// DRAW BARS
	leftBarGroup.selectAll('.bar.left')
	.data(exampleData)
	.enter().append('rect')
	.attr('class', 'bar left')
	.attr('x', 0)
	.attr('y', function(d) { return yScale(d.group); })
	.attr('width', function(d) { return xScale(percentage(d.male)); })
	.attr('height', yScale.bandwidth)
	.on('mouseover', tipM.show)
	.on('mouseout', tipM.hide)

		
	rightBarGroup.selectAll('.bar.right')
	.data(exampleData)
	.enter().append('rect')
	.attr('class', 'bar right')
	.attr('x', 0)
	.attr('y', function(d) { return yScale(d.group); })
	.attr('width', function(d) { return xScale(percentage(d.female)); })
	.attr('height', yScale.bandwidth)
	.on('mouseover', tipF.show)
	.on('mouseout', tipF.hide)
}

function processCovidData(filterCountryData){
	console.log(filterCountryData)
	let covidData = [
		{group: '0-9', male: 0, female: 0},
		{group: '10-19', male: 0, female: 0},
		{group: '20-29', male: 0, female: 0},
		{group: '30-39', male: 0, female: 0},
		{group: '40-49', male: 0, female: 0},
		{group: '50-59', male: 0, female: 0},
		{group: '60-69', male: 0, female: 0},
		{group: '70-79', male: 0, female: 0},
		{group: '80-89', male: 0, female: 0},
		{group: '90-99', male: 0, female: 0},
		{group: '100-109', male: 0, female: 0},
	]
	for(let d of filterCountryData){
		if(d.ageBracket){
			covidData.find(c => c.group == d.ageBracket)[d.gender] += 1
		}
	}
	console.log(covidData)

	return covidData
}

function processCountryStats(countryStats){
	let countryStat = [
		{
			group: '0-9', 
			male: countryStats['Male']['0 - 4'] + countryStats['Male']['5 - 9'], 
			female: countryStats['Female']['0 - 4'] + countryStats['Female']['5 - 9'], 
		},
		{
			group: '10-19', 
			male: countryStats['Male']['10 - 14'] + countryStats['Male']['15 - 19'], 
			female: countryStats['Female']['10 - 14'] + countryStats['Female']['15 - 19'], 
		},
		{
			group: '20-29', 
			male: countryStats['Male']['20 - 24'] + countryStats['Male']['25 - 29'], 
			female: countryStats['Female']['20 - 24'] + countryStats['Female']['25 - 29'], 
		},
		{
			group: '30-39', 
			male: countryStats['Male']['30 - 34'] + countryStats['Male']['35 - 39'], 
			female: countryStats['Female']['30 - 34'] + countryStats['Female']['35 - 39'], 
		},
		{
			group: '40-49', 
			male: countryStats['Male']['40 - 44'] + countryStats['Male']['45 - 49'], 
			female: countryStats['Female']['40 - 44'] + countryStats['Female']['45 - 49'], 
		},
		{
			group: '50-59', 
			male: countryStats['Male']['50 - 54'] + countryStats['Male']['55 - 59'], 
			female: countryStats['Female']['50 - 54'] + countryStats['Female']['55 - 59'], 
		},
		{
			group: '60-69', 
			male: countryStats['Male']['60 - 64'] + countryStats['Male']['65 - 69'], 
			female: countryStats['Female']['60 - 64'] + countryStats['Female']['65 - 69'], 
		},
		{
			group: '70-79', 
			male: countryStats['Male']['70 - 74'] + countryStats['Male']['75 - 79'], 
			female: countryStats['Female']['70 - 74'] + countryStats['Female']['75 - 79'], 
		},
		{
			group: '80-89', 
			male: countryStats['Male']['80 - 84'] + countryStats['Male']['85 - 89'], 
			female: countryStats['Female']['80 - 84'] + countryStats['Female']['85 - 89'], 
		},
		{
			group: '90-99', 
			male: countryStats['Male']['90 - 94'] + countryStats['Male']['95 - 99'], 
			female: countryStats['Female']['90 - 94'] + countryStats['Female']['95 - 99'], 
		},
		{
			group: '100-109', 
			male: countryStats['Male']['100 +'] , 
			female: countryStats['Female']['100 +'] , 
		},
	]
	return countryStat
}

function renderPyramids(lineData, popData){
	let procChinaCovidData = processCovidData(lineData.filter(p => p.country == "China"))
	let procChinaData = processCountryStats(popData["China"])

	renderPyramidChart("#chart-china", procChinaData)
	renderPyramidChart("#chart-china-covid", procChinaCovidData)

	let procJapanCovidData = processCovidData(lineData.filter(p => p.country == "Japan"))
	let procJapanData = processCountryStats(popData["Japan"])

	renderPyramidChart("#chart-japan", procJapanData)
	renderPyramidChart("#chart-japan-covid", procJapanCovidData)

	let procSingaporeCovidData = processCovidData(lineData.filter(p => p.country == "Singapore"))
	let procSingaporeData = processCountryStats(popData["Singapore"])

	renderPyramidChart("#chart-singapore", procSingaporeData)
	renderPyramidChart("#chart-singapore-covid", procSingaporeCovidData)

	let procSKCovidData = processCovidData(lineData.filter(p => p.country == "South Korea"))
	let procSKData = processCountryStats(popData["Republic of Korea"])

	renderPyramidChart("#chart-sk", procSKData)
	renderPyramidChart("#chart-sk-covid", procSKCovidData)
	
	var counts = {};
	for (var i = 0; i < lineData.length; i++) {
		counts[lineData[i].country] = 1 + (counts[lineData[i].country] || 0);
	}
	console.log(counts)


}



Promise.all([
    d3.json("data/line-list-data.json"),
    d3.json("data/country-age-gender-population.json"),
]).then(function(data) {
	let lineData = data[0]
	let popData = data[1]
	console.log(data)
	//Top 5 countries / Pop pyramid and Covid Pyramid
	renderPyramids(lineData, popData)
    // files[0] will contain file1.csv
    // files[1] will contain file2.csv
}).catch(function(err) {
    // handle error here
})

	