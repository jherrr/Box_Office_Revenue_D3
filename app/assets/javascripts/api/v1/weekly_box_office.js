// # Place all the behaviors and hooks related to the matching controller here.
// # All this logic will automatically be available in application.js.
// # You can use CoffeeScript in this file: http://coffeescript.org/

(function(){
    if (typeof BoxOffice === "undefined") {
        window.BoxOffice = {};
    }

    var Controller = BoxOffice.Controller = function () {
        this.currentWeek = 10;
        this.currentYear = 2010;
    };

    Controller.prototype.initializeDocument = function() {
        var numMovies = 10
        var root = document.getElementById('weekly-app');

        var barDiv = document.createElement("div");
        barDiv.setAttribute("class", "graph");
        barDiv.setAttribute("id", "weekly-bar");
        barDiv = root.appendChild(barDiv);

        var WeeklyBarChartConstr = window.BoxOffice.WeeklyBarChart;
        var WeeklyBarChart = this.WeeklyBarChart = new WeeklyBarChartConstr(
            {width: 1000, height: 500, numMovies: numMovies});
        WeeklyBarChart.appendChart("#weekly-bar");

        var listDiv = document.createElement("div");
        listDiv.setAttribute("id", "list-div");
        listDiv = root.appendChild(listDiv);

        var MovieListConstr = window.BoxOffice.MovieList;
        var MovieList = this.MovieList = new MovieListConstr(listDiv, numMovies);

        var DonutChartConstr = window.BoxOffice.DonutChart;
        var RatingDonut = this.RatingDonut = new DonutChartConstr(
            {width: 800, height: 500});

        var donutBarDiv = document.createElement("div");
        donutBarDiv.setAttribute("id", "donut-bar-div");
        donutBarDiv = root.appendChild(donutBarDiv);

        var ratingDonutSpan = document.createElement("span");
        ratingDonutSpan = donutBarDiv.appendChild(ratingDonutSpan);

        RatingDonut.appendChart(ratingDonutSpan, "count");
    };

    Controller.prototype.attachStoreListener = function() {
        var that = this;
        var WeeklyStore = BoxOffice.WeeklyStore;

        WeeklyStore.addListener( function( emitType ) {

            switch(emitType) {
                case "weekAdded":
                    var weeklyBarChartCallback = that.WeeklyBarChart.listenerCallback();
                    weeklyBarChartCallback( WeeklyStore.getWeeks(that.currentWeek) );

                    var movieListCallback = that.MovieList.listenerWeeklyCallback();
                    movieListCallback( WeeklyStore.getCurrWeek() );

                    break;
                case "moviesFetched":
                    var movieListCallback = that.MovieList.listenerMoviesCallback();
                    movieListCallback( WeeklyStore.getCurrMovies() );

                    var RatingDonutCallback = that.RatingDonut.listenerCallback();
                    RatingDonutCallback( "rating", WeeklyStore.getRatingCount() );
                    break;
            }

        });
    }

    Controller.prototype.initializeControls = function() {
        var that = this;

        window.focus();
        d3.select(window).on("keydown", function() {
            switch (d3.event.keyCode) {
                case 37:

                    break;
                case 39:
                    debugger;
                    that.currentWeek += 1;
                    updateData( that.currentYear, that.currentWeek );
                    break;
            }
        });
    };

    function updateData (currentYear, currentWeek) {
        ApiUtil.fetchWeeklyData( ApiUtil.fetchMovieData, currentYear, currentWeek );
    };

    Controller.prototype.start = function() {
        var that = this;

        document.addEventListener('DOMContentLoaded', function() {
            that.initializeDocument();
            populateData();
            that.attachStoreListener();
            that.initializeControls();
        });
    };

    function populateData() {
        var year = 2010;
        var week = 1;

        var idx = 0;
        while ( idx < 10 ) {
            ApiUtil.fetchWeeklyData( ApiUtil.fetchMovieData, year, week + idx );
            idx += 1;
        }
    };

    var boxOfficeController = new Controller();
    boxOfficeController.start();

})();
