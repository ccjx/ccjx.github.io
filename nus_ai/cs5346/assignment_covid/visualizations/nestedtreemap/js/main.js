// var margin = { left:100, right:20, top:10, bottom:100 };
const svgWidth = 1000
const svgHeight = 600
// var width = svgWidth - margin.left - margin.right,
//     height = svgHeight - margin.top - margin.bottom;

function processData(data){
	if(data.hasOwnProperty('confirmed')){
		data.value = data.confirmed
	}
	if(data.children){
		for(let child of data.children){
			processData(child)
		}
	}
}
function tile(node, x0, y0, x1, y1) {
	d3.treemapBinary(node, 0, 0, width, height);
	for (const child of node.children) {
		child.x0 = x0 + child.x0 / width * (x1 - x0);
		child.x1 = x0 + child.x1 / width * (x1 - x0);
		child.y0 = y0 + child.y0 / height * (y1 - y0);
		child.y1 = y0 + child.y1 / height * (y1 - y0);
	}
}

function name(d){
	return d.ancestors().reverse().map(d => d.data.name).join("/")
	
}
function uid (elem) {
	// Math.random should be unique because of its seeding algorithm.
	// Convert it to base 36 (numbers + letters), and grab the first 9 characters
	// after the decimal.
	return elem + '_' + Math.random().toString(36).substr(2, 9);
};
d3.json("data/output.json")
.then(function(data){
	processData(data)

	color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1))
	format = d3.format(",d")
	width = 1200
	height = 800
	treemap = data => d3.treemap()
		.tile(tile)
	(d3.hierarchy(data)
		.sum(d => d.value)
		.sort((a, b) => b.value - a.value))


	let svg = d3.select("#chart")
	.append("svg")
	.attr("viewBox", [0.5, -30.5, width, height + 30])
	.attr("width", width)
	.attr("height", height)
	.style("font", "10px sans-serif");

		const x = d3.scaleLinear().rangeRound([0, width]);
		const y = d3.scaleLinear().rangeRound([0, height]);
	  
	  
		let group = svg.append("g")
			.call(render, treemap(data));
	  
		function render(group, root) {
		  const node = group
			.selectAll("g")
			.data(root.children.concat(root))
			.enter().append("g");
	  
		  node.filter(d => d === root ? d.parent : d.children)
			  .attr("cursor", "pointer")
			  .on("click", d => d === root ? zoomout(root) : zoomin(d));
	  
		  node.append("title")
			  .text(d => `${name(d)}\n${format(d.value)}`);
	  
		  node.append("rect")
			  .attr("id", d => (d.leafUid = uid("leaf")).id)
			  .attr("fill", d => d === root ? "#fff" : d.children ? "#ccc" : "#ddd")
			  .attr("stroke", "#fff");
	  
		  node.append("clipPath")
			  .attr("id", d => (d.clipUid = uid("clip")).id)
			.append("use")
			  .attr("xlink:href", d => d.leafUid.href);
	  
		  node.append("text")
			  .attr("clip-path", d => d.clipUid)
			  .attr("font-weight", d => d === root ? "bold" : null)
			.selectAll("tspan")
			.data(d => (d === root ? name(d) : d.data.name).split(/\n/g).concat(format(d.value)))
			.enter().append("tspan")
			  .attr("x", 3)
			  .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
			  .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
			  .attr("font-weight", (d, i, nodes) => i === nodes.length - 1 ? "normal" : null)
			  .text(d => d);
	  
		  group.call(position, root);
		}
	  
		function position(group, root) {
		  group.selectAll("g")
			  .attr("transform", d => d === root ? `translate(0,-30)` : `translate(${x(d.x0)},${y(d.y0)})`)
			.select("rect")
			  .attr("width", d => d === root ? width : x(d.x1) - x(d.x0))
			  .attr("height", d => d === root ? 30 : y(d.y1) - y(d.y0));
		}
	  
		// When zooming in, draw the new nodes on top, and fade them in.
		function zoomin(d) {
		  const group0 = group.attr("pointer-events", "none");
		  const group1 = group = svg.append("g").call(render, d);
	  
		  x.domain([d.x0, d.x1]);
		  y.domain([d.y0, d.y1]);
	  
		  svg.transition()
			  .duration(750)
			  .call(t => group0.transition(t).remove()
				.call(position, d.parent))
			  .call(t => group1.transition(t)
				.attrTween("opacity", () => d3.interpolate(0, 1))
				.call(position, d));
		}
	  
		// When zooming out, draw the old nodes on top, and fade them out.
		function zoomout(d) {
		  const group0 = group.attr("pointer-events", "none");
		  const group1 = group = svg.insert("g", "*").call(render, d.parent);
	  
		  x.domain([d.parent.x0, d.parent.x1]);
		  y.domain([d.parent.y0, d.parent.y1]);
	  
		  svg.transition()
			  .duration(750)
			  .call(t => group0.transition(t).remove()
				.attrTween("opacity", () => d3.interpolate(1, 0))
				.call(position, d))
			  .call(t => group1.transition(t)
				.call(position, d.parent));
		}

})