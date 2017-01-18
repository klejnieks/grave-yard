define([
    'backbone',
    'App',
    'App.Events'
],
    function( Backbone, App, AppEvents ) {

        var HeaderView = Backbone.View.extend({

            events: {
                "click a.navigation": "navigate"
            },

            initialize: function() {

            },

            navigate: function( e ) {

                e.preventDefault();

                App.views.App.navigatePath( e.currentTarget.pathname, { trigger: true } );
            }
        });

        return HeaderView;
    }
);
