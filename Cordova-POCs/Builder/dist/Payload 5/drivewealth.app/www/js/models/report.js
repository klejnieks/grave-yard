define([
    "backbone",
    "App",
    "App.Events"
], function ( Backbone, App, AppEvents ) {

    var ReportModel = Backbone.Model.extend({

        defaults: {
          "reportName"    : "FinTrans",
          "reportFormat"  : "HTML",
          "accountNumber" : "",
          "dateStart"     : "",
          "dateEnd"       : ""
        },

        idAttribute: "reportID",

        url: function( ) {
            return App.config.report( );
        },

        initialize: function( options ) {
            this.type = "report";
        },

        requestReport: function(reportData) {
            return $.ajax({
                "url":          this.url(),
                "data":         reportData,
                "processData":  false,
                "contentType":  "json",
                "type":         "POST",
                "dataType":     "text",
                "headers": {
                    "accept":                   "application/json",
                    "x-mysolomeo-session-key":  App.models.userSession.get("sessionKey")
                }
            });
        }

    });

    return ReportModel;
});
