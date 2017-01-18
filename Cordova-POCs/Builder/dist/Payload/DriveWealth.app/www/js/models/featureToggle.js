define([
    'backbone',
    'App',
    'App.Events',
    'App.Views.Helpers'
], function ( Backbone, App, AppEvents, AppViewHelpers ) {

    var FeatureToggle = Backbone.Model.extend({

        defaults: {
            "featureToggleID":  "",
            "enabled":  false,
        },

        initialize: function( options ) {

        }

    });

    return FeatureToggle;
});
