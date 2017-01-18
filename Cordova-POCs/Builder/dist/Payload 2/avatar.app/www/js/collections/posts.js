define([
    'backbone',
    'numeral',
    'App',
    'App.Events',
    'App.Models.Post'
], function ( Backbone, numeral, App, AppEvents, PostModel ) {

    var PostsCollection = Backbone.Collection.extend({

        model: PostModel,

        url: function( ) {
            return App.config.api( ) + '/v1/eduContents';
        },

        forceRefresh: false,

        initialize: function() {

            this.on( "reset", function( ) {
                AppEvents.trigger( "posts:loaded", this );
            });
        },

        // Convenience function for getting the specified post and adding it to the collection
        getPost: function( id ) {

            var post = new PostModel({
                "eduContentID": id
            }),

            postDeferred = $.Deferred();

            post.fetch({ "context": this })
                .done( function( data ) {

                    if ( !data.eduContentID ) {

                        AppEvents.trigger( "c::posts::getPost::error", {
                            "msg": "Educational post could not be loaded.  Missing content id. [data: " + data.eduContentID + "]",
                            "friendlyMsg": App.polyglot.t("collections_posts_not_loaded"),
                            "showMessage": true
                        });

                        postDeferred.rejectWith( this, ["Educational post details could not be loaded"] );

                        return;
                    }

                    // Add it to the collection   
                    this.add( post, {
                        "merge": true 
                    });

                    this.forceRefresh = true;
 
                    AppEvents.trigger( "post:loaded", post );

                    postDeferred.resolveWith( this, [data] );
                })
                .fail( function( jqXHR, textStatus, errorThrown ) {

                    AppEvents.trigger( "c::posts::getPost::error", {
                        "msg": "Educational post could not be loaded. [status: " + jqXHR.status + " error: " + errorThrown + "]",
                        "friendlyMsg": App.polyglot.t("collections_posts_not_loaded"),
                        "showMessage": true
                    });

                    postDeferred.rejectWith( this, ["Educational post details could not be loaded"] );
                });

            return postDeferred;
        }

    });

    return PostsCollection;
});
