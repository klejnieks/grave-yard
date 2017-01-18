define([
    'backbone',
    'App',
    'App.Views.Helpers',
    'App.Events',
    'text!templates/home.html',
    'text!templates/question-row.html',
    'text!templates/post-row.html',
    'text!templates/instrument-row.html',
    'text!templates/instrument-row/rates.html',
    'text!templates/position-row.html',
    'text!templates/position-row/rate-ask.html',
    'text!templates/position-row/values.html',
    'text!templates/order-row.html',
    'text!templates/order-row/rates.html',
    'text!templates/goal-row.html',
    'text!templates/goal-row/detail.html',
    'text!templates/tag-search-row.html',
    'moment'
],
    function(
    Backbone,
    App,
    AppViewHelpers,
    AppEvents,
    homeTemplate,
    questionRowTemplate,
    postRowTemplate,
    instrumentRowTemplate,
    instrumentRowRatesTemplate,
    positionRowTemplate,
    posRateAskTemplate,
    posValuesTemplate,
    orderRowTemplate,
    ordRatesTemplate,
    goalRowTemplate,
    goalRowDetailTemplate,
    tagSearchRowTemplate,
    moment) {

        var HomeView = Backbone.View.extend({

            events: {
                "click .tag, div[data-target-path]": function( e ) {
                    App.views.App.navigate( e );
                },
                "click .favorite": function( e ) {
                    App.views.App.updateFavorite( e );
                }
            },

            acctIntervalID: null,

            throttledRender: null,

            initialize: function( options ) {

                // Set up throttled render function
                this.throttledRender = _.throttle( this.render, 1000, { "trailing": false } );

                // Render the title in the action bar
                App.views.App.renderActionTitle({
                    "title": App.polyglot.t("Welcome Home")
                });

                // Render view on favorite model loading
                this.listenTo( AppEvents, 'favorites:modelLoaded', this.render );

                // Render subviews on quote updates
                this.listenTo( AppEvents, "instruments:quotesUpdated", this.renderSubTemplates );

                // Render view on order change
                this.listenTo( AppEvents, "positions:change orders:change", this.throttledRender );

                // Set up templates
                this.template =            _.template( homeTemplate );
                this.templateQuesRow =     _.template( questionRowTemplate );
                this.templatePostRow =     _.template( postRowTemplate );
                this.templateInstRow =     _.template( instrumentRowTemplate );
                this.templateInstRates =   _.template( instrumentRowRatesTemplate );
                this.templatePosRow =      _.template( positionRowTemplate );
                this.templatePosRateAsk =  _.template( posRateAskTemplate );
                this.templatePosValues =   _.template( posValuesTemplate );
                this.templateOrdRow =      _.template( orderRowTemplate );
                this.templateOrdRates =    _.template( ordRatesTemplate );
                this.templateGoalRow =     _.template( goalRowTemplate );
                this.templateGoalDetail =  _.template( goalRowDetailTemplate );
                this.templateTagSearchRow =      _.template( tagSearchRowTemplate );

                // Set account refresh rate
                if ( App.config.accountRefreshRate > 0 ) {
                    this.acctIntervalID = window.setInterval( App.models.account.refreshAcct, App.config.accountRefreshRate );
                }
            },

            render: function() {

                var data = {},
                    visited = App.views.App.getVisited( ) || {};

                // Remove tool tips
                this.removeToolTips();

                _.extend(
                    data, {
                        moment: moment,
                        favorites: _.sortBy( this.collection.toJSON(), "createdWhen" ),
                        favsByType: this.collection.groupByType(),
                        loggedIn: App.models.userSession.loggedIn(),
                        templateRow: {
                            question: this.templateQuesRow,
                            post: this.templatePostRow,
                            instrument: this.templateInstRow,
                            position: this.templatePosRow,
                            order: this.templateOrdRow,
                            goal: this.templateGoalRow,
                            tag: this.templateTagSearchRow
                        },
                        helpers:             AppViewHelpers,
                        view:                "home",
                        templateGoalDetail:  this.templateGoalDetail,
                        templateInstRates:   this.templateInstRates,
                        templatePosRateAsk:  this.templatePosRateAsk,
                        templatePosValues:   this.templatePosValues,
                        templateOrdRates:    this.templateOrdRates,
                        cdn:                 App.config.cdn( ),
                        visited:             visited.home || false,
                        polyglot:            App.polyglot
                    }
                );
                
                
                this.$el.empty().html( this.template({ "data": data }) );

                $( document ).foundation( );

                if ( !visited.home && App.areCookiesEnabled() ) {

                    visited.home = true;

                    App.views.App.setCookie( "bhdt", JSON.stringify( visited ) );

                    $( document ).foundation( "joyride", "start" );
                }

                AppEvents.trigger("home:rendered");

                return this;
            },

            renderSubTemplates: function( ) {

                // Update goal details
                if ( this.collection.groupedByType.goal ) {
                    this.collection.groupedByType.goal.forEach( function( info ) {

                        var model = App.collections.goals.get( info.ID );

                        if ( model ) {
                            this.$("#" + model.get("goalID")).find(".goal-detail").html(
                                this.templateGoalDetail({
                                    "data": {
                                        "goal":       model.toJSON(),
                                        "favorites":  App.collections.favorites.toJSON(),
                                        "helpers":    AppViewHelpers,
                                        "polyglot":   App.polyglot
                                    }
                                })
                            );
                        }
                    }, this );
                }

                // Update instruments
                if ( this.collection.groupedByType.instrument ) {
                    this.collection.groupedByType.instrument.forEach( function( info ) {

                        var model = App.collections.instruments.get( info.ID );

                        if ( model ) {
                            this.$( "#" + model.get("symbol") ).find(".instrument-rates h3").html(
                                this.templateInstRates({
                                    "data": {
                                        "instrument": model.toJSON(),
                                        "favorites": App.collections.favorites.toJSON(),
                                        "helpers":    AppViewHelpers,
                                        "polyglot":   App.polyglot
                                    }
                                })
                            );
                        }
                    }, this );
                }

                // Update positions
                if ( this.collection.groupedByType.position ) {

                    this.collection.groupedByType.position.forEach( function( info ) {

                        var model = App.collections.positions.get( info.ID ),
                            $position;

                        if ( model && model.get("instrument") ) {

                            $position = this.$("#" + model.get("instrument").symbol + ".position" );

                            $position.find(".position-rate-ask").html(
                                this.templatePosRateAsk({
                                    "data": {
                                        "position":  model.toJSON(),
                                        "helpers":   AppViewHelpers,
                                        "polyglot":   App.polyglot
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
                }

                // Update orders
                if ( this.collection.groupedByType.order ) {

                    this.collection.groupedByType.order.forEach( function( info ) {

                        var model = App.collections.orders.get( info.ID ),
                            $order = this.$( "#" + (model.get("orderID")).replace( /(:|\.|\[|\])/g, "\\$1" ) );

                        if ( model && model.get("instrument") ) {
                            $order.find(".order-rates").html(
                                this.templateOrdRates({
                                    "data": {
                                        "order":    model.toJSON(),
                                        "helpers":  AppViewHelpers,
                                        "polyglot": App.polyglot
                                    }
                                })
                            );
                        }
                    }, this );
                }

                AppEvents.trigger("home:subtemplated");
            },

            removeView: function() {

                // Remove tool tips
                this.removeToolTips();

                window.clearInterval( this.acctIntervalID );

                this.stopListening();

                this.undelegateEvents();
            }
        });

        return HomeView;
    }
);
