define([
    'backbone',
    'App.Events',
    'text!templates/footer.html'
],
    function( Backbone, AppEvents, footerTemplate ) {

        var FooterView = Backbone.View.extend({

            initialize: function( options ){

                this.template = _.template( footerTemplate );

                this.render();
            },

            render: function() {

                this.$el.empty().html( this.template({}));

                return this;
            }

        });

        return FooterView;
    }
);
