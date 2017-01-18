define([
    'backbone',
    "App"
], function ( Backbone, App ) {

    var ExceptionModel = Backbone.Model.extend({

        url: function( ) {
            return App.config.api( ) + "/v1/appExceptions";
        },

        defaults: {
            "appTypeID": 26
        },

        intialize: function( ) {


        }

    });

    return ExceptionModel;
});
