define([
    "backbone",
    "App",
    "App.Events"
], function ( Backbone, App, AppEvents ) {

    var PositionModel = Backbone.Model.extend({

        defaults: {},

        idAttribute: "instrumentID",

        initialize: function( options ) {

            this.type = "position";

            this.instrument = App.collections.instruments.get( this.get("instrumentID") );

            if ( !this.instrument ) {
                AppEvents.trigger( "m::position::initialize::error", {
                    friendlyMsg: App.polyglot.t("models_position_not_found"),
                    msg: "Position model initialization error.  Cannot load instrument." 
                });
                return;
            }

            this.set("instrument", this.instrument.toJSON() ); 

            this.setMarkToMarket();

            this.setProfitAndLoss();

            this.setVolumeWeightedAvg();

            this.listenTo( this.instrument, "change", function( instrument ) {

                this.set("instrument", this.instrument.toJSON() ); 

                this.setMarkToMarket();

                this.setProfitAndLoss();

                this.setVolumeWeightedAvg();
            });
        },

        // Calculate the total current value of the position
        setMarkToMarket: function() {

            var markToMarket,
                prevMarkToMarket = this.get("markToMarket"),
                markToMarketChange;

            if( typeof this.instrument !== "undefined" ) { 

                if ( this.get("openQty") > 0 ) {
                    markToMarket = this.get("openQty") * this.instrument.get("rateBid");
                } else {
                    markToMarket = this.get("openQty") * this.instrument.get("rateAsk");
                }

                if ( prevMarkToMarket ) {
                    markToMarketChange = markToMarket - prevMarkToMarket;
                }
            }

            this.set({
                "markToMarket": markToMarket, 
                "prevMarkToMarket": prevMarkToMarket,
                "markToMarketChange": markToMarketChange
            });

            return markToMarket;
        },

        setProfitAndLoss: function() {

            var profitAndLoss,
                prevProfitAndLoss = this.get("profitAndLoss"),
                profitAndLossChange;

            if( typeof this.instrument !== "undefined" ) {

                if ( this.get("openQty") > 0 ) {
                    profitAndLoss = ( this.get("openQty") * this.instrument.get("rateBid") ) - this.get("costBasis"); 
                } else {
                    profitAndLoss = ( this.get("openQty") * this.instrument.get("rateAsk") ) - this.get("costBasis"); 
                }

                if ( prevProfitAndLoss ) {
                    profitAndLossChange = profitAndLoss - prevProfitAndLoss;
                }
            }
            
            this.set({
                "profitAndLoss": profitAndLoss,
                "prevProfitAndLoss": prevProfitAndLoss,
                "profitAndLossChange": profitAndLossChange  
            });

            return profitAndLoss;
        },

        setVolumeWeightedAvg: function( ) {

            var volumeWeightedAvg = this.get("costBasis") / this.get("openQty"); 

            this.set({
                "volumeWeightedAvg": volumeWeightedAvg 
            });

            return volumeWeightedAvg;
        }
    });

    return PositionModel;
});
