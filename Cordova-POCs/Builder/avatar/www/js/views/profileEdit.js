define([
    'backbone',
    'App',
    'App.Views.Helpers',
    'App.Events',
    'ladda',
    'text!templates/profile-edit.html'
], function( Backbone, App, AppViewHelpers, AppEvents, Ladda, profileEditTemplate ) {

    var ProfileEditView = Backbone.View.extend({

        profileSubmitted: false,

        events: { 
            "submit form#profile-edit-form": "editProfile"
        },

        initialize: function( options ) {

            // Render the back button in the action bar
            App.views.App.renderMenuButton("back");

            // Render the title in the action bar
            App.views.App.renderActionTitle({
                "title": App.polyglot.t("Edit Profile") 
            });

            this.template = _.template( profileEditTemplate );
        },

        render: function( ) {

            var data = {};

            _.extend( data, this.model.toJSON(), {
                "languages":  App.config.languages,
                "countries":  App.config.countries,
                "buildType":  App.config.buildType,
                "polyglot":   App.polyglot
            });

            this.$el.empty().html( this.template( data ));

            // Initialize foundation abide form validation
            this.$profileEditForm = this.$("#profile-edit-form").foundation( "abide", {} );

            // Set up ladda button animations
            this.submitButton = Ladda.create( this.$("#profile-edit-submit")[0] );

            return this;
        },

        removeView: function() {

            this.stopListening(); 

            this.undelegateEvents();
        },

        editProfile: function( e ) {

            var profileData;

            e.preventDefault();

            if ( !this.profileSubmitted ) {

                this.profileSubmitted = true;

                this.submitButton.start();

                // Remove existing alerts if they exist
                App.views.App.removeAlerts();

                profileData = {
                    "addressLine1":   this.$profileEditForm.find("#addressLine1").val(),
                    "addressLine2":   this.$profileEditForm.find("#addressLine2").val(),
                    "city":           this.$profileEditForm.find("#city").val(),
                    "stateProvince":  this.$profileEditForm.find("#stateProvince").val(),
                    "zipPostalCode":  this.$profileEditForm.find("#zipPostalCode").val(),
                    "countryID":      this.$profileEditForm.find("#countryID").val(),
                    "emailAddress1":  this.$profileEditForm.find("#emailAddress1").val(),
                    "languageID":     this.$profileEditForm.find("#language").val(),
                    "phoneHome":      this.$profileEditForm.find("#phoneHome").val()
                };
                
                this.model.save( profileData, {
                    "wait": true,
                    "context": this,
                    "dataType": "text",
                    "contentType":  "application/json",
                    "headers": {
                        "accept":  "application/json"
                    }
                })
                .done( function( data, textStatus, jqXHR ) {

                    // Identify Users with segment.io
                    App.analytics.identify( App.models.userSession.get("userID"), {
                        email:      App.models.user.get('emailAddress1'),
                        firstName:  App.models.user.get('firstName'),
                        lastName:   App.models.user.get('lastName'),
                        WLPID:      App.config.WLPID
                    });

                    App.router.navigate( "/profile", { trigger: true } );
                })
                .fail( function( jqXHR, textStatus, errorThrown ) {

                    AppEvents.trigger("v::profileEdit::editProfile::error", {
                        showAlert: true,
                        removeAlerts: true,
                        friendlyMsg: App.polyglot.t("views_profile_edit_error"),
                        msg: "Unable to edit profile. [status:" + jqXHR.status + " error:" + errorThrown + "]"
                    });       
                })
                .always( function( ) {

                    this.submitButton.stop();

                    this.profileSubmitted = false;
                });
            }
        }
    });

    return ProfileEditView;
});

