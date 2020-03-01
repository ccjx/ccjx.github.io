var margin = { left:100, right:20, top:10, bottom:100 };
const svgWidth = 1000
const svgHeight = 600
var width = svgWidth - margin.left - margin.right,
    height = svgHeight - margin.top - margin.bottom;

let svg = d3.select("#chart-area")
.append("svg")
.attr("width", svgWidth)
.attr("height", svgHeight)

var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

let g = svg.append("g")
		.attr("transform", "translate(" + margin.left + ", " + margin.top + ")")


let x = d3.scaleLog() 
	.range([0, width]);
let y = d3.scaleLinear()
	.range([height, 0]);
let circleSize = d3.scaleLinear()
	.range([30, 5000]);
	
var circleColor = d3.scaleOrdinal(d3.schemeSet2);

let xAxisG = g.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0, " + height + ")")
let yAxisG = g.append("g")
	.attr("class", "y axis")

g.append("text")
	.attr("class", "x axis-label")
	.attr("x", width/2)
	.attr("y", height + 50)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("Income per Capita (USD)")
g.append("text")
	.attr("class", "y axis-label")
	.attr("x", -height/2)
	.attr("y", -60)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("Life Expectancy (years)")
	.attr("transform", "rotate(-90)")

let yearText = g.append("text")
	.attr("class", "year-label")
	.attr("x", width)
	.attr("y", height - 10)
	// .attr("height", 100)
	.attr("font-size", "80")
	.attr("text-anchor", "end")
	.text("1800")

let continents = ["Europe", "Asia", "North America", "Oceania", "South America", "Africa"].sort()

let legend = g.append("g")
	.attr("transform", "translate(" + (width - 10) + "," + (height - 195) + ")");
	
continents.forEach((continent, i) => {
	var legendRow = legend.append("g")
		.attr("transform", "translate(0, " + (i*20) + ")");
	
	legendRow.append("rect")
		.attr("width", 10)
		.attr("height", 10)
		.attr("stroke-width", 1)
		.attr("stroke", "#000000")
		.attr("fill", circleColor(continent))

	legendRow.append("text")
		.attr("x", -10)
		.attr("y", 10)
		.attr("text-anchor", "end")
		.style("text-transform", "capitalize")
		.text(continent)
});


let currentYear = null;
let direction = 1;
let playpause = 1;
let domains = {}


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
	currentYear = parseInt(currentYear) - 3
	validateYear()
	currentYear = currentYear.toString()
})
d3.select("#left-button")
.on("click", () => {
	currentYear = parseInt(currentYear) - 1
	validateYear()
	currentYear = currentYear.toString()
})
d3.select("#right-jump-button")
	.on("click", () => {
		currentYear = parseInt(currentYear) + 3
		validateYear()
		currentYear = currentYear.toString()
	})
d3.select("#right-button")
	.on("click", () => {
		currentYear = parseInt(currentYear) + 1
		validateYear()
		currentYear = currentYear.toString()
	})
//end

function validateYear(){
	if(currentYear > 2018) {
		currentYear = 1800
	}
	else if(currentYear < 1800) {
		currentYear = 2018
	}
}
	
function progress(){
	currentYear = parseInt(currentYear) + direction * playpause
	validateYear()
	currentYear = currentYear.toString()
}
d3.json("data/data.json")
.then(function(data){
	data = data.filter(d => {
		d.countries = d.countries.filter(c => c.income != null && c.lifeExp != null && c.population != null)
		return d
	})

	// console.log(data);
	
	currentYear = data[0].year.toString();

	d3.interval(function(){
		progress()
		update(data, currentYear)
	}, 500)

    update(data, currentYear);
    
})

function formatNumber (labelValue) {
    // Nine Zeroes for Billions
    return Math.abs(Number(labelValue)) >= 1.0e+9

    ? Math.round(Math.abs(Number(labelValue)) / 1.0e+9) + "B"
    // Six Zeroes for Millions 
    : Math.abs(Number(labelValue)) >= 1.0e+6

    ? Math.round(Math.abs(Number(labelValue)) / 1.0e+6) + "M"
    // Three Zeroes for Thousands
    : Math.abs(Number(labelValue)) >= 1.0e+3

    ? Math.round(Math.abs(Number(labelValue)) / 1.0e+3) + "K"

    : Math.abs(Number(labelValue));
}

function update(allData, currentYear){
	selectedYear = allData.filter(d => d.year == currentYear)[0];
	data = selectedYear.countries
	data.sort((a,b) => b.population - a.population)
	
	x.domain([140, 150000])
	y.domain([0, 90])
	circleSize.domain([0, 1.4E9])

	// console.log(data);

	//axes
	var xAxisCall = d3
		.axisBottom(x)
		.tickValues([140, 400, 4000, 40000])
		.tickFormat(d3.format(",.0f"));

	xAxisG.call(xAxisCall)
		// .selectAll("text")
		//     .attr("transform", "rotate(-40)")
		
	var yAxisCall = d3.axisLeft(y);
	yAxisG.call(yAxisCall)
		

	//circles
	let circles = g.selectAll("circle")
		.data(data, function(d){	
			return d.country
		})

	circles.exit()
		.attr("fill", "red")
		.transition()
			.duration(100)
			.attr("opacity", 0)
			.remove()

	circles.enter()
		.append("circle")
			.attr("fill", d => circleColor(d.continent))
			.attr("cy", d => y(d.lifeExp))
			.attr("cx", d => x(d.income))
			.attr("r", d => Math.sqrt(circleSize(d.population)/ Math.PI))
			.attr("z-index", d => d.population)
			.attr("stroke-width", 1)
			.attr("stroke", "black")
			.on("mouseover", function(d) {		
				div.transition()		
					.duration(200)		
					.style("opacity", .9);		
				div.html("<strong>" + d.country + "</strong><br>" + 
				"Population: " + formatNumber(d.population) + "<br>" +
				"Income: " + formatNumber(d.income) + "<br>" +
				"Life Expectancy: " + d.lifeExp + " years")
					.style("left", (d3.event.pageX) + "px")		
					.style("top", (d3.event.pageY - 28) + "px");	
				})					
			.on("mouseout", function(d) {		
				div.transition()		
					.duration(1500)	
					.style("opacity", 0);	
			})
			.merge(circles)
			.transition()
				.duration(500)	
				.attr("cy", d => {
					return y(d.lifeExp)
				})
				.attr("cx", d => x(d.income))
				.attr("r", d => Math.sqrt(circleSize(d.population)/ Math.PI))
				.attr("z-index", d => d.population)
	
	yearText.text(currentYear)
}

function info(){
	return "Done by Clarence Cai."
}