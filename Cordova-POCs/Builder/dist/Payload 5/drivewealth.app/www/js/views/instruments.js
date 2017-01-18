define([
    'backbone',
    'App',
    'App.Views.Helpers',
    'App.Events',
    'text!templates/instruments.html',
    'text!templates/instruments/rows.html',
    'text!templates/instrument-row.html',
    'text!templates/instrument-row/rates.html'
],
    function( Backbone, App, AppViewHelpers, AppEvents, instrumentsTemplate, instrumentRowsTemplate, instrumentRowTemplate, instrumentRowRatesTemplate ) {

        var InstrumentsView = Backbone.View.extend({

            events: {
                "keydown #instrument-search":                    "debouncedSearch",
                "input #instrument-search":                      "debouncedSearch",
                "click .instrument-all, #instrument-all":        "showAll", 
                "click div[data-target-path]":  function( e ) {
                    App.views.App.navigate( e );
                },
                "click .instrument-tag":  function( e ) {
            
                    // Clear the search history
                    App.collections.instruments.lastSearch = null;

                    App.views.App.navigate( e );
                },
                "click .favorite": function( e ) {
                    App.views.App.updateFavorite( e );
                },
                "click .pop-search": function( e ) {

                    var $target = $(e.currentTarget);
  
                    e.stopPropagation( );
                    
                    e.preventDefault( );

                    e.stopPropagation( );

                    this.$search.val( $target.text( ) );

                    this.searchInstruments( );
                }
            },

            $instruments: null,

            debouncedSearch: null,

            debouncedTracking: null,

            symbols: null,

            tags: null,

            loaded: null,

            searchTerm: null,

            preventTracking: false,

            initialize: function( options ) {

                // Render the title in the action bar
                App.views.App.renderActionTitle({
                    "title": App.polyglot.t("Stocks / ETFs") 
                });

                this.debouncedSearch = _.debounce( this.searchInstruments, 500 );

                this.debouncedTracking = _.debounce( function( ) {

                    if ( this.searchTerm && this.searchTerm.length > 0 ) {

                        App.analytics.track("Searched Products", {
                            "category": ( App.models.account.get("accountType") === 2 ) ? "Live" : "Practice",
                            "query": this.searchTerm 
                        });
                    }
                }, 3000 );

                if ( _.isArray( options.symbols ) && options.symbols.length > 0 ) {
                    this.symbols = options.symbols;
                }

                if ( _.isArray( options.tags ) && options.tags.length > 0 ) {
                    this.tags = options.tags;
                }

                if ( _.isArray( options.recent ) && options.recent.length > 0 ) {
                    this.recent = options.recent; 
                }

                // Check for last search
                if ( App.collections.instruments.lastSearch ) {
                    this.searchTerm = App.collections.instruments.lastSearch;
                }

                this.template =           _.template( instrumentsTemplate );
                this.templateRows =       _.template( instrumentRowsTemplate );
                this.templateInstRow =    _.template( instrumentRowTemplate );
                this.templateInstRates =  _.template( instrumentRowRatesTemplate );

                this.listenTo( AppEvents, 'instruments:quotesUpdated', this.renderSubTemplates );
            },

            render: function( options ) {

                var data,
                    instToLoad,
                    instruments,
                    popularSource,
                    popularTags = [],
                    i = 0;

                options = options ? options : {};

                if ( options.favRefresh ) {

                    // Reload current view
                    instToLoad = this.loaded; 

                    this.loaded = null;
                }

                if ( this.searchTerm ) {
                    instruments = [];
                } else {
                    instruments = this.getInstrumentsToLoad( instToLoad );
                }

                // Generate random popular search tags
                popularSource = App.config.popularSearches.slice( );

                for ( ; i < 5; i++ ) {
                    popularTags.push( popularSource.splice( ( Math.floor(Math.random() * popularSource.length) ) , 1) ); 
                }
 
                data =  {
                    "showTags":     this.tags ? true : false,
                    "showSymbols":  this.symbols ? true : false, 
                    "showRecent":   this.recent ? true : false,
                    "showSearch":   this.searchTerm && this.searchTerm.length > 0 ? true : false,
                    "thinQuotes":   App.collections.featureToggles.isEnabled("html5-quotes-thin"),
                    "instruments":  instruments,
                    "popularTags":  popularTags 
                };

                // Remove tool tips
                this.removeToolTips();

                _.extend( 
                    data, {
                        "favorites":          App.collections.favorites.toJSON(),
                        "loggedIn":           App.models.userSession.loggedIn(),
                        "templateRows":       this.templateRows,
                        "templateInstRow":    this.templateInstRow,
                        "templateInstRates":  this.templateInstRates,
                        "helpers":            AppViewHelpers,
                        "cdn":                App.config.cdn( ),
                        "searchTerm":         this.searchTerm,
                        "polyglot":           App.polyglot
                    }
                );
 
                this.$el.empty().html( this.template({ "data": data }));

                $( document ).foundation( );

                this.$instruments = this.$("#instruments");

                this.$search = this.$("#instrument-search");

                if ( this.searchTerm ) {

                    this.preventTracking = true;

                    this.searchInstruments( );
                }

                AppEvents.trigger( "instruments:rendered" );

                return this;
            },

            removeView: function() {

                // Remove tool tips
                this.removeToolTips();

                this.stopListening(); 

                this.undelegateEvents();
            },

            renderSubTemplates: function( ) {

                var $instrument;

                this.collection.forEach( function( model ) {

                    $instrument = this.$instruments.find( "#" + model.get("symbol") );

                    $instrument.find(".instrument-rates h3").html(
                        this.templateInstRates({
                            "data": {
                                "instrument":  model.toJSON(),
                                "favorites":   App.collections.favorites.toJSON(),
                                "helpers":     AppViewHelpers
                            } 
                        }) 
                    );
                }, this );

                AppEvents.trigger( "instruments:rendered" );
            },

            renderRows: function( instToLoad ) {

                var data =  {
                    "instruments": this.getInstrumentsToLoad( instToLoad ) 
                };

                _.extend( 
                    data, {
                        "favorites":          App.collections.favorites.toJSON(),
                        "loggedIn":           App.models.userSession.loggedIn(),
                        "templateInstRow":    this.templateInstRow,
                        "templateInstRates":  this.templateInstRates,
                        "helpers":            AppViewHelpers,
                        "cdn":                App.config.cdn( ),
                        "showTags":           this.tags ? true : false,
                        "showSymbols":        this.symbols ? true : false, 
                        "showRecent":         this.recent ? true : false,
                        "showSearch":         instToLoad ? true: false,
                        "showAll":            instToLoad === "all" ? true : false,
                        "thinQuotes":         App.collections.featureToggles.isEnabled("html5-quotes-thin"),
                        "polyglot":           App.polyglot
                    }
                );
 
                this.$instruments.empty().html( this.templateRows({ "data": data }));
            },

            getInstrumentsToLoad: function( instToLoad ) {

                var instruments = [],
                    missing = 0;

                if ( instToLoad === "all" ) {

                    instruments = this.collection.toJSON( );

                } else {

                    if ( instToLoad ) { 
                        // Do nothing...symbols were specified

                    } else if ( this.symbols ) {

                        // Symbols passed in deeplink
                        instToLoad = this.symbols;

                    } else if ( this.tags ) {

                        // This is a tag link
                        instToLoad = this.findInstruments( this.tags, { "symbols": false, "name": false } );

                    } else if ( this.recent ) {

                        // Most recently viewed
                        instToLoad = this.recent;

                    } else if ( !instToLoad ) {

                        // Use default list
                        instToLoad = App.config.defaultProducts;
                    }

                    this.loaded = instToLoad;

                    _.each( instToLoad, function( symbol, index, list ) {

                        var instrument = this.collection.findWhere( { "symbol": symbol } ),
                            data,
                            recent;

                        if ( instrument ) {

                            data = instrument.toJSON( );

                            instruments.push( data );
                        } else {

                            missing += 1;
                        }
                    }, this );
                }

                if ( missing > 0 ) {
                    App.models.user.resetWatchList( );
                }

                return instruments;
            },

            searchInstruments: function( e ) {

                var instruments,
                    _this = this;

                if ( e ) {

                    e.preventDefault( );

                    e.stopPropagation( );
                }

                this.searchTerm = this.$("#instrument-search").val();

                if ( this.searchTerm && this.searchTerm.length > 0 ) {

                    if ( App.collections.featureToggles.isEnabled("html5-quotes-thin") ) {

                        // Clear previously searched
                        if ( this.searchTerm !== App.collections.instruments.lastSearch ) {
                            App.collections.instruments.clearLastSearched( );
                        }

                        // Search via the api
                        App.collections.instruments.search( { "all": this.searchTerm } )
                        .done( function( instruments ) {
                            _this.renderRows( instruments );
                        })
                        .fail( function( jqXHR, textStatus, errorThrown ) {
                            _this.renderRows([ ]);
                        });
                    } else {

                        // Search via local instruments collection
                        App.collections.instruments.lastSearch = this.searchTerm;

                        instruments = this.findInstruments( this.searchTerm );  

                        this.renderRows( instruments );
                    }

                    if ( !this.preventTracking ) {
                        this.debouncedTracking( );
                    } else {
                        this.preventTracking = false;
                    }

                } else {

                    App.collections.instruments.clearLastSearched( );

                    this.renderRows( );
                } 

                // Reset url if coming from deep link
                $(".nav-list a[href='\/stocks-etfs']").trigger("click");
            },
   
            findInstruments: function( term, options ) {

                options = _.extend( 
                    {}, {
                        "tags": true,
                        "symbols": true,
                        "name": true
                    }, 
                    options 
                );

                term = _.isArray( term ) ? term : [ term ];

                var instruments = this.collection.chain( )
                    .filter( function( inst ) {
                        var name,
                            symbol,
                            tags,
                            data = "",
                            found;

                        if ( options.name ) {
                            data += inst.get("name") ? inst.get("name") : "";
                        }

                        if ( options.symbol ) {
                            data += inst.get("symbol") ? inst.get("symbol") : "";
                        }

                        if ( options.tags ) {
                            data += _.isArray( inst.get("tags") ) ? inst.get("tags").join("") : "";
                        }

                        _.each( term , function( el, index, list ) {
                
                            var re = new RegExp( App.escapeRegExp( el ), "i");

                            if ( re.test( data ) ) {
                                found = true;
                            } 
                        });

                        return found; 

                    }, this )
                    .map( function( inst ) {
                        return inst.get("symbol");
                    }, this )
                    .value( );

                return instruments;
            },

            showAll: function( e ) {

                e.preventDefault( );

                e.stopPropagation( );

                if ( this.loaded === "all" ) {
                    // already loaded
                    return;
                }

                // Reset url if coming from deep link
                App.views.App.navigatePath( "/stocks-etfs", false );
            
                this.$search.val("");

                this.renderRows("all");
            }
        });
        
        return InstrumentsView;
    }
);
