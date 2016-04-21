(function () {
    if (typeof BoxOffice === "undefined") {
        window.BoxOffice = {};
    }

    var WeeklyBarChart = BoxOffice.WeeklyBarChart = function (options) {
        var margin = this.margin = {top: 20, right: 20, bottom: 30, left: 40};
        this.width = options.width - margin.left - margin.right;
        this.height = options.height - margin.top - margin.bottom;

        this.xScaleAxis = d3.scale.ordinal()
        .rangePoints([0, this.width], 0.5);

        this.yScale = d3.scale.linear()
            .rangeRound([this.height, 0]);

        var colors = []
        $.merge(colors, ["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
        $.merge(colors, d3.scale.category20().range());
        $.merge(colors, d3.scale.category20c().range());

        this.colorScale = d3.scale.ordinal()
            .range(colors);

        this.xAxis = d3.svg.axis()
            .scale(this.xScaleAxis)
            .orient("bottom");

        this.yAxis = d3.svg.axis()
            .scale(this.yScale)
            .orient("left")
            .tickFormat(d3.format(".2s"));

        this.colorDomain = [];
        this.xScaleAxisDomain = [];
        this.yScaleDomain = [];

        this.xScaleBarDomain = [];

        this.numMovies = options.numMovies;
    };

    WeeklyBarChart.prototype.listenerCallback = function () {
        return this.update.bind(this, this.numMovies);
    };

    WeeklyBarChart.prototype.appendChart = function(parentSelector) {
        var margin = this.margin

        var svg = this.svg = d3.select(parentSelector).append("svg")
                .attr("width", this.width + margin.left + margin.right)
                .attr("height", this.height + margin.top + margin.bottom)
            .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        this.xAxisNode = svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + this.height + ")");

        this.yAxisNode = svg.append("g")
            .attr("class", "y axis");

        this.yAxisNode.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Revenue");

    };

    WeeklyBarChart.prototype.update = function(numMovies, weeks) {
        var svg = this.svg;

        weeks = formatWeeklyDataCreateBars( weeks, numMovies );

        this.colorDomain = weeks.colors;
        this.colorScale.domain(this.colorDomain);

        this.xScaleAxisDomain = weeks.keys;
        this.xScaleAxis.domain(this.xScaleAxisDomain);

        this.yScaleDomain = weeks.weeks;
        this.yScale.domain([0, d3.max(this.yScaleDomain, function( yDomain ) {
                return formatRevenue(yDomain.total["Total Revenue"]);
            })]);

        debugger;

        //I not sure what follows is entirely correct
        //axis has to be rendered after domain is attached to the scales,
        //else, will render improperly. Scales are correct, but axises rendered
        //during time when it's state wasn't set. Though the axises state is updated
        //as its scales are given axises, the rendered DOM nodes won't reflect this
        //cause they are fire and forget.
        this.xAxisNode.call(this.xAxis);
        this.yAxisNode.call(this.yAxis);

        //Data Join
        var xPos = this.xPos = this.svg.selectAll(".revenue")
          .data(weeks.weeks, function(datum, idx) { return datum.key })

        //Update
        xPos.transition()
                .duration(750)
                .attr("transform", function(datum) {
                        return "translate(" + this.xScaleAxis(datum.key) + ",0)";
                    }.bind(this));

        // ENTER
        var entered = xPos.enter().append("g")
          .attr("class", "revenue")
          .attr("transform", function(datum) { return "translate(" + this.xScaleAxis(datum.key) + ",0)"; }.bind(this));

        // EXIT
        xPos.exit().transition()
            .duration(750)
            .style("fill-opacity", 1e-6)
            .remove();

        entered.selectAll("rect")
          .data(function(d) { return d.bars; })
        .enter().append("rect")
          .attr("width", "50px")
          .attr("y", function(d) { return this.yScale(d.y1); }.bind(this))
          .attr("height", function(d) { return this.yScale(d.y0) - this.yScale(d.y1); }.bind(this))
          .style("fill", function(d) { return this.colorScale(d.title); }.bind(this));

        var legend = this.svg.selectAll(".legend")
          .data(this.colorScale.domain().slice().reverse())
        .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("rect")
          .attr("x", this.width - 18)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", this.colorScale);

        legend.append("text")
          .attr("x", this.width - 24)
          .attr("y", 9)
          .attr("dy", ".35em")
          .style("text-anchor", "end")
          .text(function(d) { return d; });
    };



    var formatRevenue = function (str) {
        return parseInt(str.replace(/,/g, "").replace("$", ""));
    }

    //side effects: changes weeks param
    //calculate bars, get color domain, turn data into array
    var formatWeeklyDataCreateBars = function (weeks, numMovies) {
        var output = {colors: [], weeks: [], keys: []};

        weeks.forEach( function(week) {
            output.keys.push(week.key);
            week.bars = [];

            var moviesList = week.data;

            var y0 = 0;
            var idx = 0;
            while( idx < numMovies ) {
                var movieData = moviesList[idx];
                weeklyGross = formatRevenue(movieData["Weekly Gross"]);
                title = movieData["Title"];

                y1 = y0 + weeklyGross;
                output.colors.push(title);

                week.bars.push( {title: title, y0: y0, y1: y1} );
                y0 = y1;

                idx += 1;
            }

            y1 = formatRevenue(week.total["Total Revenue"]);
            var other = {title: "other", y0: y0, y1: y1};
            week.bars.push( other );

            output.weeks.push(week);
        });

        return output;
    };

})();
