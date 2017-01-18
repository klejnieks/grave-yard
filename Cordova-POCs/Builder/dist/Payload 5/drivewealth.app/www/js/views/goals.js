define([
    'backbone',
    'App',
    'App.Views.Helpers',
    'App.Events',
    'text!templates/goals.html',
    'text!templates/goal-row.html',
    'text!templates/goal-row/detail.html'
], function( Backbone, App, AppViewHelpers, AppEvents, goalsTemplate, goalRowTemplate, goalRowDetailTemplate ) {

        var GoalsView = Backbone.View.extend({

            events: {
                "click .tag, div[data-target-path]": function( e ) {
                    App.views.App.navigate( e );
                },
                "click .favorite": function( e ) {
                    App.views.App.updateFavorite( e );
                }
            },

            $goals: null,

            acctIntervalID: null,

            initialize: function( options ) {

                // Check for required collection of goals
                if ( typeof this.collection === 'undefined' ) {
                    throw new GoalsViewException("View :: Goals :: Goal collection is required on render");
                }

                // Render the action button
                App.views.App.renderActionItem({
                    "type":  "button",
                    "title": App.polyglot.t("Add"),
                    "href":  "/goals/add"
                });

                // Render the title in the action bar
                App.views.App.renderActionTitle({
                    "title": App.polyglot.t("Goals")
                });

                this.template = _.template( goalsTemplate );
                this.templateGoalRow = _.template( goalRowTemplate );
                this.templateGoalDetail = _.template( goalRowDetailTemplate );

                this.listenTo( AppEvents, 'instruments:quotesUpdated goals:reset', this.renderSubTemplates );

                // Set account refresh rate
                if ( App.config.accountRefreshRate > 0 ) {
                    this.acctIntervalID = window.setInterval( App.collections.accounts.refreshAccts, App.config.accountRefreshRate );
                }
            },

            render: function() {

                var data = {},
                    visited = App.views.App.getVisited( ) || {};

                // Remove tool tips
                this.removeToolTips();

                _.extend(
                    data, {
                        "goals":               this.collection.toJSON(),
                        "favorites":           App.collections.favorites.toJSON(),
                        "templateGoalRow":     this.templateGoalRow,
                        "templateGoalDetail":  this.templateGoalDetail,
                        "helpers":             AppViewHelpers,
                        "visited":             visited.goals || false,
                        "polyglot":            App.polyglot
                    }
                );

                this.$el.empty().html( this.template({ "data": data }) );

                this.$goals = this.$("#goals");

                $( document ).foundation( );

                if ( !visited.goals && App.areCookiesEnabled() ) {

                    visited.goals = true;

                    App.views.App.setCookie( "bhdt", JSON.stringify( visited ) );

                    $( document ).foundation( "joyride", "start" );
                }

                return this;
            },

            removeView: function() {

                // Remove tool tips
                this.removeToolTips();

                window.clearInterval( this.acctIntervalID );

                this.stopListening();

                this.undelegateEvents();
            },

            // Loop through the goals and only render the details sub template
            renderSubTemplates: function( ) {

                var $goal;

                this.collection.forEach( function( model ) {

                    $goal = this.$goals.find( "#" + model.get("goalID") );

                    $goal.find(".goal-detail").html( this.templateGoalDetail({
                        "data": {
                            "goal":       model.toJSON(),
                            "favorites":  App.collections.favorites.toJSON(),
                            "helpers":    AppViewHelpers,
                            "polyglot":   App.polyglot
                        }
                    }));
                }, this );
            }
        });

        var GoalsViewException = function( message ) {

            this.message = message;

            this.name = 'GoalsViewException';
        };

        return GoalsView;
    }
);
