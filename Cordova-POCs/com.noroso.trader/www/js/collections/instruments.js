define([
    "backbone",
    "numeral",
    "App",
    "App.Events",
    "App.Models.Instrument"
], function ( Backbone, numeral, App, AppEvents, InstrumentModel ) {

    var InstrumentsCollection = Backbone.Collection.extend({

        model: InstrumentModel,

        lastSearch: null,

        // Used to cache results from searches...key is search term
        searchResults: { },

        url: function( ) {
            return App.config.api( ) + "/v1/instruments";
        },

        failures: [],

        initialize: function() {

            _.bindAll(this, "refreshQuotes");

            this.on("reset", function() {

                this.refreshQuotes();

                // trigger app level event
                AppEvents.trigger( "instruments:reset", this );
            });
        },

        refreshQuotes: function() {
        	console.log("refreshQuotes");
        	
        	
            // create closure for collection in ajax call callback 
            var that = this,
                jqxhr,
                timer,
                symbols = "";

            if ( App.engageTimer( App.config.apiTimerCaptureRate ) ) {
                timer = new App.Timer( "API", "GET /v1/quotes" );
            }

            // Check for thin quotes
            if ( App.collections.featureToggles.isEnabled("html5-quotes-thin") ) {
                symbols = "?symbols=" + this.pluck("symbol").join(",");
            }
 
            jqxhr = $.ajax({
                "url":          App.config.api( ) + "/v1/quotes" + symbols,
                "type":         "GET",
                "dataType":     "text",
                "contentType":  "text/plain",
                "accepts":      "text/plain",
                "timeout":      ( App.config.quotesRefreshRate - 500 ),
                "context":    this,
                "headers": {
                    "accept": "text/plain"
                }
            })
            .done(function( response, textStatus, jqXHR ) {

                if ( timer ) {
                    timer.end( "success" );
                    console.log("end timer");
                }

                if ( response && response.length > 0 ){

                    response = response.split("|");

                    if ( response.length > 10 ) {

                        var data = response.slice( 10 ), 
                            instrument,
                            symbol = {},
                            rateBid,
                            rateAsk,
                            quote,
                            platformDate = response[0];
    
                        App.marketState = response[1];

                        var instrumentMatches = function ( instrument ) {
                            return ( instrument.get("symbol") === this.value );
                        };
 
                        // loop through the quotes and update collection 
                        for ( var i=0, numQuotes = data.length; i < numQuotes; i++ ) {
                            quote = data[i].split(",");

                            if ( quote.length >= 3 ) {
   
                                symbol.value = quote[0];
                                rateBid = +quote[1];
                                rateAsk = +quote[2];
 
                                instrument = that.find( instrumentMatches, symbol ); 
                                
                                // update model
                                if ( instrument ) {
                                    instrument.updateRates({
                                        rateOpen:  0,
                                        rateAsk:   rateAsk,
                                        rateBid:   rateBid
                                    });
                                }
                            }

                        }

                        // trigger app level event
                        AppEvents.trigger("instruments:quotesUpdated");
                    }
                }

            })
            .fail(function( jqXHR, textStatus, errorThrown ){

                var time = ( new Date( ).getTime( ) );

                if ( timer ) {
                    timer.end( "fail" );
                }

                this.failures = _.filter( this.failures, function( failure ) {
                    return failure > ( time - App.config.quotesFailureTime ); 
                });

                this.failures.push( time );

                if ( this.failures.length > App.config.quotesFailureThreshold ) { 

                    AppEvents.trigger("c::instruments::refreshQuotes::error", {
                        msg: "Failed to refresh quotes. Threshold " + App.config.quotesFailureThreshold + " met in " + ( App.config.quotesFailureTime / 1000 ) + " seconds.  [status: " + jqXHR.status + " error: " + errorThrown + "]"
                    });

                    // Reset failures
                    this.failures = [];
                }
            }); 
        },

        // Get specified instrument and add it to the collection
        getInstrument: function( id ) {

            var instrument = new InstrumentModel({
                    "instrumentID": id
                }),
                instrumentDeferred = $.Deferred();

            instrument.fetch({ "context":this })
                .done( function( data, textStatus, jqXHR ) {

                    if ( !data.instrumentID ) {

                        AppEvents.trigger( "c::instruments::getInstrument::error", {
                            "msg": "Instrument could not be loaded. [data: " + data.instrumentID + "]"
                        });

                        instrumentDeferred.rejectWith( this, [ jqXHR, "error", "Instrument could not be loaded"] );

                        return;
                    }

                    this.add( instrument, {
                        "merge": true
                    });

                    AppEvents.trigger("instrument:loaded", {
                        "instrumentModel": instrument
                    });

                    instrumentDeferred.resolveWith( this, [data, "success", jqXHR] );

                })
                .fail( function( jqXHR, textStatus, errorThrown ) {
                    AppEvents.trigger("c::instruments::getInstrument::error", {
                        msg: "Failed to load instrument. [status:" + jqXHR.status + " error:" + errorThrown + "]"
                    });

                    instrumentDeferred.rejectWith( this, [ jqXHR, "error", "Instrument could not be loaded"] );
                });

            return instrumentDeferred;
        },

        // Get the specified instruments and add them to the collection
        //   ids: (string) comma delimited list of symbols (e.g., "AAPL,KO,MMM" )
        getInstruments: function ( ids ) {

            var getDeferred = $.Deferred(),
                query = "?symbols=" + ids,
                timer;

            if ( !ids || typeof ids !== "string" ) {

                getDeferred.rejectWith( this, [ {}, "error", "Missing instrument symbol list" ] );

            } else {

                if ( App.engageTimer( App.config.apiTimerCaptureRate ) ) {
                    timer = new App.Timer( "API", "GET /v1/instruments?symbol={symbol}&name={name}&tag={tag}" );
                }

                $.ajax({
                    "url":          this.url() + query,
                    "type":         "GET",
                    "dataType":     "json",
                    "contentType":  "application/json",
                    "accepts":      "application/json",
                    "context":      this,
                    "headers": {
                        "accept":                   "application/json",
                        "x-mysolomeo-session-key":  App.models.userSession.get("sessionKey")
                    }
                })
                .done( function( data, textStatus, jqXHR ) {

                    if ( timer ) {
                        timer.end( "success" );
                    }

                    if ( !data ) {

                        AppEvents.trigger("c::instruments::getInstruments::error", {
                            "msg": "No data returned on gettting instruments. [data:" + JSON.stringify( data ) + "]"
                        });

                        getDeferred.rejectWith( this, [ jqXHR, "error", "No data returned on instruments get" ] );

                        return;
                    }

                    this.add( data, { "merge": true } );

                    this.refreshQuotes( );

                    getDeferred.resolveWith( this, [ data, "success", jqXHR ] ); 

                })
                .fail( function( jqXHR, textStatus, errorThrown ) {

                    if ( timer ) {
                        timer.end( "fail" );
                    }

                    AppEvents.trigger("c::instruments::getInstruments::error", {
                        "msg": "Unable to get instruments. [status:" + jqXHR.status + " error:" + errorThrown + "]"
                    });

                    getDeferred.rejectWith( this, [ jqXHR, "error", "Unable to get instruments." ] );

                });
            }

            return getDeferred;
        },

        // Retrieves the instrument from the collection by symbol or id
        getInstrumentBySymbolOrId: function( id ) {

            var instrument;

            // Check the format of id
            if( id.search(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/) !== -1 ) {
                // ID is an UUID
                instrument = App.collections.instruments.get( id );
            } else {
                // ID is a symbol (e.g., AAPL, S, XOM)
                instrument = App.collections.instruments.find( function( instrument ){
                    return instrument.get("symbol").toLowerCase() == ( id ).toLowerCase();
                });
            }

            return instrument;
        },

        // Search instruments by symbol, name or tag
        //   Term should be an object with key: symbol, name, tag or all (searches all categories)
        //   Values should be single search string
        // Example: 
        //   {
        //      "symbol": "GOOG",
        //      "name": "google",
        //      "tag":  "LongTerm",
        //      "all": "GOO"
        //   }
        //
        // Returns an array of symbols
        search: function ( term ) {

            var searchDeferred = $.Deferred(),
                symbol = "",
                name = "",
                tag = "",
                query = "",
                timer;

            if ( !term || typeof term !== "object" ) {

                searchDeferred.rejectWith( this, [ {}, "error", "Missing search term" ] );

            } else {

                // Check, for locally cached results
                if ( term.all && this.searchResults[ term.all ] ) {

                    searchDeferred.resolveWith( this, [ this.searchResults[ term.all ], "success", {} ] ); 

                    return searchDeferred;
                }

                if ( term.all && typeof term.all === "string" ) {
                    query = "?symbol=" + term.all + "&name=" + term.all + "&tag=" + term.all;
                } else if ( term.symbol && typeof term.symbol === "string" ) {
                    query = "?symbol=" + term.symbol;
                } else if ( term.name && typeof term.name === "string" ) {
                    query = "?name=" + term.name;
                } else if ( term.tag && typeof term.tag === "string" ) {
                    query = "?tag=" + term.tag;
                }

                if ( !query ) {
                    searchDeferred.rejectWith( this, [ {}, "error", "Invalid search term" ] );
                }
            }

            if ( searchDeferred.state() === "pending" ) {

                if ( App.engageTimer( App.config.apiTimerCaptureRate ) ) {
                    timer = new App.Timer( "API", "GET /v1/instruments?symbol={symbol}&name={name}&tag={tag}" );
                }

                $.ajax({
                    "url":          this.url() + query,
                    "type":         "GET",
                    "dataType":     "json",
                    "contentType":  "application/json",
                    "accepts":      "application/json",
                    "context":      this,
                    "headers": {
                        "accept":                   "application/json",
                        "x-mysolomeo-session-key":  App.models.userSession.get("sessionKey")
                    }
                })
                .done( function( data, textStatus, jqXHR ) {

                    var symbols;

                    if ( timer ) {
                        timer.end( "success" );
                    }

                    if ( !data ) {

                        AppEvents.trigger("c::instruments::search::error", {
                            "msg": "No data returned on instruments search. [data:" + JSON.stringify( data ) + "]"
                        });

                        searchDeferred.rejectWith( this, [ jqXHR, "error", "No data returned on instruments search" ] );

                        return;
                    }

                    this.set( data, { "remove": false } );

                    this.refreshQuotes( );

                    symbols = _.pluck( data, "symbol" );

                    if ( term.all ) {

                        this.searchResults[ term.all ] = symbols;

                        this.lastSearch = term.all;
                    }

                    searchDeferred.resolveWith( this, [ symbols, "success", jqXHR ] ); 
                })
                .fail( function( jqXHR, textStatus, errorThrown ) {

                    if ( timer ) {
                        timer.end( "fail" );
                    }

                    AppEvents.trigger("c::instruments::search::error", {
                        "msg": "Unable to search for instruments. [status:" + jqXHR.status + " error:" + errorThrown + "]"
                    });

                    searchDeferred.rejectWith( this, [ jqXHR, "error", "Unable to search for instruments." ] );

                })


            }

            return searchDeferred;
        },

        // Remove the last search and all of the instruments from the collection that were in it 
        clearLastSearched: function( ) {

            var toRemove = [ ],
                _this = this;

            if ( this.lastSearch ) {

        
                _.each( this.searchResults[ this.lastSearch ], function( symbol ) {

                    // Check if not in watch list before removing
                    if ( _.indexOf( App.models.user.watchList, symbol ) === -1 ) {
                        _this.remove( _this.where( { "symbol": symbol } ) );
                    }
                });

                delete this.searchResults[ this.lastSearch ];

                this.lastSearch = null;
            }
        }
    });

    return InstrumentsCollection;
});
