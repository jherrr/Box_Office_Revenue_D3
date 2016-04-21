(function() {

    if (typeof BoxOffice === "undefined") {
        window.BoxOffice = {};
    }

    var MovieList = BoxOffice.MovieList = function (parentNode, numMovies) {
        this.parentNode = parentNode;
        this.numMovies = numMovies;
        this.moviesApiData = {};
        this.moviesList = [];

        var ul = document.createElement("ul");
        this.ul = parentNode.appendChild(ul);
        this.ul.setAttribute("class", "movie-list");
        this.ul.setAttribute("style", "list-style-type:none");
    };

    MovieList.prototype.listenerWeeklyCallback = function () {
        return this.appendWeek.bind(this);
    };

    MovieList.prototype.listenerMoviesCallback = function () {
        return this.addMovies.bind(this);
    };

    MovieList.prototype.addMovies = function ( newMovies ) {

        var moviesDetails = this.moviesApiData;
        $.extend(moviesDetails, newMovies);

        var moviesList = this.moviesList;

        moviesList.forEach( function( movieTitle ) {
            var movieDetails = moviesDetails[movieTitle];

            var spanWeightedRating = document.getElementById("SpWtRt-" + movieTitle);
            spanWeightedRating.textContent = movieDetails.wtedAvgRating.toFixed(2);

            var spanFilmRating = document.getElementById("SpFmRt-" + movieTitle);
            spanFilmRating.textContent = movieDetails["Rated"];

            var spanGenre = document.getElementById("SpGn-" + movieTitle);
            spanGenre.textContent = movieDetails["Genre"];
        });
    };

    MovieList.prototype.appendWeek = function( weekData ) {
        var numMovies = this.numMovies;

        var moviesRevData = weekData.data;

        var idx = 0;
        while( idx < numMovies ) {
            var movieData = moviesRevData[idx];
            this.appendMovie(movieData);

            idx += 1;
        }
    };

    MovieList.prototype.appendMovie = function( movieData ) {
        this.moviesList.push(movieData.Title);

        var li = document.createElement("li");
        li = this.ul.appendChild(li);
        li.setAttribute("class", "row");

        var spanRank = document.createElement("span");
        spanRank = li.appendChild(spanRank);
        spanRank.setAttribute("class", "col-xs-1 col-sm-1 col-md-1");
        spanRank.textContent = movieData["Rank This Week"];

        var spanTitle = document.createElement("span");
        spanTitle = li.appendChild(spanTitle);
        spanTitle.setAttribute("class", "col-xs-3 col-sm-3 col-md-3");
        spanTitle.textContent = movieData.Title;

        var spanWeekNum = document.createElement("span");
        spanWeekNum = li.appendChild(spanWeekNum);
        spanWeekNum.setAttribute("class", "col-xs-1 col-sm-1 col-md-1");
        spanWeekNum.textContent = movieData["Week #"];

        var spanWeeklyGross = document.createElement("span");
        spanWeeklyGross = li.appendChild(spanWeeklyGross);
        spanWeeklyGross.setAttribute("class", "col-xs-1 col-sm-1 col-md-1");
        spanWeeklyGross.textContent = movieData["Weekly Gross"];

        var spanWeightedAvgRev = document.createElement("span");
        spanWeightedAvgRev = li.appendChild(spanWeightedAvgRev);
        spanWeightedAvgRev.setAttribute("class", "col-xs-1 col-sm-1 col-md-1");
        spanWeightedAvgRev.textContent = movieData.wtedAvgRev.toFixed(2);

        var spanWeightedRating = document.createElement("span");
        spanWeightedRating = li.appendChild(spanWeightedRating);
        spanWeightedRating.setAttribute("class", "col-xs-1 col-sm-1 col-md-1");
        spanWeightedRating.setAttribute("id", "SpWtRt-" + movieData.Title);

        var spanFilmRating = document.createElement("span");
        spanFilmRating = li.appendChild(spanFilmRating);
        spanFilmRating.setAttribute("class", "col-xs-1 col-sm-1 col-md-1");
        spanFilmRating.setAttribute("id", "SpFmRt-" + movieData.Title);

        var spanGenre = document.createElement("span");
        spanGenre = li.appendChild(spanGenre);
        spanGenre.setAttribute("class", "col-xs-3 col-sm-3 col-md-3");
        spanGenre.setAttribute("id", "SpGn-" + movieData.Title);
    };

})();
