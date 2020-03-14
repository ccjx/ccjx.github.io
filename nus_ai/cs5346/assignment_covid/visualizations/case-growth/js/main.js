function update(data){
	console.log(data)
	timeseries = data.timeseries

	tip = d3.tip().attr('class', 'd3-tip').html(function(d) { 
		const dt = new Date(d.dateDt)
		const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(dt)
		const mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(dt)
		const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(dt)

		return `${da}-${mo}-${ye}: ${d.confirmed} Confirmed case(s)`
	});

	tipD = d3.tip().attr('class', 'd3-tip').html(function(d) { 
		const dt = new Date(d.dateDt)
		const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(dt)
		const mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(dt)
		const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(dt)

		return `${da}-${mo}-${ye}: ${d.recovered} recovered, ${d.deaths} death(s)`
	});

	var margin = { left:100, right:20, top:10, bottom:60 };
	const svgWidth = 1200
	const svgHeight = 600
	var width = svgWidth - margin.left - margin.right,
		height = svgHeight - margin.top - margin.bottom;

	d3.select("#chart svg").remove()

	let svg = d3.select("#chart")
	.attr("class", "chart-container")
	.append("svg")
	.attr("width", svgWidth)
	.attr("height", svgHeight)
	.call(tip)
	.call(tipD)

	let g = svg.append("g")
			.attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
			
	// console.log(data)
	// let x = d3.scaleLog() 
	// .range([0, width])
	// .domain([140, 150000])
	var y = d3.scaleLinear()
	.domain([0, Math.max(...timeseries.map(t => t.confirmed))])
	.range([0, height])
	.nice()
	var yAxisScale = d3.scaleLinear()
	.domain([0, Math.max(...timeseries.map(t => t.confirmed))])
	.range([height, 0])
	.nice()

	console.log(timeseries)

	var x = d3.scaleTime()
		.domain([timeseries[0].dateDt, timeseries[timeseries.length-1].dateDt])
		.range([0, width])
		.nice()
	
	let circles = g.selectAll("circle")
		.data(timeseries)
		.enter()
		.append("circle")
		.attr("fill", "#c21e56")
		.attr("cy", d => {
			console.log(d, "circle")
			return yAxisScale(d.confirmed)
		})
		.attr("cx", d => x(d.dateDt))
		.attr("r", 5)
		.on('mouseover', tip.show)
		.on('mouseout', tip.hide)
	// .attr("stroke-width", 1)
	// .attr("stroke", "black")

	// Add the line
    g.append("path")
      .datum(timeseries)
      .attr("fill", "none")
      .attr("stroke", "#c21e56")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return x(d.dateDt) })
        .y(function(d) { return yAxisScale(d.confirmed) })
		)
		
	// .scaleBand()
	// 	.domain(sortedCountryData.map(d=>d.country))
	// 	.range([0, width])
	// 	.paddingInner(0.3)
	// 	.paddingOuter(0.3)
	let legend = g.append("g")
		.attr("transform", "translate(" + (width + 10 ) + "," + (height - 120) + ")");
		
	
		var legendRow = legend.append("g")
			.attr("transform", "translate(0, " + (0) + ")");
			legendRow.append("circle")
				.attr("cx", 5)
				.attr("cy", 5)
				.attr("r", 5)
				.attr("fill", "#c21e56")
			legendRow.append("text")
				.attr("x", -10)
				.attr("y", 10)
				.attr("text-anchor", "end")
				.style("text-transform", "capitalize")
				.text("Cases")

		var legendRow = legend.append("g")
			.attr("transform", "translate(0, " + (20) + ")");
			legendRow.append("rect")
				.attr("width", 10)
				.attr("height", 10)
				.attr("fill", "#b0c4de")
			legendRow.append("text")
				.attr("x", -10)
				.attr("y", 10)
				.attr("text-anchor", "end")
				.style("text-transform", "capitalize")
				.text("Recoveries")

		var legendRow = legend.append("g")
			.attr("transform", "translate(0, " + (40) + ")");
			legendRow.append("rect")
				.attr("width", 10)
				.attr("height", 10)
				.attr("fill", "black")
			legendRow.append("text")
				.attr("x", -10)
				.attr("y", 10)
				.attr("text-anchor", "end")
				.style("text-transform", "capitalize")
				.text("Deaths")
	

	
	bars
	var bars = g.selectAll("g.bars")
		.data(timeseries)
	
	let barsg = bars.enter()
		.append("g")
		.on('mouseover', tipD.show)
		.on('mouseout', tipD.hide)
	
	barsg.append("rect")
			.attr("fill", "#b0c4de")
			.attr("x", d => x(d.dateDt)-5)
			.attr("y", d => height - y(d.recovered) - y(d.deaths))
			.attr("width", 10)
			.attr("height", (d, i) => {
				return y(d.recovered)
			})
		
	barsg.append("rect")
			.attr("fill", "black")
			.attr("x", d => x(d.dateDt)-5)
			.attr("y", d => height - y(d.deaths))
			.attr("width", 10)
			.attr("height", (d, i) => {
				return y(d.deaths)
			})
	
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
	.tickValues(null);
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
		.text("Date")
	g.append("text")
		.attr("class", "y axis-label")
		.attr("x", -height/2)
		.attr("y", -60)
		.attr("font-size", "20px")
		.attr("text-anchor", "middle")
		.text("Cases")
		.attr("transform", "rotate(-90)")
}

function renderChart(timeSeries){
	console.log(timeSeries)

	var selectTag = d3
	.select("#countries")
	.on("change", (e) => {
		update(timeSeries[d3.select("#countries").node().value])
	});
	let countries = Object.keys(timeSeries)
	countries.sort()
	var options = selectTag.selectAll('option')
      .data(countries);

    //d3 sees we have less elements (0) than the data (2), so we are tasked to create
    //these missing inside the `options.enter` pseudo selection.
    //if we had some elements from before, they would be reused, and we could access their
    //selection with just `options`
    options.enter()
      .append('option')
      .attr('value', function(d) {
        return d;
      })
      .attr('value', function(d) {
        return d;
	  })  
	  .property("selected", function(d){ return d === "Singapore"; })
      .text(function(d) {
        return d;
	  })
	  

	  update(timeSeries[d3.select("#countries").node().value])
}

Promise.all([
    d3.json("data/time-series-data.json"),
]).then(function(data) {
	let timeSeries = data[0]
	renderChart(timeSeries)
    // files[0] will contain file1.csv
    // files[1] will contain file2.csv
}).catch(function(err) {
    // handle error here
})