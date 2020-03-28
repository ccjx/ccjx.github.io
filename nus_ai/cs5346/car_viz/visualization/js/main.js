
var margin = { left:100, right:200, top:10, bottom:20 }; //bottom: 60
const svgWidth = 1200
const svgHeight = 400
var width = svgWidth - margin.left - margin.right,
	height = svgHeight - margin.top - margin.bottom;

let brandSvg = d3.select("#car-brands-chart")
.attr("class", "chart-container")
.append("svg")
.attr("width", svgWidth)
.attr("height", svgHeight)

brandTip = d3.tip().attr('class', 'd3-tip').html(function(d) { 
	return d.make + "<br/>" + d.number;
});

let brandSvgG = brandSvg
.append("g")
.attr("transform", "translate(" + margin.left + ", " + margin.top + ")")

let brandPerSvg = d3.select("#car-brands-percent-chart")
.attr("class", "chart-container")
.append("svg")
.attr("width", svgWidth)
.attr("height", svgHeight)

let brandPerSvgG = brandPerSvg
.append("g")
.attr("transform", "translate(" + margin.left + ", " + margin.top + ")")

let coeSvg = d3.select("#coe-chart")
.attr("class", "chart-container")
.append("svg")
.attr("width", svgWidth)
.attr("height", svgHeight)

let coeSvgG = coeSvg
.append("g")
.attr("transform", "translate(" + margin.left + ", " + margin.top + ")")


let stiSvg = d3.select("#sti-chart")
.attr("class", "chart-container")
.append("svg")
.attr("width", svgWidth)
.attr("height", svgHeight)

let stiSvgG = stiSvg
.append("g")
.attr("transform", "translate(" + margin.left + ", " + margin.top + ")")


let unemploymentSvg = d3.select("#unemployment-chart")
.attr("class", "chart-container")
.append("svg")
.attr("width", svgWidth)
.attr("height", svgHeight)

let unemploymentSvgG = unemploymentSvg
.append("g")
.attr("transform", "translate(" + margin.left + ", " + margin.top + ")")

//////////////
var brand_color = d3.scaleOrdinal(d3.schemePaired )
var coe_color = d3.scaleOrdinal(d3.schemePaired )

var brand_yAxisScale = d3.scaleLinear()
// .domain([0, Math.max(...timeseries.map(t => t.confirmed))])
.range([height, 0])
.nice()

var brand_x = d3.scaleTime()
// .domain([timeseries[0].dateDt, timeseries[timeseries.length-1].dateDt])
.range([0, width])
.nice()

var brandPercent_yAxisScale = d3.scaleLinear()
// .domain([0, Math.max(...timeseries.map(t => t.confirmed))])
.range([height, 0])
.nice()

var coe_yAxisScale = d3.scaleLinear()
// .domain([0, Math.max(...timeseries.map(t => t.confirmed))])
.range([height, 0])
.nice()

var sti_yAxisScale = d3.scaleLinear()
// .domain([0, Math.max(...timeseries.map(t => t.confirmed))])
.range([height, 0])
.nice()

var unemployment_yAxisScale = d3.scaleLinear()
// .domain([0, Math.max(...timeseries.map(t => t.confirmed))])
.range([height, 0])
.nice()
//////////////


const groupBy = (items, key) => items.reduce(
	(result, item) => ({
	  ...result,
	  [item[key]]: [
		...(result[item[key]] || []),
		item,
	  ],
	}), 
	{},
  );

function renderBrandChart(svgG, xScale, yAxisScale, series, yAxisLabel, groups){
	let makeg = svgG
	let g = makeg.append("g")
	// Add the line

	area = d3.area()
    .x(d => xScale(d.data.dateDt))
    .y0(d => yAxisScale(d[0]))
    .y1(d => yAxisScale(d[1]))
	
    g.selectAll("path")
      .data(series)
	  .join("path")
    //   .attr("fill", d => brand_color(make))
    //   .attr("stroke", d => brand_color(make))
      .attr("fill", ({key}) => brand_color(key))
	  .attr("stroke-width", 1.5)
	  .attr("d", area)
	  .append("title")
		.text(({key}) => key);
    //   .attr("d", d3.line()
    //     .x(function(d) { return xScale(d.dateDt) })
    //     .y(function(d) { return yAxisScale(d.number) })
	// 	)
	
	//axes
	var xAxisCall = d3.axisBottom(xScale);
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
		// .text("Date")
	g.append("text")
		.attr("class", "y axis-label")
		.attr("x", -height/2)
		.attr("y", -60)
		.attr("font-size", "20px")
		.attr("text-anchor", "middle")
		.text(yAxisLabel)
		.attr("transform", "rotate(-90)")


	let legend = g.append("g")
	.attr("transform", "translate(" + (width + 150 ) + "," + (height - 300) + ")");
	
	groups.forEach((group, i) => {
		var legendRow = legend.append("g")
			.attr("transform", "translate(0, " + (i*20) + ")");
		
		legendRow.append("rect")
			.attr("width", 10)
			.attr("height", 10)
			.attr("stroke-width", 1)
			.attr("stroke", "#000000")
			.attr("fill", brand_color(group))
	
		legendRow.append("text")
			.attr("x", -10)
			.attr("y", 10)
			.attr("text-anchor", "end")
			.style("text-transform", "capitalize")
			.text(group)
	});
	

}

