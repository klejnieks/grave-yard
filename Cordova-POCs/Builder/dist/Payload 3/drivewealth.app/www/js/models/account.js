define([
    "backbone",
    "App",
    "App.Collections.Positions",
    "App.Events"
], function ( Backbone, App, PositionsCollection, AppEvents ) {

    var AccountModel = Backbone.Model.extend({

        idAttribute: "accountID",

        defaults: {
            "accountNo":  "",
            "nickname":   ""
        },

        url: function( ) {
            return App.config.api( ) + "/v1/users/" + App.models.userSession.id + "/accounts/" + this.id;
        },


        initialize: function( options ) {

            _.bindAll( this, "refreshAcct" );

            this.type = "account";

            this.on( "change", function() {
        
                AppEvents.trigger("account:changed", {
                    "msg": "Account has been loaded"
                });
            });

            this.on("sync", function() {

                this.setCommission( );

                AppEvents.trigger("account:synced", {
                    "msg": "Account has been synced"
                });
            });

            this.set( "balance", new PositionsCollection( this.get('positions') ) );

            this.setCommission( );

            // refresh accounts on order completion
            this.listenTo( AppEvents, "order:completed order:error", function( ) {
                this.fetch();
            });
        },

        refreshAcct: function( ) {
            this.fetch( );
        },

        clearData: function( ) {

            this.clear( );

            this.set( this.defaults );

            this.stopListening();

            this.off( );
        },

        setCommission: function( ) {

            var commission = App.models.userSession.get("commissionRate");

            if ( this.get("freeTradeBalance") > 0 ) {
                commission = 0;
            }

            this.set( "commissionRate", commission );

            return commission;
        }
    });

    return AccountModel;
});
