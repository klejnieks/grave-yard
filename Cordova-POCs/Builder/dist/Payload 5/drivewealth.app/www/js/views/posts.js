define([
    'backbone',
    'App',
    'App.Views.Helpers',
    'App.Events',
    'text!templates/posts.html',
    'text!templates/post-row.html',
    'moment'
],
    function( Backbone, App, AppViewHelpers, AppEvents, postsTemplate, postRowTemplate, moment ) {

        var PostsView = Backbone.View.extend({

            events: {
                "click .tag, div[data-target-path]": function( e ) {
                    App.views.App.navigate( e );
                },
                "click .favorite": function( e ) {
                    App.views.App.updateFavorite( e );
                }
            },

            tags: null,

            initialize: function( options ) {

                // Render the title in the action bar
                App.views.App.renderActionTitle({
                    "title": App.polyglot.t("Education") 
                });

                if ( _.isArray( options.tags ) && options.tags.length > 0 ) {
                    this.tags = options.tags;
                }

                this.template = _.template( postsTemplate );
                this.templateRow = _.template( postRowTemplate );
            },

            render: function( ) {

                var data = {},
                    posts,
                    searchTag;

                if ( this.tags ) {

                    // Use first tag only
                    searchTag = ( this.tags[0] ).toLowerCase( );

                    // User is searching by tag
                    posts = this.collection.chain( )
                        .filter( function( post ) {

                            var found;

                            _.each( post.get("tags"), function( el ) {
                                if ( el.toLowerCase( ) == searchTag ) {
                                    found = true;
                                } 
                            });

                            return found;
                        })
                        .map( function( post ) {
                            return post.toJSON( );
                        })
                        .value( );
                } else {
                    posts = this.collection.toJSON( );
                }

                _.extend( 
                    data, {
                        "posts":      posts,
                        "moment":     moment,
                        "favorites":  App.collections.favorites.toJSON(),
                        "renderRow":  this.templateRow,
                        "loggedIn":   App.models.userSession.loggedIn(),
                        "helpers":    AppViewHelpers, 
                        "searchTag":  searchTag,
                        "polyglot":   App.polyglot
                    }
                );

                this.$el.empty().html( this.template({ "data": data }));

                return this;
            },

            removeView: function() {

                this.stopListening(); 

                this.undelegateEvents();
            }
        });
        
        return PostsView;
    }
);
