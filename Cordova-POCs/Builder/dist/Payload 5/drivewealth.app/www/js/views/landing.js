define([
    'backbone',
    'App',
    'App.Events',
    'ladda',
    'models/resource',
    'text!templates/landing.html',
    'text!templates/user-add.html'
],
    function( Backbone, App, AppEvents, Ladda, resource, landingTemplate, userAddTemplate ) {

        var LandingView = Backbone.View.extend({

            events: {
                "click #sign-in-link": function( e ) {
                    App.views.App.navigate( e );
                },
                "click #sign-up": "toggleSignUpModal"
            },

            throttledCheck: null,

            initialize: function( options ) {

                _.bindAll( this, "toggleSignUpModal", "signUpUser", "checkUsername" );

                this.throttledCheck = _.debounce( this.checkUsername, 500 );

                this.template = _.template( landingTemplate );
                this.templateUserAdd = _.template( userAddTemplate );
            },

            render: function() {

                this.$el.empty().html( this.template({
                    "appsDomain":       App.config.appsDomain(),
                    "polyglot":         App.polyglot,
                    "externalRootURL":  App.config.externalRootURL,
                    "cdn":              App.config.cdn( ),
                    "externalDomain":   App.config.externalDomain( ),
                    "buildType":        App.config.buildType,
                    "languageID":       App.models.user.get("languageID") || App.config.defaultLanguageID,
                    "referralCode":     App.models.userSession.get("referralCode"),
		    "WLPID":            App.config.WLPID,
                    "WLP_Logo":         App.config.companyLogoPath.WLP_Logo,
                    "WLP_CompanyName":  resource.get('WLP_CompanyName')
                }) );

                this.$('.landing-imageshow').height(this.$el.height());

                return this;
            },

            removeView: function() {

                this.stopListening();

                this.undelegateEvents();
            },

            toggleSignUpModal: function( e ) {

                var that = this,
                    newStatus;

                if ( e ) {
                    e.preventDefault();
                }

                newStatus = App.views.App.toggleModal(
                    this.templateUserAdd({
                        polyglot: App.polyglot,
                        appRoot: App.config.appRoot,
                        cdn: App.config.cdn( ),
                        WLPID: App.config.WLPID,
                        WLP_Logo: App.config.companyLogoPath.WLP_Logo,
                        WLP_CompanyName: resource.get('WLP_CompanyName')
                    }),
                    "large"
                );

                if ( newStatus === 'open' ) {

                    // Set up ladda button animation
                    that.submitButton = Ladda.create( App.$modal.find("#signup-button")[0] );

                    // Initialize form validation
                    that.$loginForm = App.$modal.find("#signup-form")
                        .foundation({
                            "abide": {
                                "validators": {
                                    "dwpassword":  App.config.validators.password
                                }
                            }
                        })
                        .on( "submit", function( e ) {
                            e.preventDefault();
                        })
                        .on( "valid", that.signUpUser );

                    // Listen for link clicks
                    App.$modal.find(".nav-link").on("click", function( e ) {

                        e.preventDefault();

                        App.$modal.find(".nav-link").off();

                        App.views.App.toggleModal( );

                        App.views.App.navigate( e );
                    });

                    // Check username on blur and keypress
                    App.$modal.find("#username").on("blur keydown input", that.throttledCheck);

                }
            },

            signUpUser: function( e ) {

                var data = {},
                    that = this,
                    user = App.models.user,
                    referral;

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
                    "tranAmount":     App.config.starterFunds
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
                        "accept":   "application/json"
                    }
                })
                .done( function( data, textStatus, jqXHR ) {

                    App.views.App.toggleModal( );

                    if ( !data || !data.userID ) {
                        AppEvents.trigger("v::landing::createUser::error", {
                            "msg": "User could not be created. [data: " + JSON.stringify( data ) + "]"
                        });
                        return;
                    }

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
                      label:    'Default Landing'
                    });

                    App.views.App.postRenderAlert({
                        "friendlyMsg":  App.polyglot.t("views_landing_created")
                    });

                    App.views.App.removeCampaign( );

                    // Check for facebook pixel tracking campaign
                    App.views.App.activatePixelTrack( );

                    App.router.navigate( "/login", { "trigger": true } );
                })
                .fail( function( jqXHR, textStatus, errorThrown ) {

                    var friendlyMsg = App.polyglot.t("views_landing_user_add_error"),
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
                                    friendlyMsg = App.polyglot.t("views_landing_username_not_available", {"username":data.username});
                                }
                            } catch ( e ) {
                                // Use default message
                            }
                        }
                    }

                    AppEvents.trigger("v::landing::signUpUser::error", {
                        showAlert: true,
                        removeAlerts: true,
                        friendlyMsg: friendlyMsg,
                        msg: "Unable to add user. [status:" + jqXHR.status + " error:" + errorThrown + "]"
                    });

                    that.submitButton.enable().stop();
                });
            },

            checkUsername: function( ) {

                var $username = App.$modal.find("#username"),
                    $result = App.$modal.find("#check-result"),
                    username = $username.val(),
                    user = App.models.user;

                if ( username && (/^\S*$/).test( username ) ) {

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

        return LandingView;
    }
);
