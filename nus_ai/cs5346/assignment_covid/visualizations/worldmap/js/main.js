// var margin = { left:100, right:20, top:10, bottom:100 };
const svgWidth = 1000
const svgHeight = 600
// var width = svgWidth - margin.left - margin.right,
//     height = svgHeight - margin.top - margin.bottom;
circleSize = d3
  .scaleThreshold()
  .domain([1, 10, 100, 1000, 10000])
  .range([0, 5, 10, 15, 20, 30])

d3.json("data/jsonContentCountryCode.json")
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
			return d.country + "<br>" + d.confirmed + " confirmed case(s)"
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
			let findCountry = data.filter(country => country.countryCode === d.id)
			if(findCountry.length > 0 && findCountry[0].confirmed > 0){
				return "#ff6961"
			}
			else {
				return "#ffffff"
			}
		})
		.attr("stroke", "#000000")

		data = data.filter(d => d.geolocation)
		svg.append("g")
		.selectAll("circle")
		.data(data)
		.join("circle")
		.attr("cx", function (d) { console.log(d.geolocation); return projection(d.geolocation)[0]; })
		.attr("cy", function (d) { return projection(d.geolocation)[1]; })
		.attr("r", d => circleSize(d.confirmed))
		.attr("fill", "red")
		.attr("stroke", "#000000")
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


//Render Deaths
d3.json("data/jsonContentCountryCode.json")
.then((data) => {
	


	format = d3.format(",d")
	width = 1200
	height = 550
	
	let svg = d3.select("#chart-deaths")
	.attr("class", "chart-container")
	.append("svg")
	.attr("width", width)
	.attr("height", height)
    
    var projection = d3.geoMercator()
	.scale(150)
	.translate([500, 350])
    
    var path = d3.geoPath().projection(projection);
      
    var url = "data/world-50m.json"; //https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-50m.json
    
	d3.json(url)
	.then((world) => {
		
		tip = d3.tip().attr('class', 'd3-tip').html(function(d) { 
				return d.country + "<br>" + d.deaths + " death(s)"
		});
	
		let mapg = svg
		.append("g")
		.call(tip)

		var land = topojson.feature(world, world.objects.land),
		borders = topojson.feature(world, world.objects.countries)

		// console.log(borders)

		mapg.selectAll("path")
		.data(borders.features)
		.join("path")
		.attr("d", path)
		.attr("fill", d => {
			let findCountry = data.filter(country => country.countryCode === d.id)
			if(findCountry.length > 0 && findCountry[0].deaths > 0){
				return "#999999"
			}
			else {
				return "#ffffff"
			}
		})
		.attr("stroke", "#000000")
		
		data = data.filter(d => d.geolocation)
		svg.append("g")
		.selectAll("circle")
		.data(data)
		.join("circle")
		.attr("cx", function (d) { console.log(d.geolocation); return projection(d.geolocation)[0]; })
		.attr("cy", function (d) { return projection(d.geolocation)[1]; })
		.attr("r", d => circleSize(d.deaths))
		.attr("fill", "black")
		.attr("stroke", "#dddddd")
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
				.attr("fill", "black")
				.attr("stroke", "#dddddd")
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


//Render Deaths
d3.json("data/jsonContentCountryCode.json")
.then((data) => {
	


	format = d3.format(",d")
	width = 1200
	height = 550
	
	let svg = d3.select("#chart-cured")
	.attr("class", "chart-container")
	.append("svg")
	.attr("width", width)
	.attr("height", height)
    
    var projection = d3.geoMercator()
	.scale(150)
	.translate([500, 350])
    
    var path = d3.geoPath().projection(projection);
      
    var url = "data/world-50m.json"; //https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-50m.json
    
	d3.json(url)
	.then((world) => {
		
		tip = d3.tip().attr('class', 'd3-tip').html(function(d) { 
			return d.country + "<br>" + d.recovered + " case(s) healed"
		});
	
		let mapg = svg
		.append("g")
		.call(tip)

		var land = topojson.feature(world, world.objects.land),
		borders = topojson.feature(world, world.objects.countries)

		// console.log(borders)

		mapg.selectAll("path")
		.data(borders.features)
		.join("path")
		.attr("d", path)
		.attr("fill", d => {
			let findCountry = data.filter(country => country.countryCode === d.id)
			if(findCountry.length > 0 && findCountry[0].recovered > 0){
				return "#c8ddee"
			}
			else {
				return "#ffffff"
			}
		})
		.attr("stroke", "#000000")
		
		data = data.filter(d => d.geolocation)
		svg.append("g")
		.selectAll("circle")
		.data(data)
		.join("circle")
		.attr("cx", function (d) { console.log(d.geolocation); return projection(d.geolocation)[0]; })
		.attr("cy", function (d) { return projection(d.geolocation)[1]; })
		.attr("r", d => circleSize(d.recovered))
		.attr("fill", "#00008b")
		.attr("stroke", "#dddddd")
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
				.attr("fill", "#00008b")
				.attr("stroke", "#dddddd")
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