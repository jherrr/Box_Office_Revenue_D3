// # Place all the behaviors and hooks related to the matching controller here.
// # All this logic will automatically be available in application.js.
// # You can use CoffeeScript in this file: http://coffeescript.org/
$.ajax({
    type: "GET",
    dataType: "json",
    url: "api/v1/box_office/movie",
    success: function (data) {
        debugger;
        var table = data["2010"];
        var input = [];

        Object.keys(table).forEach( function( key ) {
            row = table[key]
            input.push({date: row["Date"], week: row["Week #"], revenue: row["Weekly Gross"]});
        });
        draw(input);
    }
 });

function draw(data) {
    debugger;

    var margin = {top: 20, right: 20, bottom: 70, left: 40},
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

    var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.05);

    var y = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        //  .tickFormat(d3.time.format("%Y-%m"));

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10);

    var svg = d3.select("#graph").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    x.domain(data.map(function(datum) { return datum.date; }));
    y.domain([0, d3.max(data, function(datum) {
                return formatRevenue(datum.revenue);
            }) ]);

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
        .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", "-.55em")
          .attr("transform", "rotate(-90)" );

      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Value ($)");

      svg.selectAll("bar")
          .data(data)
        .enter().append("rect")
          .style("fill", "steelblue")
          .attr("x", function(d) { return x(d.date); })
          .attr("width", x.rangeBand())
          .attr("y", function(d) { return y(formatRevenue(d.revenue)); })
          .attr("height", function(d) {
              debugger;
              return height - y(formatRevenue(d.revenue)); });

}

var formatRevenue = function (str) {
    return parseInt(str.replace(/,/g, "").replace("$", ""));
}
