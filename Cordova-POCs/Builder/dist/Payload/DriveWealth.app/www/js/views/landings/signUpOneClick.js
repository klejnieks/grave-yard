define([
    "backbone",
    "App",
    "App.Events",
    "ladda",
    "text!templates/landings/signup-one-click.html"
], function( Backbone, App, AppEvents, Ladda, signUpOneClickTemplate ) {

    var SignUpOneClickView = Backbone.View.extend({

        events: {},

        addStatus: "pending", 

        initialize: function( options ) {

            this.signUpUser( );

            this.template = _.template( signUpOneClickTemplate );
        },

        render: function( data ) {

            data = _.extend( data || {"code":""}, {
                "status":   this.addStatus,
                "polyglot": App.polyglot,
                "cdn":      App.config.cdn()
            });

            this.$el.empty( ).html( this.template( data ) );

            return this;
        },

        signUpUser: function( ) {

            var _this = this;

            App.models.user.save( {}, {
                "wait":         true,
                "context":      App.models.user,
                "dataType":     "json",
                "contentType":  "application/json",
                "headers": {
                    "accept":  "application/json"
                }
            })
            .done( function( data, textStatus, jqXHR ) {

                data.code = "";

                _this.addStatus = "complete";

                _this.render( data );

                App.views.App.removeCampaign( );
            })
            .fail( function( jqXHR, textStatus, errorThrown ) {

                var code = "",
                    response;

                _this.addStatus = "error";

                if ( typeof jqXHR !== "undefined" && jqXHR.responseText ) {

                    try {
                    
                        response = JSON.parse( jqXHR.responseText );

                        code = response.code;

                    } catch ( e ) {
                        // Do nothing
                    }
                }

                AppEvents.trigger("v::signUpOneClick::signUpUser::error", {
                    "showMessage":  false,
                    "msg":          "Unable to signup user with one click.  [status:" + jqXHR.status + " error:" + jqXHR.responseText || errorThrown + "]"
                });

                _this.render({
                    "code": code
                });
            })
            .always( function( ) {

                _this.model.clearUser( );
            });
        }
    });

    return SignUpOneClickView;
});
