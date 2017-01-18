define([
    'backbone',
    'App',
    'App.Events',
    'App.Models.Order'
], function ( Backbone, App, AppEvents, OrderModel ) {

    var OrdersCollection = Backbone.Collection.extend({

        model: OrderModel,

        url: function( ) {
            return App.config.api( ) + '/v1/orders';
        },

        initialize: function( models, options ) {

            this.on( "change", function( ) {
                AppEvents.trigger("orders:change", {
                    "msg": "Orders have been updated"
                });
            });

            this.on( "reset", function( ) {
                AppEvents.trigger("orders:set", {
                    "msg": "Orders have been set"
                });
            });

            this.listenTo( AppEvents, "accounts:loaded", function( ) {
                if ( App.models.account ) {
                    this.set( App.models.account.get("orders"), {"remove":false} ); 
                }
            }, this);
        }
    });

    return OrdersCollection;
});
