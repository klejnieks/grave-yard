define([
    'backbone',
    "App",
    "App.Events",
    "App.Collections.GoalPositions",
    'numeral'
], function ( Backbone, App, AppEvents, GoalPositionsCollection, numeral ) {

    var GoalModel = Backbone.Model.extend({

        idAttribute: "goalID",

        defaults: {
            "description":  "",
            "tags":         [],
            "urlImages":    []
        },

        url: function() {
            return App.config.api( ) + "/v1/goals/" + ( this.id ? this.id : "");
        },

        initialize: function() {

            this.type = "goal";

            // Add a local position collection to the goal model
            this.set( "positionsCollection", new GoalPositionsCollection( this.get('positions') ) ); 

            // Trigger app event on save
            this.on("sync", function( goal, attributes ){
                AppEvents.trigger("goal:loaded", {
                    goalID: goal.get("goalID")
                });
            });

            this.on("change", function() {
                this.setUrlImage();
            });

            this.listenTo( this.get("positionsCollection"), "change", function( ) {

                this.getMarkToMarket( );

                this.getProfitAndLoss( );
            }); 

            this.getMarkToMarket();

            this.getProfitAndLoss();

            this.setUrlImage();
        },

        // Calculate the current total value for the goal
        getMarkToMarket: function() {

            var percentOfGoal, 
                markToMarket = this.get("positionsCollection").chain()
                .map( function( position ) {
                    return position.get("markToMarket");
                })
                .reduce( function( memo, num ) { 
                    return memo + num;
                }, 0 )
                .value();

            this.set( "markToMarket", markToMarket );

            percentOfGoal = markToMarket / this.get("amount"); 

            this.set( "percentOfGoal", isNaN( percentOfGoal ) ? 0 : percentOfGoal );

            return markToMarket;
        },

        // Calculate profit in loss for all positions in goal
        //--> TODO: calculate for day only??
        getProfitAndLoss: function() {

            var profitAndLoss = this.get("positionsCollection").chain()
                .map( function( position ) {
                    return position.get("profitAndLoss");
                })
                .reduce( function( memo, num ) { 
                    return memo + num; 
                }, 0 )
                .value();

            this.set( "profitAndLoss", profitAndLoss );

            return profitAndLoss;                
        },

        setImage: function( file ) {

            var data,
                that = this,
                timer,
                options,
                transfer;


            if ( !window.FormData ) {
                //--> TODO: trigger error
 
                return;
            }

            data = new FormData();

            data.append( "images", file );

            if ( App.engageTimer( App.config.apiTimerCaptureRate ) ) {
                timer = new App.Timer( "API", "POST /v1/goals/{ID}/images" );
            }

            $.ajax({
                "url":          App.config.api( ) + "/v1/goals/" + this.id + "/images",
                "data":         data,
                "processData":  false,
                "contentType":  false,
                "type":         "POST",
                "dataType":     "text",
                "headers": {
                    "accept":                   "application/json",
                    "x-mysolomeo-session-key":  App.models.userSession.get("sessionKey")
                }
            })
            .done( function( data, textStatus, jqXHR ) {
    
                var imageUrl = null;

                if ( timer ) {
                    timer.end( "success" );
                }
 
                if ( textStatus === "success" ) {

                    that.setUrlImage();

                    that.set( "forceRefresh", true );

                    AppEvents.trigger("goal:imageSet", {
                        "imageUrl": imageUrl,
                        "msg":      "Image has been uploaded."
                    });
                }
            })
            .fail( function( jqXHR, textStatus, errorThrown ) {

                    var response,
                        responseMsg = "";

                    if ( timer ) {
                        timer.end( "fail" );
                    }

                    // Check for message from server 
                    if ( jqXHR && jqXHR.responseText ) {

                        try { 

                            response = JSON.parse( jqXHR.responseText );

                            if ( response && response.message ) {
                                responseMsg = response.message;
                            }

                        } catch ( e ) {
                            // Do nothing
                        } 
                    }

                    AppEvents.trigger("m::goal::setImage::error", {
                        "msg":  "Image could not be uploaded. [status: " + jqXHR.status + " error: " + errorThrown + "]",
                        "responseMsg": responseMsg
                    });
            });
        },

        setImagePhonegap: function( fileUrl ) {

            var _this = this,
                options,
                transfer;

            options = new FileUploadOptions( );

            options.fileKey = "images";

            options.fileName = fileUrl.substr( fileUrl.lastIndexOf('/') + 1 ); 

            options.mimeType = "image/jpeg";

            options.chunkedMode = true;

            options.headers = {
                "Accept":                   "application/json",
                "x-mysolomeo-session-key":  App.models.userSession.get("sessionKey")
            }

            transfer = new FileTransfer( );

            transfer.upload( fileUrl, encodeURI( App.config.api( ) + "/v1/goals/" + this.id + "/images" ), function( result ) {

                var imageUrl = null;

                _this.setUrlImage();

                _this.set( "forceRefresh", true );

                AppEvents.trigger("goal:imageSet", {
                    "imageUrl": imageUrl,
                    "msg":      "Image has been uploaded."
                });

            }, function( error ) {

                AppEvents.trigger("m::goal::setImagePhonegap::error", {
                    "msg":  "Image could not be uploaded. [code: " + error.code + " source: " + error.source + " target:" + error.target + "]",
                    "responseMsg": "Phonengap File Transfer Error Code: " + error.code 
                });
            }, options );
        },

        setUrlImage: function( ) {

            var images = this.get("urlImages");

            this.set( "imageUrl", $.isArray( images ) && images.length > 0 ? images[0] : ( App.config.appRoot + 'img/photo-default-goal.jpg' ) ); 
        },

//--> TODO: Implement
        // Get the quantity of the specified instrument allocated to this goal
        getQtyByInstrument: function( instrumentID ) {
            return Math.floor( Math.random() * 100 ); 
        }
    });

    var GoalModelException = function( message ) {

        this.message = message;

        this.name = "GoalModelException";
    };

    return GoalModel;
});
