define([
    "backbone",
    "numeral",
    "App",
    "App.Events",
    "App.Models.Favorite",
    "App.Models.Post",
    "App.Models.Goal",
    "App.Models.Instrument",
    "App.Models.Order",
    "App.Models.Position",
    "App.Models.Question",
    "moment"
], function ( Backbone, numeral, App, AppEvents, FavoriteModel, PostModel, GoalModel, InstrumentModel, OrderModel, PositionModel, QuestionModel, moment ) {

    var FavoritesCollection = Backbone.Collection.extend({

        model: FavoriteModel,

        url: function( ) {
            return App.config.api( ) + "/v1/users/" + App.models.userSession.id + "/settings";
        }, 

        // Holds the collection grouped by type
        groupedByType: {},

        // Holds the current number of fav models loaded
        modelsLoaded: 0,

        forceRefresh: false,

        // Holds all favorites keyed by account id 
        favorites: {},

        // Maps the favorite type to the model constructor
        modelConstructors: {
            "instrument": InstrumentModel,
            "position":   PositionModel,
            "question":   QuestionModel,
            "post":       PostModel, 
            "goal":       GoalModel,
            "order":      OrderModel
        },

        initialize: function( ) {

            // Force load refresh on order completed 
            this.listenTo( AppEvents, "order:completed", function( ) {
                this.forceRefresh = true;
            });
        },

        // Returns a jquery custom deferred promise...mimics jqXHR response
        sync: function( method, collection, options ) {

            // Create a custom deferred object so we can ignore 404s when user doesn't have favorites
            var favDeferred = $.Deferred(),
                userID = App.getProperty("models.userSession.id", App),
                data,
                requestType,
                requestUrl,
                ajaxOptions,
                updates,
                timer;

            if ( !userID ) {
                favDeferred.rejectWith( this, [{}, "error", "UserID not found"] );
            } 

            // "create", "read", "update", or "delete"
            if( method === "read" ) {

                requestMethod = "GET";  

                requestUrl = this.url() + "/favorites";

            } else if ( method === "update" || method === "create" ) {

                // Note: there is no PUT for this endpoint
                requestMethod = "POST";

                requestUrl = this.url();

                // Only pull out the attributes we want to save (i.e., "ID", "type", "createdWhen")
                updates = this.map( function( fav ){ 
                    return _.pick( fav.attributes, "ID", "type", "createdWhen" ); 
                }); 

                // Add them to all favorites
                this.favorites[ App.models.account.get("accountID") ] = updates;

                data = {
                    "userID":  App.models.userSession.id,
                    "key":     "favorites",
                    "value":   JSON.stringify( this.favorites ) 
                };
            }

            if ( App.engageTimer( App.config.apiTimerCaptureRate ) ) {
                timer = new App.Timer( "API", requestMethod + " /v1/users/{ID}/settings" + ( method === "read" ? "/favorites" : "" ) );
            }

            ajaxOptions = {
                url:            requestUrl,
                type:           requestMethod,
                contentType:    "application/json",
                accepts:        "application/json",
                context:        this,
                headers: {
                    "accept":                   "application/json",
                    "x-mysolomeo-session-key":  App.models.userSession.get("sessionKey")
                }
            };

            // Add data when needed on POST
            if ( typeof data !== undefined ) {
                ajaxOptions.data = JSON.stringify( data );
            }
 
            $.ajax( ajaxOptions )
            .done(function( data, textStatus, jqXHR ) {

                if ( timer ) {
                    timer.end( "success" );
                }

                // Check for data and value 
                if ( !data || !App.getProperty( "value", data ) ){

                    AppEvents.trigger("c::favorites::sync::error", {
                        msg: "Favorites not returned on 200. [data: " + JSON.stringify( data ) + "]"
                    });    

                    favDeferred.rejectWith( this, [jqXHR, "error", "Data not returned"] );

                    return;
                }

                try {
                    this.favorites = JSON.parse( data.value ); 
                } catch ( e ) {

                    AppEvents.trigger("c::favorites::sync::error", {
                        msg: "Favorites could not be parsed.  [data: " + data.value + "]"
                    });    

                    favDeferred.rejectWith( this, [jqXHR, "error", "Favorites value could not be parsed"] );

                    return;
                }

                // Only set on read since they have no unique id and can't be merged
                if ( method === "read" && this.favorites[ App.models.account.get("accountID") ] ) {
                    this.set( this.favorites[ App.models.account.get("accountID") ], { "merge": true } );
                }

                // Group the collection by type 
                this.groupByType();

                AppEvents.trigger("favorites:loaded", {
                    msg: "Favorites loaded."
                });    

                favDeferred.resolveWith( this, [this.favorites, "success", jqXHR] );

            })
            .fail( function( jqXHR, textStatus, errorThrown ) {

                if ( timer ) {
                    timer.end( "fail" );
                }

                // Check for 404
                if ( method === "read" && jqXHR.status === 404 ) {
                    // This is okay...user has no favorites
                    favDeferred.resolveWith( this, [ [], "success", jqXHR ] );
                    return;
                }

                AppEvents.trigger("c::favorites::sync::error", {
                    msg: "Favorites could not be loaded. [status: " + jqXHR.status + " error: " + errorThrown + "]"
                });    

                favDeferred.rejectWith( this, [jqXHR, "error", "Favorites could not be loaded API error:" + errorThrown] );
            });

            return favDeferred;
        },

        update: function( type, id, remove ) {

            var favorite,
                model;

            remove = remove || false;

            // Is this an existing favorite
            favorite = this.findWhere({ "ID":id, "type":type });            

            if ( favorite ) {
                // Remove from collection
                this.remove( favorite );

            } else if ( !remove ) {
                // Get the model
                model = App.collections[type + "s"].get( id );

                /*
                if ( !model ) {
                    // cannot add witout model 
                    return;
                } 
                */

                // Add to collection
                this.add({
                    "ID":           id,
                    "type":         type,
                    "createdWhen":  moment.utc().format("YYYY-MM-DDTHH:mm:ss")+"Z",
                    "model":        model,
                    "loaded":       true
                });
            } 
   
            syncDeferred = this.sync("update", this, {})
            .always( function( ) {
                if ( type === "instrument" ) {
                    AppEvents.trigger( "favorites:instrumentAdded" );
                }
            });

            return syncDeferred;
        },

        // Loads the models for all of the favorites one by one.  Pass in a "threshold" value for the min number
        //   of favs to load before the returned deferred object is marked resolved (default: all)
        //
        //   Returns a jquery promise object that mimics the jqXhr promise.
        loadAll: function( options ) {

            options = options ? options : {};

            var threshold,
                favsDeferred = $.Deferred(),
                that = this;

            if ( options.threshold && options.threshold <= this.length ) {
                threshold = options.threshold;
            } else {
                threshold = this.length;
            }

            this.modelsLoaded = 0;

            // Loop through the collection and load the details
            this.each( function( favorite ) {

                var model,
                    type = favorite.get("type"),
                    data = {},
                    isLoaded;

                // Is this model already loaded in the app?
                if ( type !== "tag" ) {
                    isLoaded = App.collections[ type + "s" ].get( favorite.get("ID") ); 
                }

                that.modelsLoaded += 1;

                if ( isLoaded && !this.forceRefresh ) {

                    favorite.set({
                        "model":   isLoaded,
                        "loaded":  true
                    });
                } else if ( type === "tag" ) {

                    // No model needed for tag search
                    favorite.set({
                        "loaded":  true
                    });
                } else if ( type !== "position" && type !== "order" ) {

                    data.loaded = false;

                    // Use the idAttribute to set the ID for the model
                    data[ App.config.idAttribute[ type ] ] = favorite.get("ID");

                    model = new that.modelConstructors[ favorite.get("type") ]( data );

                    favorite.promise = model.fetch()
                        .done(function( data, textStatus, jqXHR ) {

                            favorite.set({ 
                                "model":   model,
                                "loaded":  true
                            });
                        })
                        .fail( function( jqXHR, textStatus, errorThrown ) {

                            favorite.set( "loaded", null );

                            // If not found, remove from favorites
                            if ( jqXHR.status == 404 ) {
                                that.update( type, favorite.get("ID"), true ); 
                                return;
                            }

                            AppEvents.trigger("c::favorites::loadAll::error", {
                                msg: "A Favorite could not be loaded. [status: " + jqXHR.status + " error: " + errorThrown + "]"
                            });    

                            favsDeferred.rejectWith( that, [jqXHR, "error", "A favorite could not be loaded.  API error:" + errorThrown] );
                        })
                        .always( function( ) {

                            AppEvents.trigger("favorites:modelLoaded", {
                                msg: "A favorite model has been loaded"
                            });
                        }); 
                } else {

                    // Favorite could not be loaded
                    favorite.set( "loaded", null );

                    if ( type === "position" || type === "order" ) {
                        // No longer exists...remove from favorites
                        that.update( type, favorite.get("ID"), true ); 
                    }
                } 

                if ( that.modelsLoaded >= threshold && favsDeferred.state() === "pending" ) {
                    favsDeferred.resolveWith( that, [ that.toJSON(), "success", null ] );
                }
            });

            this.forceRefresh = false;

            return favsDeferred;
        },

        // Returns true when all of the favorite models have been loaded
        modelsAreLoaded: function( ) {
            return this.modelsLoaded === this.length;
        },

        resetData: function( ) {
            
            this.groupedByType = {};

            this.modelsLoaded = 0;

            this.reset();
        },

        setByAccount: function( accountID ) {

            this.reset( this.favorites[ accountID ], { "merge": true } ); 

            // Group the collection by type 
            this.groupedByType = this.groupByType();

            // Reset models loaded count
            this.modelsLoaded = 0;
        },

        groupByType: function( ) {

            this.groupedByType = _.groupBy( this.toJSON(), "type" );

            return this.groupedByType;
        } 
    });

    return FavoritesCollection;
});
