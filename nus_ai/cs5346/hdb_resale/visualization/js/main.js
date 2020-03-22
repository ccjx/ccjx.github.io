width = 1200
height = 600

let svg = d3.select("#chart")
.attr("class", "chart-container")
.append("svg")
.attr("width", width)
.attr("height", height)

tip = d3.tip().attr('class', 'd3-tip').html(function(d) { 
	let selectedData = mergedPrices.towns.filter(t => t.town == d.properties.PLN_AREA_N)
	if(selectedData.length == 1) {
		return d.properties.PLN_AREA_N + "<br>" + new Intl.NumberFormat().format(Math.round(selectedData[0].meanPerSqmPrice)) + " S$/sqm"	
	}
	return d.properties.PLN_AREA_N + "<br>" + "(No HDB sale data)"
});

let mergedPrices = {}
let currentYear = 1990
let direction = 1;
let playpause = 1;

let mapg = svg
.append("g")
.call(tip)

let yearText = mapg.append("text")
.attr("class", "year-label")
.attr("x", width)
.attr("y", height - 10)
.attr("font-size", "80")
.attr("text-anchor", "end")
.text(currentYear)

let drawmap = 
	mapg.append("g")

let legendValues = [0, 0.5, 1].sort()

let legend = mapg.append("g")
	.attr("transform", "translate(" + (width - 10) + "," + (height - 195) + ")");

let legendTexts = []
	
legendValues.forEach((legendValue, i) => {
	var legendRow = legend.append("g")
		.attr("transform", "translate(0, " + (i*20) + ")");
	
	legendRow.append("rect")
		.attr("width", 10)
		.attr("height", 10)
		.attr("stroke-width", 1)
		.attr("stroke", "#000000")
		.attr("fill", d3.interpolateBlues(legendValue))

	let legendText = legendRow.append("text")
		.attr("x", -10)
		.attr("y", 10)
		.attr("text-anchor", "end")
		.style("text-transform", "capitalize")
		.text(legendValue)

	legendTexts.push(legendText)
});

function renderChart(mergedPrices, mapworld){
	let maxPrice = Math.max(...mergedPrices.towns.map(t => t.meanPerSqmPrice), 0);
	legendValues.forEach((legendValue, i) => {
		legendTexts[i].text(new Intl.NumberFormat().format(Math.round(legendValue * maxPrice)) + " S$/sqm")
	})

	var projection = d3.geoMercator()
	.fitSize([width,height],mapworld)
    var path = d3.geoPath().projection(projection);
    
	yearText.text(currentYear)

	drawmap
	.selectAll("path")
	.data(mapworld.features)
	.join("path")
	.on('mouseover', tip.show)
	.on('mouseout', tip.hide)
	.transition()
		.duration(200)
		.attr("d", path)
		.attr("fill", d => {
			
			let selectedData = mergedPrices.towns.filter(t => t.town == d.properties.PLN_AREA_N)
			if(selectedData.length != 1){
				// console.error("Unable to retrieve selectedData for data ", d.properties.PLN_AREA_N)
				return d3.interpolateBlues(0)
			}
			
			return d3.interpolateBlues(selectedData[0].meanPerSqmPrice / maxPrice)
		})
		.attr("stroke", "#000000")	
}

function prepData(consolidatedPrices){
	year = currentYear
	// console.log(consolidatedPrices)
	let selectedPrices = consolidatedPrices.filter(p => (new Date(p.monthDt)).getFullYear() == year)
	let mergedTowns = {}
	for (let month of selectedPrices){
		for(let selectedPrice of month.towns){
			if(!mergedTowns.hasOwnProperty(selectedPrice.town)){
				mergedTowns[selectedPrice.town] = {
					...selectedPrice
				}
			}
			else{
				mergedTowns[selectedPrice.town].n += selectedPrice.n
				mergedTowns[selectedPrice.town].perSqmPriceSum += selectedPrice.perSqmPriceSum
				mergedTowns[selectedPrice.town].meanPerSqmPrice = (mergedTowns[selectedPrice.town].n == 0) ? 0 : mergedTowns[selectedPrice.town].perSqmPriceSum / mergedTowns[selectedPrice.town].n
			}
		}
	}
	mergedPrices = {
		year,
		towns: Object.values(mergedTowns)
	}
}

function validateYear(){
	if(currentYear > 2019) {
		currentYear = 1990
	}
	else if(currentYear < 1990) {
		currentYear = 2019
	}
}
	
function progress(){
	currentYear = currentYear + direction * playpause
	validateYear()
}


//event handlers
d3.select("#play-button")
.on("click", () => {
	if(playpause == 1){
		//pause
		playpause = 0
		d3.select("#play-button").html("▶️");
	}
	else {
		//play
		playpause = 1
		d3.select("#play-button").html("⏸");
	}
})

d3.select("#toggle-dir-button")
.on("click", () => {
	direction = direction * -1;
})
	
d3.select("#left-jump-button")
.on("click", () => {
	currentYear = currentYear - 3
	validateYear()
	
})
d3.select("#left-button")
.on("click", () => {
	currentYear = currentYear - 1
	validateYear()
})
d3.select("#right-jump-button")
.on("click", () => {
	currentYear = currentYear + 3
	validateYear()
})
d3.select("#right-button")
.on("click", () => {
	currentYear = currentYear + 1
	validateYear()
})
//end

Promise.all([
    d3.json("data/consolidatedPrices.json"),
    d3.json("data/singapore-planning-areas-topojson.json"),
]).then(function(data) {
	let consolidatedPrices = data[0]
	let topojson = data[1]

	d3.interval(function(){
		progress()
		prepData(consolidatedPrices)
		renderChart(mergedPrices, topojson)
	}, 1000)

	prepData(consolidatedPrices)
	renderChart(mergedPrices, topojson)
}).catch(function(err) {
    console.error(err)
})