function renderCoeChart(svgG, xScale, yAxisScale, flatCoe, yAxisLabel){
	let makeg = svgG
	let g = makeg.append("g")

	let categories = ['Category A', 'Category B', 'Category C', 'Category E']
	for(let category of categories){
		g.append("path")
		  .datum(flatCoe.filter(c => c.vehicleClass == category))
		  .attr("fill", "none")
		  .attr("stroke", d => coe_color(category))
		  .attr("stroke-width", 1.5)
		  .attr("d", d3.line()
			.x(function(d) { return xScale(d.dateDt) })
			.y(function(d) { return yAxisScale(d.premium) })
			)
	}

	//axes
	var xAxisCall = d3.axisBottom(xScale);
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
		// .text("Date")
	g.append("text")
		.attr("class", "y axis-label")
		.attr("x", -height/2)
		.attr("y", -60)
		.attr("font-size", "20px")
		.attr("text-anchor", "middle")
		.text(yAxisLabel)
		.attr("transform", "rotate(-90)")

		
	let legend = g.append("g")
	.attr("transform", "translate(" + (width + 150 ) + "," + (height - 300) + ")");
	
	categories.forEach((category, i) => {
		var legendRow = legend.append("g")
			.attr("transform", "translate(0, " + (i*20) + ")");
		
		legendRow.append("rect")
			.attr("width", 10)
			.attr("height", 10)
			.attr("stroke-width", 1)
			.attr("stroke", "#000000")
			.attr("fill", coe_color(category))
	
		legendRow.append("text")
			.attr("x", -10)
			.attr("y", 10)
			.attr("text-anchor", "end")
			.style("text-transform", "capitalize")
			.text(category)
	});
}

function renderSTIChart(svgG, xScale, yAxisScale, flatSTI, yAxisLabel){
	let makeg = svgG
	let g = makeg.append("g")

	g.append("path")
		  .datum(flatSTI)
		  .attr("fill", "none")
		  .attr("stroke", d => coe_color("STI"))
		  .attr("stroke-width", 1.5)
		  .attr("d", d3.line()
			.x(function(d) { 
				console.log(xScale(d.dateDt) , yAxisScale(d.Close) )
				return xScale(d.dateDt) 
			})
			.y(function(d) { 
				return yAxisScale(d.Close) 
			})
			)


	//axes
	var xAxisCall = d3.axisBottom(xScale);
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
		// .text("Date")
	g.append("text")
		.attr("class", "y axis-label")
		.attr("x", -height/2)
		.attr("y", -60)
		.attr("font-size", "20px")
		.attr("text-anchor", "middle")
		.text(yAxisLabel)
		.attr("transform", "rotate(-90)")
}

function renderUnemploymentChart(svgG, xScale, yAxisScale, flatSTI, yAxisLabel){
	let makeg = svgG
	let g = makeg.append("g")

	g.append("path")
		  .datum(flatSTI)
		  .attr("fill", "none")
		  .attr("stroke", d => coe_color("STI"))
		  .attr("stroke-width", 1.5)
		  .attr("d", d3.line()
			.x(function(d) { 
				console.log(xScale(d.dateDt) , yAxisScale(d.unemploymentRate) )
				return xScale(d.dateDt) 
			})
			.y(function(d) { 
				return yAxisScale(d.unemploymentRate) 
			})
			)


	//axes
	var xAxisCall = d3.axisBottom(xScale);
	g.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0, " + height + ")")
		.call(xAxisCall)
		// .selectAll("text")
		//     .attr("transform", "rotate(-40)")
	var yAxisCall = d3
	.axisLeft(yAxisScale)
	.tickValues(null)
	.tickFormat(d3.format(".2%"));
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
		// .text("Date")
	g.append("text")
		.attr("class", "y axis-label")
		.attr("x", -height/2)
		.attr("y", -60)
		.attr("font-size", "20px")
		.attr("text-anchor", "middle")
		.text(yAxisLabel)
		.attr("transform", "rotate(-90)")
}

