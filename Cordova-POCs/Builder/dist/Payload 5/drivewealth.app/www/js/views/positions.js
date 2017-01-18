define([
    'backbone',
    'App',
    'App.Views.Helpers',
    'App.Events',
    'ladda',
    'text!templates/positions.html',
    'text!templates/position-row.html',
    'text!templates/position-row/rate-ask.html',
    'text!templates/position-row/values.html',
    'text!templates/order-row.html',
    'text!templates/order-row/rates.html',
    'text!templates/goal-row.html',
    'text!templates/order-delete-confirm.html',
    'moment'
],
    function( Backbone, App, AppViewHelpers, AppEvents, Ladda, positionsTemplate, positionRowTemplate, posRateAskTemplate, posValuesTemplate, orderRowTemplate, ordRatesTemplate, goalRowTemplate, orderDeleteConfirmTemplate, moment ) {

        var PositionsView = Backbone.View.extend({

            events: {
                "click .tag, div[data-target-path]": function( e ) {
                    App.views.App.navigate( e );
                },
                "click .favorite": function( e ) {
                    App.views.App.updateFavorite( e );
                },
                "click #delete-order": "confirmDeleteOrder"
            },

            $positions: null,

            $orders: null,

            acctIntervalID: null,

            throttledRender: null,

            initialize: function( options ) {

                _.bindAll( this, "confirmDeleteOrder" );

                // Set up throttled render function
                this.throttledRender = _.throttle( this.render, 1000, { "trailing": false } );

                // Render the title in the action bar
                App.views.App.renderActionTitle({
                    "title": App.polyglot.t("Portfolio") 
                });

                this.template =               _.template( positionsTemplate );
                this.templatePosRow =         _.template( positionRowTemplate );
                this.templateOrdRow =         _.template( orderRowTemplate );
                this.templateDeleteConfirm =  _.template( orderDeleteConfirmTemplate );
                this.templatePosRateAsk =     _.template( posRateAskTemplate );
                this.templatePosValues =      _.template( posValuesTemplate );
                this.templateOrdRates =       _.template( ordRatesTemplate );

                this.listenTo( AppEvents, 'instruments:quotesUpdated', this.renderSubTemplates );

                this.listenTo( AppEvents, "positions:set orders:set", this.throttledRender );

                // Set account refresh rate
                if ( App.config.accountRefreshRate > 0 ) {
                    this.acctIntervalID = window.setInterval( App.models.account.refreshAcct, App.config.accountRefreshRate );
                }
            },

            render: function() {

                var data = {},
                    favoritePositions,
                    favoriteOrders;

                // Remove tool tips
                this.removeToolTips();

                _.extend( 
                    data, {
                        "positions":           this.collection.toJSON(), 
                        "pending":             App.collections.orders.toJSON(),
                        "favorites":           App.collections.favorites.toJSON(),
                        "templatePosRow":      this.templatePosRow,
                        "templatePosRateAsk":  this.templatePosRateAsk,
                        "templatePosValues":   this.templatePosValues,
                        "templateOrdRow":      this.templateOrdRow,
                        "templateOrdRates":    this.templateOrdRates,
                        "helpers":             AppViewHelpers,
                        "cdn":				   App.config.cdn( ),
                        "view":                "positions",
                        "markToMarket":        this.collection.getMarkToMarket( ),
                        "profitAndLoss":       this.collection.getProfitAndLoss( ),
                        "polyglot":            App.polyglot,
                        "moment":              moment
                    } 
                );
 
                this.$el.empty().html( this.template({ "data": data }));

                $( document ).foundation( );

                // jquery references for faster lookups during updates
                this.$positions = this.$("#positions");

                this.$orders = this.$("#orders");

                AppEvents.trigger("positions:rendered");
            
                return this;
            },

            removeView: function() {

                // Remove tool tips
                this.removeToolTips();

                window.clearInterval( this.acctIntervalID );

                this.stopListening(); 

                this.undelegateEvents();
            },

            renderSubTemplates: function( ) {

                var $position, 
                    $order;

                // Update positions mark to market and profit and loss
                this.$("#positionsMTM").html( AppViewHelpers.formatMoney( this.collection.getMarkToMarket( ) ) );

                this.$("#positionsPNL").html( AppViewHelpers.extractSign( this.collection.getProfitAndLoss( ) ) + AppViewHelpers.formatMoney( AppViewHelpers.removeSign( this.collection.getProfitAndLoss( ) ) ) );

                this.collection.forEach( function( model ) {

                    if ( model.get("instrument") ) {

                        $position = this.$positions.find( "#" + model.get("instrument").symbol + ".position" );

                        $position.find(".position-rate-ask").html(
                            this.templatePosRateAsk({
                                "data": {
                                    "position":  model.toJSON(),
                                    "helpers":   AppViewHelpers
                                } 
                            }) 
                        );

                        $position.find(".position-values").html(
                            this.templatePosValues({
                                "data": {
                                    "position":  model.toJSON(),
                                    "helpers":   AppViewHelpers,
                                    "polyglot":  App.polyglot 
                                } 
                            }) 
                        );
                    }
                }, this );

                App.collections.orders.forEach( function( model ) {

                    if ( model.get("orderID") && model.get("instrument") ) {

                        // Orders have a period in their id...escape for css selector
                        $order = this.$orders.find( "[data-order-id=\"" + (model.get("orderID")).replace( /(:|\.|\[|\])/g, "\\$1" ) + "\"]"  );

                        var modelData = model.toJSON();

                        $order.find(".order-rates").html(
                            this.templateOrdRates({
                                data: {
                                    order: modelData,
                                    helpers: AppViewHelpers,
                                    polyglot: App.polyglot
                                } 
                            }) 
                        );
                    }
                }, this );

                AppEvents.trigger("positions:subtemplated");
            },

            confirmDeleteOrder: function( e ) {

                var that = this,
                    newStatus,
                    orderID,
                    order,
                    data = {};
    
                e.preventDefault();

                e.stopPropagation();

                orderID = this.$( e.currentTarget ).closest("div.order").attr("data-order-id"); 

                order = App.collections.orders.findWhere({ "orderID": orderID });

                if ( !order ) {

                    AppEvents.trigger("v::positions::confirmDeletedOrder::error", {
                        "showAlert": true,
                        "msg": "Attempt made to delete an order not in the collection",
                        "friendlyMsg": App.polyglot.t("views_positions_order_delete_unavailable")
                    });

                    return;
                }

                data = order.toJSON();

                _.extend( data, {
                    "helpers": AppViewHelpers,
                    "polyglot": App.polyglot,
                    "cdn":		App.config.cdn( )
                });

                newStatus = App.views.App.toggleModal(
                    this.templateDeleteConfirm( data ),
                    "small"
                );

                // Set up ladda button animation
                this.deleteButton = Ladda.create( $("#order-delete-confirm")[0] );

                if ( newStatus === "open" ) {

                    App.$modal.find("button#order-delete-confirm").on( 'click', function( ) {
                        that.deleteOrder( order );
                    });

                    App.$modal.find("button#order-delete-cancel").on( 'click', App.views.App.toggleModal );
                } 
            },

            deleteOrder: function( order ) {

                var that = this;

                this.deleteButton.start();

                order.destroy({
                    "dataType": "text",
                    "context": order,
                    "wait": true 
                })
                .done( function( data, textStatus, jqXHR ) {

                    // Remove goal from favorites
                    App.collections.favorites.update( "order", this.id, true ); 

                    that.render();                    

                    AppEvents.trigger("positions:orderDeleted", {
                        msg: "Order deleted.",
                        friendlyMsg: App.polyglot.t("views_positions_order_delete_confirm"),
                        showAlert: true
                    });
                })
                .fail( function( jqXHR, textStatus, errorThrown ) {
                    AppEvents.trigger("v::positions::deleteOrder::error", {
                        showAlert: true,
                        removeAlerts: true,
                        friendlyMsg: App.polyglot.t("views_positions_order_delete_error"),
                        msg: "Unable to delete order. [status:" + jqXHR.status + " error:" + errorThrown + "]"
                    });       
                })
                .always( function( ) {

                    that.deleteButton.stop();

                    App.views.App.toggleModal();

                    that.deleteButton = null;
                });
            }
        });
        
        return PositionsView;
    }
);
