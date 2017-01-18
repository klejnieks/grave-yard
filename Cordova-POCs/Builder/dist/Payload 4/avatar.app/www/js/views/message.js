define([
    'backbone',
    'App',
    'App.Events',
    'text!templates/message.html'
],
    function( Backbone, App, AppEvents, messageTemplate ) {

        var MessageView = Backbone.View.extend({
        
            events: {

            },

            initialize: function( options ) {

                this.options = options;

                this.template = _.template( messageTemplate );
            },

            render: function( data ) {

                // Set default values if missing
                data = _.extend( {}, {
                    "friendlyTitle":    App.polyglot.t("views_message_title"),
                    "friendlyMsg":      App.polyglot.t("views_message_error")
                }, this.options );

                this.$el.empty().html( this.template( data ) );

                return this;        
            },

            removeView: function() {

                this.stopListening(); 

                this.undelegateEvents();
            }

        });

        return MessageView;
    }
);
