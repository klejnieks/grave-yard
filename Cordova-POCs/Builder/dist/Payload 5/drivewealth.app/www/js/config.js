define([
	'json!config/endpoints.json',
	'json!config/goal-categories.json',
	'json!config/chart-options.json',
	'json!config/market-state.json',
	'json!config/special-layouts.json',
	'json!config/goal-image-allowed-types.json',
	'json!config/languages.json',
	'json!config/countries.json',
	'json!config/public-sections.json',
	'json!config/api-type-map.json',
	'json!config/ord-status.json',
	'json!config/url-view-map.json',
	'json!config/default-products.json',
	'json!config/popular-searches.json',
	'json!config/target-sizes.json',
	'json!config/document-upload-types.json',
	'json!config/document-upload-image-source.json',
	'json!config/id-attribute.json',
	'json!config/order-types.json',
	'json!config/account-types.json',
	'json!config/question-categories.json'
	], function (endpoints, goalCategories, chartOptions, marketState, specialLayouts, goalImageAllowedTypes, languages, countries, publicSections, apiTypeMap, orderStatus, urlViewMap, defaultProducts, popularSearches, targetSizes, documentUploadAllowedTypes, documentUploadImageSource, idAttribute, orderTypes, accountTypes, questionCategories) {

	var isCordova = (typeof device !== "undefined") ? true : false;
	var host = window.location && typeof window.location.hostname !== "undefined" ? window.location.hostname.split(".") : "";
	var domain = host ? host[ host.length -1 ] : "";
	var buildType = isCordova ? "phonegap" : "html5";
	var env = ( ( domain && domain === "com" ) || buildType === "phonegap" ) ? "PROD" : "UAT";
	var app = {};
	
	app.config = {
		
        /***********************************
          White Label Partner Configuration
         **********************************/
		resources: {
			WLP_CompanyName: {
				en_US: "KraneShares",
				zh_CN: "KraneShares",
				es_ES: "KraneShares",
				pt_BR: "KraneShares"
			}
		},

		WLPID: "KRSH",

		companyLogoPath: {
			WLP_Logo: "kraneshares-logo-dark.svg",
			WLP_Logo_InApp: "kraneshares-logo-light.svg",
			WLP_Logo_Favicon: "kraneshares-icon.png"
		},
		/***********************************/
        
		version: "1.0.2",
		buildType: buildType,
		debug: false,
        
        segmentUrl: "https://api.segment.io/v1",
        segmentKey: "xr5enoe660",
        
        customerioUrl: "https://track.customer.io/api/v1",
        customerioSiteId: "fb161e8aae6d1fbfa548",
        customerioApiKey: "2cbf3f18c5efdbbcc35b",

        quotesRefreshRate: "0",
        quotesFailureThreshold: 50,
        quotesFailureTime: 600000,
        
        pendingOrderRefreshRate: 3000,
        
        accountRefreshRate: 10000,
        
        maxOrderStatusAttempts: 3,
        
        sessionTimeout: 300000,
        
        publicSections: publicSections,
        
        languages: languages,
        
        countries: countries,
        
        chartOptions: chartOptions,
        
        marketState: marketState,
        
        specialLayouts: specialLayouts,
        
        goalCategories: goalCategories,
        
        questionCategories: questionCategories,
        
        goalImageAllowedTypes: goalImageAllowedTypes,
        
        marketState: marketState,
        
        apiTypeMap: apiTypeMap,
        
        ordStatus: orderStatus,
        
        urlViewMap: urlViewMap,
        
        defaultProducts: defaultProducts,
        
        popularSearches: popularSearches,
        
        isDevice: isCordova,
        
        appRoot: isCordova ? "www/" : "/",
        
        targetSizes: targetSizes,
        		
        documentUploadAllowedTypes: documentUploadAllowedTypes,
        
        documentUploadImageSource: documentUploadImageSource,
        
        homeFavThreshold: 5,
        
        idAttribute: idAttribute,
        
        heartBeatRefreshRate: 30000,
        
        flashQuotesDisplayTime: 1000,
        
        orderTypes: orderTypes,
        
        accountTypes: accountTypes,
        
        // The percentage rate to sample api calls...e.g., '10' to time 10% of API calls
        //   Use true for 100% and false for 0%
        apiTimerCaptureRate: true,

        // The amount to buffer the stop orders above/below rate ask/bid in dollars
        stopOrderBuffer: 0.04,

        // The max number of exceptions to send to the api per browser session
        maxExceptions: 25,

        // The amount to start a practice account with
        starterFunds: 10000,

        documentUploadTypes: [],

        defaultLanguageID: "en_US",

        recentInstrumentsDisplay: 10,

        fbPixelTrackingCampaigns: [ "0001" ],

        pathHistoryLength: 5,

        chartDataExp: 3600,

        // At what percent of missing data should the number of ticks be corrected
        chartTickCorrection: 0.2,

        // The ratio of height to width for given layout
        chartHeightRatio: {
            "small": 0.5,
            "medium": 0.333
        },
        
        env: function() {
            return env;
        },
        
        api: function() {
            return endpoints.api[ env ];
        },

        cdn: function() {
            return endpoints.cdn[ env ];
        },

        applicationLink: function() {
            return endpoints.applicationLink[ env ];
        },

        report: function() {
            return endpoints.report[ env ];
        },

        externalDomain: function() {
            return endpoints.externalDomain[ env ];
        },

        appsDomain: function() {
            return endpoints.appsDomain[ env ];
        },

        externalRootURL: (function(){
            return isCordova ? "https://you.drivewealth.com/" : "/";
        })(),

        validators: {
            password:  function( el, required, parent ) {
                var value = $( el ).val();

                if ( value.length < 8 || value.length > 90 ) {
                    return false;
                }

                if ( value.search(/\d+/) == -1 || value.search(/[A-Za-z]/) == -1 ) {
                    return false;
                }

                return true;
            },
            nonEmptyString: function( el, required, parent ) {
                var value = $( el ).val();

                if ( value.trim()  == "") {
                    return false;
                }

                return true;
            }
        }
        
    };

    // Default to medium layout
    app.layout = "medium";
    app.modal = "small";
    app.views = {};
    app.models = {};
    app.collections = {};
    app.user = {};
    app.userAgent = {};
    app.marketState = 0;
    app.paths = [];
    app.history = [];
    app.exceptions = 0;
    app.preferences = {};
    app.campaign = {};

    // Helper functions

    // Return the value of a nested property or undefined if it doesn't exist
    // Context defaults to App
    app.getProperty = function( name , context ) {

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
    app.sleep = function sleep(milliseconds) {
        var start = new Date().getTime();

        for (var i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milliseconds){
              break;
            }
        }
    };

    app.Timer = function AppTimer( category, variable ) {

        this.category = category;

        this.variable = variable;

        this.timerStart = ( new Date( ) ).getTime( );
    };

    app.Timer.prototype.end = function end( label ) {

        this.timerEnd = ( new Date( ) ).getTime( );

        //ga( "send", "timing", this.category, this.variable, ( this.timerEnd - this.timerStart ), label );
    };

    app.engageTimer = function( rate ) {

        if ( rate === true || rate === false ) {
            return rate;
        } else {
            return Math.random( ) <= ( rate / 100 );
        }
    };

    app.decimalPlaces = function decimalPlaces(num) {

        var match = (''+num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);

        if (!match) { return 0; }

        return Math.max(
            0,
            // Number of digits right of decimal point and adjust for scientific notation.
            (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0)
        );
    };

    app.areCookiesEnabled = function() {

        var cookieEnabled = (navigator.cookieEnabled) ? true : false;
        if (typeof navigator.cookieEnabled == "undefined")  {
            document.cookie="test=dwcookie";
            cookieEnabled = (document.cookie.indexOf("test=dwcookie") != -1) ? true : false;
            document.cookie = "test=; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        }
        return (cookieEnabled);
    };


    app.lazyLoad = function ( ) {
        var loadDeferred = $.Deferred( ),
            fileNames = Array.prototype.slice.call( arguments );

        require( fileNames, function( ) {
            loadDeferred.resolveWith( this, Array.prototype.slice.call( arguments ) );
        });

        return loadDeferred.promise( );
    };

    app.getParams = function ( str ) {
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

    app.escapeRegExp = function escapeRegExp(string){
      return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    };

    app.setEnv = function ( newEnv ) {

        if ( !newEnv ) {
        	newEnv = ( ( domain && domain === "com" ) || isCordova ) ? "PROD" : "UAT";
        }

        if ( newEnv !== "UAT" && newEnv !== "PROD" ) {
            return;
        }

        env = newEnv;

        return newEnv;
    };

    app.getDeviceLocale = function ( ) {

        var deferred = $.Deferred( );

        if ( isCordova ) {
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

    return app;
});
