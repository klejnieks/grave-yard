define([
    'backbone',
    'App',
    'nprogress',
    'App.Views.Helpers',
    'App.Events',
    'text!templates/reports-list.html'
], function( Backbone, App, NProgress, AppViewHelpers, AppEvents, reportsListTemplate ) {

    var ReportsListView = Backbone.View.extend({

        events: {
          "click .button": "downloadPdf"
        },

        initialize: function( options ) {
            NProgress.start();
            this.reportName = options.reportName;
            this.template = _.template( reportsListTemplate );
            this.listenTo( AppEvents, "reports:loaded", function( ) {
                this.render();
            }, this);
        },

        render: function(collection) {

            var data = {};

            _.extend(
                data, {
                    "polyglot":   App.polyglot,
                    "reports":    this.collection.toJSON(),
                    "reportName": this.reportName
            });

            this.$el.empty().html( this.template( { "data": data } ));
            NProgress.done();

            return this;
        },

        downloadPdf: function(e) {

           e.preventDefault();
           var fileKey = e.currentTarget.dataset.filekey;
           if ( !(App.config.buildType === "phonegap")) {
             var w = window.open("");
           }


           $.ajax({
               "url":          this.collection.url() + "/" + App.models.account.get("accountID") + "/" + fileKey,
               "type":         "GET",
               "dataType":     "json",
               "contentType":  "application/json",
               "accepts":      "application/json",
               "context":      this,
               "headers": {
                   "accept":   "application/json"
               }
           })
           .done( function( data, textStatus, jqXHR ) {

               if ( !data ) {

                 AppEvents.trigger("v::report::error", {
                     removeAlerts: true,
                     showAlert: false,
                     friendlyMsg: App.polyglot.t("views_report_create_success"),
                     msg: "Report could not be downloaded."
                 });

                   return;
               }


              if ( App.config.buildType === "phonegap" ) {
                window.open(data.url, "_system");
              } else {
                w.location = data.url;
              }

           })
           .fail( function( jqXHR, textStatus, errorThrown ) {

               AppEvents.trigger("v::report::error", {
                   removeAlerts: true,
                   showAlert: false,
                   friendlyMsg: App.polyglot.t("views_report_create_success"),
                   msg: "Report could not be be downloaded."
               });

           });


        },

        removeView: function() {

            this.stopListening();
            this.undelegateEvents();
        }
    });

    return ReportsListView ;
});
