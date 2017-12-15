
// Cause Visual Data  
var causeDataSet = [];


// Cause Data Visual
function causeVisual(){

	// Append Sub-Heading
	$('#visualHeading').text('Percent Distribution by Cause of Death');
    $('#guessForm').css("display","none");
    $('#myModal').modal('show');
    
    $('#modalHeaderText').text('How to interact with this visual and reveal more data:');
    $("#interactionInstructions").append('<p id="text1">The data displayed represents a distribution of the total number of deaths from 1999 - 2015 for all of the United States by cause. There is a lot of valuable knowledge to be gained viewing the data at high level and even more learnings at a granual level. Year and state have a casual effect. </p>');
    $("#interactionInstructions").append('<p id="text2"><span style="text-transform: uppercase; font-weight: bold; font-size: 20px">Click</span> on a cause and guess the approximate percentage it accounts for within the total distribution.</p>');
    $("#interactionInstructions").append('<p id="text3">If you guess within a 5.0% margin of the true distribution, the distribution of deaths of the selected cause will be displayed by year and state.</p>');


	// create Grandtotal of deaths for % distribution
	var grandTotal = 0;
	for (var keys in causeData) {
		if(keys != 'All Causes'){
			grandTotal += causeData[keys];
		}
	}

	//Reformat Data for tree structure
	for(keys in causeData){
		var child = {
			'cause': keys,
			'percent': Math.round(((causeData[keys]/grandTotal)*100)),
			'total': causeData[keys]
		}
	  	if(child.cause != 'All Causes'){
			causeDataSet.push(child);
		}
	}

	// Create Tree Structure
	var tree = {
	    cause: "tree",
	    children: causeDataSet
	};

	// Set Overall Visual size
	var width = 960,
	    height = 500,
	    color = d3.scale.category20c(),
	    div = d3.select("body")
	    		.append("div")
	    		.attr("id", "causeVisual")
	       		.style("position", "relative");


	// Extract data
	var treemap = d3.layout
		.treemap()
	    .size([width, height])
	    .sticky(true)
	    .value(function(d) { return d.total; });


    var colors = ['#9CABB4', '#2D3234', '#B4B4B4', '#343434', '#707B81', '#0A1934', '#173773', '#C5C6C2', '#464645', '#929390', '#6F7376', '#F37A4D', '#C0603D', '#735347', '#0D10A6', '#A2C8F3', '#475873', '#96B9F3', '#202734']
	// Define individual node
	var node = div.datum(tree)
			.selectAll(".node")
	      	.data(treemap.nodes)
	    	.enter()
	    	.append("div")
	      	.attr("class", "node")
	      	.attr("id", function(d) { return d.cause; })
		    .style("background-color", function(d, i){
		    	return colors[i];
		    })
	      	.call(position)
	      	.append('div')
	      	.style("font-size", function(d) {
	          // compute font size based on sqrt(area)
	          return Math.max(6, 0.14*Math.sqrt(d.area))+'px'; })
	      	.text(function(d) { return d.children ? null : d.cause; })
	      	.style("text-align", "center");

	return causeDataSet;
}
	
	// var colorcount = 0;
// To set position and area of boxes based on distribution for Cause Data Visual
function position() {

  this.style("left", function(d) { return d.x + "px"; })
      .style("top", function(d) { return d.y + "px"; })
      .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
      .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
}

// Add event listeners to each cause in data set
function addCauseEventListeners() {
	var causes = $('.node');
	for(var i =0; i < causes.length; i++){
		causes[i].addEventListener('click', function(){
			var cause = this.id;
			$('#myModal').modal('show');
			$('#modalHeaderText').text('Take a guess to see more data')
			$('#text1').text('What percent of total deaths do you think ' + cause + ' account for?')	
			$('#text2').css('display','none');
			$('#text3').css('display','none');
			$('#guessForm').css('display','block');
			
			submitGuess(cause);
	})
	}
}

// Submit guess
function submitGuess(cause){
	$("#submit").click(function(e){
		e.preventDefault();
        var guess = $("#guess").val(); 
		evaluateGuess(guess, cause);
	})
}

// Evaluate guess for correctness
function evaluateGuess(guess, cause){

	// Retrieve correct percent distribution for selected cause
    var correctPercent = 0; 
    for(var i = 0; i< causeDataSet.length; i++){
    	if(causeDataSet[i].cause === cause){
    		correctPercent = causeDataSet[i].percent;
    	}
	}

	// Calculate Margin in guess and correct distribution
	var margin = guess - correctPercent

	// Set ToastR timeout
	toastr.options.timeOut = 2000;

	if((guess >= correctPercent-5) && (guess <= correctPercent+5)){
    	toastr.success('Success messages');
		hideModal();
		causeByStateByYear(cause);
	} else {
		if(margin > -10 && margin < 10){
			toastr.warning('Try again! Your guess is within 10%!');
		} else {
			toastr.error('Try again! Your guess was >10% off!');
		}
	}
}

// Hide Modal upon correct guess
function hideModal(){
  $(".modal").removeClass("in");
  $(".modal-backdrop").remove();
  $('body').removeClass('modal-open');
  $('body').css('padding-right', '');
  $("#myModal").remove();
}


