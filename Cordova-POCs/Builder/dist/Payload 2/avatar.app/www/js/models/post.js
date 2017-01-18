define([
    'backbone',
    'App',
    'App.Events'
], function ( Backbone, App, AppEvents ) {

    var PostModel = Backbone.Model.extend({

        defaults: {
            "title":         "",
            "byline":        "",
            "countDislike":  0,
            "countLike":     0,
            "countView":     0,
            "uploadedWhen":  "",
            "tags":          [],
            "urlImage":      ""
        },

        idAttribute: "eduContentID",

        url: function( ) {
            return App.config.api( ) + "/v1/eduContents/" + this.id; 
        },

        initialize: function( options ) {

            this.type = "post";
        },

        likePost: function( action ) {

            var likePromise = this.save({}, {
                "url":       this.url() + "?action=" + action,
                "dataType":  "text",
                "context":   this
            })
            .done( function( data, textStatus, jqXHR ) {

                // increment like / dislike count
                if ( action === "like" ) {
                    this.set( "countLike", this.get("countLike") + 1 );
                } else {
                    this.set( "countDislike", this.get("countDislike") + 1 );
                }

                AppEvents.trigger("postLike:" + action, {
                    "msg": ( action === "like" ? "Like" : "Dislike" ) + " added to post"
                });
            })
            .fail( function( jqXHR, textStatus, errorThrown ) {
                AppEvents.trigger("m::post::likePost::error", {
                    msg: "Like/Dislike could not be added to post. [status: " + jqXHR.status + " error: " + errorThrown + "]"

                });    
            });

            return likePromise;
        }
    });

    return PostModel;
});
