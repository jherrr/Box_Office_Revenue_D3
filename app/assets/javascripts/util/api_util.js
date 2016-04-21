(function(){
    if (typeof ApiUtil === "undefined") {
        window.ApiUtil = {};
    }

    var ApiUtil = window.ApiUtil = {};
    ApiUtil.fetchWeeklyData = function ( callback, year, week ) {
        $.ajax({
            type: "GET",
            dataType: "json",
            data: {year: year, week: week},
            url: "api/v1/box_office/week",
            success: function (data) {
                BoxOffice.WeeklyStore.updateWeeks(week, data);
                callback( extractWeeklyMovieData(data) );
            }
         });
    };

    ApiUtil.fetchMovieData = function ( data ) {
        $.ajax({
            type: "GET",
            dataType: "json",
            url: "api/v1/movies/list",
            data: {list: data},
            success: function ( data ) {
                debugger;
                BoxOffice.WeeklyStore.addMovies(data);
            }
        });

    };

    //get titles of top 20 movies for that week to make an api call to OMDB
    var extractWeeklyMovieData = function ( data ) {
        var num_movies = 20;
        var output = [];
        var moviesList = data.data;

        idx = 0
        while ( idx <= num_movies ) {
            output.push(moviesList[idx].Title);
            idx+=1;
        }

        return output
    };

})();
