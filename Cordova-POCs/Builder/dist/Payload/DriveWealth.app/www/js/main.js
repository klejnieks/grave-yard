/*
 * DriveWealth html5-trader v#.#.#
 * http://www.drivewealth.com
 *
 * Copyright (c) 2014, Drivewealth, LLC
 *
 * Date: ####-##-##
 *
 * License
 */

// Configure requirejs
require.config({
	baseUrl: "js",
	
    config: {
       'moment': {
            noGlobal: true
        },
       'detepicker': {
            noGlobal: true
        },
       'pickdate': {
            noGlobal: true
       },
       'nprogress': {
            noGlobal: true
       }
    },
    paths: {
        // backbone and dependencies
        //'jquery':                       ["//ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min", '../lib/jquery/jquery'],
        'jquery':                       '../lib/jquery/dist/jquery',

        'underscore':                   '../lib/underscore/underscore',
        'backbone':                     '../lib/backbone/backbone',

        // require plugins
        'text':                         '../lib/requirejs-text/text',

        // foundation
        'foundation.core':              '../lib/foundation/js/foundation',

        // foundation vendor libs
        'jquery.cookie':                '../lib/foundation/js/vendor/jquery.cookie',
        'fastclick':                    '../lib/foundation/js/vendor/fastclick',
        'placeholder':                  '../lib/foundation/js/vendor/placeholder',

        // ladda button animations
        'ladda':                        '../lib/ladda/js/ladda',
        'spin':                         '../lib/ladda/js/spin',

        // jquery input tags
        'jquery.tags.input':            '../lib/jquery-tags-input/jquery.tagsinput',

        // numeral js
        'numeral':                      '../lib/numeral/numeral',

        // moment js
        'moment':                       '../lib/momentjs/moment',

        //datepicker
        'picker':                       '../lib/pickadate/lib/picker',
        'pickerDate':                   '../lib/pickadate/lib/picker.date',

        // bootstrap touchspin
        'touchspin':                    '../lib/touchspin/bootstrap-touchspin/bootstrap.touchspin',

        // crypto-js libraries
        'cryptojs':                     '../lib/cryptojs/lib/crypto',
        'SHA256':                       '../lib/cryptojs/lib/SHA256',

        // purl url parser
        'purl':                         '../lib/purl/purl',

        // ua parser
        'ua-parser':                    '../lib/ua-parser-js/src/ua-parser',

        // d3
        'd3':                           '../lib/d3/d3',

        // polyglot - i18n
        'polyglot':                     '../lib/polyglot/lib/polyglot',

        'nprogress':                    '../lib/nprogress/nprogress',

        // application constructors
        'App':                           'config',
        'App.Auth':                      'auth',
        'App.Libraries':                 'libs',
        'App.Router':                    'router',
        'App.Events':                    'events',
        'App.Views.AccountBrief':        'views/accountBrief',
        'App.Views.App':                 'views/app',
        'App.Views.Charts.Line':         'views/charts/line',
        'App.Views.Footer':              'views/footer',
        'App.Views.Goals':               'views/goals',
        'App.Views.GoalEdit':            'views/goalEdit',
        'App.Views.GoalDetail':          'views/goalDetail',
        'App.Views.Header':              'views/header',
        'App.Views.Helpers':             'views/helpers',
        'App.Views.Home':                'views/home',
        'App.Views.InstrumentDetail':    'views/instrumentDetail',
        'App.Views.InstrumentDetail.Allocation':  'views/instrumentDetail/allocation',
        'App.Views.InstrumentDetail.Order':       'views/instrumentDetail/order',
        'App.Views.InstrumentDetail.Research':    'views/instrumentDetail/research',
        'App.Views.Instruments':         'views/instruments',
        'App.Views.Landing':             'views/landing',
        'App.Views.Login':               'views/login',
        'App.Views.Message':             'views/message',
        'App.Views.Marketplace':        'views/marketplace',
        'App.Views.LearningMarkets':    'views/learningMarkets',
        'App.Views.OrderReview':         'views/orderReview',
        'App.Views.OrderConfirm':        'views/orderConfirm',
        'App.Views.PasswordReset':       'views/passwordReset',
        'App.Views.PasswordSet':         'views/passwordSet',
        'App.Views.Posts':               'views/posts',
        'App.Views.PostDetail':          'views/postDetail',
        'App.Views.Positions':           'views/positions',
        'App.Views.Profile':             'views/profile',
        'App.Views.ProfileAddDocument':  'views/profileAddDocument',
        'App.Views.ProfileAddDocuments': 'views/profileAddDocuments',
        'App.Views.ProfileEdit':         'views/profileEdit',
        'App.Views.Reports':             'views/reports',
        'App.Views.ReportsList':         'views/reportsList',
        'App.Views.Questions':           'views/questions',
        'App.Views.QuestionAdd':         'views/questionAdd',
        'App.Views.QuestionAddAnswer':   'views/questionAddAnswer',
        'App.Views.QuestionDetail':      'views/questionDetail',
        'App.Views.UserAdd':             'views/userAdd',
        'App.Views.ReportRedirect':      'views/landings/reportRedirect',
        'App.Views.SignUpOneClick':      'views/landings/signUpOneClick',
        'App.Views.Tags':                'views/tags',
        'App.Views.Tour':                'views/tour',
        'App.Models.Account':            'models/account',
        'App.Models.Analytics':          'models/analytics',
        'App.Models.Exception':          'models/exception',
        'App.Models.Favorite':           'models/favorite',
        'App.Models.FeatureToggle':      'models/featureToggle',
        'App.Models.Post':               'models/post',
        'App.Models.Goal':               'models/goal',
        'App.Models.Instrument':         'models/instrument',
        'App.Models.Order':              'models/order',
        'App.Models.Position':           'models/position',
        'App.Models.Question':           'models/question',
        'App.Models.Report':             'models/report',
        'App.Models.Tag':                'models/tag',
        'App.Models.User':               'models/user',
        'App.Models.UserSession':        'models/userSession',
        'App.Collections.Accounts':      'collections/accounts',
        'App.Collections.Favorites':     'collections/favorites',
        'App.Collections.FeatureToggles':'collections/featureToggles',
        'App.Collections.Posts':         'collections/posts',
        'App.Collections.Reports':       'collections/reports',
        'App.Collections.Instruments':   'collections/instruments',
        'App.Collections.Goals':         'collections/goals',
        'App.Collections.GoalPositions': 'collections/goalPositions',
        'App.Collections.Orders':        'collections/orders',
        'App.Collections.Positions':     'collections/positions',
        'App.Collections.Questions':     'collections/questions',
        'App.Collections.Tags':          'collections/tags'
    },
    shim: {
        'underscore': {
            exports: '_'
        },
        'backbone': {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        'foundation.core': {
            deps: [
                'jquery',
                'jquery.cookie',
                'fastclick',
                'placeholder'
            ],
            exports: 'Foundation'
        },
        'jquery.tags.input': {
            deps: [
                'jquery'
            ]
        },
        'placeholder': {
            deps: [
                'jquery'
            ],
            exports: 'Placeholders'
        },
        'numeral': {
            exports: 'numeral'
        },
        'ladda': {
            deps: [
                'spin'
            ],
            exports: 'Ladda'
        },
        'touchspin': {
            deps: [
                'jquery'
            ]
        },
        'SHA256': {
            deps: [
                'cryptojs'
            ],
            exports: 'Crypto'
        }
    }
});

require([
    'App.Libraries'
], function( ) {
    require([
        'jquery',
        'underscore',
        'backbone',
        'App',
        'App.Router',
        'App.Events',
        'App.Views.App',
        'App.Models.Analytics',
        'App.Models.User',
        'App.Models.UserSession',
        'App.Collections.Accounts',
        'App.Collections.Favorites',
        'App.Collections.FeatureToggles',
        'App.Collections.Posts',
        'App.Collections.Goals',
        'App.Collections.Instruments',
        'App.Collections.Orders',
        'App.Collections.Positions',
        'App.Collections.Reports',
        'App.Collections.Questions',
        'App.Collections.Tags',
        'ua-parser',
        'purl',
        'text!i18n/en_US.json',
        'foundation.core'
    //], function ( $, _, Backbone, App, AppRouter, AppEvents, AppView, AnalyticsModel, UserModel, UserSessionModel, FavoritesCollection, PostsCollection, PositionsCollection, TagsCollection, UAParser, purl, i18n_en_US ) {
    ], function ( $, _, Backbone, App, AppRouter, AppEvents, AppView, AnalyticsModel, UserModel, UserSessionModel, AccountsCollection, FavoritesCollection, FeatureTogglesCollection, PostsCollection, GoalsCollection, InstrumentsCollection, OrdersCollection, PositionsCollection, ReportsCollection, QuestionsCollection, TagsCollection, UAParser, purl, i18n_en_US ) {

          // Dynamically add favicon
          (function() {
              var link = document.createElement('link');
              link.type = 'image/png';
              link.rel = 'icon';
              // configured with partner json file
              link.href = App.config.cdn() + '/' + App.config.WLPID + '/' + App.config.companyLogoPath.WLP_Logo_Favicon;
              document.getElementsByTagName('head')[0].appendChild(link);
          }());
      
          alert("main.js IIFE has run");
          
          var updateSessionTime,
                campaign,
                queryParams,
                languageId,
                sessionEnv,
                languagePromise,
                languageLoaded,
                msg;

            // Attempt to report errors that bubble to window
            window.onerror = function ( msg, url, lineNumber ) {
                AppEvents.trigger("a::main::start::error", {
                    "showMessage": true,
                    "friendlyMessage": "Unknown Window Error",
                    "msg": "Uncaught window exception. " + msg
                });
            };

            try {

                // Initialize i18n helper
                App.polyglot = new Polyglot({
                    "phrases": JSON.parse( i18n_en_US ),
                    "locale": "en"
                });

                App.purl = purl( window.location.href );

                // Check for overrided session environment...load if not default
                try {
                    if ( typeof sessionStorage === 'object' ) {

                        sessionEnv = sessionStorage.getItem('sessionEnv');

                        // Check for passed in session key
                        if ( App.purl.param("sessionKey") ) {

                            sessionStorage.setItem( 'sessionKey', App.purl.param("sessionKey") );

                            sessionStorage.setItem( 'sessionTime', ( new Date( ) ).getTime() / 1000 );
                        }
                    }
                } catch ( e ) {
                    // do nothing
                }

                if ( sessionEnv && sessionEnv !== App.config.env ) {
                    App.setEnv( sessionEnv );
                }

                // Initialize router
                App.router = new AppRouter();

                // Initialize collections
                App.collections.orders = new OrdersCollection();

                App.collections.instruments = new InstrumentsCollection();

                App.collections.positions = new PositionsCollection();

                App.collections.goals = new GoalsCollection();

                App.collections.favorites = new FavoritesCollection();

                App.collections.featureToggles = new FeatureTogglesCollection();

                App.collections.accounts = new AccountsCollection();

                // Holds educational content
                App.collections.posts = new PostsCollection();

                App.collections.questions = new QuestionsCollection();

                App.collections.tags = new TagsCollection();

                // Initialize user
                App.models.userSession = new UserSessionModel();

                App.models.user = new UserModel();

                alert("app has completed creating most classes it needs");
                
                // Create a throttled function for updating session time
                updateSessionTime = Foundation.utils.debounce( App.models.userSession.updateSessionTime, 3000, true );

                // Listen for global ajax success events and update session time
                $(document).on( "ajaxSuccess", function( e, jqXHR, options ){
                    if( App.models.userSession.loggedIn() && options.url.search(/heartbeat/) == -1) {
                        updateSessionTime();
                    }
                });

                // Default layout to unauthorized
                App.authType = "Unauth";

                // Initialize application view
                App.views.App = new AppView({
                    el: '#app'
                });

                alert("app has created first app view");
                
                // Check for cookied preferences
                App.preferences = App.views.App.getPreferences( );

                // Normally I would use the purl library here for the query params.  But since we will NOT be
                // receiving url encoded query strings on one-click signup (thanks marketing), I have to use a
                // less strict regex to parse.
                queryParams = App.getParams( );

                if ( App.config.buildType === "phonegap" ) {

                    if ( App.preferences.languageID ) {

                        // Has a language been set in preferences
                        languageId = App.preferences.languageID;

                    } else {

                        // Attempt to get the language from the device
                        languagePromise = App.getDeviceLocale( )
                        .done( function( languageId ) {

                            App.models.userSession.loadLanguage( languageId );

                            App.models.user.set("languageID", languageId );
                        });
                    }
                } else {
                    // Set language if cookied or passed in as query param
                    if ( queryParams["lang"] ) {
                        languageId = queryParams["lang"][0];
                    } else if ( App.preferences.languageID ) {
                        languageId = App.preferences.languageID;
                    }
                }

                if ( languageId ) {

                    languageLoaded = App.models.userSession.loadLanguage( languageId );

                    App.models.user.set("languageID", languageId );
                }

                // Check for special message param
                msg = App.purl.param("msg");

                $.when( !languageId || languageLoaded ) 
                    .done( function( ) {
                        if ( msg && msg === "upload" ) {
                            App.views.App.postRenderAlert({
                                "type": "alert",
                                "friendlyMsg": App.polyglot.t("msg_login_upload_docs")
                            });
                        }
                    });

                // Parse user agent
                App.uaParser = new UAParser( );

                App.userAgent = App.uaParser.getResult( );

                // Check for campaign params and set cookie
                App.campaign = App.views.App.getPreferences("camp");

                // Setup analytics
                App.analytics = new AnalyticsModel();

                if ( queryParams["utm_campaign"] ) {

                    campaign = {
                        "utm_campaign":  queryParams["utm_campaign"][0],
                        "utm_content":   queryParams["utm_content"] ? queryParams["utm_content"][0] : "",
                        "utm_medium":    queryParams["utm_medium"] ? queryParams["utm_medium"][0] : "",
                        "utm_source":    queryParams["utm_source"] ? queryParams["utm_source"][0] : "",
                        "utm_term":      queryParams["utm_term"] ? queryParams["utm_term"][0] : ""
                    };

                    App.campaign = campaign;

                    App.views.App.setCookie( "camp", JSON.stringify( campaign ) );
                }

                // Check for facebook pixel tracking campaign...store as cookie
                if ( App.config.buildType !== "phonegap" && App.purl.param("fb_camp") ) {
                    App.views.App.setCookie( "fb_camp", App.purl.param("fb_camp") );
                }

                // Extend backbone view with a method to remove tooltips
                Backbone.View.prototype.removeToolTips = function( ) {
                    this.$("div[data-tooltip][data-selector]").each(function( index ){
                       $("span[data-selector=\"" +  $(this).attr("data-selector") + "\"]").remove();
                    });
                };
                
                Backbone.View.prototype.close = function() {
                	console.log("IM CLOSING NOW.... NOOOOOOO!");
                }

            } catch ( e ) {
            	alert("Some error happened: " + e.stack);
                //-->TODO:  Redirect page to general error message
                AppEvents.trigger("a::main::start::error", {
                    "showMessage": true,
                    "friendlyMsg": App.polyglot.t("main_unknown"),
                    "msg": "Error occurred during app initialization." + ( e.toString ? e.toString( ) : "" ),
                    "stack": e.stack ? e.stack : ""
                });

                return;
            }

            $.when( languageId || languagePromise )
            .always( function( ) {

                Backbone.history.start({ pushState: ( Modernizr.history ? true : false ), root: '/' });

                if ( App.views.App.getCookie("sela") && App.router.view === "landing" ) {
                    // User has logged in before...foward to login
                    App.router.navigate( "/login", { "trigger": true } );
                } else if ( App.config.buildType === "phonegap" ) {
                    App.router.navigate( "/", { "trigger": true } );
                }
            });
    });
});
