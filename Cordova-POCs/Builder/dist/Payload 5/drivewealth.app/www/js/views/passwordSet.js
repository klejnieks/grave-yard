define([
    'backbone',
    'App',
    'App.Events',
    'ladda',
    'text!templates/password-set.html'
],
    function( Backbone, App, AppEvents, Ladda, passwordSetTemplate ) {

        var PasswordSetView = Backbone.View.extend({

            submitButton: null,

            submitted: false,

            events: {
                "submit #set-password": "setPassword"
            },

            initialize: function( options ) {

                this.template = _.template( passwordSetTemplate );
            },

            render: function( data ) {

                data = data || {};

                _.extend(
                    data,
                    {
                        "polyglot":  App.polyglot,
                        "appRoot":   App.config.appRoot,
                        "cdn":              App.config.cdn( ),
                        "WLPID":            App.config.WLPID,
                        "WLP_Logo":         App.config.companyLogoPath.WLP_Logo,
                        "WLP_CompanyName":  resource.get('WLP_CompanyName')
                    }
                );

                this.$el.empty().html( this.template( data ) );

                this.submitButton = Ladda.create( this.$("#set-button")[0] );

                this.$resetForm = this.$("#set-password").foundation({
                    "abide": {
                        "validators": {
                            "dwpassword":  App.config.validators.password
                        }
                    }
                });

                return this;
            },

            removeView: function() {

                this.stopListening();

                this.undelegateEvents();
            },

            setPassword: function( e ) {

                var user = App.models.user,
                    that = this;

                e.preventDefault();

                e.stopPropagation();

                this.submitButton.disable().start();

                if ( !this.submitted ) {

                    this.submitted = true;

                    user.set({
                        "code":      this.$resetForm.find("#password-reset-code").val(),
                        "password":  this.$resetForm.find("#password-new").val()
                    });

                    user.setPassword()
                        .done( function( data, textStatus, jqXHR ) {

                            App.views.App.postRenderAlert({
                                "friendlyMsg":  App.polyglot.t("views_password_set")
                            });

                            App.router.navigate( "/login", { "trigger": true } );
                        })
                        .fail( function( jqXHR, textStatus, errorThrown ) {

                            var friendlyMsg,
                                result,
                                status = App.getProperty( "status", jqXHR );

                            if ( status == -1 ) {

                                // Missing password reset code...redirect to reset
                                App.views.App.postRenderAlert({
                                    "friendlyMsg":  App.polyglot.t("views_password_set_error"),
                                    "type":         "alert"
                                });

                                //--> TODO: why is validate being triggered after navigating?
                                // Remove data-equalto attribute...it's throwing an error
                                that.$resetForm.find("#password-new-confirm").removeAttr("data-equalto");

                                App.router.navigate( "/password/reset", { "trigger": true } );

                                return;
                            } else if ( typeof jqXHR === "undefined" || ( status >= 500 || status === 0 ) ) {

                                // API Error
                                friendlyMsg = App.polyglot.t("views_password_set_api_error");
                            } else {

                                // Default message
                                friendlyMsg = App.polyglot.t("views_password_set_api_error");

                                if ( typeof jqXHR !== "undefined" && typeof jqXHR.responseText !== "undefined" ) {

                                    // Check for returned message on 400
                                    try {
                                        result = JSON.parse( jqXHR.responseText );

                                        if ( typeof result.message !== "undefined" ) {
                                            friendlyMsg = result.message;
                                        }
                                    } catch ( e ) {
                                        // Use default message
                                    }
                                }
                            }

                            AppEvents.trigger("v::passwordReset::setPassword::error", {
                                "showAlert":     true,
                                "removeAlerts":  true,
                                "msg":           "Unable to reset password. [status:" + jqXHR.status + " error:" + errorThrown + "]",
                                "friendlyMsg":   friendlyMsg
                            });

                        })
                        .always( function( ) {

                            that.submitted = false;

                            that.submitButton.enable().stop();
                        });
                }
            }
        });

        return PasswordSetView;
    }
);
