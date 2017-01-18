define([
    'backbone',
    'App',
    'App.Events',
    'App.Views.Helpers',
    "ladda",
    "purl",
    'text!templates/profile-add-document/profile-add-document.html',
    'text!templates/profile-add-document/image.html',
    'text!templates/profile-add-document/load-single-id-again.html'
], function( Backbone, App, AppEvents, AppViewHelpers, Ladda, purl, profileAddDocumentTemplate, profileAddDocumentImageTemplate, profileAddLoadSingleIDAgain ) {

    var ProfileAddDocumentView = Backbone.View.extend({

        events: {
            "change input#document-image-input":  "loadImage",
            "submit form#document-add-form":      "uploadDocument",
            "click #document-image-delete":       "removeImage",
            "click #uploadDocuments":             "moreDocuments",
            "click #submit-single-id-again":      "submitSingleIDAgain",			
			"click #document-image-upload": function( ) {
				
                this.$("#document-image-input").trigger("click");
            
			},
			"click #document-image-upload-library": function( ) {

                var _this = this;

				navigator.camera.getPicture( onSuccess, onFail, {
					"quality":			50,
					"sourceType":       Camera.PictureSourceType.PHOTOLIBRARY,
					"destinationType":  Camera.DestinationType.FILE_URI,
					"encodingType":     Camera.EncodingType.JPEG
				});

				function onSuccess ( e ) {
					_this.loadImage( e );
				};

				function onFail () {
					App.router.navigate( "profile/add-document", { "trigger": true } );
				};
				
            },
			
			"click #document-image-upload-camera": function( ) {

                var _this = this;
				
				navigator.camera.getPicture( onSuccess, onFail, {
					"quality":			50,
					"sourceType":       Camera.PictureSourceType.CAMERA,
					"destinationType":  Camera.DestinationType.FILE_URI,
					"encodingType":     Camera.EncodingType.JPEG
				});

				function onSuccess ( e ) {
					_this.loadImage( e );
				};

				function onFail () {
					App.router.navigate( "profile/add-document", { "trigger": true } );
				};
				
            },
			
//            "click #document-image-upload": function( ) {
//
//                var _this = this;
//
//                if ( App.config.buildType === "phonegap" && navigator.camera ) {
//                    navigator.camera.getPicture( function( e ) {
//                        _this.loadImage( e );
//                    }, function( message ) {
//                        AppEvents.trigger('v::profileAddDocument::loadImage::error', {
//                            "msg":          "Error uploading document image. (Name: " + errName + " Message:" + errMsg + ")",
//                            "friendlyMsg":  App.polyglot.t("views_profile_add_document_image_upload_error"),
//                            "showAlert":    true,
//                            "type":         "alert"
//                        });
//                    }, {
//                        "sourceType":       Camera.PictureSourceType.PHOTOLIBRARY,
//                        "destinationType":  Camera.DestinationType.FILE_URI,
//                        "encodingType":     Camera.EncodingType.JPEG
//                    });
//                } else {
//                    this.$("#document-image-input").trigger("click");
//                }
//            }
        },

        submitButton: null,

        formSubmitted: null,

        $documentForm: null,

        imageFile: null,

        initialize: function( options ) {
          
            options = options || {};
          
            // Render the title in the action bar
            App.views.App.renderActionTitle({
                "title": App.polyglot.t("Document Upload")
            });

            this.template = _.template( profileAddDocumentTemplate );

            this.templateImage = _.template( profileAddDocumentImageTemplate );
          
            this.templateLoadImageAgain = _.template( profileAddLoadSingleIDAgain );
        },

        render: function( ) {

            // TODO: extend data to the other template
            var data = {
                "types":            App.config.documentUploadTypes,
                "buildType":        App.config.buildType,
                "polyglot":         App.polyglot,
                "cdn":              App.config.cdn(),
                "showIOSWarning":   false,
                // TODO: do we need to define the 'both' document upload type here?
				"hasDocumentId":    _.find( App.models.user.uploadedDocs, function (pic) {
					if (pic.toLowerCase() === "picture id") {
						return true;
					} else {
						return false;
					}
				}),
                "hasDocumentAddr":  _.find( App.models.user.uploadedDocs, function (pic) {
					if (pic.toLowerCase() === "proof of address") {
						return true;
					} else {
						return false;
					}
				}),
				
				"hasDocumentIDandAddr":  _.find( App.models.user.uploadedDocs, function (pic) {
					if (pic.toLowerCase() === "picture id_proof of address") {
						return true;
					} else {
						return false;
					}
				}),
				
                "languageID":       App.models.userSession.get("languageID")
            };

            // Check for iOS 8...show warning
            if ( App.userAgent.os && App.userAgent.os.name === "iOS" && (/^8\./).test( App.userAgent.os.version ) ) {
                data.showIOSWarning = true;
            }

            this.$el.empty().html( this.template( data ) );

            this.$documentForm = this.$("#document-add-form");

            this.$documentImage = this.$("#document-image");

            $( document ).foundation( );

            // Set up ladda button animations
            // this.submitButton = Ladda.create( this.$("#document-submit")[0] );
        },
      
        // TODO - pass in URL params for referral - possible issue of not routing when referral key is present, i.e. upload?r=######
        moreDocuments: function () {
          
          if (Backbone.history.fragment === 'upload') { 
              App.router.navigate( "/upload-2forms", { "trigger": true } );
          } else if (Backbone.history.fragment === 'profile/add-document') {
              App.router.navigate( "/profile/add-documents", { "trigger": true } );
          } else {
              App.router.navigate( "profile/add-documents", { "trigger": true } );
          }
          
          // TODO: Add error handler for page load
        },

        loadImage: function ( e ) {

            // Using app helper to check for deep level property
            var file,
                fileType = "",
                reader = null,
                _this = this;

            if ( App.config.buildType === "phonegap" ) {

                window.resolveLocalFileSystemURL( e, function( fileEntry ) {

                    _this.imageFile = fileEntry.toURL();

                    fileEntry.file( function( file ) {
                        _this.displayUploadedImage( file, "image/jpeg" );
                    });

                }, function( error ) {

                    var errName =   App.getProperty("target.error.name", error) || "Unknown",
                        errMsg =    App.getProperty("target.error.message", error) || "Unknown";

                    AppEvents.trigger('v::profileAddDocument::loadImage::error', {
                        "msg":          "Error uploading document image. (Name: " + errName + " Message:" + errMsg + ")",
                        "friendlyMsg":  App.polyglot.t("views_profile_add_document_image_upload_error"),
                        "showAlert":    true,
                        "type":         "alert"
                    });
                });

            } else {

                file = App.getProperty("target.files.0", e);

                if ( file && window.FileReader ) {

                    fileType = file.type;

                    // Check file type
                    if ( _.indexOf( App.config.documentUploadAllowedTypes, file.type ) == -1 ) {

                        // Image type not allowed
                        AppEvents.trigger("v::profileAddDocument::loadImage::warning", {
                            "showAlert":    true,
                            "type":         "alert",
                            "msg":          "Image type [" + file.type +  "] not allowed.",
                            "friendlyMsg":  App.polyglot.t("views_profile_add_document_invalid_file_type")
                        });

                        return;
                    }

                    // Save reference to file
                    this.imageFile = file;

                    this.displayUploadedImage( file, fileType );
                }
            }
        },
      
        submitSingleIDAgain: function () {
          
          var _this = this;
          
          var data = {
                    "polyglot":         App.polyglot,
                    "cdn":              App.config.cdn(),
                    "languageID":       App.models.userSession.get("languageID"),
			  		"buildType":        App.config.buildType
                    
          };
          
          _this.$("#hide-for-single-id-resubmit").hide( );
          
          _this.$("#load-single-id").empty( ).html( _this.templateLoadImageAgain( data ) );
          
        },

        displayUploadedImage: function ( file, fileType ) {

           
            var _this = this;

            reader = new FileReader();

            reader.onload = function ( event ) {

                var imgSrc;

                // Load image into page
                if ( fileType === "image/jpeg" || fileType === "image/png" || fileType === "image/gif" ) {
                    imgSrc = event.target.result;
                } else {
                    imgSrc = App.config.appRoot + App.config.documentUploadImageSource[ fileType ] + "-" + App.models.userSession.get("languageID") + ".png";
                }
                
                var data = {
                  
                    "polyglot":         App.polyglot,
                    "imageSrc":         imgSrc
                };

                _this.$documentImage.empty( ).html( _this.templateImage( data ) );

                $("#document-image-upload").hide( );
				if ( App.config.buildType === "phonegap" ) {
					$("#document-image-upload-library").hide( );
					$("#document-image-upload-camera").hide( );
				}
                $("#document-submit").show( );
              
                // Moved the set up of Ladda animation to here
                _this.submitButton = Ladda.create( _this.$("#document-submit")[0] );
            };

            reader.onerror = function ( event ) {

                var errName =   App.getProperty("target.error.name", event) || "Unknown",
                    errMsg =    App.getProperty("target.error.message", event) || "Unknown";

                AppEvents.trigger('v::profileAddDocument::loadImage::error', {
                    "msg":          "Error uploading document image. (Name: " + errName + " Message:" + errMsg + ")",
                    "friendlyMsg":  App.polyglot.t("views_profile_add_document_image_upload_error"),
                    "showAlert":    true,
                    "type":         "alert"
                });
            };

            reader.readAsDataURL( file );
        },

        uploadDocument: function( e ) {

            var data,
                _this = this,
                uploadDocument;

            e.preventDefault( );

            if ( !this.formSubmitted ) {

                this.formSubmitted = true;
                
                this.submitButton.start( );

                // Remove existing alerts if they exist
                App.views.App.removeAlerts();

                if ( !window.FormData ) {

                    AppEvents.trigger("v::profileAddDocument::uploadDocument::error", {
                        type: "alert",
                        removeAlerts: true,
                        showAlert: true,
                        friendlyMsg: App.polyglot.t("views_profile_add_document_invalid_browser"),
                        msg: "Unable to upload document.  Missing FormData API."
                    });

                    this.submitButton.stop( );

                    this.formSubmitted = false;

                    return;
                }

                if ( !this.imageFile ) {

                    AppEvents.trigger("v::profileAddDocument::uploadDocument::warning", {
                        type: "alert",
                        removeAlerts: true,
                        showAlert: true,
                        friendlyMsg: App.polyglot.t("views_profile_add_document_missing_image"),
                        msg: "Attempt to upload document without image."
                    });

                    this.submitButton.stop( );

                    this.formSubmitted = false;

                    return;
                }

                if ( App.config.buildType === "phonegap" ) {

                    data = {};

                    data.token = App.models.userSession.get("userID");

                    data.documentType = this.$documentForm.find("#documentType").val( );

                    uploadDocument = this.model.uploadDocumentPhonegap;
                } else {

                    data = new FormData( );

                    data.append( "documentImage", this.imageFile );

                    data.append( "token", App.models.userSession.get("userID") );

                    data.append( "documentType", this.$documentForm.find("#documentType").val( ) );

                    uploadDocument = this.model.uploadDocument;
                }

                uploadDocument( data, this.imageFile )
                    .done( function( data, textStatus, jqXHR ) {

                        var documentType = _this.$documentForm.find("#documentType").val( );

                        _this.model.setUploadedDocs( documentType );

                        _this.render();

                        AppEvents.trigger("v::profileAddDocument::uploadDocument::success", {
                            removeAlerts: true,
                            showAlert: true,
                            friendlyMsg: App.polyglot.t("views_profile_add_document_confirm"),
                            msg: "Document uploaded."
                        });

                        App.analytics.track("Uploaded Document", {
                            "category":  "Verification",
                            "label":     documentType
                        });
                    })
                    .fail( function( jqXHR, textStatus, errorThrown ) {

                        var response,
                            responseMsg = "";

                        // Check for message from server
                        if ( jqXHR && jqXHR.responseText ) {

                            try {

                                response = JSON.parse( jqXHR.responseText );

                                if ( response && response.message ) {
                                    responseMsg = response.message;
                                }

                            } catch ( e ) {
                                // Do nothing
                            }
                        }

                        AppEvents.trigger("v::profileAddDocument::uploadDocument::error", {
                            type: "alert",
                            removeAlerts: true,
                            showAlert: true,
                            friendlyMsg: App.polyglot.t("views_profile_add_document_error") + ( responseMsg ? " - Reason: " + responseMsg : "" ),
                            msg: "Unable to upload document. [status:" + ( jqXHR.status || "" ) + " error:" + responseMsg + "]"
                        });
                    })
                    .always( function( ) {

                        _this.submitButton.stop( );

                        _this.formSubmitted = false;
                    });

            }
        },

        removeImage: function( ) {

            this.imageFile = null;

            this.$documentImage.empty( );

            // Wrap file input field temporarily in a form so that just it can be reset
            this.$("#document-image-input").wrap('<form>').closest('form').get(0).reset();

            // Remove temporary wrap
            this.$("#document-image-input").unwrap();

            this.$("#document-submit").hide( );

            this.$("#document-image-upload").show( );

        },

        removeView: function() {

            this.stopListening();

            this.undelegateEvents();
        }
    });

    return ProfileAddDocumentView;
});
