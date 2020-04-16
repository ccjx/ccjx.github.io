// var margin = { left:100, right:20, top:10, bottom:100 };
const svgWidth = 1000
const svgHeight = 600
// var width = svgWidth - margin.left - margin.right,
//     height = svgHeight - margin.top - margin.bottom;
circleSize = d3
  .scaleThreshold()
  .domain([1, 10, 100, 1000, 10000])
  .range([0, 5, 10, 12, 15, 20])

d3.csv("data/DATASET-2.csv")
.then((data) => {
	console.log(data)
	

	format = d3.format(",d")
	width = 1200
	height = 550
	
	let svg = d3.select("#chart")
	.attr("class", "chart-container")
	.append("svg")
	.attr("width", width)
	.attr("height", height)
    
    var projection = d3.geoMercator();
    projection
	  .scale(150)
	  .translate([500, 350])
	  
    var path = d3.geoPath().projection(projection);
      
    var url = "data/world-50m.json"; //https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-50m.json
    
	d3.json(url)
	.then((world) => {
	
		tip = d3.tip().attr('class', 'd3-tip').html(function(d) { 
			// let findCountry = data.filter(country => country.countryCode === d.id)
			// if(findCountry.length > 0 && findCountry[0].confirmed > 0){
			// 	return findCountry[0].country + "<br>" + findCountry[0].confirmed + " confirmed case(s)"
			// }
			// else{
			// 	return "[No Data]"
			// }
			let fullname = d["Province/State"] + (d["Province/State"] != "" ? ", " : "") + d["Country/Region"]
			return fullname + "<br>" + d["4/10/20"] + " confirmed case(s)"
		});

		let mapg = svg
		.append("g")
		.call(tip)

		var land = topojson.feature(world, world.objects.land),
		borders = topojson.feature(world, world.objects.countries)

		// console.log(borders)

		mapg
		.append("g")
		.selectAll("path")
		.data(borders.features)
		.join("path")
		.attr("d", path)
		.attr("fill", d => {
			// let findCountry = data.filter(country => country.countryCode === d.id)
			// if(findCountry.length > 0 && findCountry[0].confirmed > 0){
			// 	return "#ff6961"
			// }
			// else {
				return "#ffffff"
			// }
		})
		.attr("stroke", "#000000")

		// data = data.filter(d => d.geolocation)
		svg.append("g")
		.selectAll("circle")
		.data(data)
		.join("circle")
		.attr("cx", function (d) { console.log(projection([Number(d.Lat), Number(d.Long)])); return projection([Number(d.Long), Number(d.Lat)])[0]; })
		.attr("cy", function (d) { return projection([Number(d.Long), Number(d.Lat)])[1]; })
		.attr("r", d => circleSize(d["4/10/20"]))
		.attr("fill", "red")
		.attr("stroke", "#000000")
		.attr("opacity", 0.7)
		.on('mouseover', tip.show)
		.on('mouseout', tip.hide)
	
	let legend = mapg.append("g")
	.attr("transform", "translate(" + (width - 100) + "," + (height - 300) + ")");
	
	circleSize.domain().forEach((domain, i) => {
		var legendRow = legend.append("g")
			.attr("transform", "translate(0, " + (i*55) + ")");
		
		legendRow.append("circle")
			.attr("cx", 30)
			.attr("cy", 5)
			.attr("r", circleSize(domain))
			.attr("fill", "red")
			.attr("stroke", "#000000")
			.attr("stroke-width", 1)

		legendRow.append("text")
			.attr("x", -10)
			.attr("y", 10)
			.attr("text-anchor", "end")
			.style("text-transform", "capitalize")
			.text(domain)
	})

	})
	.catch((error) => {
		if (error) throw error;
	});

})

