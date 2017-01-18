define([
    'backbone',
    'App',
    'App.Events',
    'App.Views.Helpers',
    "App.Models.Goal",
    "ladda",
    'text!templates/goal-edit.html',
    'text!templates/goal-delete-confirm.html',
    'jquery.tags.input'
], function( Backbone, App, AppEvents, AppViewHelpers, GoalModel, Ladda, goalEditTemplate, goalDeleteConfirmTemplate ) {

    var GoalEditView = Backbone.View.extend({

            // Use this reference to control the ladda animation
            submitButton: null,

            // Use this as a reference to the uploaded image file
            imageFile: null,

            // Set to true when goal in process of saving
            goalSubmitted: false, 

            events: {
                "submit form#goal-edit-form":     "editGoal",
                "click button#goal-edit-delete":  "confirmDeleteGoal",
                "click a#goal-tags-toggle":       "toggleTags",
                "change input#goal-image-input":  "loadImage",
                "change #goal-category":          "updateCatDesc",
 
                "click #goal-image-upload":   function() {
                    var _this = this;
                    if ( App.config.buildType === "phonegap" && navigator.camera ) {
                        navigator.camera.getPicture( function( e ) {
                            _this.loadImage( e );
                        }, function( message ) {
                            AppEvents.trigger('v::goalEdit::loadImage::error', {
                                "msg":          "Error uploading goal image. [Message:" + message + "]",
                                "friendlyMsg":  App.polyglot.t("views_goals_edit_image_upload_error"),
                                "showAlert":    true,
                                "type":         "alert"
                            });    
                        }, {
                            "sourceType":       Camera.PictureSourceType.PHOTOLIBRARY,
                            "destinationType":  Camera.DestinationType.FILE_URI,
                            "encodingType":     Camera.EncodingType.JPEG 
                        });
                    } else {
                        $("#goal-image-input").trigger("click");
                    }
                }
            },

            initialize: function( options ) {

                _.bindAll( this, "onGoalEdit", "confirmDeleteGoal", "deleteGoal" );

                this.type = "add";

                if ( this.model ) {
                    this.type = "edit";
                }

                // Render the back button in the action bar
                App.views.App.renderMenuButton("back");

                // Render the title in the action bar
                App.views.App.renderActionTitle({
                    "title": this.model ? App.polyglot.t("Edit Goal:") + " " + this.model.get("description") : App.polyglot.t("New Goal") 
                });

                this.template = _.template( goalEditTemplate );
                this.templateDeleteConfirm = _.template( goalDeleteConfirmTemplate );
            },

            render: function() {

                var data = {
                    "description":  "",
                    "amount":       "",
                    "tags":         [],
                    "positions":    [],
                    "category":     "",
                    "imageUrl":     App.config.appRoot + "img/graphic-upload-photo.png",
                    "type":         "add",
                    "defaultGoal":  false,
                    "polyglot":     App.polyglot
                },
                position;

                // Remove tooltips
                $(".tooltip").remove( );

                if ( this.type === "edit" ) {
            
                    _.extend( data, this.model.toJSON(), {
                        "type": "edit"
                    });

                    // Clone the tags so we can pull out the catgory without changing model
                    data.tags = $.isArray( data.tags ) ? _.clone( data.tags ) : [];

                    // Check if one of the tags is an official category...grab the first one
                    data.category = _.find( App.config.goalCategories, function( cat ) {
                      return _.indexOf( data.tags, cat.tag ) !== -1;
                    });

                    if ( !data.category ) {

                        data.category = {};
                    } else {

                        // Remove the category from the tags array
                        position = _.indexOf( data.tags, data.category.tag );
                    
                        data.tags.splice( position, 1 );
                    }

                    // Grab the last image in the array
                    if ( $.isArray( data.urlImages ) && data.urlImages.length > 0 ) {
                        data.imageUrl = _.last( data.urlImages );
                    }
                }

                // Don't show delete if new goal or default
                data.showDelete = ( this.type === "add" || data.defaultGoal ) ? false : true; 

                // Set official category tags
                data.categories = App.config.goalCategories;

                _.extend( data, AppViewHelpers );

                this.$el.empty().html( this.template( data ) );

                // Set up jquery references
                this.$goalCategory = this.$("#goal-category"); 
                this.$goalTags = this.$("#goal-tags");
                this.$goalEditForm = this.$("#goal-edit-form");
                this.$tagContainer = this.$("#goal-tags-container");
                this.$tagToggle = this.$("#goal-tags-toggle");

                // Initialize jquery tags
                this.$goalTags.tagsInput({
                    "defaultText": "",
                    "width": "100%"
                });

                $( document ).foundation( );

                // Initialize foundation abide form validation
                this.$goalEditForm.foundation( "abide", {} );

                // Set up ladda button animations
                this.submitButton = Ladda.create( this.$("#goal-edit-submit")[0] );
                this.imageButton = Ladda.create( this.$("#image-edit-submit")[0] );
                this.deleteButton = Ladda.create( this.$("#goal-edit-delete")[0] );

                return this;
            },

            removeView: function() {

                // Remove tooltips
                $(".tooltip").remove( );

                this.stopListening(); 

                this.undelegateEvents();
            },

            editGoal: function( e ) {

                var goal,
                    goalData = null,
                    tags = [],
                    re = /#/gi;

                e.preventDefault();

                if ( !this.goalSubmitted ) {

                    this.goalSubmitted = true;

                    this.submitButton.start( );

                    this.imageButton.start( );

                    // Remove existing alerts if they exist
                    App.views.App.removeAlerts();

                    // Build tags array from comma delimited input string
                    tags = _.chain( tags )
                        .push( this.$goalCategory.val() )
                        .concat( this.$goalTags.val().length > 0 ? this.$goalTags.val().replace(re,"").split(",") : [] )
                        .value();
      
                    goalData = {
                        "description":  this.$goalEditForm.find("#goal-description").val(),
                        "currencyID":   "USD",
                        "userID":       App.models.userSession.get("userID"),
                        "amount":       numeral().unformat( this.$goalEditForm.find("#goal-amount").val() ),
                        "tags":         tags,
                        "active":       true,
                        "type":         this.type,
                        "forceRefresh": true,
                        "accountID":    App.models.account.get("accountID")
                    };

                    if ( this.type === 'edit' ) {
                        // Use existing model
                        goal = this.model;
                    } else {
            
                        // Create new goal model
                        goal = new GoalModel( {}, {
                            "validate": true 
                        });

                        this.model = goal;
                    }

                    if ( goal.validationError ) {
                        //--> TODO: trigger alert error with message
                        return false;
                    }

                    goal.save( goalData, {
                        "context": this,
                        "dataType": ( this.type === "add" ? "json" : "text" )
                    })
                    .done( function( data, textStatus, jqXHR ) {
                        this.onGoalEdit( data );
                    })
                    .fail( function( jqXHR, textStatus, errorThrown ) {

                        AppEvents.trigger("v::goalEdit::editGoal::error", {
                            removeAlerts: true,
                            showAlert: true,
                            friendlyMsg: App.polyglot.t("views_goals_edit_error"),
                            msg: "Unable to edit goal. [status:" + jqXHR.status + " error:" + errorThrown + "]"
                        });       

                        this.submitButton.stop( );

                        this.imageButton.stop( );

                        this.goalSubmitted = false;
                    });
                } 
            },

            onGoalEdit: function ( data ) {

                // If this is a new goal, add it to the collection
                if ( this.type == 'add' ) {

                    this.model.set( data );

                    App.collections.goals.add( this.model );
                }
           
                // Clear the app path stack
                App.paths = [];

                if ( this.imageFile ) { 

                    this.listenToOnce( AppEvents, "goal:imageSet", function() {
                        this.onGoalSaved();
                    }); 

                    this.listenToOnce( AppEvents, "m::goal::setImage::error", function( data ) {

                        AppEvents.trigger("v::goalEdit::onGoalEdit::error", {
                            "msg": "The image for the goal could not be saved!",
                            "data": data  
                        });

                        App.views.App.postRenderAlert({
                            friendlyMsg: App.polyglot.t("views_goals_edit_image_upload_error") + ( data.responseMsg ? " - Reason: " + data.responseMsg : "" ),
                            type: "alert"  
                        });

                        App.views.App.navigatePath( "/goals/" + this.model.get("goalID"), { trigger: true } );
                    });

                    // Attempt to save the image
                    if ( App.config.buildType === "phonegap" ) {
                        this.model.setImagePhonegap( this.imageFile );
                    } else {
                        this.model.setImage( this.imageFile );
                    }

                } else {
                    this.onGoalSaved();
                }
            },

            onGoalSaved: function () {

                var friendlyMsg;

                AppEvents.trigger('goalsEdit:success', {
                    msg: "The goal " + this.model.get("goalID") + " '" + this.model.get("description") + "' has been " + ( this.model.get("type") === 'add' ? "created" : "saved" )  + "!"  
                });

                if ( this.model.get("type") === "add" ) {
                    friendlyMsg = App.polyglot.t("views_goals_edit_created");
                } else {
                    friendlyMsg = App.polyglot.t("views_goals_edit_saved");
                }

                App.views.App.postRenderAlert({
                    "friendlyMsg": friendlyMsg  
                });

                App.views.App.navigatePath( "/goals/" + this.model.get("goalID"), { trigger: true } );
            },

            toggleTags: function ( e ) {
    
                var content = "Add Custom Tags";

                e.preventDefault();

                if ( !this.$tagContainer.is(":visible") ) {
                    content = "Custom Tags"; 
                }

                this.$tagToggle.text( content ); 

                this.$tagContainer.toggleClass("hide");
            },

            loadImage: function ( e ) {
           
                // Using app helper to check for deep level property 
                var file, 
                    reader = null,
                    _this = this;

                if ( App.config.buildType === "phonegap" ) {

                    window.resolveLocalFileSystemURL( e, function( fileEntry ) {

                        _this.imageFile = fileEntry.toURL();

                        fileEntry.file( function( file ) {
                            _this.displayUploadedImage( file );
                        });

                    }, function( error ) {

                        var errName =   App.getProperty("target.error.name", error) || "Unknown",
                            errMsg =    App.getProperty("target.error.message", error) || "Unknown";
        
                        AppEvents.trigger('v::goalEdit::loadImage::error', {
                            "msg":          "Error uploading goal image. [Name: " + errName + " Message:" + errMsg + "]",
                            "friendlyMsg":  App.polyglot.t("views_goals_edit_image_upload_error"),
                            "showAlert":    true,
                            "type":         "alert"
                        });    
                    });

                } else {

                    file = App.getProperty("target.files.0", e);

                    if ( file && window.FileReader ) {

                        // Check file type
                        if ( _.indexOf( App.config.goalImageAllowedTypes, file.type ) == -1 ) {

                            // Image type not allowed 
                            AppEvents.trigger("v::goalEdit::loadImage::warning", {
                                "showAlert":    true,
                                "type":         "alert",
                                "msg":          "Image type [" + file.type +  "] not allowed.",
                                "friendlyMsg":  App.polyglot.t("views_goals_upload_image_error")
                            });    

                            return;
                        }

                        // Save reference to file
                        this.imageFile = file;

                        this.displayUploadedImage( file );
                    }
                }
            },

            displayUploadedImage: function ( file ) {

                reader = new FileReader();

                reader.onload = function ( event ) {
                    // Load image into page 
                    $("#goal-image").css( "background-image", "url(" + event.target.result + ")" ).css( "margin-bottom", "0px" );

                    $("#goal-image").next( ).css( "display", "block" );

                    // Remove upload button and replace with save
                    $("#goal-image-upload").hide( );

                    $("#image-edit-submit").show( );
                };

                reader.onerror = function ( event ) {

                    var errName =   App.getProperty("target.error.name", event) || "Unknown",
                        errMsg =    App.getProperty("target.error.message", event) || "Unknown";
    
                    AppEvents.trigger('v::goalEdit::loadImage::error', {
                        "msg":          "Error uploading goal image. [Name: " + errName + " Message:" + errMsg + "]",
                        "friendlyMsg":  App.polyglot.t("views_goals_edit_image_upload_error"),
                        "showAlert":    true,
                        "type":         "alert"
                    });    
                };

                reader.readAsDataURL( file );
            },

            confirmDeleteGoal: function( e ) {

                var that = this,
                    newStatus;
    
                if ( e ) {
                    e.preventDefault();
                }

                if ( !this.goalSubmitted ) {

                    newStatus = App.views.App.toggleModal(
                        this.templateDeleteConfirm({
                            "polyglot": App.polyglot
                        }),
                        "small"
                    );

                    if ( newStatus === "open" ) {
                        App.$modal.find("button#goal-delete-confirm").on( 'click', that.deleteGoal );
                        App.$modal.find("button#goal-delete-cancel").on( 'click', that.confirmDeleteGoal );
                    } 
                }

            },

            deleteGoal: function( ) {

                this.model.destroy({
                    "dataType": "text",
                    "context": this.model
                })
                .done( function( data, textStatus, jqXHR ) {

                    // Remove goal from favorites
                    App.collections.favorites.update( "goal", this.id, true ); 

                    App.views.App.toggleModal("","");

                    App.views.App.navigatePath( "/goals", { "trigger": true } );
                })
                .fail( function( jqXHR, textStatus, errorThrown ) {

                    AppEvents.trigger("v::goalEdit::deleteGoal::error", {
                        showAlert: true,
                        removeAlerts: true,
                        friendlyMsg: App.polyglot.t("views_goals_delete_error"),
                        msg: "Unable to delete goal. [status:" + jqXHR.status + " error:" + errorThrown + "]"
                    });       

                    this.deleteButton.stop();
                });
            },

            updateCatDesc: function( e ) {

                var cat = _.findWhere( App.config.goalCategories, {"tag": $(e.currentTarget).val() } );

                this.$("#goal-category-desc").text( cat ? cat.desc : "" );
            }
    });

    return GoalEditView;
});
