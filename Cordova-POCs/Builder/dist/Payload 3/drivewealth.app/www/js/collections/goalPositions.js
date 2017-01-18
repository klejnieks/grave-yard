define([
    'backbone',
    'App',
    'App.Events',
    'App.Models.Position'
], function ( Backbone, App, AppEvents, PositionModel ) {

    var GoalPositionsCollection = Backbone.Collection.extend({

        model: PositionModel,

        initialize: function( models, options ) {

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
        }
    });

    return GoalPositionsCollection;
});
