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
	data = countryData["2020-03-31"]
	// console.log(data)
	tip = d3.tip().attr('class', 'd3-tip').html(function(d) { 
		return d.Country + "<br>" + d.NewConfirmed + " new daily confirmed case(s)"
	});
	let sortedCountryData = data.slice().sort(function (a, b) {
		return b.NewConfirmed-a.NewConfirmed;
	});
	sortedCountryData = sortedCountryData.slice(0, 20)
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
	.domain([0, sortedCountryData[0].NewConfirmed])
	.range([0, height]);
	var yAxisScale = d3.scaleSymlog()
	.domain([0, sortedCountryData[0].NewConfirmed])
	.range([height, 0]);

	var x = d3.scaleBand()
		.domain(sortedCountryData.map(d=>d.Country))
		.range([0, width])
		.paddingInner(0.3)
		.paddingOuter(0.3)
		

	//bars
	var bars = g.selectAll("rect")
		.data(sortedCountryData)
	
	bars.enter()
		.append("rect")
		.attr("x", (d, i) => {
			return x(d.Country)
		})
		.attr("y", d=> {
			// console.log(d.confirmed); 
			return height - y(d.NewConfirmed)
		})
		.attr("fill", d => barColor(d.Country))
		.attr("width", x.bandwidth)
		.attr("height", (d, i) => {
			return y(d.NewConfirmed)
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


Promise.all([
    // d3.json("data/country-age-gender-population.json"),
    // d3.json("data/jsonContentCountryCode.json"),
    d3.csv("data/DATASET-1.csv"),
]).then(function(data) {
	// let popData = data[0]
	// let countryData = data[1]
	fdata = data[0].filter(d => {
		return Date.parse(d.Date) >= Date.parse("2020-02-29") && Date.parse(d.Date) <= Date.parse("2020-03-31")
	})

	
	
	let arrDate = {}

	let prefix = "2020-03"

	for(let d of fdata){
		// if(d.Date != "2020-02-29"){
			arrDate[d.Date] = []
		// }		
	}

	for(let d of fdata){
		// if(d.Date != "2020-02-29"){
			arrDate[d.Date].push(d)
		// }
	}
	lastd = null
	for(let d in arrDate){
		if(lastd != null){
			for(let country of arrDate[d]){
				country.NewConfirmed = Number(country.Confirmed) - Number((lastd.filter(c => c.Country == country.Country)[0]).Confirmed)
			}
		}
		lastd = arrDate[d]
	}



	renderChartTop15(arrDate)
	//renderChartTop15WithPop(popData, countryData)
}).catch(function(err) {
    // handle error here
})
