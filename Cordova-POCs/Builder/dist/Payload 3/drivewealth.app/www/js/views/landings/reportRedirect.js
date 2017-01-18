define([
    "backbone",
    "App",
    "App.Events",
    "text!templates/reports-form.html"
], function( Backbone, App, AppEvents, reportsFormTemplate ) {

    var ReportRedirectView = Backbone.View.extend({

        events: {},

        initialize: function( options ) {

            this.templateForm = _.template( reportsFormTemplate );

            this.data = options.data;
        },

        render: function( ) {

            var reportData = {
                "ReportName"   :  this.data.ReportName,
                "ReportFormat" :  this.data.ReportFormat,
                "DateStart"    :  this.data.DateStart,
                "DateEnd"      :  this.data.DateEnd,
                "url"          :  this.data.url,
                "sessionKey"   :  this.data.sessionKey,
                "buildType"    :  "phonegap"
            };

            if ( reportData["ReportName"] === "CoinTrans" ) {
                _.extend( reportData, {
                    "UserId": this.data.UserId
                });
            } else if ( reportData["ReportName"] === "ReferralSummaryPerformance" ) {
                _.extend( reportData, {
                    "IbUserId":     this.data.UserId,
                    "AccountType":  this.data.AccountType
                });
            } else if ( reportData["ReportName"] === "Instrument" ) {
                _.extend( reportData, {
                    "TradeStatus"  :  this.data.TradeStatus,
                    "InstrumentType"  :  this.data.InstrumentType
                });
            } else {
                _.extend( reportData, {
                    "AccountNumber":  this.data.AccountNumber
                });
            }


            // Build form element and submit
            form = this.templateForm( reportData );

            //console.log(form);

            $( form ).appendTo( this.el ).submit( ).remove( );

        },

        removeView: function() {

            this.stopListening();

            this.undelegateEvents();
        },

    });

    return ReportRedirectView;
});
