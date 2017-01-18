define([
    'backbone',
    'App',
    'App.Views.Helpers',
    'App.Events',
    'text!templates/order-confirm.html',
    'moment'
],
    function( Backbone, App, AppViewHelpers, AppEvents, orderConfirmTemplate, moment ) {

        var OrderConfirmView = Backbone.View.extend({

            events: {
            },

            initialize: function( options ){

                this.template = _.template( orderConfirmTemplate );
            },

            render: function() {

                var data = this.model.toJSON();

                data.polyglot = App.polyglot;

                data.cdn = App.config.cdn( );

                data.orderExpires = null;

                if ( data.ordType == 2 && data.isoTimeRestingOrderExpires ) {
                    data.orderExpires = moment( data.isoTimeRestingOrderExpires ).format("LLLL"); 
                }

                _.extend( data, AppViewHelpers );

                this.$el.empty().html(
                    this.template( data )
                );

                // Completed order sent to segment
                App.analytics.track('Completed Order', {
                  orderId:  data.orderNo,
                  total:    data.ordType == 3 ? data.estimatedCommission : data.commission,
                  priceTotal:  data.ordType == 3 ? data.estimatedPrice : data.actualPrice,
                  currency: 'USD',
                  ordType:  data.ordType == 3 ? "Stop" : "Market",
                  side:     data.side === "B" ? "Buy" : "Sell",
                  products: [
                    {
                      id:       data.instrumentID,
                      sku:      data.symbol,
                      name:     data.instrument.name,
                      price:    data.ordType == 3 ? data.price : data.actualRate,
                      quantity: data.orderQty,
                      category: ( App.models.account.get("accountType") === 2 ) ? "Live" : "Practice",
                      autoStop: data.autoStop
                    }
                  ]
                });

                return this;
            },

            removeView: function() {

                this.stopListening();

                this.undelegateEvents();
            }
        });

        return OrderConfirmView;
    }
);
