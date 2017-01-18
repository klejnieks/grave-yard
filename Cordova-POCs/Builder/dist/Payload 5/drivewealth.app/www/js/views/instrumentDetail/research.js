define([
    'backbone',
    'App',
    'App.Views.Helpers',
    'App.Events',
    'text!templates/instrument-detail/research.html',
    "ladda"
], function( Backbone, App, AppViewHelpers, AppEvents, researchTemplate, Ladda ) {

    var ResearchView = Backbone.View.extend({

        events: {
        },
        initialize: function( options ){

            var _this = this;

            // Set this flag to true if detail call fails or fields are missing
            this.noResearch = this.model.get("noResearch");

            this.parentView = options.parentView;

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

            this.template = _.template( researchTemplate );
        },

        render: function( ) {

            var data = this.model.toJSON( );

            _.extend( data, {
              buildType: App.config.buildType,
              cdn: App.config.cdn( ),
              polyglot: App.polyglot
            });

            this.$el.empty().html(
                this.template( { data: data } )
            );

            return this;
        },

        removeView: function() {

            // Remove tool tips
            this.removeToolTips();

            this.stopListening();

            this.undelegateEvents();

            this.parentView = null;
        }
    });

    return ResearchView;
});
