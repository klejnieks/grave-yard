define([
    "backbone",
    "App",
    "App.Events",
    "App.Views.InstrumentDetail.Order",
    "App.Views.InstrumentDetail.Research",
    "App.Views.Charts.Line",
    "App.Views.Helpers",
    "text!templates/instrument-detail.html",
    "text!templates/instrument-detail/position.html",
    "text!templates/instrument-detail/position-pnl.html",
    "text!templates/instrument-detail/rates.html",
    "text!templates/tags.html",
    "text!templates/tag-row.html",
    "moment",
    "numeral",
    "ladda",
    "touchspin"
],
    function( Backbone, App, AppEvents, OrderView, ResearchView, LineChartView, AppViewHelpers, template, positionTemplate, positionPNLTemplate, ratesTemplate, tagsTemplate, tagRowTemplate, moment, numeral, Ladda ) {

        var InstrumentDetailView = Backbone.View.extend({

            events: {
                "click .tag, div[data-target-path]": function( e ) {
                    App.views.App.navigate( e );
                },
                "click .favorite": function( e ) {
                    App.views.App.updateFavorite( e );
                },
                "click .bar-range":  "updateRange"
            },

            tagPromise: null,

            barsPromise: null,

            // Holds the tab view modules
            tabViewModules: {
                "order":       OrderView,
                "research":    ResearchView
            },

            showTab: "order",

            // Holds the position model if it exists for this instrument
            position: null,

            // Holds reference to the chart view
            chartView: null,

            // Holds a jquery reference to the chart container
            $chartContainer: null,

            currentAsk: null,

            // set default chart options
            chart: {
                "range": "1Y"
            },

            initialize: function( options ) {

                // Render the back button in the action bar
                App.views.App.renderMenuButton("back");

                // Render the title in the action bar
                App.views.App.renderActionTitle({
                    "title": App.polyglot.t("Symbol:") + " " + this.model.get("symbol")
                });

                // Render the favorite icon in the action bar
                App.views.App.renderActionItem({
                    "type":             "favorite",
                    "id":               this.model.get("instrumentID"),
                    "favoriteType":     "instrument"
                });

                this.template =         _.template( template );
                this.templatePosition = _.template( positionTemplate );
                this.templatePNL =      _.template( positionPNLTemplate );
                this.templateRates =    _.template( ratesTemplate );
                this.templateTags =     _.template( tagsTemplate );
                this.templateTagRow =   _.template( tagRowTemplate );

                // Clear out any previous orders that did not make it past the "review" stage
                if ( !options.order ) {
                    App.collections.orders.remove( App.collections.orders.where({ status: -1 }) );
                } else {
                    // The order model was passed in
                    this.order = options.order;
                }

                if ( options.showTab ) {
                    // Load the tab passed in
                    this.showTab = options.showTab;
                }

                // Check for tags search promise
                if ( options.tagPromise ) {
                    this.tagPromise = options.tagPromise;
                }

                // Load the chart with the passed in date range
                if ( options.range ) {
                    this.chart.range = options.range;
                }

                // Initiate bars data loading
                this.barsPromise = this.model.getBars({
                    "range": this.chart.range
                });

                // Initialize chart view
                this.chartView = new LineChartView({
                    "model": this.model
                });

                // Update prices on quotes refresh
                this.listenTo( AppEvents, "instruments:quotesUpdated", function( ) {

                    this.currentAsk = AppViewHelpers.formatMoney( this.model.get("rateAsk"), false );

                    this.updateViews( );
                });

                // Holds references to the tab views
                this.tabViews = { };

                // Holds ladda button references for chart ranges
                this.chartRangeButtons = { };

                // Update recently viewed instruments
                App.models.user.setRecentInstruments( this.model.get("symbol") );
            },

            render: function( options ) {

                var data = this.model.toJSON(),
                    posQuantity,
                    posProfitAndLoss,
                    posVolumeWeightedAvg,
                    posSide,
                    visited = App.views.App.getVisited( ) || {},
                    _this = this;

                // If render from favorite change, only render discover tags
                if ( options && options.favRefresh ) {

                    this.renderTags( );

                    return;
                }

                // Remove tool tips
                this.removeToolTips();

                // Check if the user has a position
                this.position = App.collections.positions.getByInstrumentId( this.model.get("instrumentID") );

                _.extend( data, {
                    "helpers":          AppViewHelpers,
                    "renderRates":      this.templateRates,
                    "renderPNL":        this.templatePNL,
                    "renderPosition":   this.templatePosition,
                    "cdn":              App.config.cdn( ),
                    "position":         this.position ? this.position.toJSON() : this.position,
                    "visited":          visited.instrumentDetail || false,
                    "polyglot":         App.polyglot,
                    "hasData":          this.model.hasData( ),
                    "showTab":          this.showTab,
                    "range":            this.chart.range,
                    "chartRanges":      App.collections.featureToggles.isEnabled("html5-charting-v2"),
                    "buildType":        App.config.buildType
                });

                // Render template
                this.$el.empty().html( this.template( { "data": data } ) );

                // Handle tab click event
                this.$('#instrument-detail-tabs').on('toggled', function (event, tab) {
                    _this.renderTab({
                        "name": tab.attr("id")
                    });
                });

                this.renderTab({
                    "name":   this.showTab
                });

                this.$chartContainer = $("#instrument-chart");

                // Set the height of the chart container...based on width and layout used
                this.$chartContainer.height( this.$el.width( ) * App.config.chartHeightRatio[ App.layoutSize ] + 10 );

                this.currentAsk = this.model.get("rateAsk");

                // Set up range buttons with ladda animation
                $(".bar-range").each( function( index, el ) {
                    _this.chartRangeButtons[ $(el).attr("data-value") ] = Ladda.create( el );
                });

                // Render chart when bars data is done loading
                this.barsPromise
                .done( function( data, status, jqXHR ) {
                    if ( _this.chartView ) {
                        _this.chartView.render({
                          "container":  "#instrument-chart",
                          "data":       data,
                          "range":      _this.chart.range
                        });
                    }
                })
                .fail( function( jqXHR, textStatus, errorThrown ) {
                    //--> TODO: render chart could not be loaded
                    var aa = 11;
                });

                // Populate tags when done
                if ( this.tagPromise ) {
                    this.tagPromise.done( function( data, textStatus, jqXHR ) {
                        _this.renderTags( );
                    });
                }

                $( document ).foundation( );

                // Show the joyride intro message if user hasn't visited page
                if ( !visited.instrumentDetail && App.areCookiesEnabled() ) {

                    visited.instrumentDetail = true;

                    App.views.App.setCookie( "bhdt", JSON.stringify( visited ) );

                    $( document ).foundation( "joyride", "start" );
                }

                AppEvents.trigger("instrument:rendered");

                // Check if user is coming from product review...remove product if so
                if ( this.order && App.history.length > 1 && (App.history[ App.history.length - 2 ]).search("^\/(stocks-etfs|products)\/" + data.symbol + "\/order\/review") !== -1 ) {
                    App.analytics.track('Removed Product', {
                        id:        data.instrumentID,
                        sku:       data.symbol,
                        name:      data.name,
                        price:     this.order.estimatedPrice,
                        quantity:  this.order.orderQty,
                        category:  ( App.models.account.get("accountType") === 2 ) ? "Live" : "Practice",
                        autoStop:  this.order.autoStop,
                        ordType:   this.order.ordType == 3 ? "Stop" : "Market",
                        side:      this.order.side === "B" ? "Buy" : "Sell"
                    });
                }

                // track product view
                App.analytics.track('Viewed Product', {
                    id:        data.instrumentID,
                    sku:       data.symbol,
                    name:      data.name,
                    price:     data.rateAsk,
                    category:  ( App.models.account.get("accountType") === 2 ) ? "Live" : "Practice"
                });

                document.body.scrollTop = document.documentElement.scrollTop = 0;
                return this;
            },

            // Initialize tab view (if necessary) and render
            renderTab: function( options ) {

                if ( !options.name ) {
                    // Default to order tab
                    options.name = "order"
                }

                options = _.extend( options || {}, {
                    "el":          "#" + options.name,
                    "parentView":  this,
                    "model":       this.model,
                });

                // Add tab specific data
                if ( options.name === "order" ) {
                    options.order = this.order;
                }

                // Initialize tab view if it hasn't been already
                if ( !this.tabViews[ options.name ] ) {
                    this.tabViews[ options.name ] = new this.tabViewModules[ options.name ]( options );
                }

                this.tabViews[ options.name ].render( );

                this.showTab = options.name;
            },

            removeView: function() {

                _.each( this.tabViews, function( tab, name ) {
                    tab.removeView( );
                });

                this.tabViews = null;

                this.removeToolTips();

                this.stopListening();

                this.undelegateEvents();

                this.position = null;

                this.chartView.removeView( );

                this.barsPromise = null;

                this.chartView = null;

                this.chart.range = "1Y";

                this.$chartContainer.empty( );

                // Remove chart data
                this.model.set("barData", {} );
            },

            renderTags: function( ) {

                var data = {
                    "tags":            App.collections.tags.toJSON(),
                    "helpers":         AppViewHelpers,
                    "templateTagRow":  this.templateTagRow,
                    "moment":          moment,
                    "favorites":       App.collections.favorites.toJSON(),
                    "loggedIn":        App.models.userSession.loggedIn(),
                    "parent":          this.model,
                    "polyglot":        App.polyglot
                };

                this.$("#tags-container").empty().html( this.templateTags( { "data": data } ) );
            },

            // Update the sub views
            updateViews: function( ) {

                var data = this.model.toJSON();

                _.extend(
                    data, {
                        "helpers": AppViewHelpers
                    }
                );

                // Update the rates adjacent to symbol and name
                this.$(".instrument-rates").html(
                    this.templateRates({
                        "data": data
                    })
                );

                // Update the position
                if ( this.position ) {

                    _.extend(
                        data, {
                            "position":   this.position ? this.position.toJSON() : this.position,
                            "polyglot":   App.polyglot,
                            "renderPNL":  this.templatePNL
                        }
                    );

                    this.$("#position-pnl").html(
                        this.templatePNL({
                            "data": data
                        })
                    );

                    this.$el.foundation( );
                }

                AppEvents.trigger("instrument:rendered");
            },

            // Handles resizing of the page
            resize: function( ) {

                // Adjust chart container height
                this.$chartContainer.height( this.$el.width( ) * App.config.chartHeightRatio[ App.layoutSize ] + 10 );

                // Resize chart view
                this.chartView.resize( );
            },

            // Update the chart with the selected time range
            updateRange: function( e ) {

                var target = e.currentTarget,
                    range = $(target).attr("data-value"),
                    button,
                    _this = this;

                if ( range !== this.chart.range ) {

                    button = this.chartRangeButtons[ range ].start( );

                    this.model.getBars({
                        "range": range
                    })
                    .done( function( data, status, jqXHR ) {

                        _this.$(".bar-range").removeClass("chart-range-active");

                        _this.$(".bar-range[data-value='" + range + "']").addClass("chart-range-active");

                        _this.chartView.update({
                            "container":  "#instrument-chart",
                            "data":       data,
                            "range":      range
                        });

                        _this.chart.range = range;
                    })
                    .fail( function( jqXHR, textStatus, errorThrown ) {
                        AppEvents.trigger("v::instrumentDetail::updateRange::error", {
                            showAlert:     true,
                            type:          "alert",
                            removeAlerts:  true,
                            friendlyMsg:   "The data could not be loaded for this time range.  Please try again.",
                            msg:           "Data could not be loaded for chart range " + range
                        });
                    })
                    .always( function ( ) {
                        button.stop( );
                    });
                }
            }
        });

        return InstrumentDetailView;
    }
);
