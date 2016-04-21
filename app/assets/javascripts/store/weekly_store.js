(function(){
    if (typeof BoxOffice === "undefined") {
        window.BoxOffice = {};
    }

    var weekSize = 10;
    var weeks = [];
    var currWeek = "0";
    var currMovies = {};

    //Singleton?
    var WeeklyStore = BoxOffice.WeeklyStore = {};

    var callbacks = [];

    WeeklyStore.addListener = function( callback ) {
        callbacks.push( callback );
    };

    WeeklyStore.emitChange = function ( emitType ) {
        callbacks.forEach(function( callback ) {
            callback( emitType );
        });
    };

    WeeklyStore.updateWeeks = function ( week, data ) {
        var movies = data.data;

        //weird error where one of the movies returns "null"
        while( movies[0] === null || movies[0]["Rank This Week"] === "-" ) {
            movies.splice(0,1);
        }

        var avgTheaterData = calcWtedTheaterAvg(data);
        addWtedRevToData(data, avgTheaterData);

        $.extend(data, avgTheaterData);

        currWeek = week;

        data.key = week;
        weeks[week] = data;

        this.emitChange("weekAdded");
    };

    WeeklyStore.addMovies = function ( data ) {
        var avgVoteRatingData = calcWtedRatingAvg( data );
        addWtedRatingToData(data, avgVoteRatingData);

        currMovies = data;
        debugger;

        this.emitChange("moviesFetched");
    };

    WeeklyStore.getCurrWeek = function () {
        return $.extend({}, weeks[currWeek]);
    };

    WeeklyStore.getWeeks = function (currentWeek) {
        var filteredWeeks = weeks.filter( function( week ) {
            return !(typeof week === 'undefined');
        });

        return filteredWeeks.slice( (Math.max(0, currentWeek - 10)), currentWeek);
    };

    WeeklyStore.getCurrMovies = function () {
        return $.extend({}, currMovies);
    };

    WeeklyStore.getRatingCount = function () {
        return countNumFilmsWithRating( this.getCurrMovies() );
    }

    var countNumFilmsWithRating = function ( moviesData ) {
        var cache = {};
        var keys = Object.keys( moviesData );

        keys.forEach( function( key ) {
            var movie = moviesData[key];
            var rated = movie["Rated"];

            if ( typeof cache[rated] === "undefined" ) {
                cache[rated] = 1;
            } else {
                cache[rated] += 1;
            }

        });

        var ratings = Object.keys( cache );
        var output = [];

        ratings.forEach( function( rating ) {
            output.push({rating: rating, count: cache[rating]});
        });

        return output;
    };

    var calcWtedRatingAvg = function( moviesData ) {
        var keys = Object.keys(moviesData);

        var listImdbVotes = [];
        var totalVotes = 0;
        var totalRatings = 0;
        var movieCt = 0;

        keys.forEach( function( key ) {
            var movieData = moviesData[key];

            var imdbVotes = movieData["imdbVotes"];
            var imdbRating = movieData["imdbRating"];

            if (imdbVotes && imdbRating) {
                totalVotes += Helper.toNum(imdbVotes);
                totalRatings += Helper.toNum(imdbRating);
                movieCt += 1;

                if( listImdbVotes.length < 20 ) {
                    listImdbVotes.push(Helper.toNum(imdbVotes));
                }
            }


        });

        var minImdbVotes = Helper.minWithArr(listImdbVotes);
        var avgImdbRating = totalRatings/movieCt;

        return {minImdbVotes: minImdbVotes, avgImdbRating: avgImdbRating};
    };

    var addWtedRatingToData = function( moviesData, avgMoviesData ) {
        var keys = Object.keys(moviesData);

        keys.forEach( function( key ) {
            var movieData = moviesData[key];
            var wtedAvgRating = "N/A"
            var imdbVotes = movieData["imdbVotes"];
            var imdbRating = movieData["imdbRating"];

            if ( imdbVotes && imdbRating ) {
                imdbVotes = Helper.toNum(imdbVotes);
                imdbRating = Helper.toNum(imdbRating);
                var minImdbVotes = avgMoviesData.minImdbVotes;
                var avgImdbRating = avgMoviesData.avgImdbRating;

                wtedAvgRating = ( ((imdbRating * imdbVotes) + (avgImdbRating * minImdbVotes))
                / (imdbVotes + minImdbVotes));
            }

            movieData.wtedAvgRating = wtedAvgRating;
        });

    };

    var calcWtedTheaterAvg = function( weekData ) {

        var movieList = weekData.data;

        var listTheaterCt = [];
        var totalTheaterCt = 0;
        var totalTheaterAvgGross = 0;
        var movieCt = 0;

        movieList.forEach( function( movieData ) {
            totalTheaterCt += Helper.toNum(movieData["Theater Count"]);
            totalTheaterAvgGross += Helper.toNum(movieData["Theater Average Gross"]);

            if( listTheaterCt.length < 20 ) {
                listTheaterCt.push(Helper.toNum(movieData["Theater Count"]));
            }

            movieCt += 1;
        });

        var minTheaterCt = Helper.minWithArr(listTheaterCt);
        var avgTheaterAvgGross = totalTheaterAvgGross/movieCt;

        return {minTheaterCt: minTheaterCt, avgTheaterAvgGross: avgTheaterAvgGross};
    }

    var addWtedRevToData = function( movieData, avgData ) {
        var movieList = movieData.data;

        movieList.forEach( function( movieData ) {
            var TheaterAvgGross = Helper.toNum(movieData["Theater Average Gross"]);
            var TheaterCt = Helper.toNum(movieData["Theater Count"]);
            var avgTheaterAvgGross = avgData.avgTheaterAvgGross;
            var minTheaterCt = avgData.minTheaterCt;

            var wtedAvgRev = ( ((TheaterAvgGross * TheaterCt) +
                                (avgTheaterAvgGross * minTheaterCt)) /
                            (TheaterCt + minTheaterCt) );

            movieData.wtedAvgRev = wtedAvgRev;
        });
    };

    var countRating = function( movieData ) {



    };

})();
