// Global application registry.  Contains config info and other shared resources
define(['models/endpoints', 'models/languages', 'models/countries'], function (Endpoints, Languages, Countries) {

	var app = {};
	var isCordova = (typeof device !== "undefined") ? true : false;
	var host = window.location && typeof window.location.hostname !== "undefined" ? window.location.hostname.split(".") : "";
	var domain = host ? host[ host.length -1 ] : "";
	var buildType = isCordova ? "phonegap" : "html5";
	var env = ( ( domain && domain === "com" ) || buildType === "phonegap" ) ? "PROD" : "UAT";
	var endpoints = new Endpoints().get('endpoints');

    app.config = {

        "version": "1.0.undefined",
        
     // White label partner company name
        resources: {
          WLP_CompanyName: {
            en_US: "DriveWealth",
            zh_CN: "DriveWealth",
            es_ES: "DriveWealth",
            pt_BR: "DriveWealth"
          }
        },

        // White label partner ID
        "WLPID": "DW",

        // White label partner company logo
        "companyLogoPath": {
          WLP_Logo: "logo-dark.svg",
          WLP_Logo_InApp: "logo.svg",
          WLP_Logo_Favicon: "icon.png"
        },

        "buildType": buildType,

        "env": function( ) {
            return env;
        },

        // Debug mode...display events in the console
        "debug": false,

        // Define the api domain
        "api": function( ) {
            return endpoints.api[ env ];
        },

        // Define the cdn domain
        "cdn":  function( ) {
            return endpoints.cdn[ env ];
        },

        // Live account application link
        "applicationLink": function( ) {
            return endpoints.applicationLink[ env ];
        },

        // Define the report domain
        "report": function( ) {
            return endpoints.report[ env ];
        },

        "externalDomain": function( ) {
            return endpoints.externalDomain[ env ];
        },

        "appsDomain": function( ) {
            return endpoints.appsDomain[ env ];
        },

        "segmentUrl": "https://api.segment.io/v1",

        "segmentKey": "SEGMENT_KEY",

        "customerioUrl": "https://track.customer.io/api/v1",

        "customerioSiteId": "CUSTOMER_IO_SITE_ID",

        "customerioApiKey": "CUSTOMER_IO_API_KEY",

        isDevice: isCordova, 

        externalRootURL: (function( ){
            return isCordova ? "https://you.drivewealth.com/" : "/";
        })( ),

        appRoot: isCordova ? "www/" : "/",

        // Define the media queries used to determine layout
        "targetSizes" : {
            "small":    "only screen and (max-width: 40em)",
            "medium":   "only screen and (min-width: 40.063em)"
        },

        // Active languages
        languages : new Languages().get('languages'),
        
        // Active countries
        countries: new Countries().get('countries'),

        // Set the number of milliseconds to wait between quote refreshes
        "quotesRefreshRate": 2000,

        // The minimum number of failures to have before sending error
        "quotesFailureThreshold": 50,

        // The number of milliseconds to check for quote refresh failures ( e.g., Past 10 minutes: 600000 )
        "quotesFailureTime": 600000,

        // Set the number of milleseconds to wait between order status refreshes
        "pendingOrderRefreshRate": 3000,

        // The number of milliseconds between account refreshes
        "accountRefreshRate": 10000,

        // The number of times to attempt to retrieve the status of an order before stopping
        "maxOrderStatusAttempts": 3,

        // Define which sections are publicly available without session key
        "publicSections": ["root", "login", "learn", "education", "questions", "tour", "tags", "marketplace", "learningmarkets"],

        // Define special layouts that will override defaults
        "specialLayouts": {
            "learn": {
                "Unauth": "Acquisition"
            },
            "education": {
                "Unauth": "Acquisition"
            },
            "questions": {
                "Unauth": "Acquisition"
            },
            "marketplace": {
                "Unauth": "Acquisition"
            },
            "learningmarkets": {
               "Unauth": "Acquisition"
            },
            "upload": {
                "Auth":  "Upload"
            },
            "upload-2forms": {
                "Auth":  "Upload"
            },
            "reporting": {
                "Auth":  "Reporting"
            }
        },

        // Define when the session should time out....milliseconds of inactivity
        "sessionTimeout": 300000,

        // Goal tags masked as categories....user is required to select one on goal add/edit
        "goalCategories": [
            { "tag": "vehicle",       "desc": "Cars, Trucks and Motorcycles" },
            { "tag": "collectibles",  "desc": "Art, Comic Books and Sculptures" },
            { "tag": "education",     "desc": "College, MBA, Masters, Doctorate" },
            { "tag": "travel",        "desc": "Vacations, Moving, New Identity" },
            { "tag": "wedding",       "desc": "Everything Related To Weddings" },
            { "tag": "tech",          "desc": "Tablets, Phones, Laptops and TVs" },
            { "tag": "fashion",       "desc": "Clothing, Accessories and Jewelry" },
            { "tag": "charity",       "desc": "Charitable Causes" },
            { "tag": "home",          "desc": "Real Estate, Furniture, Landscaping, Remodeling, Appliances" },
            { "tag": "retirement",    "desc": "Retirement" },
            { "tag": "gifts",         "desc": "Endowments, Pledges, Cash" },
            { "tag": "health",        "desc": "Tattoos, Surgery, Health Care" },
            { "tag": "fun",           "desc": "Rainy Day Fund, Frivolous Purchases" },
            { "tag": "investing",     "desc": "Investing" }
        ],

        // Question tags masked as categories
        "questionCategories": [
            { "tag": "securities", "desc": "Securities description" },
            { "tag": "etf", "desc": "ETF description" }
        ],

        // Types of images that can be uploaded for goals
        "goalImageAllowedTypes": ["image/jpeg", "image/png", "image/gif"],

        "documentUploadAllowedTypes": ["image/jpeg", "image/png", "image/gif", "application/pdf"],

        "documentUploadImageSource": {
            "application/pdf": "img/icon-pdf"
        },

        // Number of favorites to load before showing home view..others will be loaded dynamically
        "homeFavThreshold": 5,

        // Map the model types to the ID attribute
        "idAttribute": {
            "question":    "questionID",
            "post":        "eduContentID",
            "instrument":  "instrumentID",
            "position":    "instrumentID",
            "order":       "orderID",
            "goal":        "goalID"
        },

        // The rate (milliseconds) at which to send the heartbeat to the server and keep the session alive
        "heartBeatRefreshRate": 30000,

        // How long to wait (milliseconds) before removing flash quotes
        "flashQuotesDisplayTime": 1000,

        // Market status description and classname grouped by account type...special case for account type 1 "Practice"
        "marketState" : {
            "default": {
                "0": {
                    "desc": "",
                    "className": ""
                },
                "1": {
                    "desc": "Market Open",
                    "className": "icon-open"
                },
                "2": {
                    "desc": "Market Closed",
                    "className": "icon-closed closed"
                },
                "3": {
                    "desc": "Market Suspended",
                    "className": "icon-closed suspended"
                }
            },
            "1": {
                // PRACTICE ACCOUNT
                "0": {
                    "desc": "",
                    "className": ""
                },
                "1": {
                    "desc": "Practice Market Open 24/7",
                    "className": "icon-open"
                },
                "2": {
                    "desc": "Practice Market Open 24/7",
                    "className": "icon-open"
                },
                "3": {
                    "desc": "Market Suspended",
                    "className": "icon-closed suspended"
                }
            }
        },

        "orderTypes": {
            "1":  "market",
            "2":  "limit",
            "3":  "stop"
        },

        "accountTypes": {
            "1":   "Practice",
            "2":   "Live",
            "98":  "Test"
        },

        // Form validation functions used with foundation abide
        "validators" : {
            "password":  function( el, required, parent ) {
                var value = $( el ).val();

                if ( value.length < 8 || value.length > 90 ) {
                    return false;
                }

                if ( value.search(/\d+/) == -1 || value.search(/[A-Za-z]/) == -1 ) {
                    return false;
                }

                return true;
            },
            "nonEmptyString": function( el, required, parent ) {
                var value = $( el ).val();

                if ( value.trim()  == "") {
                    return false;
                }

                return true;
            }
        },

        // Maps the backend type with the front end
        "apiTypeMap" : {
            "questions":    "question",
            "eduContents":  "post",
            "instruments":  "instrument",
            "goals":        "goals",
            "marketplace":  "marketplace",
            "learningmarkets":"learningmarkets",
        },

        // Maps the front end type with the router view (first part of url)
        "urlViewMap": {
            "post":        "learn",
            "question":    "questions",
            "instrument":  "products",
            "position":    "positions",
            "goal":        "goals",
            "marketplace": "marketplace",
            "learningmarkets":"learningmarkets"
        },

        // Order statuses
        "ordStatus": {
            "0": "New",
            "1": "Partially filled",
            "2": "Filled",
            "4": "Canceled",
            "6": "Pending cancel",
            "7": "Stopped",
            "8": "Rejected"
        },

        // Default products to show on list view
        "defaultProducts": ["AAPL","BABA","BAC","BIDU","BKW","FB","GOOG","KO","MCD","SAN"],

        // The percentage rate to sample api calls...e.g., '10' to time 10% of API calls
        //   Use true for 100% and false for 0%
        "apiTimerCaptureRate": true,

        // The amount to buffer the stop orders above/below rate ask/bid in dollars
        "stopOrderBuffer": 0.04,

        // The max number of exceptions to send to the api per browser session
        "maxExceptions": 25,

        // The amount to start a practice account with
        "starterFunds": 10000,

        "documentUploadTypes": [
			// { "display": "Current Proof of Residence", "value": "Proof of address" },
			// { "display": "Government-Issued ID", "value": "Picture ID" }
        ],

        "defaultLanguageID": "en_US",

        // The number of recent instruments to display in view
        "recentInstrumentsDisplay": 10,

        // Facebook pixel tracking campaigns
        "fbPixelTrackingCampaigns": [ "0001" ],

        // Number of paths to keep in the history
        "pathHistoryLength": 5,

        // Popular search examples
        "popularSearches": [ "AAPL", "BABA", "Alibaba", "ETF", "technology", "dow30", "Russell", "Russell1000", "NKE", "KO", "sp500", "usa", "china", "energy", "services", "financial", "materials", "industrial", "healthcare", "TSLA", "GOOG", "YHOO", "ZNGA", "BIDU", "spain", "brazil", "consumer", "NFLX", "index", "Facebook" ],

        // Available chart time ranges
        "chartOptions": {
            "1D": {
                "compression":  4,
                "shortValue":   "1",
                "shortUnit":    "d",
                "abbr":         "1 Day",
                "tradingDays":  "1",
                "length":       86400,
                "corLimit":     0.99
            },
            "5D": {
                "compression":  8,
                "shortValue":   5,
                "shortUnit":    "d",
                "abbr":         "5 Day",
                "tradingDays":  "5",
                "length":       432000,
                "corLimit":     0.667
            },
            "1M": {
                "compression":  0,
                "shortValue":   1,
                "shortUnit":    "M",
                "abbr":         "1 Month",
                "tradingDays":  "31",
                "length":       2678400,
                "corLimit":     0.50
            },
            "3M": {
                "compression":  0,
                "shortValue":   3,
                "shortUnit":    "M",
                "abbr":         "3 Month",
                "tradingDays":  "93",
                "length":       8035200,
                "corLimit":     0.667
            },
            "1Y": {
                "compression":  0,
                "shortValue":   1,
                "shortUnit":    "y",
                "abbr":         "1 Yr.",
                "tradingDays":  "365",
                "length":       31536000,
                "corLimit":     0.50
            },
            "2Y": {
                "compression":  10,
                "shortValue":   5,
                "shortUnit":    "y",
                "abbr":         "2 Yr.",
                "tradingDays":  "1825",
                "length":       157680000,
                "corLimit":     0.80
            }
        },

        // The amount of time in seconds when the bar data expires
        "chartDataExp": 3600,

        // At what percent of missing data should the number of ticks be corrected
        "chartTickCorrection": 0.2,

        // The ratio of height to width for given layout
        "chartHeightRatio": {
            "small": 0.5,
            "medium": 0.333
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

    // State of the market: 0=Unknown, 1=Open, 2=Closed, 3=Suspended
    app.marketState = 0;

    // Stack of visited paths from category down...used by back button
    app.paths = [];

    // Last 5 visited paths
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
