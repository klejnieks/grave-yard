define([
    'backbone',
    'App',
    'App.Events'
], function ( Backbone, App, AppEvents ) {

    var FavoriteModel = Backbone.Model.extend({

        defaults: {},

        initialize: function( options ) {

            this.type = "favorite";
        }
    }); 
    
    return FavoriteModel;
});
