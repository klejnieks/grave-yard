define([
    'backbone',
    'App',
    'App.Events',
    'App.Views.Helpers',
    "App.Models.Goal",
    'text!templates/goal-detail.html',
    'text!templates/goal-detail/meter.html',
    'text!templates/goal-detail/pnl.html',
    "text!templates/tags.html",
    "text!templates/tag-row.html",
    "moment"
], function( Backbone, App, AppEvents, AppViewHelpers, GoalModel, goalDetailTemplate, goalDetailMeterTemplate, goalDetailPnlTemplate, tagsTemplate, tagRowTemplate, moment ) {

    var GoalDetailView = Backbone.View.extend({

        events: {
            "click .tag, div[data-target-path]": function( e ) {
                App.views.App.navigate( e );
            },
            "click .favorite": function( e ) {
                App.views.App.updateFavorite( e );
            }
        },

        tagPromise: null,

        initialize: function( options ) {

            // Render the back button in the action bar
            App.views.App.renderMenuButton("back");

            // Render the title in the action bar
            App.views.App.renderActionTitle({
                "title": AppViewHelpers.escapeHtml( this.model.get('description') )
            });

            // Render the action button
            App.views.App.renderActionItem({
                "type":     "button",
                "title":    App.polyglot.t("Edit"),
                "href":     "/goals/edit/" + this.model.get('goalID')
            });

            this.template = _.template( goalDetailTemplate );
            this.templateGoalMeter = _.template( goalDetailMeterTemplate );
            this.templateGoalPnl   = _.template( goalDetailPnlTemplate );
            this.templateTags =     _.template( tagsTemplate );
            this.templateTagRow =   _.template( tagRowTemplate );

            // Check for tags search promise
            if ( options.tagPromise ) {
                this.tagPromise = options.tagPromise;
            }

            this.listenTo( AppEvents, 'instruments:quotesUpdated', this.renderSubViews );
        },

        render: function() {

            var data = this.model.toJSON(),
                _this = this;

            // Remove tool tips
            this.removeToolTips();

            // Loop through each position and calculate MTM and PNL
            this.model.get('positionsCollection').each( function( positionModel, index, list ) {

                // Set a reference to the position in the data object for additional values
                var position = _.find( data.positions, function ( pos ) { return pos.instrumentID === positionModel.get('instrumentID'); } );

                if ( position ) {

                    position.markToMarket = positionModel.get("markToMarket");

                    position.profitAndLoss = positionModel.get("profitAndLoss");

                    position.instrument = positionModel.instrument.toJSON();

                    position.ratioOfGoal = position.markToMarket / data.markToMarket;
                }
            });

            // Check for url image
            data.imageUrl = AppViewHelpers.getImage( data.urlImages );

            if ( !data.imageUrl ) {
                // Use default image
                data.imageUrl = App.config.appRoot + "img/photo-default-goal.jpg";
            }

            _.extend(
                data, {
                    "favorites":        App.collections.favorites.groupedByType,
                    "helpers":          AppViewHelpers,
                    "renderGoalMeter":  this.templateGoalMeter,
                    "renderGoalPnl":    this.templateGoalPnl,
                    "polyglot":         App.polyglot
                }
            );

            this.$el.empty().html( this.template( { "data": data } ) );

            $( document ).foundation( );

            // Populate tags when done
            if ( this.tagPromise ) {
                this.tagPromise.done( function( data, textStatus, jqXHR ) {

                    data = {
                        "tags":            App.collections.tags.toJSON(),
                        "helpers":         AppViewHelpers,
                        "templateTagRow":  _this.templateTagRow,
                        "moment":          moment,
                        "favorites":       App.collections.favorites.toJSON(),
                        "loggedIn":        App.models.userSession.loggedIn(),
                        "parent":          _this.model,
                        "polyglot":        App.polyglot
                    };

                    _this.$("#tags-container").empty().html( _this.templateTags( { "data": data } ) );
                });
            }

            document.body.scrollTop = document.documentElement.scrollTop = 0;
            return this;
        },

        removeView: function() {

            // Remove tool tips
            this.removeToolTips();

            this.stopListening();

            this.undelegateEvents();
        },

        renderSubViews: function( ) {

            var data = this.model.toJSON();

            _.extend(
                data, {
                    "helpers": AppViewHelpers,
                    "polyglot":  App.polyglot
                }
            );

            // Render PNL subview
            this.$(".goal-pnl").html(
                this.templateGoalPnl({
                    "data": data
                })
            );

            // Render meter subview
            this.$(".goal-meter").html(
                this.templateGoalMeter({
                    "data": data
                })
            );
        }
    });

    return GoalDetailView;
});
