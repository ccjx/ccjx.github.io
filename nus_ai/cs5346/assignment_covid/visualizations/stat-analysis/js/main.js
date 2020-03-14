// var margin = { left:100, right:20, top:10, bottom:100 };
const svgWidth = 1000
const svgHeight = 600
// var width = svgWidth - margin.left - margin.right,
//     height = svgHeight - margin.top - margin.bottom;
circleSize = d3
  .scaleThreshold()
  .domain([1, 10, 100, 1000, 10000])
  .range([0, 5, 10, 15, 20, 30])

  var barColor = d3.scaleOrdinal(d3.schemeSet3)
  .range(["#24ad0a", "#9817ff", "#d7011b", "#19a0da", "#e867b8", "#7e6839", "#435fdb", "#12aa84", "#d88111", "#7e6083", "#e47572", "#969c16", "#fb3ef1", "#3d7375", "#d00d5e", "#377927", "#a13eba", "#8b8ee2", "#a65425", "#9f948d", "#604df8", "#fd660a", "#7d9f6f", "#a94b70", "#945b55", "#91529e", "#b98f3b", "#c70799"])

function renderChartTop15(countryData){
	tip = d3.tip().attr('class', 'd3-tip').html(function(d) { 
		return d.country + "<br>" + d.confirmed + " confirmed case(s)"
	});
	let sortedCountryData = countryData.slice().sort(function (a, b) {
		return b.confirmed-a.confirmed;
	});
	sortedCountryData = sortedCountryData.slice(0, 15)
	console.log(sortedCountryData)

	var margin = { left:100, right:20, top:10, bottom:60 };
	const svgWidth = 1200
	const svgHeight = 400
	var width = svgWidth - margin.left - margin.right,
		height = svgHeight - margin.top - margin.bottom;

	let svg = d3.select("#chart-top-15")
	.attr("class", "chart-container")
	.append("svg")
	.attr("width", svgWidth)
	.attr("height", svgHeight)
	.call(tip)

	let g = svg.append("g")
			.attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
			
	// console.log(data)
	// let x = d3.scaleLog() 
	// .range([0, width])
	// .domain([140, 150000])
	var y = d3.scaleSymlog()
	.domain([0, 100000])
	.range([0, height]);
	var yAxisScale = d3.scaleSymlog()
	.domain([0, 100000])
	.range([height, 0]);

	var x = d3.scaleBand()
		.domain(sortedCountryData.map(d=>d.country))
		.range([0, width])
		.paddingInner(0.3)
		.paddingOuter(0.3)
		

	//bars
	var bars = g.selectAll("rect")
		.data(sortedCountryData)
	
	bars.enter()
		.append("rect")
		.attr("x", (d, i) => {
			return x(d.country)
		})
		.attr("y", d=> {
			// console.log(d.confirmed); 
			return height - y(d.confirmed)
		})
		.attr("fill", d => barColor(d.country))
		.attr("width", x.bandwidth)
		.attr("height", (d, i) => {
			return y(d.confirmed)
		})
		.on('mouseover', tip.show)
		.on('mouseout', tip.hide)
	
	//axes
	var xAxisCall = d3.axisBottom(x);
	g.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0, " + height + ")")
		.call(xAxisCall)
		// .selectAll("text")
		//     .attr("transform", "rotate(-40)")
	var yAxisCall = d3
	.axisLeft(yAxisScale)
	.tickValues([0, 10, 100, 1000, 10000, 100000]);
	g.append("g")
		.attr("class", "y axis")
		.call(yAxisCall)
	
	//Labels
	g.append("text")
		.attr("class", "x axis-label")
		.attr("x", width/2)
		.attr("y", height + 50)
		.attr("font-size", "20px")
		.attr("text-anchor", "middle")
		.text("Country")
	g.append("text")
		.attr("class", "y axis-label")
		.attr("x", -height/2)
		.attr("y", -60)
		.attr("font-size", "20px")
		.attr("text-anchor", "middle")
		.text("Cases (log)")
		.attr("transform", "rotate(-90)")
}


