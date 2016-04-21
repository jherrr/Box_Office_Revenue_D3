(function(){
    if (typeof Helper === "undefined") {
        window.Helper = {};
    }

    Helper.toNum = function (str) {
        return parseInt(str.replace(/,/g, "").replace("$", ""));
    };

    Helper.minWithArr = function (arr) {
        var fn = Math.min
        arr.forEach( function( val ) {
            fn = fn.bind(null, val);
        });

        return fn();
    };

})();
