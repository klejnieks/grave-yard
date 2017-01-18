define([
    'backbone',
    'App',
    'App.Views.Helpers',
    'App.Events',
    'text!templates/questions.html',
    'text!templates/question-row.html',
    'moment'
],
    function( Backbone, App, AppViewHelpers, AppEvents, questionsTemplate, questionRowTemplate, moment ) {

        var QuestionsView = Backbone.View.extend({

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
                    "title": App.polyglot.t("Community Q & A") 
                });

                // Render the action button
                App.views.App.renderActionItem({
                    "type":   "button",
                    "title":  App.polyglot.t("Add"),
                    "href":   "/questions/add" 
                });

                if ( _.isArray( options.tags ) && options.tags.length > 0 ) {
                    this.tags = options.tags;
                }

                this.template = _.template( questionsTemplate );
                this.templateRow = _.template( questionRowTemplate ); 
            },

            render: function( ) {

                var data = {},
                    questions,
                    searchTag;

                    if ( this.tags ) {

                        // Use first tag only
                        searchTag = ( this.tags[0] ).toLowerCase( );

                        // User is searching by tag
                        questions = this.collection.chain( )
                            .filter( function( question ) {

                                var found;

                                _.each( question.get("tags"), function( el ) {
                                    if ( el.toLowerCase( ) == searchTag ) {
                                        found = true;
                                    } 
                                });

                                return found;
                            })
                            .map( function( question ) {
                                return question.toJSON( );
                            })
                            .value( );
                    } else {
                        questions = this.collection.toJSON( );
                    }


                _.extend( 
                    data, {
                        "questions":  questions,
                        "moment":     moment,
                        "favorites":  App.collections.favorites.toJSON(),
                        "loggedIn":   App.models.userSession.loggedIn(),
                        "renderRow":  this.templateRow,
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
        
        return QuestionsView;
    }
);