function renderChartTop15WithPop(popData, countryData){
	
	tip = d3.tip().attr('class', 'd3-tip').html(function(d) { 
		return d.country + "<br>" + d3.format(".4%")(d.covidPercent / (100 * 1000)) + " of population" + "<br>Covid Cases: " + d.confirmed + "<br>Population: " + d.population 
	});



	let countryDataClone = countryData.slice()
	countryDataClone.sort(function (a, b) {
		if(a.country < b.country) { return -1; }
		if(a.country > b.country) { return 1; }
		return 0;
	});
	for(let country of countryDataClone){
		let matchCountry = country.country
		if(country.country == "Mainland China") {
			matchCountry = "China"
		} else if (country.country == "Hong Kong") {
			matchCountry = "China, Hong Kong SAR"
		} else if (country.country == "Macau") {
			matchCountry = "China, Macao SAR"
		} else if (country.country == "US") {
			matchCountry = "United States of America"
		} else if (country.country == "South Korea") {
			matchCountry = "Republic of Korea"
		} else if (country.country == "Vietnam") {
			matchCountry = "Viet Nam"
		} else if (country.country == "Bolivia") {
			matchCountry = "Bolivia (Plurinational State of)"
				
		} else if (country.country == "Brunei") {
			matchCountry = "Brunei Darussalam"
		} else if (country.country == "Czech Republic") {
			matchCountry = "Czechia"
		} else if (country.country == "Iran") {
			matchCountry = "Iran (Islamic Republic of)"
		} else if (country.country == "Moldova") {
			matchCountry = "Republic of Moldova"
		} else if (country.country == "Russia") {
			matchCountry = "Russian Federation"
		} else if (country.country == "Saint Barthelemy") {
			matchCountry = "Saint Barthélemy"
		} else if (country.country == "St. Martin") {
			matchCountry = "Saint-Martin (French part)"
		} else if (country.country == "UK") {
			matchCountry = "United Kingdom of Great Britain and Northern Ireland"
		}
		
		
		//Not found - Holy See (Vatican), Ivory Coast, Palestine, Taiwan
			
		if(!popData[matchCountry]) {
			console.log(matchCountry)
			console.log("Not found!")
			continue;
		}
		// console.log(popData[matchCountry])
		country.population = popData[matchCountry]["Both Sexes"]["Total"]
	}
	
	countryDataClone = countryDataClone.filter(c => c.population)
	for(let c of countryDataClone){
		c.covidPercent = c.confirmed / c.population * 100 * 1000
	}
	countryDataClone.sort(function (a, b) {
		return b.covidPercent-a.covidPercent;
	});
	// china = countryDataClone.filter(c => c.country == "Mainland China")
	sortedCountryData = countryDataClone.slice(0, 15)
	// sortedCountryData.push(china[0])
	console.log(sortedCountryData)

	var margin = { left:100, right:20, top:10, bottom:60 };
	const svgWidth = 1200
	const svgHeight = 400
	var width = svgWidth - margin.left - margin.right,
		height = svgHeight - margin.top - margin.bottom;

	let svg = d3.select("#chart-top-15-pop")
	.attr("class", "chart-container")
	.append("svg")
	.attr("width", svgWidth)
	.attr("height", svgHeight)
	.call(tip)

	let g = svg.append("g")
			.attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
			
	// console.log(data)
	// let x = d3.scaleLog() 
	// .range([0, width])
	// .domain([140, 150000])
	var y = d3.scaleSymlog()
	.domain([0, 2e2])
	.range([0, height]);
	var yAxisScale = d3.scaleSymlog()
	.domain([0, 2e2])
	.range([height, 0]);

	var x = d3.scaleBand()
		.domain(sortedCountryData.map(d=>d.country))
		.range([0, width])
		.paddingInner(0.3)
		.paddingOuter(0.3)
		

	//bars
	var bars = g.selectAll("rect")
		.data(sortedCountryData)
	
	bars.enter()
		.append("rect")
		.attr("x", (d, i) => {
			return x(d.country)
		})
		.attr("y", d=> {
			// console.log(d.confirmed); 
			return height - y(d.covidPercent)
		})
		.attr("fill", d => barColor(d.country))
		.attr("width", x.bandwidth)
		.attr("height", (d, i) => {
			return y(d.covidPercent)
		})
		.on('mouseover', tip.show)
		.on('mouseout', tip.hide)
	
	//axes
	var xAxisCall = d3.axisBottom(x);
	g.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0, " + height + ")")
		.call(xAxisCall)
		// .selectAll("text")
		//     .attr("transform", "rotate(-40)")
	var yAxisCall = d3
	.axisLeft(yAxisScale)
	.tickValues([])
	
	g.append("g")
		.attr("class", "y axis")
		.call(yAxisCall)
	
	//Labels
	g.append("text")
		.attr("class", "x axis-label")
		.attr("x", width/2)
		.attr("y", height + 50)
		.attr("font-size", "20px")
		.attr("text-anchor", "middle")
		.text("Country")
	g.append("text")
		.attr("class", "y axis-label")
		.attr("x", -height/2)
		.attr("y", -70)
		.attr("font-size", "20px")
		.attr("text-anchor", "middle")
		.text("(COVID-19 Cases/Pop) (log)")
		.attr("transform", "rotate(-90)")
}

Promise.all([
    d3.json("data/country-age-gender-population.json"),
    d3.json("data/jsonContentCountryCode.json"),
]).then(function(data) {
	let popData = data[0]
	let countryData = data[1]
	console.log(data)
	renderChartTop15(countryData)
	renderChartTop15WithPop(popData, countryData)
}).catch(function(err) {
    // handle error here
})
