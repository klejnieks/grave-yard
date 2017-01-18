define([
    'backbone',
    'App',
    'App.Events',
    'App.Models.Position'
], function ( Backbone, App, AppEvents, PositionModel ) {

    var PositionsCollection = Backbone.Collection.extend({

        model: PositionModel,

        initialize: function( models, options ) {

            this.on( "change", function( ) {
                AppEvents.trigger("positions:change", {
                    "msg": "Positions have been updated"
                });
            });

            this.on( "reset", function( ) {
                AppEvents.trigger("positions:set", {
                    "msg": "Positions have been set"
                });
            });

            this.listenTo( AppEvents, "accounts:loaded", function( ) {
                if ( App.models.account ) {
                    this.reset( App.models.account.get("positions") ); 
                }
            }, this);
        },

        getMarkToMarket: function() {

            var markToMarket = this.chain()
                .map( function( position ) {
                    return position.get("markToMarket");
                })
                .reduce( function( memo, num ) { 
                    return memo + num; 
                }, 0 )
                .value();

            return markToMarket;
        },
    
        getByInstrumentId: function( instrumentID ) {

            return this.findWhere({ "instrumentID": instrumentID });
        },

        getProfitAndLoss: function( ) {

            var profitAndLoss = this.chain( )
                .map( function( position ) {
                    return position.get("profitAndLoss");
                })
                .reduce( function( memo, num ) {    
                    return memo + num;
                }, 0 )
                .value( );
        
            return profitAndLoss;
        }
    });

    return PositionsCollection;
});
