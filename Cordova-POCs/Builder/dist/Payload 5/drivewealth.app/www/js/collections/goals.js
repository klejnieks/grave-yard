define([
    'backbone',
    'numeral',
    'App',
    'App.Events',
    'App.Models.Goal'
], function ( Backbone, numeral, App, AppEvents, GoalModel ) {

    var GoalsCollection = Backbone.Collection.extend({

        model: GoalModel,

        url: function() {
            return App.config.api( ) + '/v1/users/' + App.models.userSession.id + '/goals';
        }, 

        initialize: function() {

            this.on( "reset", function( ) {
                AppEvents.trigger("goals:reset", {
                    "msg": "Goals have been reset"
                });
            });

            this.listenTo( AppEvents, "accounts:loaded", function( ) {
                if ( App.models.account ) {
                    this.reset( App.models.account.get("goals") ); 
                }
            }, this);
        }
    });

    return GoalsCollection;
});
