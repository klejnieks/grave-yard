define([
    "backbone",
    "App",
    "App.Events",
    "ladda",
    "models/resource",
    "text!templates/user-add.html"
], function( Backbone, App, AppEvents, Ladda, resource, userAddTemplate ) {

    var AddUserView = Backbone.View.extend({

        submitButton: null,

        events: {
            "submit #signup-form": "signUpUser"
        },

        throttledCheck: null,

        initialize: function( options ) {

            _.bindAll( this, "checkUsername" );

            this.throttledCheck = _.debounce( this.checkUsername, 500 );

            this.template = _.template( userAddTemplate );
        },

        render: function( ) {

            var data = {
                polyglot:  App.polyglot,
                appRoot:   App.config.appRoot,
                cdn:       App.config.cdn( ),
                WLPID:     App.config.WLPID,
                WLP_Logo:  App.config.companyLogoPath.WLP_Logo,
                WLP_CompanyName: resource.get('WLP_CompanyName')
            };

            var _this = this;

            this.$el.empty().html( this.template( data ) );

            // Set up ladda button animation
            this.submitButton = Ladda.create( this.$("#signup-button")[0] );

            // Set up form jquery reference and foundation abide validation
            this.$loginForm = this.$("#signup-form").foundation({
                "abide": {
                    "validators": {
                        "dwpassword":  App.config.validators.password
                    }
                }
            });

            // Check username on blur and keypress
            this.$("#username").on("blur keydown input", _this.throttledCheck);

            return this;
        },

        signUpUser: function( e ) {

            var data = {},
                that = this,
                user = App.models.user;

            e.preventDefault();

            // Remove any existing data from user model
            user.clearUser( );

            App.views.App.removeAlerts();

            this.submitButton.disable().start();

            data = {
                "emailAddress1":  this.$loginForm.find("#emailAddress1").val(),
                "firstName":      this.$loginForm.find("#firstName").val(),
                "lastName":       this.$loginForm.find("#lastName").val(),
                "username":       this.$loginForm.find("#username").val(),
                "password":       this.$loginForm.find("#password-new").val(),
                "tranAmount":     App.config.starterFunds,
                "WLPID":          App.config.WLPID
            };

            // Check if user was referred
            if ( App.models.userSession.get("referralCode") ) {
                data.referralCode = App.models.userSession.get("referralCode");
            }

            if ( App.config.buildType === "phonegap" ) {
                data["utm_medium"] = "App";
            }

            user.save( data, {
                "wait":         true,
                "context":      App.models.user,
                "dataType":     "json",
                "contentType":  "application/json",
                "headers": {
                    "accept":  "application/json"
                }

            })
            .done( function( data, textStatus, jqXHR ) {

                App.views.App.postRenderAlert({
                    "friendlyMsg":  App.polyglot.t("views_user_add_confirm")
                });

                App.analytics.identify( data.userID, {
                    firstName:  user.get('firstName'),
                    lastName:   user.get('lastName'),
                    email:      user.get('emailAddress1'),
                    createdAt:  jqXHR.getResponseHeader('x-mysolomeo-ts'),
                    locale:     user.get("languageID"),
                    WLPID:      App.config.WLPID
                });

                App.analytics.track('Registered Practice Account', {
                  category: 'Registration',
                  label:    "Signup In App"
                });

                App.views.App.removeCampaign( );

                // Check for facebook pixel tracking campaign
                App.views.App.activatePixelTrack( );

                App.router.navigate( "/login", { "trigger": true } );
            })
            .fail( function( jqXHR, textStatus, errorThrown ) {

                var friendlyMsg = App.polyglot.t("views_user_add_error"),
                    result = {};

                if ( jqXHR.status >= 400 || jqXHR.status < 500 ) {

                    if ( typeof jqXHR !== "undefined" && typeof jqXHR.responseText !== "undefined" ) {

                        // Check for returned message on 400
                        try {
                            result = JSON.parse( jqXHR.responseText );

                            if ( typeof result.message !== "undefined" ) {
                                friendlyMsg = result.message;
                            }

                            if ( friendlyMsg.search(/duplicate username/i) != -1 ) {
                                friendlyMsg = App.polyglot.t("views_user_add_duplicate", {"username": data.username});
                            }
                        } catch ( e ) {
                            // Use default message
                        }
                    }
                }

                AppEvents.trigger("v::userAdd::signUpUser::error", {
                    showAlert: true,
                    removeAlerts: true,
                    friendlyMsg: friendlyMsg,
                    msg: "Unable to add user. " + ( result.message ? result.message : "" ) + " [status:" + jqXHR.status + " error:" + errorThrown + "]"
                });

                that.submitButton.enable().stop();
            });
        },

        checkUsername: function( ) {

            var $username = this.$("#username"),
                $result = this.$("#check-result"),
                username = $username.val(),
                user = App.models.user;

            if ( username ) {

                $username.trigger("change");

                user.checkUsername( username )
                .done( function( data, textStatus, jqXHR ) {
                    // Username is taken
                    $result.removeClass("valid-username username").addClass("invalid-username").text( App.polyglot.t("username_unavailable", {"username":username}) );
                })
                .fail( function( jqXHR, textStatus, errorThrown ) {
                    // Username is available
                    $result.removeClass("invalid-username username").addClass("valid-username").text( App.polyglot.t("username_available", {"username":username}) );
                })
                .always( function( ) {
                    $username.removeAttr("data-invalid").addClass("username-input");
                });
            } else {
                $result.removeClass("invalid-username valid-username").addClass("username");
                $username.removeClass("username-input");
            }
        }

    });

    return AddUserView;
});
