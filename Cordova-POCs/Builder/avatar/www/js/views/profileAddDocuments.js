define([
    'backbone',
    'App',
    'App.Events',
    'App.Views.Helpers',
    "ladda",
    "purl",
    'text!templates/profile-add-document/profile-add-documents-2forms.html',
    'text!templates/profile-add-document/image.html',
    'text!templates/profile-add-document/id-image.html',
    'text!templates/profile-add-document/poa-image.html',
    'text!templates/profile-add-document/load-id-again.html',
    'text!templates/profile-add-document/load-poa-again.html'
], function( Backbone, App, AppEvents, AppViewHelpers, Ladda, purl, profileAddDocumentsTemplate, profileAddDocumentImageTemplate, profileAddIDDocumentImageTemplate, profileAddPOADocumentImageTemplate, profileAddLoadIDAgain, profileAddLoadPOAAgain  ) {

    var ProfileAddDocumentsView = Backbone.View.extend({

        events: {
            "change input#document-id-image-input":   		"loadIDImage",
            "change input#document-poa-image-input":  		"loadPOAImage",
            "submit form#document-id-add-form":       		"uploadIDDocument",
            "submit form#document-poa-add-form":      		"uploadPOADocument",
            "click #document-id-image-delete":        		"removeIDImage",
            "click #document-poa-image-delete":       		"removePOAImage",
            "click #oneDocument":                     		"oneDocument",
            "click #document-id-image-upload":        		"documentIDImageUpload",
			"click #document-id-image-upload-library": 		"documentIDImageUploadLibrary",
			"click #document-id-image-upload-camera":  		"documentIDImageUploadCamera",
            "click #document-poa-image-upload":       		"documentPOAImageUpload",
			"click #document-poa-image-upload-library":     "documentPOAImageUploadLibrary",
			"click #document-poa-image-upload-camera":      "documentPOAImageUploadCamera",
            "click #submit-poa-again":                		"submitPOAAgain",
            "click #submit-id-again":                 		"submitIDAgain",
        },

        submitIDButton: null,
        submitPOAButton: null,

        IDformSubmitted: null,
        POAformSubmitted: null,

        $documentIDForm: null,
        $documentPOAForm: null,

        imageFile: null,
        IDimageFile: null,
        POAimageFile: null,

        initialize: function( options ) {

            options = options || {};

            // Render the title in the action bar
            App.views.App.renderActionTitle({
                "title": App.polyglot.t("Document Upload")
            });

            this.template = _.template( profileAddDocumentsTemplate );

            this.templateIDImage = _.template( profileAddIDDocumentImageTemplate );
            this.templatePOAImage = _.template( profileAddPOADocumentImageTemplate );
          
            this.templateloadIDImageAgain = _.template( profileAddLoadIDAgain );
            this.templateloadPOAImageAgain = _.template( profileAddLoadPOAAgain );
        },

        render: function( ) {
          
            // add variables for the 
            var data = {
                "types":            App.config.documentUploadTypes,
                "buildType":        App.config.buildType,
                "polyglot":         App.polyglot,
                "cdn":              App.config.cdn(),
                "showIOSWarning":   false,
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

            this.$documentIDForm = this.$("#document-id-add-form");
            this.$documentPOAForm = this.$("#document-poa-add-form");

            this.$documentIDImage = this.$("#document-id-image");
            this.$documentPOAImage = this.$("#document-poa-image");

            $( document ).foundation( );

        },
      
        documentIDImageUpload :function( imageElement ) {
			
			this.$("#document-id-image-input").trigger("click");
        
		},
		      
        documentPOAImageUpload :function( imageElement ) {

			this.$("#document-poa-image-input").trigger("click");
			
        },
		
		documentIDImageUploadLibrary: function () {
		
			var _this = this;
			
			navigator.camera.getPicture( onSuccess, onFail, {
				"quality":			50,
				"sourceType":       Camera.PictureSourceType.PHOTOLIBRARY,
				"destinationType":  Camera.DestinationType.FILE_URI,
				"encodingType":     Camera.EncodingType.JPEG
			});

			function onSuccess ( e ) {
				_this.loadIDImage( e );
			};

			function onFail () {
				App.router.navigate( "profile/add-documents", { "trigger": true } );
			};
		},
		
		documentPOAImageUploadLibrary: function () {
		
			var _this = this;
			
			navigator.camera.getPicture( onSuccess, onFail, {
				"quality":			50,
				"sourceType":       Camera.PictureSourceType.PHOTOLIBRARY,
				"destinationType":  Camera.DestinationType.FILE_URI,
				"encodingType":     Camera.EncodingType.JPEG
			});

			function onSuccess ( e ) {
				_this.loadPOAImage( e );
			};

			function onFail () {
				App.router.navigate( "profile/add-documents", { "trigger": true } );
			};
		},
		
		documentIDImageUploadCamera: function () {
			var _this = this;
			
			navigator.camera.getPicture( onSuccess, onFail, {
				"quality":			50,
				"sourceType":       Camera.PictureSourceType.CAMERA,
				"destinationType":  Camera.DestinationType.FILE_URI,
				"encodingType":     Camera.EncodingType.JPEG
			});

			function onSuccess ( e ) {
				_this.loadIDImage( e );
			};

			function onFail () {
				App.router.navigate( "profile/add-documents", { "trigger": true } );
			};
		},
		
		documentPOAImageUploadCamera: function () {
			var _this = this;
			
			navigator.camera.getPicture( onSuccess, onFail, {
				"quality":			50,
				"sourceType":       Camera.PictureSourceType.CAMERA,
				"destinationType":  Camera.DestinationType.FILE_URI,
				"encodingType":     Camera.EncodingType.JPEG
			});

			function onSuccess ( e ) {
				_this.loadPOAImage( e );
			};

			function onFail () {
				App.router.navigate( "profile/add-documents", { "trigger": true } );
			};
		},
          
        oneDocument: function () {
          
          if (Backbone.history.fragment === 'upload-2forms') { 
              App.router.navigate( "/upload", { "trigger": true } );
          } else if (Backbone.history.fragment === 'profile/add-documents') {
              App.router.navigate( "/profile/add-document", { "trigger": true } );
          } else {
              App.router.navigate( "/upload", { "trigger": true } );
          }
          // TODO: Add error handler for page load
        },
      
        submitIDAgain: function () {
          
          var _this = this;
          
          var data = {
                    "polyglot":         App.polyglot,
                    "cdn":              App.config.cdn(),
                    "languageID":       App.models.userSession.get("languageID"),
			  		"buildType":        App.config.buildType
          };
          
          _this.$("#hide-for-id-resubmit").hide( );
          
          _this.$("#load-id").empty( ).html( _this.templateloadIDImageAgain( data ) );
          
        },

        submitPOAAgain: function () {
          
          var _this = this;
          
          var data = {
                    "polyglot":         App.polyglot,
                    "cdn":              App.config.cdn(),
                    "languageID":       App.models.userSession.get("languageID"),
			  		"buildType":        App.config.buildType
          };
          
          _this.$("#hide-for-poa-resubmit").hide( );
          
          _this.$("#load-poa").empty( ).html( _this.templateloadPOAImageAgain( data ) );
          
        },
      
        loadIDImage: function ( e ) {

            // Using app helper to check for deep level property
            var file,
                fileType = "",
                reader = null,
                _this = this;

            if ( App.config.buildType === "phonegap" ) {

                window.resolveLocalFileSystemURL( e, function( fileEntry ) {

                    _this.IDimageFile = fileEntry.toURL();

                    fileEntry.file( function( file ) {
                        _this.displayUploadedIDImage( file, "image/jpeg" );
                    });

                }, function( error ) {

                    var errName =   App.getProperty("target.error.name", error) || "Unknown",
                        errMsg =    App.getProperty("target.error.message", error) || "Unknown";

                    AppEvents.trigger('v::profileAddDocuments::loadIDImage::error', {
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
                        AppEvents.trigger("v::profileAddDocuments::loadIDImage::warning", {
                            "showAlert":    true,
                            "type":         "alert",
                            "msg":          "Image type [" + file.type +  "] not allowed.",
                            "friendlyMsg":  App.polyglot.t("views_profile_add_document_invalid_file_type")
                        });

                        return;
                    }

                    // Save reference to file
                    this.IDimageFile = file;

                    this.displayUploadedIDImage( file, fileType );
                }
            }
        },
      
      
        loadPOAImage: function ( e ) {

            // Using app helper to check for deep level property
            var file,
                fileType = "",
                reader = null,
                _this = this;

            if ( App.config.buildType === "phonegap" ) {

                window.resolveLocalFileSystemURL( e, function( fileEntry ) {

                    _this.POAimageFile = fileEntry.toURL();

                    fileEntry.file( function( file ) {
                        _this.displayUploadedPOAImage( file, "image/jpeg" );
                    });

                }, function( error ) {

                    var errName =   App.getProperty("target.error.name", error) || "Unknown",
                        errMsg =    App.getProperty("target.error.message", error) || "Unknown";

                    AppEvents.trigger('v::profileAddDocuments::loadImage::error', {
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
                        AppEvents.trigger("v::profileAddDocuments::loadImage::warning", {
                            "showAlert":    true,
                            "type":         "alert",
                            "msg":          "Image type [" + file.type +  "] not allowed.",
                            "friendlyMsg":  App.polyglot.t("views_profile_add_document_invalid_file_type")
                        });

                        return;
                    }

                    // Save reference to file
                    this.POAimageFile = file;

                    this.displayUploadedPOAImage( file, fileType );
                }
            }
        },
      
        displayUploadedIDImage: function ( file, fileType ) {

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

                _this.$documentIDImage.empty( ).html( _this.templateIDImage( data ) );

                $("#document-id-image-upload").hide( );
				if ( App.config.buildType === "phonegap" ) {
					$("#document-id-image-upload-library").hide( );
					$("#document-id-image-upload-camera").hide( );
				}
                $("#document-id-submit").show( );
                // TODO - move
                _this.submitIDButton = Ladda.create( _this.$("#document-id-submit")[0] );
              
            };

            reader.onerror = function ( event ) {

                var errName =   App.getProperty("target.error.name", event) || "Unknown",
                    errMsg =    App.getProperty("target.error.message", event) || "Unknown";

                AppEvents.trigger('v::profileAddDocuments::loadIDImage::error', {
                    "msg":          "Error uploading document image. (Name: " + errName + " Message:" + errMsg + ")",
                    "friendlyMsg":  App.polyglot.t("views_profile_add_document_image_upload_error"),
                    "showAlert":    true,
                    "type":         "alert"
                });
            };

            reader.readAsDataURL( file );
        },
      
        displayUploadedPOAImage: function ( file, fileType ) {

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

                _this.$documentPOAImage.empty( ).html( _this.templatePOAImage( data ) );

                $("#document-poa-image-upload").hide( );
				if ( App.config.buildType === "phonegap" ) {
					$("#document-poa-image-upload-library").hide( );
					$("#document-poa-image-upload-camera").hide( );
				}
                $("#document-poa-submit").show( );
              
                _this.submitPOAButton = Ladda.create( _this.$("#document-poa-submit")[0] );

            };

            reader.onerror = function ( event ) {

                var errName =   App.getProperty("target.error.name", event) || "Unknown",
                    errMsg =    App.getProperty("target.error.message", event) || "Unknown";

                AppEvents.trigger('v::profileAddDocuments::loadPOAImage::error', {
                    "msg":          "Error uploading document image. (Name: " + errName + " Message:" + errMsg + ")",
                    "friendlyMsg":  App.polyglot.t("views_profile_add_document_image_upload_error"),
                    "showAlert":    true,
                    "type":         "alert"
                });
            };

            reader.readAsDataURL( file );
        },
      
        uploadIDDocument: function( e ) {

            var data,
                _this = this,
                uploadIDDocument;

            e.preventDefault( );

            if ( !this.IDformSubmitted ) {

                this.IDformSubmitted = true;
                
                _this.submitIDButton.start( );

                // Remove existing alerts if they exist
                App.views.App.removeAlerts();

                if ( !window.FormData ) {

                    AppEvents.trigger("v::profileAddDocuments::uploadIDDocument::error", {
                        type: "alert",
                        removeAlerts: true,
                        showAlert: true,
                        friendlyMsg: App.polyglot.t("views_profile_add_document_invalid_browser"),
                        msg: "Unable to upload document.  Missing FormData API."
                    });

                    this.submitIDButton.stop( );

                    this.IDformSubmitted = false;

                    return;
                }

                if ( !this.IDimageFile ) {

                    AppEvents.trigger("v::profileAddDocuments::uploadIDDocument::warning", {
                        type: "alert",
                        removeAlerts: true,
                        showAlert: true,
                        friendlyMsg: App.polyglot.t("views_profile_add_document_missing_image"),
                        msg: "Attempt to upload document without image."
                    });

                    this.submitIDButton.stop( );

                    this.IDformSubmitted = false;

                    return;
                }

                if ( App.config.buildType === "phonegap" ) {

                    data = {};

                    data.token = App.models.userSession.get("userID");

                    data.documentType = this.$documentIDForm.find("#documentType").val( );

                    uploadIDDocument = this.model.uploadDocumentPhonegap;
                } else {

                    data = new FormData( );

                    data.append( "documentImage", this.IDimageFile );

                    data.append( "token", App.models.userSession.get("userID") );

                    data.append( "documentType", this.$documentIDForm.find("#documentType").val( ) );

                    uploadIDDocument = this.model.uploadDocument;
                }

                uploadIDDocument( data, this.IDimageFile )
                    .done( function( data, textStatus, jqXHR ) {

                        var documentType = _this.$documentIDForm.find("#documentType").val( );

                        _this.model.setUploadedDocs( documentType );

                        _this.render();

                        AppEvents.trigger("v::profileAddDocuments::uploadIDDocument::success", {
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

                        AppEvents.trigger("v::profileAddDocuments::uploadIDDocument::error", {
                            type: "alert",
                            removeAlerts: true,
                            showAlert: true,
                            friendlyMsg: App.polyglot.t("views_profile_add_document_error") + ( responseMsg ? " - Reason: " + responseMsg : "" ),
                            msg: "Unable to upload document. [status:" + ( jqXHR.status || "" ) + " error:" + responseMsg + "]"
                        });
                    })
                    .always( function( ) {

                        _this.submitIDButton.stop( );

                        _this.IDformSubmitted = false;
                    });

            }
        },
      
        uploadPOADocument: function( e ) {

            var data,
                _this = this,
                uploadPOADocument;

            e.preventDefault( );

            if ( !this.POAformSubmitted ) {

                this.POAformSubmitted = true;

                this.submitPOAButton.start( );

                // Remove existing alerts if they exist
                App.views.App.removeAlerts();

                if ( !window.FormData ) {

                    AppEvents.trigger("v::profileAddDocuments::uploadPOADocument::error", {
                        type: "alert",
                        removeAlerts: true,
                        showAlert: true,
                        friendlyMsg: App.polyglot.t("views_profile_add_document_invalid_browser"),
                        msg: "Unable to upload document.  Missing FormData API."
                    });

                    this.submitPOAButton.stop( );

                    this.POAformSubmitted = false;

                    return;
                }

                if ( !this.POAimageFile ) {

                    AppEvents.trigger("v::profileAddDocuments::uploadPOADocument::warning", {
                        type: "alert",
                        removeAlerts: true,
                        showAlert: true,
                        friendlyMsg: App.polyglot.t("views_profile_add_document_missing_image"),
                        msg: "Attempt to upload document without image."
                    });

                    this.submitPOAButton.stop( );

                    this.POAformSubmitted = false;

                    return;
                }

                if ( App.config.buildType === "phonegap" ) {

                    data = {};

                    data.token = App.models.userSession.get("userID");

                    data.documentType = this.$documentPOAForm.find("#documentType").val( );

                    uploadPOADocument = this.model.uploadDocumentPhonegap;
                } else {

                    data = new FormData( );

                    data.append( "documentImage", this.POAimageFile );

                    data.append( "token", App.models.userSession.get("userID") );

                    data.append( "documentType", this.$documentPOAForm.find("#documentType").val( ) );

                    uploadPOADocument = this.model.uploadDocument;
                }

                uploadPOADocument( data, this.POAimageFile )
                    .done( function( data, textStatus, jqXHR ) {

                        var documentType = _this.$documentPOAForm.find("#documentType").val( );

                        _this.model.setUploadedDocs( documentType );

                        _this.render();

                        AppEvents.trigger("v::profileAddDocuments::uploadPOADocument::success", {
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

                        AppEvents.trigger("v::profileAddDocuments::uploadPOADocument::error", {
                            type: "alert",
                            removeAlerts: true,
                            showAlert: true,
                            friendlyMsg: App.polyglot.t("views_profile_add_document_error") + ( responseMsg ? " - Reason: " + responseMsg : "" ),
                            msg: "Unable to upload document. [status:" + ( jqXHR.status || "" ) + " error:" + responseMsg + "]"
                        });
                    })
                    .always( function( ) {

                        _this.submitPOAButton.stop( );

                        _this.POAformSubmitted = false;
                    });

            }
        },
      
        removeIDImage: function( ) {

            this.IDimageFile = null;

            this.$documentIDImage.empty( );

            // Wrap file input field temporarily in a form so that just it can be reset
            this.$("#document-id-image-input").wrap('<form>').closest('form').get(0).reset();

            // Remove temporary wrap
            this.$("#document-id-image-input").unwrap();

            this.$("#document-id-submit").hide( );

            this.$("#document-id-image-upload").show( );
			
			if ( App.config.buildType === "phonegap" ) {
				this.$("#document-id-image-upload-library").show( );
				this.$("#document-id-image-upload-camera").show( );
			}

        },
      
        removePOAImage: function( ) {

            this.POAimageFile = null;

            this.$documentPOAImage.empty( );

            // Wrap file input field temporarily in a form so that just it can be reset
            this.$("#document-poa-image-input").wrap('<form>').closest('form').get(0).reset();

            // Remove temporary wrap
            this.$("#document-poa-image-input").unwrap();

            this.$("#document-poa-submit").hide( );

            this.$("#document-poa-image-upload").show( );
			
			if ( App.config.buildType === "phonegap" ) {
				this.$("#document-poa-image-upload-library").show( );
				this.$("#document-poa-image-upload-camera").show( );
			}

        },

        removeView: function() {

            this.stopListening();

            this.undelegateEvents();
        }
    });

    return ProfileAddDocumentsView;
});
