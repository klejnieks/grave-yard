define([
    'backbone',
    'numeral',
    'App',
    'App.Events',
    'App.Models.Report'
], function ( Backbone, numeral, App, AppEvents, ReportModel ) {

    var ReportsCollection = Backbone.Collection.extend({

        model: ReportModel,

        url: function( ) {
            return App.config.api( ) + '/v1/statements';
        },

        forceRefresh: false,

        initialize: function() {

            this.on( "reset", function( ) {
                AppEvents.trigger( "reports:loaded", this );
            });
        }

    });

    return ReportsCollection;
});
