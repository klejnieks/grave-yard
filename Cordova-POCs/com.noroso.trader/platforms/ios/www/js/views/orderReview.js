define([
    'backbone',
    'App',
    'App.Views.Helpers',
    'App.Events',
    'ladda',
    'text!templates/order-review.html',
    'text!templates/order-review/position-protection-modal.html',
    'text!templates/order-review/position-protection-state.html'
],
    function( Backbone, App, AppViewHelpers, AppEvents, Ladda, orderReviewTemplate, protectionModalTemplate, protectionStateTemplate ) {

        var OrderReviewView = Backbone.View.extend({

            // Use this reference to control the ladda animation
            submitButton: null,

            // Flag if the order is being processed
            orderSubmitted: false,

            // Used to track previous totals on flash quote update
            prevEstimatedPrice: null,
            prevEstimatedTotal: null,
            prevRateRequest: null,

            events: {
                "click #submit-order":            "submitOrder",
                "click #position-protect-modal":  "toggleProtectModal",
                "change #order-protect":          "toggleProtectDisable"
            },

            initialize: function( options ){

                _.bindAll( this, 'getOrderStatus', 'toggleProtectModal', 'addPositionProtection', 'updateEstAmtProtected' );

                // Render the back button in the action bar
                App.views.App.renderMenuButton("back");

                // Render the title in the action bar
                App.views.App.renderActionTitle({
                    "title": App.polyglot.t("Review Your Order")
                });

                this.template = _.template( orderReviewTemplate );

                this.templateProtectionModal = _.template( protectionModalTemplate );

                this.templateProtectionState = _.template( protectionStateTemplate );

                this.listenTo( AppEvents, 'instruments:quotesUpdated', this.updatePrices );

                this.listenTo( AppEvents, "autoStop:changed", this.renderProtectionNum );

            },

            render: function() {

                var data = this.model.toJSON(),
                    instrumentModel,
                    ordType = this.model.get("ordType"),
                    side = this.model.get("side"),
                    openQty = 0,
                    showAutoStop = false,
                    self = this;

                _.extend( data, AppViewHelpers );

                // Get the instrument model
                instrumentModel = App.collections.instruments.get( data.instrumentID );

                // Get current position for this instrument
                this.position = App.collections.positions.get( this.model.get("instrumentID") );

                if ( this.position ) {
                    openQty = this.position.get("openQty");
                }

                data.rateRequest = this.model.get('rateRequest');

                data.symbol = instrumentModel.get('symbol');

                data.estimatedPrice = this.model.get('estimatedPrice');

                data.estimatedTotal = this.model.get('estimatedTotal');

                data.featureTogglesAutoStop = App.collections.featureToggles.isEnabled("auto-stop");

                data.autoStop = this.model.get("autoStop");

                data.protectionPercent = Math.round( 100 - data.autoStop );

                // Only show auto stop if market order and side is sell or side is buy and order qty is less than position qty
                if ( ordType == 1 && ( side === "B" || ( side === "S" &&  ( this.model.get("orderQty") < openQty ) ) ) ) {
                    data.showAutoStop = true;
                }

                data.polyglot = App.polyglot;

                data.cdn = App.config.cdn( );

                data.renderProtectionState = this.templateProtectionState;

                this.prevEstimatedPrice = data.estimatedPrice;

                this.prevEstimatedTotal = data.estimatedTotal;

                this.prevEstimatedRate = data.rateRequest;

                this.$el.empty().html(
                    this.template( { "data": data } )
                );

                // Set up jquery references
                this.$estimatedPrice = $('#order-estimated-price');
                this.$estimatedTotal = $('#order-estimated-total');
                this.$estimatedRate = $('#order-estimated-rate');
                this.$protectionDesc = $("#protectionDesc");
                this.$protectContainer = $("#position-protect-container");

                // Set up button animation
                this.submitButton = Ladda.create( this.$('#submit-order')[0] );

                // Add product to "cart"
                App.analytics.track('Added Product', {
                  id:       data.instrumentID,
                  sku:      data.symbol,
                  name:     data.name,
                  price:    data.estimatedPrice,
                  quantity: this.model.get("orderQty"),
                  category: ( App.models.account.get("accountType") === 2 ) ? "Live" : "Practice",
                  autoStop: data.autoStop,
                  ordType:  AppViewHelpers.capitalizeFirst( App.config.orderTypes[ data.ordType ] ),
                  side:     data.side === "B" ? "Buy" : "Sell"
                });

                return this;
            },

            removeView: function() {

                this.stopListening();

                this.undelegateEvents();
            },

            submitOrder: function() {

                var that = this;

                this.submitButton.start();

                // Disable protect position button
                this.$('#position-protect').prop( 'disabled', 'disabled');

                if ( !this.orderSubmitted ) {

                    // Check if the order protect was turned off
                    this.orderSubmitted = true;

                    this.model.submitOrder()
                    .done( function( ) {
                        // delay first status check
                        window.setTimeout( App.views.main.getOrderStatus, 1000, 0 );
                    })
                    .fail( function( jqXHR, textStatus, errorThrown ) {

                        AppEvents.trigger("v::orderReview::submitOrder::error", {
                            showAlert: true,
                            type: "alert",
                            friendlyMsg: App.polyglot.t("views_order_review_submit_error"),
                            msg: "Submit order error. [status:" + jqXHR.status + " error:" + errorThrown + "]"
                        });

                        that.submitButton.disable();
                    });
                }
            },

            getOrderStatus: function( attempts ) {

                var that = this;

                if ( !attempts || attempts < App.config.maxOrderStatusAttempts ) {

                    this.model.getOrderStatus()
                    .done( function ( data, textStatus, jqXHR ) {

                        if ( data.processed ) {

                            App.router.navigate( '/stocks-etfs/' + data.symbol + '/order/confirm/' + data.orderID , { trigger: true } );

                        } else if ( data.ordStatus >= 4 ) {

                            AppEvents.trigger( "v::orderReview::getOrderStatus::error", {
                                showAlert: true,
                                type: "alert",
                                friendlyMsg: App.polyglot.t("views_order_review_process_error",{
                                    "status":  App.config.ordStatus[ data.ordStatus ],
                                    "reason":  data.ordRejReason
                                }),
                                msg: "Order was canceled, stopped or rejected." + App.config.ordStatus[ data.ordStatus ] +"' - Reason: '" + data.ordRejReason + "'."
                            });

                            that.submitButton.disable();

                        } else {

                            window.setTimeout( App.views.main.getOrderStatus, App.config.pendingOrderRefreshRate, data.statusAttempts );
                        }
                    })
                    .fail( function ( jqXHR, textStatus, errorThrown ) {

                        AppEvents.trigger( "v::orderReview::getOrderStatus::error", {
                            showAlert: true,
                            type: "warning",
                            friendlyMsg: App.polyglot.t("views_order_review_load_status_error"),
                            msg: "Unable to load the order status. [status:" + jqXHR.status + " error:" + errorThrown + "]"
                        });

                        that.submitButton.disable();
                    });
                } else {
                    AppEvents.trigger( "v::orderReview::getOrderStatus::error", {
                        showAlert: true,
                        type: "warning",
                        friendlyMsg: App.polyglot.t("views_order_review_load_status_error"),
                        msg: "Unable to load the order status. Max order status attempts made."
                    });

                    that.submitButton.disable();
                }
            },

            toggleProtectModal: function( e ) {

                var that = this,
                    content = "",
                    newStatus = App.$modal.hasClass("open") ? "close" : "open",
                    side = this.model.get("side"),
                    positionMTM = 0;

                if ( e ) {

                    e.preventDefault( );

                    e.stopPropagation( );
                }

                if ( !this.orderSubmitted ) {

                    if ( newStatus === "open" ) {

                        if ( this.position ) {
                            positionMTM = this.position.get("markToMarket");
                        }

                        // This is an estimate of the new position...used to calculate percent protected amount
                        this.newPositionEst = positionMTM + ( side === "B" ? 1 : -1 ) * this.model.get("estimatedPrice");

                        content = this.templateProtectionModal({
                            "helpers":            AppViewHelpers,
                            "protectionPercent":  Math.round( 100 - this.model.get("autoStop") ),
                            "positionMTM":        positionMTM,
                            "newPositionEst":     this.newPositionEst,
                            "newProtectedAmt":    this.getProtectedAmt( this.newPositionEst, this.model.get("autoStop") ),
                            "side":               side,
                            "polyglot":           App.polyglot,
                            "buildType":          App.config.buildType,
                        });
                    }

                    // Render modal
                    newStatus = App.views.App.toggleModal( content, "medium" );

                    // Add event listeners and initializations
                    if ( newStatus === 'open' ) {

                        // Set up touch spin controls
                        App.$modal.find("#protect-modal-percent").on( "change", that.updateEstAmtProtected ).TouchSpin({ "max": 99, "min": 1 });

                        // Listen for modal button clicks
                        App.$modal.find('button#add-protect-position').on( 'click', that.addPositionProtection );
                        App.$modal.find('button#close-protect-position').on( 'click', that.toggleProtectModal );

                        // Initialize form validation
                        App.$modal.find('#protect-position-form').foundation( 'abide', {} );
                    } else {

                        // Unbind event listeners
                        App.$modal.find("#protect-modal-percent").off( );
                        App.$modal.find('button#add-protect-position').off( );
                        App.$modal.find('button#close-protect-position').off( );
                    }
                }
            },

            // Return the estimated amount protected based on autostop value
            getProtectedAmt: function( amount, autoStop ) {
                return autoStop === 0 ? 0 : amount - ( amount * ( autoStop / 100 ) );
            },

            // Update the estimated protected amount in the modal
            updateEstAmtProtected: function( e ) {

                e.preventDefault( );

                if ( this.newPositionEst ) {
                    App.$modal.find("#protect-modal-protected").html(
                        AppViewHelpers.formatDollars(
                            this.getProtectedAmt(
                                this.newPositionEst,
                                Math.round( 100 - App.$modal.find("#protect-modal-percent").val() )
                            )
                        )
                    );
                }
            },

            addPositionProtection: function( e ) {

                var autoStop = Math.round( 100 - App.$modal.find('#protect-modal-percent').val() );

                e.preventDefault();

                if ( App.$modal.find('[data-invalid]').length === 0 ) {

                    this.$('#order-protect').prop('checked', 'checked');

                    this.model.set( "autoStop", Math.round( autoStop ) );

                    this.toggleProtectModal();
                }
            },

            renderProtectionNum: function() {

                var data = {
                    "autoStop":  this.model.get("autoStop"),
                    "protectionPercent": Math.round( 100 - this.model.get("autoStop") ),
                    "polyglot":  App.polyglot
                };

                this.$protectContainer.empty().html( this.templateProtectionState( { "data": data } ) );
            },

            toggleProtectDisable: function() {

                if ( this.$('#order-protect').is(":checked") ) {

                    this.model.set( "autoStop", this.model.get("prevAutoStop") );

                } else {

                    this.model.set( "prevAutoStop", this.model.get("autoStop") );

                    this.model.set( "autoStop", 0 );
                }
            },

            updatePrices: function() {

                var estimatedPriceChange = ( this.model.get("estimatedPrice") - this.prevEstimatedPrice ),
                    estimatedTotalChange = ( this.model.get("estimatedTotal") - this.prevEstimatedTotal ),
                    estimatedRateChange = ( this.model.get("rateRequest") - this.prevEstimatedRate );

                if ( this.model.get("ordType") == 1 ) {

                    this.$estimatedPrice.html( "<strong>" + AppViewHelpers.formatFlashRate(
                        this.model.get('estimatedPrice'),
                        this.prevEstimatedPrice,
                        estimatedPriceChange
                    ) + "</strong>" );

                    this.$estimatedTotal.html( "<strong>" +  AppViewHelpers.formatFlashRate(
                        this.model.get('estimatedTotal'),
                        this.prevEstimatedTotal,
                        estimatedTotalChange
                    ) + "</strong>");

                    this.$estimatedRate.html( AppViewHelpers.formatFlashRate(
                        this.model.get('rateRequest'),
                        this.prevEstimatedRate,
                        estimatedRateChange
                    ));

                    this.prevEstimatedPrice = this.model.get("estimatedPrice");
                    this.prevEstimatedTotal = this.model.get("estimatedTotal");
                    this.prevEstimatedRate = this.model.get("rateRequest");

                    AppEvents.trigger("app:flashQuotes");
                }
            }
        });

        return OrderReviewView;
    }
);
