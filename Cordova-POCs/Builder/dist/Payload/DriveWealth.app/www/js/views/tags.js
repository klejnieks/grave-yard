define([
    'backbone',
    'App',
    'App.Views.Helpers',
    'App.Events',
    'text!templates/tags.html',
    'text!templates/tag-row.html',
    'moment'
],
    function( Backbone, App, AppViewHelpers, AppEvents, tagsTemplate, tagRowTemplate, moment ) {

        var TagsView = Backbone.View.extend({

            events: {
                "click .tag, div[data-target-path]": function( e ) {
                    App.views.App.navigate( e );
                },
                "click .favorite": function( e ) {
                    App.views.App.updateFavorite( e );
                }
            },

            initialize: function( options ) {

                var title = "";

                if ( options.tags ) {
                    _.each( options.tags, function( tag ){
                        title += ( title.length > 0 ? ", " : "" ) + "\"" + tag + "\"";
                    });
                }

                title = "Articles tagged " + title;

                // Render the title in the action bar
                App.views.App.renderActionTitle({
                    "title": title 
                });

                // Render the favorite icon in the action bar
                App.views.App.renderActionItem({
                    "type":           "favorite",
                    "id":             options.tags.join(","),
                     "favoriteType":  "tag"
                });

                this.templateTags =    _.template( tagsTemplate );
                this.templateTagRow =  _.template( tagRowTemplate );
            },

            render: function( ) {

                var data = {};

                _.extend( 
                    data, {
                        "tags":  this.collection.toJSON(),
                        "moment":          moment,
                        "favorites":       App.collections.favorites.toJSON(),
                        "loggedIn":        App.models.userSession.loggedIn(),
                        "templateTagRow":  this.templateTagRow,
                        "helpers":         AppViewHelpers, 
                        "parent":          null,
                        "polyglot":        App.polyglot
                    }
                );

                this.$el.empty().html( this.templateTags({ "data": data }));

                return this;
            },

            removeView: function() {

                this.stopListening(); 

                this.undelegateEvents();
            }
        });
        
        return TagsView;
    }
);
