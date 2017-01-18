define([
    'backbone',
    'App',
    'App.Views.Helpers',
    'App.Events',
    "App.Models.Order",
    'text!templates/instrument-detail/order.html',
    'text!templates/instrument-detail/order-details.html',
    'text!templates/instrument-detail/order-rate.html',
    'text!templates/instrument-detail/order-rate-label.html',
    'text!templates/instrument-detail/order-rate-rule.html',
    'text!templates/instrument-detail/order-side.html',
    "text!templates/instrument-detail/inst-rate.html",
    "text!templates/instrument-detail/research.html",
    "ladda"
], function( Backbone, App, AppViewHelpers, AppEvents, OrderModel, orderTemplate, orderDetailsTemplate, orderRateTemplate, orderRateLabelTemplate, orderRateRuleTemplate, orderSideTemplate, instRateTemplate, researchTemplate, Ladda ) {

    var InstrumentDetailOrderView = Backbone.View.extend({

        events: {
            "submit form#order-form":                   "reviewOrder",
            "click #order-type a":                      "setOrderType",
            "click #order-side div.radio-button":       "setOrderSide",
            "touchstart #order-side div.radio-button":  "setOrderSide",
            "change input.order-qty":                   "setOrderQty",
            "keydown #order-rate-input":                "debouncedSetOrderRate",
            "blur #order-rate-input":                   "debouncedSetOrderRate",
            "input #order-rate-input":                  "debouncedSetOrderRate",

        },

        initialize: function( options ){

            var _this = this;

            // Set this flag to true if detail call fails or fields are missing
            this.noResearch = this.model.get("noResearch");

            // Check if the detail been fetched already
            if ( typeof this.noResearch === "undefined" ) {

                this.model.fetch( )
                    .done( function( data, status, jqXHR ) {
                        // Check for research fields
                        _this.model.set( "noResearch", ( !data.description && !data.urlInvestor && !data.fundamentalDataModel ) ? true : false );

                        _this.render( );
                    })
                    .fail( function( jqXHR, textStatus, errorThrown ) {
                        _this.model.set( "noResearch", true );
                    });
            }

            _.bindAll( this, "preReviewCheck", "updateEstimatedTotal", "setOrderRate" );

            this.parentView = options.parentView;

            // If no existing order model, initialize a new one
            if ( options.order ) {

                this.order = options.order;

            } else {

                this.order = new OrderModel( {
                    "accountID":       App.models.account.get("accountID"),
                    "accountNo":       App.models.account.get("accountNo"),
                    "userID":          App.models.account.get("userID"),
                    "accountType":     App.models.account.get("accountType"),
                    "instrumentID":    this.model.get("instrumentID"),
                    "comment":         "",
                    "symbol":          this.model.get("symbol"),
                }, { "validate": false } );

                App.collections.orders.add( this.order );
            }

            // Reset the order status and number of status update attempts
            this.order.set({
                "ordStatus":       -1,
                "statusAttempts":  0
            });

            this.throttledCheck = _.throttle( this.preReviewCheck, 500, {} );

            this.debouncedSetOrderRate = _.debounce( this.setOrderRate, 500 );

            // Update prices on quotes refresh and set order rate
            this.listenTo( AppEvents, "instruments:quotesUpdated", function( ) {

                this.setOrderRate( );

                this.updateViews( );
            });

            this.template =           _.template( orderTemplate );
            this.templateDetails =    _.template( orderDetailsTemplate );
            this.templateRate =       _.template( orderRateTemplate );
            this.templateRateLabel =  _.template( orderRateLabelTemplate );
            this.templateRateRule =   _.template( orderRateRuleTemplate );
            this.templateSide =       _.template( orderSideTemplate );
            this.templateRateInst =   _.template( instRateTemplate );
            this.templateResearch =   _.template( researchTemplate );
        },

        render: function( ) {

            var data = this.model.toJSON( );

            data.order = this.order.toJSON();

            _.extend( data, {
                "helpers":          AppViewHelpers,
                "renderDetails":    this.templateDetails,
                "renderRate":       this.templateRate,
                "renderRateLabel":  this.templateRateLabel,
                "renderRateRule":   this.templateRateRule,
                "renderSide":       this.templateSide,
                "renderRateInst":   this.templateRateInst,
                "cdn":              App.config.cdn( ),
                "polyglot":         App.polyglot,
                "hasData":          this.model.hasData( ),
                "buildType":        App.config.buildType,
                "stopOrderBuffer":  App.config.stopOrderBuffer,
                "limitOrders":      App.collections.featureToggles.isEnabled("html5-order-type-limit")
            });

            this.$el.empty().html(
                this.template( { "data": data } )
            );

            // Set the order rate on type or side change
            this.listenTo( this.order, "change:ordType change:side", function( ) {
                this.setOrderRate( );
            });

            // Run pre review check on any model change and update estimated total
            this.listenTo( this.order, "change", function( ) {

                this.preReviewCheck( );

                this.updateEstimatedTotal( );
            });

            // Set up jquery references
            this.$reviewButton = this.$("#review-order");

            this.reviewButton = Ladda.create( this.$reviewButton[0] );

            // Set up touchspin on quantity inputs
            this.$("#order-qty").TouchSpin({ "max": 100000, "min": 1 });

            this.preReviewCheck( );

            return this;
        },

        removeView: function() {

            // Remove tool tips
            this.removeToolTips();

            this.stopListening();

            this.undelegateEvents();

            this.parentView = null;

            this.order = null;
        },

        updateViews: function( ) {

            var data = this.model.toJSON();
                ordType = this.order.get("ordType"),
                side = this.order.get("side"),
                type = App.config.orderTypes[ ordType ];

            data.order = this.order.toJSON( );

            _.extend(
                data, {
                    "helpers": AppViewHelpers
                }
            );

            if ( type === "market" ) {
                this.renderRate( );
            } else if ( type === "stop" ) {
                this.renderRateRule( );
            }
        },

        // Handles when user selects order type (i.e., market, limit or stop)
        setOrderType: function( e ) {

            var target =   e.currentTarget,
                ordType =  $( target ).attr("data-order-type"),
                prevType = this.order.get("ordType");

            e.preventDefault( );

            // Highlight selected order button
            this.$("#order-type a")
                .removeClass("button-active")
                .filter("[data-order-type='" + ordType + "']")
                .addClass("button-active");

            this.order.set( "ordType", ordType );

            if ( ordType === "research" ) {

                // This is not an order type...it is just displaying the research data
                this.renderResearch( );

            } else {

                if ( prevType === "research" ) {
                    this.renderDetails( );
                }

                this.renderSide( );

                this.renderRate( );

                this.resetRateValidation( );
            }
        },

        // Handles when the user has selected order side via touch area (i.e., buy or sell )
        setOrderSide: function( e ) {

            var $target =  $( e.currentTarget ),
                side = $target.attr("data-order-side");

            this.$("#order-side div.radio-button").attr("data-value", "false");

            $target.attr("data-value", "true");

            this.order.set( "side", side );

            this.renderRate( );

            this.resetRateValidation( );
        },

        // Handles when the user changes quantity
        setOrderQty: function( ) {

            var qty = parseInt( this.$("#order-qty").val( ), 10 );

            this.order.set( "orderQty", qty );
        },

        // Handles when the rate request changes
        setOrderRate: function ( ) {

            var ordType,
                side,
                type,
                rateRequest,
                data;

            if ( this.order ) {

                ordType = this.order.get("ordType");

                side = this.order.get("side");

                type = App.config.orderTypes[ ordType ];

                if ( type ) {

                    if ( type === "market" ) {
                        rateRequest = ( side === "B" ? this.model.get("rateAsk") : this.model.get("rateBid") );
                    } else if ( type ) {
                        rateRequest = this.$("#order-rate-input" ).val();
                    }

                    data = {
                        "rateRequest":  rateRequest,
                        "price":        rateRequest
                    };

                    if ( type === "limit" ) {
                        data.limitPrice = rateRequest;
                    }

                    this.order.set( data );
                }
            }
        },

        // Reset abide validation rules on stop/limit order rate input field
        resetRateValidation: function( ) {

            var ordType = this.order.get("ordType"),
                side = this.order.get("side"),
                type = App.config.orderTypes[ ordType ];


            // remove validation requirements
            this.$("#order-rate-input")
                .removeAttr("required")
                .removeAttr("pattern");

            if ( type === "stop" || type === "limit" ) {
                this.$("#order-rate-input" )
                    .attr("required","")
                    .attr("pattern",  "^[0-9]+([.][0-9]{1,2})?$" );
            }

            this.$el.foundation();
        },

        renderDetails: function( ) {

            var data = this.model.toJSON( );

            data.order = this.order.toJSON();

            _.extend( data, {
                "helpers":          AppViewHelpers,
                "renderRate":       this.templateRate,
                "renderSide":       this.templateSide,
                "renderRateLabel":  this.templateRateLabel,
                "renderRateRule":   this.templateRateRule,
                "renderRateInst":   this.templateRateInst,
                "cdn":              App.config.cdn( ),
                "polyglot":         App.polyglot,
                "hasData":          this.model.hasData( ),
                "stopOrderBuffer":  App.config.stopOrderBuffer,
            });

            this.$("#order-details").html( this.templateDetails( {"data": data} ) );

            // Set up jquery references
            this.$reviewButton = this.$("#review-order");

            this.reviewButton = Ladda.create( this.$reviewButton[0] );

            // Set up touchspin on quantity inputs
            this.$("#order-qty").TouchSpin({ "max": 100000, "min": 1 });
        },

        // Render the order rate field
        renderRate: function( ) {

            var data = this.model.toJSON( );

            data.order = this.order.toJSON();

            _.extend( data, {
                "helpers":          AppViewHelpers,
                "renderRate":       this.templateRate,
                "renderRateLabel":  this.templateRateLabel,
                "renderRateRule":   this.templateRateRule,
                "renderRateInst":   this.templateRateInst,
                "cdn":              App.config.cdn( ),
                "polyglot":         App.polyglot,
                "hasData":          this.model.hasData( ),
                "stopOrderBuffer":  App.config.stopOrderBuffer,
            });

            this.$("#order-rate").html( this.templateRate( {"data": data} ) );
        },

        renderRateLabel: function( ) {

            var data = this.model.toJSON( );

            data.order = this.order.toJSON();

            _.extend( data, {
                "helpers":          AppViewHelpers,
                "polyglot":         App.polyglot,
            });

            this.$("order-rate-label").html( this.templateRateLabel( {"data": data} ) );
        },

        renderRateRule: function( ) {

            var data = this.model.toJSON( );

            data.order = this.order.toJSON();

            _.extend( data, {
                "helpers":          AppViewHelpers,
                "polyglot":         App.polyglot,
                "stopOrderBuffer":  App.config.stopOrderBuffer,
            });

            this.$("#order-rate-rule").html( this.templateRateRule( {"data": data} ) );
        },

        renderResearch: function( ) {

            var data = this.model.toJSON( );

            _.extend( data, {
                "buildType":        App.config.buildType,
                "helpers":          AppViewHelpers,
                "polyglot":         App.polyglot,
                "fundamentals":     App.collections.featureToggles.isEnabled("html5-fundamentals")
            });

            this.$("#order-details").html( this.templateResearch( {"data": data} ) );
        },

        renderSide: function( ) {

            var data = this.model.toJSON( );

            data.order = this.order.toJSON();

            _.extend( data, {
                "helpers":          AppViewHelpers,
                "polyglot":         App.polyglot
            });

            this.$("#order-side").html( this.templateSide( { "data": data } ) );
        },

        // Update the estimated total box
        updateEstimatedTotal: function( ) {

            var rateRequest = this.order.get("rateRequest"),
                orderQty = this.order.get("orderQty"),
                estTotal = "";

            if ( rateRequest && orderQty > 0 ) {
                estTotal = AppViewHelpers.formatMoney( rateRequest * orderQty );
            } else {
                estTotal = "<span class=\"t-med\">Enter a quantity above</span>";
            }

            this.$("#order-calc").empty().html( estTotal );
        },

        // Handle when user clicks review button
        reviewOrder: function( e ) {

            var ordType = this.order.get("ordType"),
                type = App.config.orderTypes[ ordType ],
                account = App.models.account;

            e.preventDefault();

            e.stopPropagation( );

            this.reviewButton.start( );

            if ( !this.preReviewCheck( e ) ) {

                this.reviewButton.stop( );

                return;
            }

            if ( type === "market" ) {

              // Check if market is open
              if (App.collections.featureToggles.isEnabled("html5-market-after")) {

              } else if ( +account.get("accountType") === 2 && +App.marketState !== 1 ) {

                AppEvents.trigger( "v::instrumentDetail::reviewOrder::warning", {
                  showAlert: true,
                  type: "alert",
                  removeAlerts: true,
                  friendlyMsg: App.polyglot.t("views_instrument_detail_market_closed"),
                  msg: "Attempt made to purchase order when market is closed."
                });

                this.reviewButton.stop( );

                return;

              }
            }

            App.router.navigate( "/stocks-etfs/" + this.model.get("symbol") + "/order/review", { trigger: true } );
        },

        // Confirm order requirements before unlocking review order button
        preReviewCheck: function( e ) {

            var ordType = this.order.get("ordType"),
                type = App.config.orderTypes[ ordType ],
                orderQty = this.order.get("orderQty"),
                side = this.order.get("side"),
                commissionRate = App.models.userSession.get("commissionRate"),
                rateRequest = this.order.get("rateRequest"),
                position,
                positionQty,
                positionSign,
                rate,
                hasData = this.model.hasData( );

            if ( e ) {
                e.stopPropagation( );
            }

            // Clear alerts
            App.views.App.removeAlerts();

            this.$reviewButton.addClass("disabled");

            // Check if quantity has been set and greater than zero
            if ( isNaN( orderQty ) ) {
                return;
            } else if ( orderQty === 0 ) {
                AppEvents.trigger( "v::instrumentDetail::preReviewCheck::warning", {
                    showAlert: true,
                    type: "alert",
                    removeAlerts: true,
                    friendlyMsg: App.polyglot.t("views_instrument_detail_invalid_quantity"),
                    msg: "Attempt made to purchase instrument with zero quantity"
                });

                return;
            }

            if ( type === "market" ) {

                // Check if instrument has market data and can be traded
                if ( !hasData ){
                    AppEvents.trigger( "v::instrumentDetail::preReviewCheck::warning", {
                        friendlyMsg: App.polyglot.t("views_instrument_detail_no_market_data", {
                            "_":     "Unable to place order for %{name} at this time.  No market data available.",
                            "name":  this.model.get("name")
                        }),
                        msg: "Attempt made to place order on instrument with no market data.",
                        showAlert: true,
                        type: "alert",
                        removeAlerts: true
                    });

                    return;
                }

                // Check if user has adequate cash
                if ( side === "B" && ( ( ( orderQty * rateRequest ) + commissionRate ) > App.models.account.get("cash") ) ) {
                    AppEvents.trigger( "v::instrumentDetail::preReviewCheck::warning", {
                        friendlyMsg: App.polyglot.t("views_instrument_detail_invalid_cash"),
                        msg: "Attempt made to purchase instrument with inadequate cash",
                        showAlert: true,
                        type: "alert",
                        removeAlerts: true
                    });

                    return;
                }

            } else if (  type === "stop" || type === "limit" ) {

                if ( isNaN( parseFloat( rateRequest ) ) ) {
                    return;
                } else if ( parseFloat( rateRequest ) <= 0 ) {
                    AppEvents.trigger( "v::instrumentDetail::preReviewCheck::warning", {
                        friendlyMsg: App.polyglot.t("views_instrument_detail_invalid_rate_low"),
                        msg: "Attempt made to place stop order with rate request of zero",
                        showAlert: true,
                        type: "alert",
                        removeAlerts: true
                    });

                    return;
                }

                if ( type === "stop" ) {
                    // Check stop rate...buy must be above market and sell must be below market by 0.05
                    if ( side === "S" ) {

                        rate = this.model.get("rateBid");

                        if ( rateRequest > ( +rate - App.config.stopOrderBuffer ) && hasData ) {
                            AppEvents.trigger( "v::instrumentDetail::preReviewCheck::warning", {
                                friendlyMsg: App.polyglot.t("views_instrument_detail_invalid_sell_rate"),
                                msg: "Attempt made to place stop sell order with rate too high",
                                showAlert: true,
                                type: "alert",
                                removeAlerts: true
                            });

                            return;
                        }

                    } else {

                        rate = this.model.get("rateAsk");

                        if ( rateRequest < ( +rate + App.config.stopOrderBuffer ) && hasData ) {
                            AppEvents.trigger( "v::instrumentDetail::preReviewCheck::warning", {
                                friendlyMsg: App.polyglot.t("views_instrument_detail_invalid_buy_rate"),
                                msg: "Attempt made to place stop buy order with rate too low",
                                showAlert: true,
                                type: "alert",
                                removeAlerts: true
                            });

                            return;
                        }
                    }
                }
            }

            if ( side === "S" ) {

                // Check if the user owns at least 1 if selling
                position = App.collections.positions.getByInstrumentId( this.model.get("instrumentID") );

                if ( !position ) {
                    AppEvents.trigger( "v::instrumentDetail::preReviewCheck::warning", {
                        friendlyMsg: App.polyglot.t("views_instrument_detail_invalid_position"),
                        msg: "Attempt made to place market sell order without position",
                        showAlert: true,
                        type: "alert",
                        removeAlerts: true
                    });

                    return;
                }

                // Check the number they are trying to sell
                positionQty = parseInt( position.get("openQty"), 10 );

                positionSide = position.get("side");

                positionSign = ( positionSide == "S" ? "-" : "" );

                if ( isNaN( positionQty) || positionSide == "S" || ( orderQty > positionQty ) ) {
                    AppEvents.trigger( "v::instrumentDetail::preReviewCheck::warning", {
                        friendlyMsg: App.polyglot.t("views_instrument_detail_invalid_position_amt", {"sign":positionSign,"quantity":positionQty}),
                        msg: "Attempt made to place sell order with more instruments then they own.  ",
                        showAlert: true,
                        type: "alert",
                        removeAlerts: true
                    });

                    return;
                }
            }

            // Enable form button
            this.$reviewButton.removeClass("disabled");

            return true;
        }
    });

    return InstrumentDetailOrderView;
});
