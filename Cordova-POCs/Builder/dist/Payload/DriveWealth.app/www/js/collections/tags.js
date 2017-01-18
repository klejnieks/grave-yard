define([
    'backbone',
    'App',
    'App.Events',
    'App.Models.Tag'
], function ( Backbone, App, AppEvents, TagModel ) {

    var TagsCollection = Backbone.Collection.extend({

        model: TagModel,

        url: function() {
            return App.config.api( ) + '/v1/tags/';
        }, 

        initialize: function() {

        },

        search: function( tags, count ) {

            var tagDeferred = $.Deferred(),
                timer;

            count = count ? count : "";

            if ( !tags || ( !_.isArray( tags ) && !_.isString( tags ) ) ) {
                tagDeferred.rejectWith( this, [ {}, "error", "Missing search tags requirement" ] );
            }

            tags = _.isArray( tags ) ? tags.join(",") : tags;

            if ( tagDeferred.state() === "pending" ) {

                if ( App.engageTimer( App.config.apiTimerCaptureRate ) ) {
                    timer = new App.Timer( "API", "GET /v1/tags?tags={ID}&count={ID}" );
                }

                $.ajax({
                    "url":          this.url() + "?tags=" + tags + "&count=" + count,
                    "type":         "GET",
                    "dataType":     "json",
                    "contentType":  "application/json",
                    "accepts":      "application/json",
                    "context":      this,
                    "headers": {
                        "accept":   "application/json"
                    }
                })
                .done( function( data, textStatus, jqXHR ) {

                    if ( timer ) {
                        timer.end( "success" );
                    }
 
                    if ( !data ) {

                        AppEvents.trigger("c::tags::search::error", {
                            "msg": "No data returned on tags search. [data:" + JSON.stringify( data ) + "]"
                        });

                        tagDeferred.rejectWith( this, [ jqXHR, "error", "No data returned on tags search" ] );

                        return;
                    }

                    this.reset( data );

                    AppEvents.trigger("tags:success");

                    tagDeferred.resolveWith( this, [ data, "success", jqXHR ] ); 
                })
                .fail( function( jqXHR, textStatus, errorThrown ) {

                    if ( timer ) {
                        timer.end( "fail" );
                    }

                    AppEvents.trigger("c::tags::search::error", {
                        "msg": "Unable to search for tags. [status:" + jqXHR.status + " error:" + errorThrown + "]"
                    });

                    tagDeferred.rejectWith( this, [ jqXHR, "error", "Unable to search for tags." ] );
                });
            }

            return tagDeferred;
        }
    });

    return TagsCollection;
});
