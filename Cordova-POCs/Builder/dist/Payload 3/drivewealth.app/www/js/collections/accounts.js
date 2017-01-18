define([
    "backbone",
    "numeral",
    "App",
    "App.Events",
    "App.Models.Account"
], function ( Backbone, numeral, App, AppEvents, AccountModel ) {

    var AccountsCollection = Backbone.Collection.extend({

        model: AccountModel,

        url: function( ) {
            return App.config.api( ) + "/v1/users/" + App.models.userSession.id + "/accounts";
        },

        hasLiveAcct: false,

        initialize: function() {

            _.bindAll( this, "refreshAccts", "setHasLive" );

            this.on( "reset sync", function( ) {

                this.setHasLive( );

                AppEvents.trigger("accounts:loaded", {
                    "msg": "Account has been loaded"
                });
            });

            this.on( "sync", function( ) {

                AppEvents.trigger("accounts:synced", {
                    "msg": "Account has been synced"
                });
            });
        },

        refreshAccts: function( ) {
            return this.fetch( );
        },

        setHasLive: function( ) {

            this.hasLiveAcct = this.findWhere( { "accountType": 2 } ) ? true : false;

            return this.hasLiveAcct; 
        }

    });

    return AccountsCollection;
});
