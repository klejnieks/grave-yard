define([
    'backbone',
    'App',
    'App.Events',
    'App.Views.Helpers',
    'text!templates/learning-markets.html'
], function( Backbone, App, AppEvents, AppViewHelpers, learningMarketsTemplate ) {

    var LearningMarketsView = Backbone.View.extend({


        events: {
          "click a.cta-affiliate ": "trackEvent"
        },

        initialize: function( options ) {

            // Render the title in the action bar

            App.views.App.renderMenuButton("back");

            App.views.App.renderActionTitle({
                "title": "Learning Markets"
            });

            this.template = _.template( learningMarketsTemplate );

        },

        render: function() {

            var data = {
                "polyglot":   App.polyglot,
                "buildType":  App.config.buildType,
                "cdn":        App.config.cdn()
            };

            // Remove tool tips
            this.removeToolTips();


            this.$el.empty().html( this.template( data ) );

            return this;
        },

        trackEvent: function() {
          App.analytics.track('Proposed Marketplace Purchase', {
           category:   'Marketplace',
            label:      "Learning Markets",
            affiliate:  "Learning Markets"
          });
        },

        removeView: function() {

            // Remove tool tips
            this.removeToolTips();

            this.stopListening();

            this.undelegateEvents();
        }

    });

    return LearningMarketsView;
});
