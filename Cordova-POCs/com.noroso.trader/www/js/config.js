// Global application registry.  Contains config info and other shared resources
define([], function () {

    var app = {},
    host = window.location && typeof window.location.hostname !== "undefined" ? window.location.hostname.split(".") : "",
    domain = host ? host[ host.length -1 ] : "",
    buildType = "APP_BUILD_TYPE",
    env = ( ( domain && domain === "com" ) || buildType === "phonegap" ) ? "PROD" : "UAT",
    endpoints = {
        api: {
            UAT:   "http://api.drivewealth.io",
            PROD:  "https://api.drivewealth.net"
        },
        cdn: {
            UAT:   "http://syscdn.drivewealth.io",
            PROD:  "https://d3an3cesqmrf1x.cloudfront.net"
        },
        applicationLink: {
            UAT:   "https://fs24.formsite.com/DriveWealth/uat-online-app-en_US/fill?id160=",
            PROD:  "https://fs24.formsite.com/DriveWealth/online-app-en_US/fill?id160="
        },
        report: {
            UAT:   "http://reports.drivewealth.io/DriveWealth",
            PROD:  "https://reports.drivewealth.net/DriveWealth"
        },
        externalDomain: {
            UAT:   "http://you.drivewealth.io",
            PROD:  "https://you.drivewealth.com"
        },
        appsDomain: {
          UAT:   "http://apps.drivewealth.io",
          PROD:  "https://apps.drivewealth.com"
        }
    };

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

        "rootURL": "ROOT_URL",

        "externalRootURL": (function( ){
            return buildType === "phonegap" ? "https://you.drivewealth.com/" : "/";
        })( ),

        "appRoot": ( buildType === "phonegap" ? ( cordova.file.applicationDirectory + "www/" ) : "/" ),

        // Define the media queries used to determine layout
        "targetSizes" : {
            "small":    "only screen and (max-width: 40em)",
            "medium":   "only screen and (min-width: 40.063em)"
        },

        // Active languages
        "languages" : [
            {
                "languageID":  "en_US",
                "nameEnglish": "English",
                "nameNative":  "English",
                "langCode":    "en"
            },
            {
                "languageID":   "zh_CN",
                "nameEnglish":  "Chinese",
                "nameNative":   "简体中文",
                "langCode":     "zh"
            },
            {
                "languageID":   "es_ES",
                "nameEnglish":  "Spanish",
                "nameNative":   "Español",
                "langCode":     "es"
            },
            {
                "languageID":   "pt_BR",
                "nameEnglish":  "Portuguese",
                "nameNative":   "Português",
                "langCode":     "pt"
            }
        ],

        // Active countries
        "countries": [{"ID":"AFG","name":"Afghanistan"},{"ID":"ALA","name":"Aland Islands"},{"ID":"ALB","name":"Albania"},{"ID":"DZA","name":"Algeria"},{"ID":"ASM","name":"American Samoa"},{"ID":"AND","name":"Andorra"},{"ID":"AGO","name":"Angola"},{"ID":"AIA","name":"Anguilla"},{"ID":"ATA","name":"Antarctica"},{"ID":"ATG","name":"Antigua and Barbuda"},{"ID":"AGR","name":"Argentina"},{"ID":"ARG","name":"Argentina"},{"ID":"ARM","name":"Armenia"},{"ID":"ABW","name":"Aruba"},{"ID":"AUS","name":"Australia"},{"ID":"AUT","name":"Austria"},{"ID":"AZE","name":"Azerbaijan"},{"ID":"BHS","name":"Bahamas"},{"ID":"BHR","name":"Bahrain"},{"ID":"BGD","name":"Bangladesh"},{"ID":"BRB","name":"Barbados"},{"ID":"BEL","name":"Belgium"},{"ID":"BLZ","name":"Belize"},{"ID":"BEN","name":"Benin"},{"ID":"BMU","name":"Bermuda"},{"ID":"BTN","name":"Bhutan"},{"ID":"BOL","name":"Bolivia"},{"ID":"BIH","name":"Bosnia and Herzegovina"},{"ID":"BWA","name":"Botswana"},{"ID":"BRA","name":"Brazil"},{"ID":"IOT","name":"British Indian Ocean Territory"},{"ID":"VGB","name":"British Virgin Islands"},{"ID":"BRN","name":"Brunei"},{"ID":"BGR","name":"Bulgaria"},{"ID":"BFA","name":"Burkina Faso"},{"ID":"BDI","name":"Burundi"},{"ID":"KHM","name":"Cambodia"},{"ID":"CMR","name":"Cameroon"},{"ID":"CAN","name":"Canada"},{"ID":"Can","name":"Canada"},{"ID":"CPV","name":"Cape Verde"},{"ID":"CYM","name":"Cayman Islands"},{"ID":"CAF","name":"Central African Republic"},{"ID":"TCD","name":"Chad"},{"ID":"CHL","name":"Chile"},{"ID":"CHN","name":"China"},{"ID":"CXR","name":"Christmas Island"},{"ID":"CCK","name":"Cocos (Keeling) Islands"},{"ID":"COL","name":"Colombia"},{"ID":"COM","name":"Comoros"},{"ID":"COK","name":"Cook Islands"},{"ID":"CRC","name":"Costa Rica"},{"ID":"HRV","name":"Croatia"},{"ID":"CYP","name":"Cyprus"},{"ID":"CZE","name":"Czech Republic"},{"ID":"DNK","name":"Denmark"},{"ID":"DJI","name":"Djibouti"},{"ID":"DMA","name":"Dominica"},{"ID":"DOM","name":"Dominican Republic"},{"ID":"ECU","name":"Ecuador"},{"ID":"EGY","name":"Egypt"},{"ID":"SLV","name":"El Salvador"},{"ID":"GNQ","name":"Equatorial Guinea"},{"ID":"ERI","name":"Eritrea"},{"ID":"EST","name":"Estonia"},{"ID":"ETH","name":"Ethiopia"},{"ID":"FLK","name":"Falkland Islands"},{"ID":"FRO","name":"Faroe Islands"},{"ID":"FJI","name":"Fiji"},{"ID":"FIN","name":"Finland"},{"ID":"FRA","name":"France"},{"ID":"PYF","name":"French Polynesia"},{"ID":"GAB","name":"Gabon"},{"ID":"GMB","name":"Gambia"},{"ID":"GEO","name":"Georgia"},{"ID":"DEU","name":"Germany"},{"ID":"GHA","name":"Ghana"},{"ID":"GIB","name":"Gibraltar"},{"ID":"GRC","name":"Greece"},{"ID":"GRL","name":"Greenland"},{"ID":"GRD","name":"Grenada"},{"ID":"GUM","name":"Guam"},{"ID":"GTM","name":"Guatemala"},{"ID":"GIN","name":"Guinea"},{"ID":"GNB","name":"Guinea-Bissau"},{"ID":"GUY","name":"Guyana"},{"ID":"HTI","name":"Haiti"},{"ID":"VAT","name":"Holy See (Vatican City)"},{"ID":"HND","name":"Honduras"},{"ID":"HKG","name":"Hong Kong"},{"ID":"HUN","name":"Hungary"},{"ID":"ISL","name":"Iceland"},{"ID":"IND","name":"India"},{"ID":"IDN","name":"Indonesia"},{"ID":"IRL","name":"Ireland"},{"ID":"IMN","name":"Isle of Man"},{"ID":"ISR","name":"Israel"},{"ID":"ITA","name":"Italy"},{"ID":"CIV","name":"Ivory Coast"},{"ID":"JAM","name":"Jamaica"},{"ID":"JPN","name":"Japan"},{"ID":"JEY","name":"Jersey"},{"ID":"JOR","name":"Jordan"},{"ID":"KAZ","name":"Kazakhstan"},{"ID":"KEN","name":"Kenya"},{"ID":"KIR","name":"Kiribati"},{"ID":"KWT","name":"Kuwait"},{"ID":"KGZ","name":"Kyrgyzstan"},{"ID":"LAO","name":"Laos"},{"ID":"LVA","name":"Latvia"},{"ID":"LSO","name":"Lesotho"},{"ID":"LBR","name":"Liberia"},{"ID":"LIE","name":"Liechtenstein"},{"ID":"LTU","name":"Lithuania"},{"ID":"LUX","name":"Luxembourg"},{"ID":"MAC","name":"Macau"},{"ID":"MKD","name":"Macedonia"},{"ID":"MDG","name":"Madagascar"},{"ID":"MWI","name":"Malawi"},{"ID":"MYS","name":"Malaysia"},{"ID":"MDV","name":"Maldives"},{"ID":"MLI","name":"Mali"},{"ID":"MLT","name":"Malta"},{"ID":"MHL","name":"Marshall Islands"},{"ID":"MRT","name":"Mauritania"},{"ID":"MUS","name":"Mauritius"},{"ID":"MYT","name":"Mayotte"},{"ID":"MEX","name":"Mexico"},{"ID":"FSM","name":"Micronesia"},{"ID":"MDA","name":"Moldova"},{"ID":"MCO","name":"Monaco"},{"ID":"MNG","name":"Mongolia"},{"ID":"MNE","name":"Montenegro"},{"ID":"MSR","name":"Montserrat"},{"ID":"MAR","name":"Morocco"},{"ID":"MOZ","name":"Mozambique"},{"ID":"NAM","name":"Namibia"},{"ID":"NRU","name":"Nauru"},{"ID":"NPL","name":"Nepal"},{"ID":"NLD","name":"Netherlands"},{"ID":"ANT","name":"Netherlands Antilles"},{"ID":"NCL","name":"New Caledonia"},{"ID":"NZL","name":"New Zealand"},{"ID":"NIC","name":"Nicaragua"},{"ID":"NER","name":"Niger"},{"ID":"NGA","name":"Nigeria"},{"ID":"NIU","name":"Niue"},{"ID":"NFK","name":"Norfolk Island"},{"ID":"MNP","name":"Northern Mariana Islands"},{"ID":"NOR","name":"Norway"},{"ID":"OMN","name":"Oman"},{"ID":"PAK","name":"Pakistan"},{"ID":"PLW","name":"Palau"},{"ID":"PAN","name":"Panama"},{"ID":"PNG","name":"Papua New Guinea"},{"ID":"PRY","name":"Paraguay"},{"ID":"PER","name":"Peru"},{"ID":"PHL","name":"Philippines"},{"ID":"PCN","name":"Pitcairn Islands"},{"ID":"POL","name":"Poland"},{"ID":"PRT","name":"Portugal"},{"ID":"PRI","name":"Puerto Rico"},{"ID":"QAT","name":"Qatar"},{"ID":"COG","name":"Republic of the Congo"},{"ID":"ROU","name":"Romania"},{"ID":"RUS","name":"Russia"},{"ID":"RWA","name":"Rwanda"},{"ID":"BLM","name":"Saint Barthelemy"},{"ID":"SHN","name":"Saint Helena"},{"ID":"KNA","name":"Saint Kitts and Nevis"},{"ID":"LCA","name":"Saint Lucia"},{"ID":"MAF","name":"Saint Martin"},{"ID":"SPM","name":"Saint Pierre and Miquelon"},{"ID":"VCT","name":"Saint Vincent and the Grenadines"},{"ID":"WSM","name":"Samoa"},{"ID":"SMR","name":"San Marino"},{"ID":"STP","name":"Sao Tome and Principe"},{"ID":"SAU","name":"Saudi Arabia"},{"ID":"SEN","name":"Senegal"},{"ID":"SRB","name":"Serbia"},{"ID":"SYC","name":"Seychelles"},{"ID":"SLE","name":"Sierra Leone"},{"ID":"SGP","name":"Singapore"},{"ID":"SVK","name":"Slovakia"},{"ID":"SVN","name":"Slovenia"},{"ID":"SLB","name":"Solomon Islands"},{"ID":"ZAF","name":"South Africa"},{"ID":"KOR","name":"South Korea"},{"ID":"ESP","name":"Spain"},{"ID":"LKA","name":"Sri Lanka"},{"ID":"SUR","name":"Suriname"},{"ID":"SJM","name":"Svalbard"},{"ID":"SWZ","name":"Swaziland"},{"ID":"SWE","name":"Sweden"},{"ID":"CHE","name":"Switzerland"},{"ID":"TWN","name":"Taiwan"},{"ID":"TJK","name":"Tajikistan"},{"ID":"TZA","name":"Tanzania"},{"ID":"THA","name":"Thailand"},{"ID":"TLS","name":"Timor-Leste"},{"ID":"TGO","name":"Togo"},{"ID":"TKL","name":"Tokelau"},{"ID":"TON","name":"Tonga"},{"ID":"TTO","name":"Trinidad and Tobago"},{"ID":"TUN","name":"Tunisia"},{"ID":"TUR","name":"Turkey"},{"ID":"TKM","name":"Turkmenistan"},{"ID":"TCA","name":"Turks and Caicos Islands"},{"ID":"TUV","name":"Tuvalu"},{"ID":"VIR","name":"US Virgin Islands"},{"ID":"UGA","name":"Uganda"},{"ID":"UKR","name":"Ukraine"},{"ID":"ARE","name":"United Arab Emirates"},{"ID":"GBR","name":"United Kingdom"},{"ID":"USA","name":"United States"},{"ID":"URY","name":"Uruguay"},{"ID":"UZB","name":"Uzbekistan"},{"ID":"VUT","name":"Vanuatu"},{"ID":"VEN","name":"Venezuela"},{"ID":"VNM","name":"Vietnam"},{"ID":"WLF","name":"Wallis and Futuna"},{"ID":"ESH","name":"Western Sahara"},{"ID":"ZMB","name":"Zambia"}],

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
            newEnv = ( ( domain && domain === "com" ) || buildType === "phonegap" ) ? "PROD" : "UAT";
        }

        if ( newEnv !== "UAT" && newEnv !== "PROD" ) {
            return;
        }

        env = newEnv;

        return newEnv;
    };

    app.getDeviceLocale = function ( ) {

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

    return app;
});
