// Global application registry.  Contains config info and other shared resources
define(function(require) {
	
	var app = window.app || {};
	
	app.util = {};
	
	// Helper functions

    // Return the value of a nested property or undefined if it doesn't exist
    // Context defaults to App
	app.util.getProperty = function( name , context ) {

        var parts,
            i,
            prop,
            result = context || app;

        if ( !name || typeof name.split === "undefined" ) {
            return;
        }

        parts = name.split(".");

        for ( i = 0, prop; result && (typeof( prop = parts[i] ) !== "undefined"); i++ ) {
            // Check for empty property
            if ( prop.length === 0 ) {
                result = undefined;
                break;
            }
            result = ( prop in result ? result[prop] : undefined );
        }

        return result;
    };

    // For testing only
    app.util.sleep = function sleep(milliseconds) {
        var start = new Date().getTime();

        for (var i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milliseconds){
              break;
            }
        }
    };

    app.util.Timer = function AppTimer( category, variable ) {

        this.category = category;

        this.variable = variable;

        this.timerStart = ( new Date( ) ).getTime( );
    };

    app.util.Timer.prototype.end = function end( label ) {

        this.timerEnd = ( new Date( ) ).getTime( );

        //ga( "send", "timing", this.category, this.variable, ( this.timerEnd - this.timerStart ), label );
    };

    app.util.engageTimer = function( rate ) {

        if ( rate === true || rate === false ) {
            return rate;
        } else {
            return Math.random( ) <= ( rate / 100 );
        }
    };

    app.util.decimalPlaces = function decimalPlaces(num) {

        var match = (''+num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);

        if (!match) { return 0; }

        return Math.max(
            0,
            // Number of digits right of decimal point and adjust for scientific notation.
            (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0)
        );
    };

    app.util.areCookiesEnabled = function() {

        var cookieEnabled = (navigator.cookieEnabled) ? true : false;
        if (typeof navigator.cookieEnabled == "undefined")  {
            document.cookie="test=dwcookie";
            cookieEnabled = (document.cookie.indexOf("test=dwcookie") != -1) ? true : false;
            document.cookie = "test=; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        }
        return (cookieEnabled);
    };

    app.util.lazyLoad = function ( ) {
        var loadDeferred = $.Deferred( ),
            fileNames = Array.prototype.slice.call( arguments );

        require( fileNames, function( ) {
            loadDeferred.resolveWith( this, Array.prototype.slice.call( arguments ) );
        });

        return loadDeferred.promise( );
    };

    app.util.getParams = function ( str ) {
       var queryString = str || window.location.search || '',
           keyValPairs = [],
           params      = {},
           key;

       queryString = queryString.replace(/.*?\?/,"");

       if ( queryString.length ) {

          keyValPairs = queryString.split('&');

          for (pairNum in keyValPairs) {

             key = keyValPairs[pairNum].split('=')[0];

             if (!key.length) continue;

             if (typeof params[key] === 'undefined') {
                 params[key] = [];
             }

             params[key].push(keyValPairs[pairNum].split('=')[1]);
          }
       }
       return params;
    };

    app.util.escapeRegExp = function escapeRegExp(string){
      return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    };

    app.util.setEnv = function ( newEnv ) {

        if ( !newEnv ) {
            newEnv = ( ( domain && domain === "com" ) || buildType === "phonegap" ) ? "PROD" : "UAT";
        }

        if ( newEnv !== "UAT" && newEnv !== "PROD" ) {
            return;
        }

        env = newEnv;

        return newEnv;
    };

    app.util.getDeviceLocale = function ( ) {

        var deferred = $.Deferred( );

        if ( buildType !== "phonegap" ) {
            deferred.rejectWith( null, [null, "error", "Method not available for buildtype " + buildType ] );
        } else {

            // Attempt to get the language from the device
            navigator.globalization.getLocaleName(
                function( locale ) {

                    var localeId = ( locale && locale.value ? locale.value : "" ),
                        langId,
                        language,
                        languageId;

                    if ( localeId && _.isString( localeId ) ) {

                        langId = localeId.substr(0,2);

                        language = _.findWhere( app.config.languages, { "langCode": langId } );

                        if ( language ) {
                            languageId = language.languageID;
                        }
                    }

                    deferred.resolveWith( null, [ languageId ] );
                },
                function( error ) {
                    deferred.rejectWith( null, [ null, "error", error.code + " - " + error.message ] );
                }
            );
        }

        return deferred;
    };
    
});
