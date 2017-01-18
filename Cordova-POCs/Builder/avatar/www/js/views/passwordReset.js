define([
    'backbone',
    'App',
    'App.Events',
    'ladda',
    'text!templates/password-reset.html',
    'models/resource'
],
    function( Backbone, App, AppEvents, Ladda, passwordResetTemplate, resource ) {

        var PasswordResetView = Backbone.View.extend({

            submitButton: null,

            events: {
                "submit #reset-password": "resetPassword"
            },

            initialize: function( options ) {

                this.template = _.template( passwordResetTemplate );
            },

            render: function( ) {

                this.$el.empty().html( this.template({
                    "polyglot":         App.polyglot,
                    "appRoot":          App.config.appRoot,
                    "cdn":              App.config.cdn( ),
                    "WLPID":            App.config.WLPID,
                    "WLP_Logo":         App.config.companyLogoPath.WLP_Logo,
                    "WLP_CompanyName":  resource.get('WLP_CompanyName')

                }) );

                this.submitButton = Ladda.create( this.$("#reset-button")[0] );

                this.$resetForm = this.$("#reset-password").foundation();

                return this;
            },

            removeView: function( ) {

                this.stopListening();

                this.undelegateEvents();
            },

            resetPassword: function( e ) {

                var user = App.models.user,
                    that = this;

                e.preventDefault();

                this.submitButton.disable().start();

                user.set({
                    "username": this.$resetForm.find("#username").val()
                });

                user.resetPassword()
                    .done( function( data, textStatus, jqXHR ) {

                        App.views.App.postRenderAlert({
                            "friendlyMsg":  App.polyglot.t("views_password_reset_email")
                        });

                        App.router.navigate( "/password/set", { "trigger": true } );
                    })
                    .fail( function( jqXHR, textStatus, errorThrown ) {

                        var friendlyMsg;

                        if ( typeof jqXHR !== "undefined" && ( jqXHR.status >= 500 || jqXHR.status === 0 ) ) {
                            friendlyMsg = "We are unable to reset your password at this time.  Please try again.";
                        } else {
                            friendlyMsg = App.polyglot.t("views_password_reset_invalid_username", {
                                "username":  user.get("username")
                            });
                        }

                        AppEvents.trigger("v::passwordReset::resetPassword::error", {
                            "showAlert":     true,
                            "removeAlerts":  true,
                            "msg":           "Unable to reset password. [status:" + jqXHR.status + " error:" + errorThrown + "]",
                            "friendlyMsg":   friendlyMsg
                        });
                    })
                    .always( function( ) {
                        that.submitButton.enable().stop();
                    });
            }
        });

        return PasswordResetView;
    }
);