// Create Data Distribution by State and Year for selected Cause
function causeByStateByYear(cause) {

	// Retrieve Data set based on cause clicked
	var data = stateCauseData(cause);

	// Hide Previous Data Visual
	$('#causeVisual').css("display","none");
	$('#visualHeading').text('Cause of Death: ' + cause);
	$('#subHeading').text("Distribution by state and year");

	// Set size of visual
	var margin = {top: 20, right: 160, bottom: 60, left: 40};
	var width = 1000 - margin.left - margin.right,
    	height = 600 - margin.top - margin.bottom;

    // Generate main SVG for visual
	var svg = d3
	  .select("body")
	  .append("svg")
	  .attr("id", "stateCauseVisual")
	  .attr("width", width + margin.left + margin.right)
	  .attr("height", height + margin.top + margin.bottom+100)
	  .append("g")
	  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


	  // Transpose the data into layers
	var dataset = d3.layout.stack()(years.map(function(year) {
  		return data.map(function(d) {
    		return {x: d.state, y: +d[year]/d.total, z: year};
 		});
	}));

	// Set x, y scale and generate colors for series
	var x = d3.scale.ordinal()
	  .domain(dataset[0].map(function(d) { return d.x; }))
	  .rangeRoundBands([0, width], .05)

	var y = d3.scale.linear()
	  .domain([0, d3.max(dataset, function(d) {  return d3.max(d, function(d) { return d.y0 + d.y; });  })])
	  .range([height, 0]);

	var colors  = randomColor({
   		count: years.length,
   		hue: 'blue'
	});

	// For percent distribution to create 100% bar chart
	var formatPercent = d3.format(".00%");

	// Define and draw axes
	var yAxis = d3.svg.axis()
	  .scale(y)
	  .orient("left")
	  .ticks(5)
	  .tickSize(-width, 0, 0)
	  .tickFormat(formatPercent);

	var xAxis = d3.svg.axis()
	  .scale(x)
	  .orient("bottom")
	  .tickSize(4, 2, 0)

	svg.append("g")
	  .attr("class", "y axis")
	  .call(yAxis);

	svg.append("g")
	  .attr("class", "x axis")
	  .attr("transform", "translate(18," + height + ")")
	  .call(xAxis)      
	  .selectAll("text")
	  .style("text-anchor", "end")
	  .attr("dx", "-.8em")
	  .attr("dy", "-1.55em")
	  .attr("transform", "rotate(-90)" );

	// Create groups for each series
	var groups = svg.selectAll("g.total")
	  .data(dataset)
	  .enter().append("g")
	  .attr("class", "total")
	  .style("fill", function(d, i) { return colors[i]; });

	 // Bar graph
	var rect = groups.selectAll("rect")
	  .data(function(d) { return d; })
	  .enter()
	  .append("rect")
	  .attr("x", function(d) { return x(d.x); })
	  .attr("y", function(d) { return y(d.y0 + d.y); })
	  .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
	  .attr("width", x.rangeBand())
	  .attr("class",  function(d) { return ("state "+ d.x)})
	  .on('click', addStateEventListeners)
	  .on("mouseover", function() { tooltip.style("display", null); })
	  .on("mouseout", function() { tooltip.style("display", "none"); })
	  .on("mousemove", function(d) {
	    var xPosition = d3.mouse(this)[0] - 15;
	    var yPosition = d3.mouse(this)[1] - 25;
	    tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
	    tooltip.select("text").html("Year: " + d.z + "  " + (d.y*100).toFixed(2)+ " %");
	  	tooltip.select("text").attr("data-html", "true")
	  });

	// Legend
	var legend = svg.selectAll(".legend")
	  .data(colors)
	  .enter()
	  .append("g")
	  .attr("class", "legend")
	  .attr("transform", function(d, i) { return "translate(30," + i * 19 + ")"; });
	 
	legend.append("rect")
	  .attr("x", width - 18)
	  .attr("width", 18)
	  .attr("height", 18)
	  .style("fill", function(d, i) {return colors.slice().reverse()[i];});
	 
	legend.append("text")
	  .attr("x", width + 5)
	  .attr("y", 9)
	  .attr("dy", ".35em")
	  .style("text-anchor", "start")
	  .text(function(d, i) { 
	  		return years[i];
	  	});

    // Format tooltip, initial display is hidden
	var tooltip = svg.append("g")
	  .attr("class", "tooltip")
	  .style("display", "none");
	    
	tooltip.append("rect")
	  .attr("width", 30)
	  .attr("height", 20)
	  .attr("fill", "white")
	  .style("opacity", 0.5);

	tooltip.append("text")
	  .attr("x",15)
	  .attr("dy", "1.2em")
	  .style("text-anchor", "middle")
	  .attr("font-size", "12px")
	  .attr("font-weight", "bold");

	addStateEventListeners();

}


// Add event listeners to each cause in data set
function addStateEventListeners(d) {

			var state = d.x;
			console.log(state);
			var test = stateYearDatabyCause(state);
			return test;
	
}
// function clickHandler(d, i) {
//     // d is the datum
//     // i is the index
//     // this is the reference to the current element
//     // d3.event is the reference to the current event
// }


function stateYearDataVisual(test){
	// var test = stateYearDatabyCause(state);
	console.log(test);
}

