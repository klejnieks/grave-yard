define([
    'backbone',
    'App',
    'App.Views.Helpers',
    'App.Events',
    'text!templates/account-brief.html',
    'text!templates/account-brief-pl.html'
],
    function( Backbone, App, AppViewHelpers, AppEvents, accountBriefTemplate, accountBriefPLTemplate ) {

        var AccountBriefView = Backbone.View.extend({

            $acctCash: null,

            $acctMtm: null,

            $acctTotal: null,

            $acctProfitAndLoss: null,



            // Requires positions collection
            initialize: function( options ){

                this.template = _.template( accountBriefTemplate );
                this.templatePL = _.template( accountBriefPLTemplate );

                // Re-render on quotes refresh
                this.listenTo( AppEvents, 'instruments:quotesUpdated accounts:loaded', this.renderSubTemplates );


                this.render();
            },

            render: function() {

                var markToMarket,
                    data = {
                        markToMarket: "",
                        cash: "",
                        profitAndLoss: "",
                        polyglot: App.polyglot,
                        accountTotal: ""
                    };

                // Remove tool tips
                this.removeToolTips();

                // Load position info if it exists
                if( App.models.account ){

                    data.markToMarket = App.collections.positions.getMarkToMarket();

                    data.cash = App.models.account.get("cash") || "";

                    data.profitAndLoss = App.collections.positions.getProfitAndLoss( );

                    data.accountTotal = data.markToMarket + data.cash;
                }

                _.extend( data, AppViewHelpers );

                this.$el.empty().html(
                    this.template( data )
                );

                $( document ).foundation( );

                // jquery references
                this.$acctCash = this.$("#acct-cash-amt");
                this.$acctMtm = this.$("#acct-investments-amt");
                this.$acctTotal = this.$("#acct-total-amt");
                this.$acctProfitAndLoss = this.$("#acct-profitAndLossacct-amt");

                this.$acctProfitAndLoss.html( this.templatePL(data) );


                return this;
            },

            renderSubTemplates: function( ) {

                var cash,
                    profitAndLoss,
                    data,
                    markToMarket,
                    accountTotal;

                if( App.models.account ){

                   dataPL = {
                        profitAndLoss: App.collections.positions.getProfitAndLoss( ),
                        extractSign: AppViewHelpers.extractSign,
                        formatMoney: AppViewHelpers.formatMoney,
                        removeSign: AppViewHelpers.removeSign
                    };


                    cash = App.models.account.get("cash");

                    markToMarket = App.collections.positions.getMarkToMarket( );

                    accountTotal = cash + markToMarket;

                    this.$acctCash.html( AppViewHelpers.formatMoney( cash ) );

                    this.$acctMtm.html( AppViewHelpers.formatMoney( markToMarket ) );

                    this.$acctTotal.html( "<strong>" + AppViewHelpers.formatMoney( accountTotal ) + "</strong>" );

                    this.$acctProfitAndLoss.html( this.templatePL(dataPL) );

                }

            },

            profitAndLossClass: function(profitAndLoss) {
              if ((AppViewHelpers.extractSign(profitAndLoss) == "+") ) {
                return ' success';
              } else {
                return ' alert';
              }
            },


            removeView: function() {

                // Remove tool tips
                this.removeToolTips();

                this.stopListening();

                this.undelegateEvents();
            }
        });

        return AccountBriefView;
    }
);
