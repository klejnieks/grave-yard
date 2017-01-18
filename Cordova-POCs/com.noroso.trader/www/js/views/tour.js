define([
    'backbone',
    'App',
    'App.Events',
    'text!templates/tour.html'
], function( Backbone, App, AppEvents, tourTemplate ) {

    var TourView = Backbone.View.extend({

        events: { },

        initialize: function( options ) {

            this.template = _.template( tourTemplate );
        },

        render: function() {

            data = {
                "polyglot":         App.polyglot,
                "externalRootURL":  App.config.externalRootURL,
                "externalDomain":   App.config.externalDomain( ),
                "buildType":        App.config.buildType,
                "appRoot":          App.config.appRoot
            };

            this.$el.empty().html( this.template( data ) );

            this.$("#tour-slides").foundation({
                "orbit": {
                    "animation": "slide"
                }
            });
        }
    });

    return TourView;
});