function prepareData(newCarsProcessed){
	let dateRange = newCarsProcessed.map(nc => new Date(nc.dateDt))
	brand_x.domain([Math.min(...dateRange), Math.max(...dateRange)])

	let flatNewCars = []
	
	for (let newcar of newCarsProcessed){
		for(let brand of newcar.makes){
			flatNewCars.push({
				year: newcar.year,
				dateDt: new Date(newcar.dateDt),
				make: brand.make,
				number: brand.number,
			})
		}
	}

	let makeGroups = groupBy(flatNewCars, "make")
	for(let group in makeGroups){
		makeGroups[group] = {
			make: group,
			number: makeGroups[group].reduce((a,b) => a + b.number, 0)
		}
	}
	makeGroups = Object.values(makeGroups)
	makeGroups.sort((a,b) => (a.number > b.number) ? -1 : 1)
	makeGroups = makeGroups.slice(0, 12).map(g => g.make)

	let filteredCars = flatNewCars.filter(fc => makeGroups.includes(fc.make))
	let groupedByDates = groupBy(filteredCars, "dateDt")
	for(let group in groupedByDates){
		let currentGroup = groupedByDates[group]
		let mergedGroup = {}
		for(let currG of currentGroup){
			mergedGroup.year = currG.year
			mergedGroup.dateDt = currG.dateDt
			mergedGroup[currG.make] = currG.number
		}

		groupedByDates[group] = mergedGroup
	}
	groupedByDates = Object.values(groupedByDates)
	series = d3.stack().keys(makeGroups)(groupedByDates)

	brand_yAxisScale.domain([0, 180000])
	
	let percentGroupedByDates = [...groupedByDates]
	percentGroupedByDates = percentGroupedByDates.map(p => Object.assign({}, p))
	
	for(let group of percentGroupedByDates){
		let sum = 0
		for(let make of makeGroups){
			sum += group[make]
		}

		for(let make of makeGroups){
			group[make] = group[make] / sum
		}
	}
	brandPercent_yAxisScale.domain([0, 1])
	seriesGroupedByDates = d3.stack().keys(makeGroups)(percentGroupedByDates)

	return {flatNewCars, makeGroups, series, seriesGroupedByDates}
}

function prepareCoeData(coeData){
	let flatCoe = []
	for (let coeMonth of coeData){
		for(let vehicleClass of coeMonth.vehicleClasses){ //vehicleClasses
			flatCoe.push({
				month: coeMonth.month,
				dateDt: new Date(coeMonth.dateDt),
				vehicleClass: vehicleClass.vehicleClass,
				premium: vehicleClass.premium,
			})
		}
	}
	coe_yAxisScale.domain([0, 100000])
	return flatCoe.filter(f => f.vehicleClass != "Category D")
}

Promise.all([
    d3.json("data/coeResults.json"),
    // d3.json("data/monthlyCarTypes.json"),
    d3.json("data/newCarsProcessed.json"),
    d3.json("data/residentLongTermRate.json"),
    d3.json("data/sti.json"),
]).then(function(data) {
	let coeResults = data[0]
	// let monthlyCarTypes = data[1]
	let newCarsProcessed = data[1]
	let residentLongTermRate = data[2]
	let sti = data[3]

	returnTuple = prepareData(newCarsProcessed)
	newCarsProcessed = returnTuple.flatNewCars
	groups = returnTuple.makeGroups
	series = returnTuple.series
	seriesGroupedByDates = returnTuple.seriesGroupedByDates

	groups.reverse()
	renderBrandChart(brandSvgG, brand_x, brand_yAxisScale, series, "Cars Sold", groups)
	renderBrandChart(brandPerSvgG, brand_x, brandPercent_yAxisScale, seriesGroupedByDates, "Car Sold (%)", groups)

	flatCoeReturns = prepareCoeData(coeResults)
	flatCoeReturns = flatCoeReturns.map(fc => {
		return {
			...fc,
			dateDt: new Date(fc.dateDt)
		}
	}).filter(fc => fc.dateDt > brand_x.domain()[0] && fc.dateDt < brand_x.domain()[1])
	//filter(fc => fc.dateDt < brand_x.domain()[1])
	renderCoeChart(coeSvgG, brand_x, coe_yAxisScale, flatCoeReturns, "COE Price ($)")

	sti_yAxisScale.domain([1400, 4000])
	sti = sti.map(s => {
		return {
			...s,
			dateDt: new Date(s.dateDt)
		}
	}).filter(s => s.dateDt > brand_x.domain()[0] && s.dateDt < brand_x.domain()[1])
	renderSTIChart(stiSvgG, brand_x, sti_yAxisScale, sti, "Straits Times Index ($)")

	unemployment_yAxisScale.domain([0.004, 0.01])
	residentLongTermRate = residentLongTermRate.map(s => {
		return {
			...s,
			dateDt: new Date(s.dateDt)
		}
	}).filter(s => s.dateDt > brand_x.domain()[0] && s.dateDt < brand_x.domain()[1])
	renderUnemploymentChart(unemploymentSvgG, brand_x, unemployment_yAxisScale, residentLongTermRate, "Singapore Resident Unemployment (%)")
	
}).catch(function(err) {
    console.error(err)
})
