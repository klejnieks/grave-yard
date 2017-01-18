define([
    'backbone',
    'App',
    'App.Events',
    'ladda',
    'text!templates/login.html'
],
    function( Backbone, App, AppEvents, Ladda, loginTemplate ) {

        var LoginView = Backbone.View.extend({

            // Use these reference to control the ladda animation
            submitButton: null,

            events: {
                "submit form#login-form":  "loginUser",
                "change #language":        "changeLanguage",
                'click #show-password':    "showPassword"
            },

            initialize: function( options ) {

                this.template = _.template( loginTemplate );
                
                try {
            		StatusBar.styleDefault();
            	} 
                catch(error) {}
            },

            render: function() {
            	
                data = {
                    "polyglot":         App.polyglot,
                    "appRoot":          App.config.appRoot,
                    "rootURL":          App.config.rootURL,
                    "externalRootURL":  App.config.externalRootURL,
                    "cdn":              App.config.cdn(),
                    "WLPID":            App.config.WLPID,
                    "WLP_Logo":         App.config.companyLogoPath.WLP_Logo
                };

                data.languages = App.config.languages;

                data.languageID = App.preferences.languageID || App.config.defaultLanguageID;

                this.$el.empty().html( this.template( data ) );

                $("body").removeClass("f-topbar-fixed");

                // Set focus on the username field
                $("#username").focus( );
              
                // set variable for password
                this.passwordInput = $('#password', this.el);

                // Set up ladda button animation
                this.submitButton = Ladda.create( this.$("#login-button")[0] );

                // Set up form jquery reference and foundation abide validation
                this.$loginForm = this.$("#login-form").foundation();

                return this;
            },

            removeView: function() {

                this.stopListening();

                this.undelegateEvents();
            },

            loginUser: function( e ) {

                var that = this,
                    reEnv = /\#(UAT|PROD)$/i,
                    username = $("#username").val(),
                    results,
                    env,
                    switched;

                e.preventDefault();

                // Check for environment tag on username
                results = reEnv.exec( username );

                env = results ? ( results[1] ).toUpperCase( ) : undefined;

                if ( env && env !== App.config.env ) {

                    // The requested environment is not default...switch it
                    switched = App.setEnv( env );

                    if ( switched ) {
                        username = username.replace( results[0], "" );
                    }
                }

                App.views.App.removeAlerts();

                this.submitButton.disable().start();

                this.model.loginUser({
                    "username":   username,
                    "password":   $('#password').val(),
                    "languageID": $("#language").val(),
                    "env":        env
                })
                .done( function( ) {

                    var unfundedAccts;

                    // Identify Users with segment.io
                    App.analytics.identify( App.models.userSession.get("userID"), {
                        email:            App.models.user.get('emailAddress1'),
                        firstName:        App.models.user.get('firstName'),
                        lastName:         App.models.user.get('lastName'),
                        referralCode:     App.models.user.get('referralCode'),
                        numLiveAccounts:  App.collections.accounts.where( { "accountType": 2 } ).length,
                        numDemoAccounts:  App.collections.accounts.where( { "accountType": 1 } ).length,
                        WLPID:            App.config.WLPID
                    });

                    App.views.App.navigatePath( ( App.router.forward || '/' ), { trigger: true } );

                    try {
                		StatusBar.styleLightContent();
                	} catch(error) {}
                	
                    // Check for unfunded live accounts
                    unfundedAccts = App.collections.accounts.where( { "accountType":2, "cash":0 } );

                    if ( unfundedAccts.length > 0 ) {
                        App.analytics.track("Needs Funding", {
                            "category":  "Funding",
                            "label":     "No Cash",
                            "accountNo": unfundedAccts[0].get("accountNo")
                        });
                    }

                    // Check for pending live accounts without docs
                    if ( App.collections.accounts.hasLiveAcct && App.models.user.get("status") === 1 ) {

                        // Check if docs have been uploaded
                        App.models.user.getUploadedDocs( )
                        .always( function( data ) {

                          
                          var docs = App.models.user.uploadedDocs;
                          
                          // store variable to see if user has uploaded ID document
                          var hasID = _.find( docs, function (pic) {
                            if (pic.toLowerCase() === "picture id") {
                              return true;
                            } else {
                              return false;
                            }
                          });
                          
                          // store variable to see if user has uploaded proof of adress document
                          var hasPOA = _.find( docs, function (pic) {
                            if (pic.toLowerCase() === "proof of address") {
                              return true;
                            } else {
                              return false;
                            }
                          });
							
                          // store variable for single document with both ID and proof of address
                          var hasSingleProofDoc = _.find( docs, function (pic) {
                            if (pic.toLowerCase() === "picture id_proof of address") {
                              return true;
                            } else {
                              return false;
                            }
                          });
                          
                            if ( !docs || !( hasID && hasPOA ) || !hasSingleProofDoc ) {
                            
                            // Show alert that docs are needed
                            AppEvents.trigger("v::login::loginUser::warning", {
                                "showAlert":     true,
                                "removeAlerts":  true,
                                "msg":           "Incomplete document uploads",
              "friendlyMsg":	 "<a href=\"/profile/add-document\" class=\"nav-item\" >" + App.polyglot.t("views_login_doc_upload_alert") + " " + App.polyglot.t("Upload Documents Here") + "</a>",
                                "type":          "alert"
                            });
                          }
                      });
                    }
                })
                .fail( function( jqXHR, textStatus, errorThrown ) {

                    var msg,
                        type = "error";

                    if ( typeof jqXHR !== "undefined" && ( jqXHR.status >= 500 || jqXHR.status === 0 ) ) {
                        msg = App.polyglot.t("views_login_error");
                    } else {
                        msg = App.polyglot.t("views_login_incorrect_credentials");
                        type = "warning";
                    }

                    AppEvents.trigger("v::login::loginUser::" + type, {
                        "showAlert":     true,
                        "removeAlerts":  true,
                        "msg":           "Username/password error. [status:" + jqXHR.status + " error:" + errorThrown + "]",
                        "friendlyMsg":   msg
                    });
                })
                .always( function( ) {
                    that.submitButton.enable().stop();
                });
            },

            changeLanguage: function( e ) {

                var languageId = this.$( e.target ).val( ),
                    _this      = this,
                    username   = this.$loginForm.find("#username").val( ),
                    password   = this.$loginForm.find("#password").val( );

                if ( languageId ) {

                    App.models.userSession.loadLanguage( languageId )
                    .done( function( ) {

                        App.views.App.renderLayout( );

                        App.views.App.refreshViews( );

                        // Reset username and password if entered
                        $("#username").val( username );

                        $("#password").val( password );
                    });

                    App.models.user.set("languageID", languageId );
                }
            },
          
          
            showPassword: function () {
              
              if (this.passwordInput.attr('type') === 'password') {
                this.passwordInput.attr('type', 'text'); 
              } else {
                this.passwordInput.attr('type', 'password'); 
              }
            
            }
        });

        return LoginView;
    }
);
