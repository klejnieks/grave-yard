define([
    'backbone',
    'App',
    'App.Events'
], function ( Backbone, App, AppEvents ) {

    var OrderModel = Backbone.Model.extend({

        idAttribute: 'orderID',

        defaults: {
            "ordType":       "1",
            "side":          "B",
            "autoStop":      0,
            "prevAutoStop":  20
        },

        url: function( ) {
            return App.config.api( ) + "/v1/orders/" + this.id;
        },

        initialize: function( attributes, options ) {

            this.type = "order";

            this.instrument = App.collections.instruments.get( this.get('instrumentID') );

            if ( !this.instrument ) {
                AppEvents.trigger( "m::order::initialize::error", {
                    friendlyMsg: App.polyglot.t("models_order_load_error"),
                    msg: "Order model initialization error.  Cannot load instrument."
                });
                return;
            }

            this.set( "instrument", this.instrument.toJSON() );

            this.setEstimatedPriceAndTotal();

            this.listenTo( AppEvents, 'instruments:quotesUpdated', this.updateInstrumentBasedPrices );

            this.listenTo( AppEvents, 'account:synced', this.setEstimatedPriceAndTotal );

            this.on( "change", this.updateInstrumentBasedPrices );

            this.on('change:autoStop', this.updateAutoStop);
        },

        validate: function( attributes, options ) {

            if ( !attributes.orderQty || isNaN(+attributes.orderQty) || +attributes.orderQty % 1 !== 0 ) {
                return "Quantity must be an integer and is required.";
            }
        },

        submitOrder: function() {

            var sessionKey = App.models.userSession.get('sessionKey'),
                orderPromise,
                timer;

            if ( typeof sessionKey === 'undefined' ) {
                return false;
            }

            if ( App.engageTimer( App.config.apiTimerCaptureRate ) ) {
                timer = new App.Timer( "API", "POST /v1/orders" );
            }

            orderPromise = $.ajax({
                url:            App.config.api( ) + '/v1/orders',
                data:           JSON.stringify( this.pick("accountID", "accountNo", "userID", "accountType", "ordType", "side", "instrumentID", "orderQty", "price", "comment", "autoStop", "limitPrice") ),
                processData:    false,
                type:           'POST',
                contentType:    'application/json',
                accepts:        'application/json',
                context:        this,
                headers: {
                    "accept":                   "application/json",
                    "x-mysolomeo-session-key":  sessionKey
                }
            })
            .done(function( data, textStatus, jqXHR ) {

                if ( timer ) {
                    timer.end( "success" );
                }

                if ( !data ){

                    AppEvents.trigger( "m::order::submitOrder::error", {
                        friendlyMsg: App.polyglot.t("models_order_submission_failure"),
                        msg: 'Order submission failure.  No data in response. [' + JSON.stringify( data ) +  ']'
                    });

                    return false;
                }

                this.set( data );

                AppEvents.trigger('order:submitted', this.toJSON() );

                return true;
            })
            .fail( function( jqXHR, textStatus, errorThrown ) {

                if ( timer ) {
                    timer.end( "fail" );
                }

                AppEvents.trigger( "m::order::submitOrder::error", {
                    friendlyMsg: App.polyglot.t("models_order_submission_failure"),
                    msg: "Submit order ajax failure. [status: " + jqXHR.status + " error: " + errorThrown + "]"
                });

                return false;
            });

            return orderPromise;
        },

        getOrderStatus: function() {

            var sessionKey = App.models.userSession.get('sessionKey'),
                orderStatusDeferred = $.Deferred(),
                timer;

            if ( typeof sessionKey === 'undefined' ) {
                return false;
            }

            if ( App.engageTimer( App.config.apiTimerCaptureRate ) ) {
                timer = new App.Timer( "API", "GET /v1/orders/{ID}" );
            }

            $.ajax({
                url:            App.config.api( ) + '/v1/orders/' + this.get('orderID'),
                type:           'GET',
                contentType:    'application/json',
                accepts:        'application/json',
                context:        this,
                headers: {
                    "accept":                   "application/json",
                    "x-mysolomeo-session-key":  sessionKey
                }
            })
            .done(function( data, textStatus, jqXHR ) {

                if ( timer ) {
                    timer.end( "success" );
                }

                if ( !data || typeof data !== 'object' ){

                    AppEvents.trigger( "m::order::getOrderStatus::error", {
                        friendlyMsg: App.polyglot.t("models_order_status_failure"),
                        msg: 'Unable to load the order status. No data returned order status. [' + JSON.stringify( data ) + ']'
                    });

                    orderStatusDeferred.rejectWith( this, [jqXHR, "error", "Invalid response"] );

                    return false;
                }

                if ( typeof data.leavesQty === 'undefined' || typeof data.ordStatus === "undefined" ){

                    AppEvents.trigger( "m::order::getOrderStatus::error", {
                        friendlyMsg: App.polyglot.t("models_order_status_failure"),
                        msg: 'Unable to load the order status. Missing fields returned. [' + JSON.stringify( data ) + ']'
                    });

                    orderStatusDeferred.rejectWith( this, [jqXHR, "error", "Invalid response.  Missing attributes."] );

                    return false;
                }

                // add custom attributes
                _.extend( data, {
                    lastUpdate:      ( new Date( ) ).getTime(),
                    statusAttempts:  ( this.get('statusAttempts') ? this.get('statusAttempts') + 1 : 1 )
                });

                // update attributes
                this.set( data );

                if ( ( +data.leavesQty === 0 && +data.ordStatus === 2 ) || ( +data.ordType === 3 && +data.ordStatus === 0 ) ) {
                    // Order is complete

                    this.set( "processed", true );

                    AppEvents.trigger( 'order:completed', this.toJSON() );

                    App.collections.accounts.refreshAccts( );

                } else if ( data.ordStatus >= 4 ) {
                    AppEvents.trigger( "m::order:getOrderStatus::error", {
                        friendlyMsg: App.polyglot.t("models_order_cancelled"),
                        msg: 'Order status canceled, stopped or rejected [ ordStatus:' + data.ordStatus + ' ]'
                    });
                } else {
                    AppEvents.trigger( 'order:pending', this.toJSON() );
                }

                orderStatusDeferred.resolveWith( this, [ this.toJSON(), "success", jqXHR ] );
            })
            .fail( function( jqXHR, textStatus, errorThrown ) {

                if ( timer ) {
                    timer.end( "fail" );
                }

                AppEvents.trigger( "m::order::getOrderStatus::error", {
                    friendlyMsg: App.polyglot.t("models_order_status_failure"),
                    msg: "Order status ajax failure. [status: " + jqXHR.status + " error: " + errorThrown + "]"
                });

                orderStatusDeferred.rejectWith( this, [jqXHR, "error", "Non 200 response. [" + errorThrown + "]"] );

                return false;
            });

            return orderStatusDeferred.promise();
        },

        setRateRequest: function() {

            if ( this.get('ordType') == 1 ) {
                // Update latest rate price
                this.set( 'rateRequest', this.get('side') === 'B' ? this.instrument.get('rateAsk') : this.instrument.get('rateBid') );
            }
        },

        setEstimatedPriceAndTotal: function() {

            var commissionRate = App.models.account.get("commissionRate"),
                estimatedPrice = this.get('rateRequest') * this.get('orderQty'),
                estimatedTotal = estimatedPrice + ( ( this.get("side") === "S" ? -1 : 1 ) * commissionRate );

            this.set({
                "estimatedPrice": estimatedPrice,
                "estimatedTotal": estimatedTotal,
                "estimatedCommission":  commissionRate
            });

            return {
                "estimatedPrice": estimatedPrice,
                "estimatedTotal": estimatedTotal
            };
        },

        setActualPrices: function( ) {

            var commission = this.get("commission"),
                actualQty = this.get("cumQty"),
                actualPrice = this.get("grossTradeAmt"),
                actualTotal = actualPrice + ( ( this.get("side") === "S" ? -1 : 1 ) * commission ),
                actualRate = actualPrice / actualQty,
                actualScale = 2;

            if ( actualTotal && actualTotal > 0 ) {

                // Check for price improvement...use scale of 6 if exists
                if ( App.decimalPlaces( actualRate ) > 2 && +numeral( actualRate ).format("0.000000") * actualQty === actualPrice ) {
                    actualScale = 6;
                }

                this.set({
                    "commission":   commission,
                    "actualPrice":  actualPrice,
                    "actualTotal":  actualTotal,
                    "actualRate":   actualRate,
                    "actualScale":  actualScale
                });
            }

            return;
        },

        updateInstrumentBasedPrices: function( ) {

            this.set( "instrument", this.instrument.toJSON() );

            this.setRateRequest();

            this.setEstimatedPriceAndTotal();

            if ( this.get("processed") ) {
                this.setActualPrices( );
            }
        },

        updateAutoStop: function( ) {
          AppEvents.trigger( "autoStop:changed", this );
        }

    });

    return OrderModel;
});
