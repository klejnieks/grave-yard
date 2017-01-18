define([
    'backbone',
    'App',
    'App.Events',
    'App.Views.Helpers',
    'text!templates/marketplace.html'
], function( Backbone, App, AppEvents, AppViewHelpers, marketplaceTemplate ) {

    var MarketplaceView = Backbone.View.extend({


        events: {
          "click a[data-target-path] ": function( e ) {
              App.views.App.navigate( e );
          },
          "click a.cta-affiliate ": "trackEvent"
        },

        initialize: function( options ) {

            // Render the title in the action bar
            App.views.App.renderActionTitle({
                "title": App.polyglot.t("Marketplace")
            });

            this.template = _.template( marketplaceTemplate );
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

        trackEvent: function(e) {
           var title = $(e.target).data("title"),
               affiliate = $(e.target).data("affiliate");

           App.analytics.track('Proposed Marketplace Purchase ', {
              category:   'Marketplace',
              label:      title,
              affiliate:  affiliate
            });
        },

        removeView: function() {

            // Remove tool tips
            this.removeToolTips();

            this.stopListening();

            this.undelegateEvents();
        }

    });

    return MarketplaceView;
});
