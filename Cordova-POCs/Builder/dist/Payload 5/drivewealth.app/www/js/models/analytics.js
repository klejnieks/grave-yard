define([
    "backbone",
    "App",
    "App.Events",
    "moment"
], function ( Backbone, App, AppEvents, moment ) {

    var AnalyticsModel = Backbone.Model.extend({

        authorization: null,

        library: "api",

        identified: false,

        context: {},

        initialize: function( options ) {

            if ( window.analytics ) {
                this.library = "js";
            } else {
                this.setAuthorization( );
            }

            this.context = {
                "userAgent": App.uaParser.getUA(),
                "library": {
                    "name":     "DriveWealth (" + App.config.buildType + ")",
                    "version":  App.config.version 
                }
            };
        },

        setAuthorization: function( ) {

            this.authorization = "Basic " + btoa( App.config.segmentKey + ":" ); 

            return this.authorization;
        },

        setAnonymousID: function( ) {

            this.anonymousID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });

            App.views.App.setCookie( "seganon", this.anonymousID );

            return this.anonymousID;
        },

        getAnonymousID: function( ) {

            if ( !this.anonymousID ) {

                // Check if it's cookied
                this.anonymousID = App.views.App.getCookie("seganon");

                if ( !this.anonymousID ) { 
                    this.setAnonymousID( );
                }
            }

            return this.anonymousID;
        },

        page: function( options ) {

            var jqXHR,
                jqXHR2,
                data,
                userID = App.models.userSession.get("userID"),
                anonymousID = this.getAnonymousID( ),
                campaign = {},
                campaignProps = {};

            if ( !userID ) {
                userID = App.models.user.get("userID");
            }

            if ( App.campaign && App.campaign["utm_campaign"] ) {

                // Used for passing in context
                campaign = {
                    "campaign": {
                        "name": App.campaign["utm_campaign"],
                        "content": App.campaign["utm_content"],
                        "medium": App.campaign["utm_medium"],
                        "source": App.campaign["utm_source"],
                        "term": App.campaign["utm_term"]
                    }
                };

                // Used for property values
                campaignProps = {
                    "utm_campaign":     App.campaign["utm_campaign"],
                    "utm_content":  App.campaign["utm_content"],
                    "utm_medium":   App.campaign["utm_medium"],
                    "utm_source":   App.campaign["utm_source"],
                    "utm_term":     App.campaign["utm_term"]
                };

                _.extend( options, campaignProps );
            }

            if ( this.library === "js" ) {

                analytics.page( undefined, options );

            } else {

                data = {
                    "userId":       userID ? userID : undefined,
                    "anonymousId":  anonymousID,
                    "timestamp":    moment.utc().toISOString(),
                    "properties": {
                        "path":      Backbone.history.location.pathname,
                        "name":      options.name,
                        "referrer":  undefined,
                        "title":     "DriveWealth - Investing with a purpose. You.",
                        "search":    Backbone.history.location.search,
                        "url":       Backbone.history.location.href
                    },
                    "context":   _.extend( {},  this.context, campaign ),
                    "writeKey":  App.config.segmentKey
                };

                jqXHR = $.ajax({
                    "url":          App.config.segmentUrl + "/page",
                    "type":         "POST",
                    "dataType":     "json",
                    "contentType":  "application/json",
                    "accepts":      "application/json",
                    "context":      this,
                    "data":         JSON.stringify( data )
                });

                if ( !this.identified ) {
                    this.identify( );
                }
            }

            return jqXHR;
        }, 

        identify: function( userID, options ) {

            var jqXHR,
                data,
                anonymousID;

            options = options || {};

            if ( this.library === "js" ) {
                analytics.identify( userID, options );
            } else {

                anonymousID = this.getAnonymousID( );

                data = {
                    "userId":       userID ? userID : undefined,
                    "anonymousId":  anonymousID,
                    "timestamp":    moment.utc().toISOString(),
                    "traits":       options,
                    "context":      _.extend( {},  this.context ),
                    "writeKey":     App.config.segmentKey
                };
                
                jqXHR = $.ajax({
                    "url":          App.config.segmentUrl + "/identify",
                    "type":         "POST",
                    "dataType":     "json",
                    "contentType":  "application/json",
                    "accepts":      "application/json",
                    "context":      this,
                    "data":         JSON.stringify( data )                
                })
                .always( function( ) {
                    this.identified = true;
                });
            }

            return jqXHR;
        },

        track: function( eventName, options ) {

            var jqXHR,
                data,
                userID = App.models.userSession.get("userID"),
                anonymousID,
                campaign = {},
                campaignProps = {};

            options = options || {};

            if ( !userID ) {
                userID = App.models.user.get("userID");
            }

            if ( App.campaign && App.campaign["utm_campaign"] ) {

                // Used for passing in context
                campaign = {
                    "campaign": {
                        "name": App.campaign["utm_campaign"],
                        "content": App.campaign["utm_content"],
                        "medium": App.campaign["utm_medium"],
                        "source": App.campaign["utm_source"],
                        "term": App.campaign["utm_term"]
                    }
                };

                // Used for property values
                campaignProps = {
                    "utm_campaign":     App.campaign["utm_campaign"],
                    "utm_content":  App.campaign["utm_content"],
                    "utm_medium":   App.campaign["utm_medium"],
                    "utm_source":   App.campaign["utm_source"],
                    "utm_term":     App.campaign["utm_term"]
                };

                _.extend( options, campaignProps );
            }

            if ( this.library === "js" ) {

                analytics.track( eventName, options );

            } else {

                anonymousID = this.getAnonymousID( );

                data = {
                    "userId":       userID ? userID : undefined,
                    "anonymousId":  anonymousID,
                    "event":        eventName, 
                    "properties":   options,
                    "timestamp":    moment.utc().toISOString(),
                    "context":      _.extend( {},  this.context, campaign ),
                    "writeKey":     App.config.segmentKey
                };

                jqXHR = $.ajax({
                    "url":          App.config.segmentUrl + "/track",
                    "type":         "POST",
                    "dataType":     "json",
                    "contentType":  "application/json",
                    "accepts":      "application/json",
                    "context":      this,
                    "data":         JSON.stringify( data )
                });
            }

            return jqXHR;
        }    
    });

    return AnalyticsModel;
});
