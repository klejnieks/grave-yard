define([
    'backbone',
    'App',
    'App.Events',
    'App.Models.FeatureToggle'
], function ( Backbone, App, AppEvents, FeatureToggleModel ) {

    var FeatureTogglesCollection = Backbone.Collection.extend({

        model: FeatureToggleModel,

        url: function() {
            return App.config.api( ) + "/v1/featureToggles/";
        },

        initialize: function() {

        },

        isEnabled: function(feature) {
          var featureModel = this.findWhere({featureToggleID: feature});
          return featureModel ? featureModel.get("enabled") : false;
        }

    });

    return FeatureTogglesCollection;
});
