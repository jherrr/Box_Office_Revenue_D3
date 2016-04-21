(function() {

    if (typeof BoxOffice === "undefined") {
        window.BoxOffice = {};
    }

    var DonutChart = BoxOffice.DonutChart = function (options) {
        var width = this.width = options.width;
        var height = this.height = options.height;
        this.radius = Math.min(width, height) / 2;
        this.color = d3.scale.ordinal()
            .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
    };

    DonutChart.prototype.appendChart = function (parentSelector, layoutAccessorAttr) {
        var width = this.width;
        var height = this.height;
        var radius = this.radius;

        this.arc = d3.svg.arc()
            .outerRadius(radius - 10)
            .innerRadius(radius - 70);

        this.pie = d3.layout.pie()
            .value(function(d) { return d[layoutAccessorAttr]; });

        this.svg = d3.select(parentSelector).append("svg")
            .attr("width", width)
            .attr("height", height)
          .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    };

    DonutChart.prototype.listenerCallback = function() {
        return this.addCircleData.bind(this);
    }

    DonutChart.prototype.addCircleData = function( accessor, data ) {
        var svg = this.svg;
        var pie = this.pie;
        var arc = this.arc;
        var color = this.color;

        var g = svg.selectAll(".arc")
            .data(pie(data))
          .enter().append("g")
            .attr("class", "arc");

        g.append("path")
            .attr("d", arc)
            .style("fill", function(d) {
                return color(d.data[accessor]); });

        g.append("text")
            .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
            .attr("dy", ".35em")
            .text(function(d) {
                return d.data[accessor]; });
    };









})();
