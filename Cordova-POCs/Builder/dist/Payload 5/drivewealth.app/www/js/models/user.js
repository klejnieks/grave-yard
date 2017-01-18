// Filename: /js/models/user.js
define([
    'backbone',
    'App',
    'App.Events'
], function( Backbone, App, AppEvents ) {

    var UserModel = Backbone.Model.extend({

        idAttribute: 'userID',

        // This holds the recent instruments
        recentInstruments: null,

        watchList: null,

        debouncedReset: null,

        defaults: {
            "firstName":      "",
            "lastName":       "",
            "addressLine1":   "",
            "addressLine2":   "",
            "city":           "",
            "countryID":      "",
            "emailAddress1":  "",
            "languageID":     "en_US",
            "phoneHome":      "",
            "stateProvince":  "",
            "zipPostalCode":  "",
            "WLPID":          ""
        },

        url: function( ) {
            return App.config.api( ) + "/v1/users/" + ( App.models.userSession.id ? App.models.userSession.id : "" );
        },

        initialize: function( options ) {

            this.type = "user";

            this.debouncedReset = _.debounce( this.resetWatchList, 1000 );

            this.on( "change", function( ) {
                AppEvents.trigger("user:loaded", {
                    "msg": "User profile has been loaded"
                });
            });

            this.listenTo( AppEvents, "favorites:instrumentAdded user:recentInstrumentsSet order:completed accounts:synced", function( ) {
                this.debouncedReset( );
            });

            this.listenTo( AppEvents, "userSession:processed", function( ) {
                this.resetWatchList( );
            });
        },

        resetPassword: function( ) {

            var jqXHR,
                timer,
                data = {
                    "username": this.get("username")
                };

            if ( App.engageTimer( App.config.apiTimerCaptureRate ) ) {
                timer = new App.Timer( "API", "POST /v1/users/passwords" );
            }

            jqXHR = $.ajax({
                "url":          App.config.api( ) + "/v1/users/passwords",
                "type":         "POST",
                "dataType":     "json",
                "contentType":  "application/json",
                "accepts":      "application/json",
                "context":      this,
                "headers": {
                    "accept":   "application/json"
                },
                "data":         JSON.stringify( data )
            })
            .done( function( data, textStatus, jqXHR ) {

                if ( timer ) {
                    timer.end( "success" );
                }

                if ( !data || !data.passwordResetID ) {
                    AppEvents.trigger("m::user::resetPassword::error", {
                        "msg": "Password reset fail. Missing passwordResetID [data: " + JSON.stringify( data ) + "]"
                    });
                    return;
                }

                this.set( "passwordResetID", data.passwordResetID );

                AppEvents.trigger("user:passwordReset", {
                    "msg": "Password reset for '" + data.username + "'"
                });
            })
            .fail( function( jqXHR, textStatus, errorThrown ) {

                if ( timer ) {
                    timer.end( "fail" );
                }

                AppEvents.trigger("m::user::resetPassword::error", {
                    "msg": "Password reset fail. [status: " + jqXHR.status + " error: " + errorThrown + "]"
                });
            });

            return jqXHR;
        },

        setPassword: function( ) {

            var data,
                timer,
                missingAttr = [],
                setDeferred = $.Deferred();

            data = {
                "code":             this.get("code"),
                "passwordResetID":  this.get("passwordResetID"),
                "password":         this.get("password")
            };

            _.each( data, function( value, key ) {
                if ( typeof value === "undefined" || !value ){
                    missingAttr.push( key );
                }
            });

            if ( missingAttr.length > 0 ) {

                AppEvents.trigger("m::user::setPassword::error", {
                    "msg": "Missing required attributes [" + missingAttr.join(",") + "]"
                });

                setDeferred.rejectWith( this, [ { "status": -1 }, "error", "Missing required field(s) [" + missingAttr.join(",") + "]" ] );
            }

            if ( setDeferred.state() === "pending" ) {

                if ( App.engageTimer( App.config.apiTimerCaptureRate ) ) {
                    timer = new App.Timer( "API", "PUT /v1/users/passwords/{ID}" );
                }

                $.ajax({
                    "url":          App.config.api( ) + "/v1/users/passwords/" + data.passwordResetID,
                    "type":         "PUT",
                    "dataType":     "text",
                    "contentType":  "application/json",
                    "accepts":      "application/json",
                    "context":      this,
                    "processData":  false,
                    "headers": {
                        "accept":   "application/json"
                    },
                    "data":         JSON.stringify( data )
                })
                .done( function( data, textStatus, jqXHR ) {

                    if ( timer ) {
                        timer.end( "success" );
                    }

                    AppEvents.trigger("user:passwordReset", {
                        "msg": "Password reset for '" + data.username + "'"
                    });

                    setDeferred.resolveWith( this, [ data, "success", jqXHR ] );
                })
                .fail( function( jqXHR, textStatus, errorThrown ) {

                    if ( timer ) {
                        timer.end( "fail" );
                    }

                    AppEvents.trigger("m::user::setPassword::error", {
                        "msg": "Password reset fail. [status: " + jqXHR.status + " error: " + errorThrown + "]"
                    });

                    setDeferred.rejectWith( this, [ jqXHR, "error", "Password reset fail" ] );
                });
            }

            return setDeferred.promise();
        },

        syncSetting: function( key, value ) {

            var defaults = {
                    "url": this.url() + "/settings",
                    "type": "GET",
                    "contentType":    "application/json",
                    "accepts":        "application/json",
                    "context": this,
                    "headers": {
                        "accept":                   "application/json",
                        "x-mysolomeo-session-key":  App.models.userSession.get("sessionKey")
                    }
                },
                options = {},
                userID = App.getProperty("models.userSession.id", App),
                settingDeferred = $.Deferred(),
                method = "read",
                setting,
                timer;

            if ( !userID ) {
                settingDeferred.rejectWith( this, [{}, "error", "UserID not found"] );
            }

            if ( settingDeferred.state() === "pending" ) {

                if ( value ) {
                    // User is setting value
                    method = "update";

                    // Stringify if value is object
                    if ( _.isObject( value ) ) {
                        value = JSON.stringify( value );
                    }

                    options.type = "POST";
                    options.data = JSON.stringify({
                        "userID":  userID,
                        "key":     key,
                        "value":   value
                    });
                } else {
                    // User is getting value
                    options.url = this.url() + "/settings/" + key;
                }

                options = _.extend(
                    defaults,
                    options
                );

                if ( App.engageTimer( App.config.apiTimerCaptureRate ) ) {
                    timer = new App.Timer( "API", ( value ? "POST" : "GET" ) + " /v1/users/{ID}/settings" + ( value ? "" : ( "/" + key ) ) );
                }

                $.ajax( options )
                .done(function( data, textStatus, jqXHR ) {

                    if ( timer ) {
                        timer.end( "success" );
                    }

                    // Check for data and value
                    if ( !data || !App.getProperty( "value", data ) ){

                        AppEvents.trigger("m::user::syncSettings::error", {
                            msg: "User setting not returned on 200. [data: " + JSON.stringify( data ) + "]"
                        });

                        settingDeferred.rejectWith( this, [ jqXHR, "error", "Data not returned" ] );

                        return;
                    }

                    AppEvents.trigger("userSetting:success", {
                        msg: "User setting " + key + " has been synced."
                    });

                    settingDeferred.resolveWith( this, [ data, "success", jqXHR ] );

                })
                .fail( function( jqXHR, textStatus, errorThrown ) {

                    if ( timer ) {
                        timer.end( "fail" );
                    }

                    // Check for 404
                    if ( method === "read" && jqXHR.status === 404 ) {
                        // This is okay...user has no favorites
                        settingDeferred.resolveWith( this, [ null, "success", jqXHR ] );
                        return;
                    }

                    AppEvents.trigger("m::user::syncSettings::error", {
                        msg: "User setting " + key + " could not be loaded. [status: " + jqXHR.status + " error: " + errorThrown + "]"
                    });

                    settingDeferred.rejectWith( this, [jqXHR, "error", "User setting could not be synced API error:" + errorThrown] );
                });

            }

            return settingDeferred;
        },

        checkUsername: function( username ) {

            var jqXHR,
                timer;

            if ( App.engageTimer( App.config.apiTimerCaptureRate ) ) {
                timer = new App.Timer( "API", "GET /v1/users?username={ID}" );
            }

            jqXHR = $.ajax({
                "url":          this.url() + "?username=" + username,
                "type":         "GET",
                "dataType":     "text",
                "contentType":  "application/json",
                "accepts":      "application/json",
                "context":      this,
                "processData":  false,
                "headers": {
                    "accept":   "application/json"
                }
            })
            .done( function( data, textStatus, jqXHR ) {

                if ( timer ) {
                    timer.end( "success" );
                }

                AppEvents.trigger("user:usernameAvailable", {
                    "msg": "Username '" + username + "' is available."
                });
            })
            .fail( function( jqXHR, textStatus, errorThrown ) {

                if ( timer ) {
                    timer.end( "fail" );
                }

                AppEvents.trigger("m::user::checkUsername::warning", {
                    "msg": "Username '" + username + "' is NOT available."
                });
            });

            return jqXHR;
        },

        uploadDocument: function( data ) {

            var jqXHR,
                timer;

            if ( App.engageTimer( App.config.apiTimerCaptureRate ) ) {
                timer = new App.Timer( "API", "POST /v1/goals/{ID}/images" );
            }

            jqXHR = $.ajax({
                "url":          App.config.api( ) + "/v1/documents",
                "data":         data,
                "processData":  false,
                "contentType":  false,
                "type":         "POST",
                "dataType":     "text",
                "context":      this,
                "headers": {
                    "x-mysolomeo-session-key":  App.models.userSession.get("sessionKey"),
                    "accept":                   "application/json"
                }
            })
            .done( function( data, textStatus, jqXHR ) {

                if ( timer ) {
                    timer.end( "success" );
                }

                AppEvents.trigger("m::user::uploadDocument::success", {
                    "msg":      "Document image has been uploaded."
                });
            })
            .fail( function( jqXHR, textStatus, errorThrown ) {

                if ( timer ) {
                    timer.end( "fail" );
                }

                AppEvents.trigger("m::user::uploadDocument::error", {
                    "msg":          "Image could not be uploaded. [status: " + jqXHR.status + " error: " + errorThrown + "]"
                });
            });

            return jqXHR;
        },

        uploadDocumentPhonegap: function( data, fileUrl ) {

            var _this = this,
                options,
                transfer,
                params = { },
                deferred = $.Deferred( );

            options = new FileUploadOptions( );

            options.fileKey = "documentImage";

            options.fileName = fileUrl.substr( fileUrl.lastIndexOf('/') + 1 );

            options.mimeType = "image/jpeg";

            options.chunkedMode = true;

            options.headers = {
                "Accept":                   "application/json",
                "x-mysolomeo-session-key":  App.models.userSession.get("sessionKey")
            };

            params.token = data.token || "";

            params.documentType = data.documentType || "";

            options.params = params;

            transfer = new FileTransfer( );

            transfer.upload( fileUrl, encodeURI( App.config.api( ) + "/v1/documents" ), function( result ) {

                AppEvents.trigger("m::user::uploadDocument::success", {
                    "msg":      "Document image has been uploaded."
                });

                deferred.resolveWith( this, [ data, "success", null ] );

            }, function( error ) {

                AppEvents.trigger("m::user::uploadDocument::error", {
                    "msg":          "Image could not be uploaded via phonegap. [code: " + error.code + " target: " + error.target + "]"
                });

                deferred.rejectWith( this, [ null, "error", "Image could not be uploaded via phonegap." ] );

            }, options );

            return deferred;
        },

        loadRecentInstruments: function( ) {

            var promise = this.syncSetting( "recentInstruments" );

            promise.done( function( data ) {

                if ( _.isObject( data ) && data.value ) {

                    try {

                        this.recentInstruments = JSON.parse( data.value );

                        if ( !this.recentInstruments || !_.isObject( this.recentInstruments ) ) {
                            this.recentInstruments = {};
                        }

                    } catch ( e ) {

                        this.recentInstruments = {};

                        AppEvents.trigger("m::user::loadRecentInstruments::error", {
                            "msg":        "Recent instruments value could not be parsed. [" + data.value + "]",
                            "showAlert":  false
                        });
                    }

                } else {

                    // User doesn't have any recently viewed instruments
                    this.recentInstruments = {};
                }
            });

            return promise;
        },

        getRecentInstruments: function( accountID ) {

            accountID = accountID || App.models.account.get("accountID");

            if ( _.isObject( this.recentInstruments ) && this.recentInstruments[ accountID ] ) {
                return this.recentInstruments[ accountID ];
            } else {
                return [ ];
            }
        },

        // This will only return the symbols that are displayed
        getAllRecentInstrumentSymbols: function( accountID ) {

            var recentInstruments = this.getRecentInstruments( accountID ),
                symbols = [];

                _.each( recentInstruments.slice( 0, App.config.recentInstrumentsDisplay ), function( value ) {
                    symbols.push( value.symbol );
                });

            return symbols;
        },

        setRecentInstruments: function( symbol ) {

            var recentItem,
                recentData = this.getRecentInstruments( );

            // Check if it's on the list
            recentItem = _.findWhere( recentData, {"symbol": symbol} );

            if ( recentItem ) {
                // Yes - increment views
                recentItem.views += 1;
            } else {
                // No - add it to the list
                recentItem = {
                    "symbol":  symbol,
                    "views":   1
                };

                recentData.push( recentItem );
            }

            // Sort based on views
            recentData = _.sortBy( recentData, "views" ).reverse( );

            this.recentInstruments[ App.models.account.get("accountID") ] = recentData;

            // Resync setting
            this.syncSetting( "recentInstruments", this.recentInstruments );

            AppEvents.trigger("user:recentInstrumentsSet");
        },

        loadWatchList: function( ) {

            var promise = this.syncSetting("watchList");

            promise.done( function( data ) {

                if ( _.isObject( data ) && data.value ) {

                    try {

                        this.watchList = JSON.parse( data.value );

                        if ( !this.watchList ) {
                            this.watchList = [];
                        }

                    } catch ( e ) {

                        this.watchList = [];

                        AppEvents.trigger("m::user::loadWatchList::error", {
                            "msg":        "Watch list value could not be parsed. [" + data.value + "]",
                            "showAlert":  false
                        });
                    }

                } else {

                    // User doesn't have a watch list
                    this.watchList = [];
                }
            });

            return promise;
        },

        getWatchList: function( ) {

            if ( !_.isArray( this.watchList ) ) {
                this.watchList = [];
            }

            return this.watchList;
        },

        addToWatchList: function( symbol ) {

            var index;

            // Make sure watchlist is array
            this.getWatchList( );

            // Check if symbol is on list
            index = _.indexOf( this.watchList, symbol, true );

            if ( index !== -1 ) {
                // Already on list
                return this.watchList;
            }

            // Add it to the list in sorted order
            this.watchList.push( symbol );

            this.watchList.sort( );

            // Resync setting
            this.syncSetting( "watchList", this.watchList );
        },

        resetWatchList: function( ) {

            var watchList = [ ],
                _this = this,
                missingInstruments = [ ];

            if ( App.models.userSession.loggedIn( ) ) {

                App.collections.accounts.each( function( account ) {

                    // Get the instruments from the positions
                    _.each( account.get("positions"), function( value ) {

                        var instrument = App.collections.instruments.getInstrumentBySymbolOrId( value.instrumentID );

                        if ( !instrument ) {

                            // Load the missing instrument and resync
                            _this.loadMissingInstrument( value.instrumentID );

                        } else {

                            watchList.push( instrument.get("symbol") );
                        }
                    });

                    // Get the instruments from the orders...exclude local orders
                    _.chain( account.get("orders") )
                    .filter( function( value ) {
                        return value.ordStatus !== -1;
                    })
                    .each( function( value ) {

                        var instrument = App.collections.instruments.getInstrumentBySymbolOrId( value.instrumentID );

                        if ( !instrument ) {

                            // Load the missing instrument and resync
                            _this.loadMissingInstrument( value.instrumentID );

                        } else {

                            watchList.push( instrument.get("symbol") );
                        }
                    });

                });

                // Get the favorited instruments
                _.each( App.collections.favorites.favorites, function( favs ) {

                    _.chain( favs )
                    .where( {"type":"instrument"} )
                    .each( function( value, key ) {

                        var instrument = App.collections.instruments.getInstrumentBySymbolOrId( value.ID );

                        if ( !instrument ) {

                            // Load the missing instrument and resync
                            _this.loadMissingInstrument( value.ID );

                        } else {

                            watchList.push( instrument.get("symbol") );
                        }
                    });
                });

                // Get the recently viewed
                _.each( this.recentInstruments, function( value, key ) {

                    var symbols = _this.getAllRecentInstrumentSymbols( key ),
                        missing = [ ];

                    watchList = watchList.concat( symbols );

                    _.each( symbols, function( symbol ) {

                        var instrument = App.collections.instruments.getInstrumentBySymbolOrId( symbol );

                        if ( !instrument ) {

                            // Load the missing instrument and resync
                            missing.push( symbol );
                        }
                    });

                    if ( missing.length > 0 ) {
                        _this.loadMissingInstrumentsBySymbols( missing.join(",") );
                    }
                });

                watchList = _.uniq( watchList ).sort( );

                // Check if list has changed
                if ( ( _.difference( watchList, this.watchList ) ).length > 0 || ( _.difference( this.watchList, watchList ) ).length > 0  ) {

                    this.watchList = watchList;

                    // Resync setting
                    this.syncSetting( "watchList", this.watchList );
                }
            }
        },

        loadMissingInstrument: function( id ) {

            var _this = this;

            App.collections.instruments.getInstrument( id )
            .done( function( ) {
                _this.debouncedReset( );
            });
        },

        loadMissingInstrumentsBySymbols: function( symbols ) {

            App.collections.instruments.getInstruments( symbols );
        },

        getUploadedDocs: function( ) {

            var promise = this.syncSetting( "uploadedDocuments" );

            promise.done( function( data ) {

                if ( _.isObject( data ) && data.value ) {

                    try {

                        this.uploadedDocs = JSON.parse( data.value );

                        if ( !this.uploadedDocs || !_.isArray( this.uploadedDocs ) ) {
                            this.uploadedDocs = [];
                        }

                    } catch ( e ) {

                        this.uploadedDocs = [];

                        AppEvents.trigger("m::user::getUploadedDocs::error", {
                            "msg":        "Uploaded docs value could not be parsed. [" + data.value + "]",
                            "showAlert":  false
                        });
                    }

                } else {

                    // User doesn't have any uploaded docs
                    this.uploadedDocs = [];
                }
            });

            return promise;

        },

        setUploadedDocs: function( type ) {

            if ( _.indexOf( this.uploadedDocs, type ) === -1 ) {

                this.uploadedDocs.push( type );

                this.syncSetting( "uploadedDocuments", this.uploadedDocs );
            }
        },

        clearUser: function( ) {

            this.clear( );

            this.recentInstruments = null;

            this.watchList = null;

            this.set( this.defaults );
        }
    });

    return UserModel;
});
