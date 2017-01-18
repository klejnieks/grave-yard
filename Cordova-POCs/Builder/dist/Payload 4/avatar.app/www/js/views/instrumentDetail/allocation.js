define([
    'backbone',
    'App',
    'App.Views.Helpers',
    'App.Events',
    'text!templates/instrument-detail/allocation.html',
    'text!templates/instrument-detail/allocation/goal-row.html'
], function( Backbone, App, AppViewHelpers, AppEvents, allocationTemplate, goalRowTemplate ) {

    var InstrumentDetailAllocationView = Backbone.View.extend({

        events: {

        },

        initialize: function( options ) { 

            this.template = _.template( allocationTemplate );
            this.templateGoalRow = _.template( goalRowTemplate );
        },

        render: function( ) {

            var data = { 
                "goals":  [ ] 
            },
            _this = this;

            // Determine quantity of instruments allocated per goal
            App.collections.goals.each( function( goal, index ) {

                var goalData = goal.toJSON( );

                goalData.allocatedQty = goal.getQtyByInstrument( _this.model.id ); 

                data.goals.push( goalData ); 
            });

            _.extend(
                data, {
                    "templateGoalRow":     this.templateGoalRow,
                    "helpers":             AppViewHelpers,
                    "polyglot":            App.polyglot
                }
            );

            this.$el.empty().html(
                this.template( { "data": data } )
            );

            // Set up touchspin on quantity inputs
            this.$("input.allocation-qty").TouchSpin({ "max": 100000, "min": 1 });

            return this;
        },

        removeView: function( ) {

            // Remove tool tips
            this.removeToolTips();

            this.stopListening();

            this.undelegateEvents();
        },

    });

    return InstrumentDetailAllocationView;
}); 
