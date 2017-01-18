// Filename: /js/models/userSession.js
define([
    'backbone',
    'App',
    'App.Events',
    'SHA256',
    'purl',
    'text!i18n/en_US.json'
], function( Backbone, App, AppEvents, Crypto, purl, i18n_en_US ) {

    var UserSessionModel = Backbone.Model.extend({

        idAttribute: 'userID',

        defaults: {
            "commissionRate":  2.99,
            "forceRefresh":    false,
            "languageID":      App.config.defaultLanguageID,
            "processed":       false
        },

        languageID: null,

        languageLoaded: false,

        url: function( options ) {

            options = options || {};

            // Only append key if useKey option not set to false and sessionKey exists
            var useKey = options.useKey !== false && this.get("sessionKey") ? true : false;

            return App.config.api( ) + '/v1/userSessions/' + ( useKey ? this.get("sessionKey") : "" );
        },

        // Use this to clear heartbeat interval on logout
        heartBeatInterval: null,

        // Use this to clear quotes refresh interval
        quotesInterval: null,

        // Store the hashed last account id here
        hashAcct: null,

        initialize: function( options ) {

            var sessionKey,
                sessionTime,
                sessionEnv,
                currentTime = (new Date()).getTime() / 1000,
                referral;

            this.type = "userSession";

            // Check for required App objects
            if ( typeof App.collections.positions === 'undefined' ) {
                throw new UserSessionModelException("Models :: User :: Positions collection is required");
            }

            if ( typeof App.collections.orders === 'undefined' ) {
                throw new UserSessionModelException("Models :: User :: Orders collection is required");
            }

            if ( typeof App.collections.goals === 'undefined' ) {
                throw new UserSessionModelException("Models :: User :: Goals collection is required");
            }

            if ( typeof App.collections.favorites === 'undefined' ) {
                throw new UserSessionModelException("Models :: User :: Favorites collection is required");
            }

            _.bindAll( this, 'loadUserData', 'userLoadError', 'loginUser', "updateSessionTime", "heartBeat");

            try { 

                // Check for existing session key
                if ( typeof sessionStorage === 'object' ) {

                    sessionKey = sessionStorage.getItem('sessionKey');
                    sessionTime = +sessionStorage.getItem('sessionTime');
                    sessionEnv = sessionStorage.getItem('sessionEnv');

                    if ( currentTime < ( sessionTime + App.config.sessionTimeout ) ) {

                        // Key is still active...set in model
                        this.set( 'sessionKey', sessionKey );

                        // Retrieve user data
                        //this.refreshUser();

                        AppEvents.trigger('user:sessionfound');
                    } else {

                        // Remove session info from storage
                        sessionStorage.removeItem('sessionKey');
                        sessionStorage.removeItem('sessionTime');
                        sessionStorage.removeItem('sessionEnv');
                    }

                }

            } catch( e ) {

                AppEvents.trigger("m::userSession::initialize::warning", {
                    "msg": "Session storage error. " + ( e.name ? e.name + " " : "" ) + ( e.message ? e.message : "" ) 
                });
            }

            //--> TODO: Move cookie logic out of app view so it's accessible here during initialization

            // Check for last account id
            if ( App.config.buildType === "phonegap" ) {
                this.hashAcct = window.localStorage.getItem("sela");
            } else {
                this.hashAcct = $.cookie("sela");
            }

            // Check for referral code on querystring
            referral = purl( window.location.href ).param("r");

            // Check cookie if not on querystring
            if ( !referral ) {
                if ( App.config.buildType === "phonegap" ) {
                    referral = window.localStorage.getItem("r");
                } else {
                    referral = $.cookie("r");
                }
            }

            if ( referral ) {

                // Update model
                this.set( "referralCode", referral );

                // Set cookie with referral code
                if ( App.config.buildType === "phonegap" ) {

                    window.localStorage.removeItem( "r" );

                    window.localStorage.setItem( "r", referral );
                } else {
                    $.cookie( "r", referral, { "expires": 60, "path": "/" } );
                }

            }
        },

        //--> TODO: abstract away response check from this
        loadUserData: function( response ) {

            var loginState,
                account;

            if ( typeof response !== 'object' ) {

                this.userLoadError();
                return;
            }

            // Check for success
            if ( response.hasOwnProperty('loginState') ) {

                loginState = response.loginState;

                if ( loginState !== 1 ) {

                    this.userLoadError();
                    return;
                }
            }

            // Check for account info
            if ( !response.hasOwnProperty('accounts') || !$.isArray( response.accounts ) || response.accounts.length < 1 ) {
                this.userLoadError();
                return;
            }

            this.updateSessionTime();

            try {

                // Set session key in local storage if it exists 
                if ( typeof sessionStorage === 'object' ) {
                    sessionStorage.setItem( 'sessionKey', response.sessionKey );
                }

            } catch( e ) {

                AppEvents.trigger("m::userSession::loadUserData::warning", {
                    "msg": "Session storage error. Unable to set key."  + ( e.name ? e.name + " " : "" ) + ( e.message ? e.message : "" )
                });
            }

            // Initiate quotes refresh
            if ( App.config.quotesRefreshRate > 0 ) {
                this.quotesInterval = window.setInterval( App.collections.instruments.refreshQuotes, App.config.quotesRefreshRate );
            }

            // Reset instruments collection
            App.collections.instruments.reset( App.models.userSession.get('instruments') );

            // Set accounts
            App.collections.accounts.reset( this.get('accounts') );

            // Set last selected...default to first in collection
            if ( this.hashAcct ) {
                account = App.collections.accounts.find( function( acct ){
                    return Crypto.SHA256( acct.get("accountID") ) === this.hashAcct;
                }, this);
            }

            if ( !account ) {
                account = App.collections.accounts.at( 0 );
            }

            this.setAccount( account );

            AppEvents.trigger('user:loaded');

            // Initialize heartbeat
            this.heartBeatInterval = window.setInterval( App.models.userSession.heartBeat, App.config.heartBeatRefreshRate );

            return true;
        },

        userLoadError: function() {

            AppEvents.trigger('user:error', {
                "msg": "User error."
            });
        },

        setAccount: function( account ) {

            App.models.account = account;

            // Load positions
            App.collections.positions.reset( account.get("positions") );

            // Load pending orders
            App.collections.orders.reset( account.get("orders") );

            // Load goals
            App.collections.goals.reset( account.get("goals") );

            // Set a cookie with the selected account id
            App.views.App.setCookie("sela", Crypto.SHA256( account.get("accountID") ), { "expires": 365, "path": "/" } );

            // Attempt to save last account id as user setting...do not wait
            App.models.user.syncSetting( "lastAccountID", account.get("accountID") );

            AppEvents.trigger("account:set");
        },

        loginUser: function( data ) {

            var screenRes = '',
                languageID = data.languageID ? data.languageID : App.config.defaultLanguageID;

            if ( typeof data === 'object' && 'username' in data && 'password' in data ) {

                //--> TODO: get user agent and window details

                if ( typeof window.screen == 'object' && window.screen.height && window.screen.width ) {
                    screenRes = window.screen.width + 'x' + window.screen.height;
                }
            }

            if ( data.env ) {
                try {
                    if ( typeof sessionStorage === 'object' ) {
                        sessionStorage.setItem( "sessionEnv", data.env );
                    }
                } catch( e ) {
                    // do nothing
                }
            }

            // Set the session language ID
            this.set( "languageID", languageID );

            return this.processUser( "login", {
                url: this.url( { "useKey": false } ),
                data: JSON.stringify({
                    "appTypeID":        "26",
                    "appVersion":       App.config.version,
                    "emailAddress":     data.username,
                    "ipAddress":        "1.1.1.1",
                    "languageID":       data.languageID ? data.languageID : "en_US",
                    "osType":           App.userAgent.os ? App.userAgent.os.name : "Unknown",
                    "osVersion":        App.userAgent.os ? App.userAgent.os.version : "Unknown",
                    "password":         data.password,
                    "scrRes":           screenRes,
                    "username":         data.username
                }),
                type: 'POST',
                contentType: 'application/json',
                accepts: 'application/json',
                processData: false,
                context: this,
                headers: {
                    "accept": "application/json"
                }
            });
        },

        refreshUser: function( ) {

            return this.processUser( "refresh", {
                url:          this.url(),
                //url:          '/data/userSession.json',
                type:         'GET',
                contentType:  'application/json',
                accepts:      'application/json',
                processData:  false,
                context:      this,
                headers: {
                    "accept": "application/json",
                    "x-mysolomeo-session-key": this.get("sessionKey")
                }
            });
        },

        // Returns a jquery promise...success on user refresh/login and data loading
        processUser: function( type, options ) {

            var userDeferred =  $.Deferred(),
                sessionKey =    this.get('sessionKey'),
                _this = this,
                userPromise,
                timer,
                timingVar;

            if ( type === "refresh" && typeof sessionKey === 'undefined' ) {

                userDeferred.rejectWith( _this, [null, "error", "Session key could not be found"] );

            } else {

                if ( App.engageTimer( App.config.apiTimerCaptureRate ) ) {

                    // Track api time
                    timingVar = ( type == "refresh" ) ? "GET /v1/userSessions/{sessionKey}" : "POST /v1/userSessions";

                    timer = new App.Timer( "API", timingVar );
                }

                userPromise = $.ajax( options )
                .then(
                    function( data, textStatus, jqXHR ) {

                        var languageID,
                            languagePromise = true;

                        if ( timer ) {
                            timer.end( "success" );
                        }

                        if ( !data ){
                            _this.userLoadError();
                            return;
                        }

                        _this.set( data );

                        if ( type === "login" ) {
                            // Remove campaign codes
                            App.views.App.removeCampaign( );
                        }

                        // Set cookie with referral code
                        App.views.App.setCookie( "r", _this.get("referralCode"), { "expires": 60, "path": "/" } );

                        languageID = _this.get("languageID");

                        if ( languageID ) {
                            // Load in language files if necessary
                            languagePromise = _this.loadLanguage( languageID );
                        }

                        // Attempt to load in the last viewed account if it's not cookied
                        $.when( ( _this.hashAcct || App.models.user.syncSetting("lastAccountID") ) && languagePromise )
                        .then(
                            function( lastAcctResponse ) {

                                if ( _.isObject( lastAcctResponse ) && lastAcctResponse.value ) {
                                    // Last account id was retrieved from user settings
                                    _this.hashAcct = Crypto.SHA256( lastAcctResponse.value );
                                }
                            }
                        )
                        .always(
                            function( ) {
                                isLoaded = _this.loadUserData( data );

                                if ( !isLoaded ) {
                                    userDeferred.rejectWith( _this, [jqXHR, "error", "User loading error"] );
                                } else {

                                    _this.set( "forceRefresh", false );

                                    // Load the favorites, the user profile data and the last account viewed
                                    $.when(
                                        App.collections.favorites.fetch(),
                                        App.models.user.fetch(),
                                        App.collections.featureToggles.fetch(),
                                        App.models.user.loadRecentInstruments( ),
                                        App.models.user.loadWatchList( )
                                    )
                                    .then(
                                        function( favoritesResponse, userResponse ) {

                                            _this.set( "processed", true );

                                            userDeferred.resolveWith( _this, [data], null );

                                            AppEvents.trigger("userSession:processed");
                                        },
                                        function( jqXHR, textStatus, errorThrown ) {
                                            userDeferred.rejectWith( _this, [jqXHR, "error", "Favorites loading error. [" + errorThrown + "]"] );
                                        }
                                    );

                                }
                            }
                        );

                    },
                    function( jqXHR, textStatus, errorThrown ) {

                        var msg = "";

                        if ( timer ) {
                            timer.end( "fail" );
                        }

                        if ( jqXHR.status === 401 ) {

                            AppEvents.trigger( "m::userSession::processUser::error", {
                                msg: "The user is not authorized. [status: " + jqXHR.status + " error: " + errorThrown + "]"
                            });

                            AppEvents.trigger("userSession:unauthorized", {
                                msg:   "User is not authorized"
                            });

                        } else {

                            if ( jqXHR.status >= 500 ) {
                                msg = "API Error";
                            }

                            AppEvents.trigger( "m::userSession::processUser::error", {
                                msg: "The user could not be loaded. " + msg + " [status: " + jqXHR.status + " error: " + errorThrown + "]"
                            });
                        }

                        userDeferred.rejectWith( this, [jqXHR, "error", "The user could not be loaded"] );
                    }
                );
            }

            return userDeferred.promise();
        },

        // Returns true if user has valid session key and session data is loaded
        loggedIn: function( ) {

            if ( !this.get("sessionKey") || !this.get("userID") || !this.get("processed") ) {
                return false;
            }

            return true;
        },

        logoutUser: function( ) {

            var logoutDeferred = $.Deferred(),
                timer;

            if ( App.engageTimer( App.config.apiTimerCaptureRate ) ) {
                timer = new App.Timer( "API", "DELETE /v1/userSessions/{ID}" );
            }

            $.ajax({
                url: this.url(),
                type: "DELETE",
                dataType: "text",
                contentType:    'application/json',
                accepts:        'application/json',
                context:        this,
                headers: {
                    "accept":                   "application/json",
                    "x-mysolomeo-session-key":  this.get("sessionKey")
                }

            })
            .done( function( data, textStatus, jqXHR ) {

                if ( timer ) {
                    timer.end( "success" );
                }

                App.views.App.clearUserData();

                logoutDeferred.resolveWith( this, [ this.toJSON(), "success", jqXHR ] );
            })
            .fail( function( jqXHR, textStatus, errorThrown ) {

                if ( timer ) {
                    timer.end( "fail" );
                }

                AppEvents.trigger("m::userSession::logoutUser::error", {
                    "msg": "Unable to logout user. [status: " + jqXHR.status + " error: " + errorThrown + "]"
                });

                App.views.App.clearUserData();

                logoutDeferred.rejectWith( this, [ jqXHR, "error", "Failed logout. [" + textStatus + ": " + errorThrown + "]" ] );
            })
            .always( function( ) {

                // Remove campaign codes
                App.views.App.removeCampaign( );
            });

            return logoutDeferred;
        },

        clearUser: function( ) {

            var sessionEnv;

            // remove session key and time from session storage
            try {
                if ( typeof sessionStorage === 'object' ) {

                    sessionEnv = sessionStorage.getItem("sessionEnv");

                    if ( sessionEnv ) {
                        // Reset default environment
                        App.setEnv( );
                    }

                    sessionStorage.removeItem( 'sessionKey' );

                    sessionStorage.removeItem( 'sessionTime' );

                    sessionStorage.removeItem( 'sessionEnv' );
                }

            } catch( e ) {

                AppEvents.trigger("m::userSession::clearUser::warning", {
                    "msg": "Session storage error. Unable to remove key." + ( e.name ? e.name + " " : "" ) + ( e.message ? e.message : "" )
                });
            }

            // remove all user data attributes from the model
            this.clear();

            this.set( this.defaults );

            this.languageLoaded = null;

            window.clearInterval( this.heartBeatInterval );

            window.clearInterval( this.quotesInterval );
        },

        heartBeat: function( ) {

            var sessionTime = this.get("sessionTime"),
                sessionKey = this.get("sessionKey"),
                currentTime = ( new Date() ).getTime() / 1000,
                timer;

            // Check if user's session has timed out
            if ( ( currentTime - sessionTime ) > ( App.config.sessionTimeout / 1000 ) ) {

                App.views.App.clearUserData();

                AppEvents.trigger("userSession:timeout", {
                    msg:   "User's session has timed out."
                });

                return;
            }

            if ( sessionKey ) {

                if ( App.engageTimer( App.config.apiTimerCaptureRate ) ) {
                    timer = new App.Timer( "API", "PUT /v1/userSessions/{ID}?action=heartbeat" );
                }

                // Can't use model save here because it will send all of the user session data
                $.ajax({
                    "url": this.url() + "?action=heartbeat",
                    "context": this,
                    "dataType": "text",
                    "type": "PUT",
                    "contentType": 'application/json',
                    "accepts": 'application/json',
                    "processData": false,
                    headers: {
                        "accept": "application/json",
                        "x-mysolomeo-session-key": sessionKey
                    }
                })
                .done( function( data, textStatus, jqXHR ) {

                    var sessionTime = this.updateSessionTime();

                    if ( timer ) {
                        timer.end( "success" );
                    }

                    AppEvents.trigger("userSession:heartbeat", {
                        msg:   "Heartbeat submitted",
                        data:  { "sessionTime": sessionTime }
                    });
                })
                .fail( function( jqXHR, textStatus, errorThrown ) {

                    if ( timer ) {
                        timer.end( "fail" );
                    }

                    if ( jqXHR.status === 401 ) {
                        // User is unauthorized...clear the user data
                        App.views.App.clearUserData();

                        AppEvents.trigger("userSession:unauthorized", {
                            msg:   "User is not authorized",
                            data:  jqXHR
                        });
                    }

                    AppEvents.trigger("m::userSession::heartBeat::error", {
                        msg:   "Heartbeat failure. [status: " + jqXHR.status + " error: " + errorThrown + "]",
                        data:  jqXHR
                    });
                });
            }
        },

        updateSessionTime: function( ) {

            var sessionTime = (new Date()).getTime() / 1000;

            this.set( "sessionTime", sessionTime );

            // Set local storage if it exists 
            try { 

                if ( typeof sessionStorage === "object" ) {
                    sessionStorage.setItem( 'sessionTime', sessionTime );
                }

            } catch( e ) {

                AppEvents.trigger("m::userSession::updateSessionTime::warning", {
                    "msg": "Session storage error. Unable to set session time. " + ( e.name ? e.name + " " : "" ) + ( e.message ? e.message : "" )  
                });
            }

            return sessionTime;
        },

        loadLanguage: function( languageID ) {

            var loadDeferred = $.Deferred(),
                _this = this,
                languageFilePath;

            if ( !this.languageLoaded || languageID !== this.languageID ) {

                this.languageID = languageID;

                try {

                    App.polyglot.replace( JSON.parse( i18n_en_US ) );

                    App.polyglot.locale("en");

                    _this.set( "languageID", languageID );

                    // Set cookie
                    App.views.App.setPreferences( { "languageID": languageID } );

                    if ( languageID === App.config.defaultLanguageID ) {

                        // Default language...do nothing
                        this.languageLoaded = true;

                        loadDeferred.resolveWith( _this, [] );
                    } else {

                        //--> TODO: move this logic to lazy load method
                        this.languageLoaded = loadDeferred;

                        if ( App.config.buildType === "phonegap" ) {

                            languageFilePath = App.config.externalDomain( ) + "/js/i18n/" + languageID + ".json";

                            $.getJSON( languageFilePath )
                              .done( function( phrases ) {

                                App.polyglot.extend( phrases );

                                App.polyglot.locale( languageID.substr(0,2) );
                              })
                              .fail( function( ) {
                                AppEvents.trigger( "m::userSession::loadLanguage::error", {
                                    msg: "The langage " + languageID + " could not be loaded in phonegap."
                                });
                              })
                              .always( function( ) {
                                loadDeferred.resolveWith( _this, [] );
                              });
                        } else {

                            languageFilePath = "text!/js/i18n/" + languageID + ".json";

                            // Load in language
                            App.lazyLoad( languageFilePath )
                              .done( function( phrases ) {

                                try {

                                    phrases = JSON.parse( phrases );

                                    App.polyglot.extend( phrases );

                                    App.polyglot.locale( languageID.substr(0,2) );

                                } catch ( e ) {
                                    // do nothing
                                    AppEvents.trigger( "m::userSession::loadLanguage::error", {
                                        msg: "The langage phrase mapping " + languageID + " could not be parsed."
                                    });
                                }
                              })
                              .fail( function( ) {
                                AppEvents.trigger( "m::userSession::loadLanguage::error", {
                                    msg: "The langage " + languageID + " could not be loaded."
                                });
                              })
                              .always( function( ) {
                                loadDeferred.resolveWith( _this, [] );
                              });
                        }

                    }
                } catch ( e ) {

                    loadDeferred.resolveWith( _this, [] );

                    AppEvents.trigger( "m::userSession::loadLanguage::error", {
                        msg: "The default langage phrase mapping could not be parsed."
                    });
                }
            } else {

                loadDeferred.resolveWith( _this, [] );
            }

            return loadDeferred;

        }
    });

    var UserSessionModelException = function( message ) {

        this.message = message;

        this.name = "UserSessionModelException";
    };

    return UserSessionModel;
});