define([
    'backbone',
    'App',
    'App.Events',
    'App.Views.Helpers',
    "App.Models.Question",
    "ladda",
    'text!templates/question-add.html',
    'jquery.tags.input'
], function( Backbone, App, AppEvents, AppViewHelpers, QuestionModel, Ladda, questionAddTemplate ) {

    var QuestionAddView = Backbone.View.extend({

        // Use this reference to control the ladda animation
        submitButton: null,

        // Set to true when question in process of saving
        questionSubmitted: false,

        events: {
            "submit form#question-add-form":  "addQuestion",
            "change #goal-category":          "updateCatDesc"
        },

        initialize: function( options ) {

            // Render the back button in the action bar
            App.views.App.renderMenuButton("back");

            // Render the title in the action bar
            App.views.App.renderActionTitle({
                "title": App.polyglot.t("Add Question")
            });

            this.template = _.template( questionAddTemplate );
        },

        render: function() {

            var data = {
                "category":  {},
                "polyglot":  App.polyglot
            };

            // Remove tool tips
            this.removeToolTips();

            // Set official category tags
            data.categories = App.config.questionCategories;

            this.$el.empty().html( this.template( data ) );

            $( document ).foundation({"abide": {
                "validators": {
                    "nonEmptyString":  App.config.validators.nonEmptyString
                }
            } });

            // Set up jquery references
            this.$questionAddForm = this.$("#question-add-form");
            this.$questionCategory = this.$("#question-category");
            this.$questionTags = this.$("#question-tags");

            // Initialize jquery tags
            this.$questionTags.tagsInput({
                "defaultText": "",
                "width": "100%"
            });

            // Initialize foundation abide form validation
            this.$questionAddForm.foundation( "abide", {} );

            // Set up ladda button animation
            this.submitButton = Ladda.create( this.$("#question-add-submit")[0] );

            return this;
        },

        removeView: function() {

            // Remove tool tips
            this.removeToolTips();

            this.stopListening();

            this.undelegateEvents();
        },

        addQuestion: function( e ) {

            var data,
                tags = [],
                question,
                questionPromise,
                re = /#/gi;

            e.preventDefault();

            if ( !this.questionSubmitted ) {

                this.questionSubmitted = true;

                this.submitButton.start();

                // Remove existing alerts if they exist
                App.views.App.removeAlerts();

                // Build tags array from comma delimited input string
                tags = _.chain( tags )
                    .push( this.$questionCategory.val() )
                    .concat( this.$questionTags.val().length > 0 ? this.$questionTags.val().replace(re,"").split(",") : [] )
                    .value();

                data = {
                    "title":        this.$questionAddForm.find("#question-title").val(),
                    "content":      this.$questionAddForm.find("#question-content").val(),
                    "tags":         tags
                };

                question = new QuestionModel();

                questionPromise = question.save( data, {
                        "wait":     true,
                        "context":  this
                    })
                .done( function( data ) {

                    // Add this model to the questions collection
                    App.collections.questions.add( question );

                    App.collections.questions.forceRefresh = true;

                    AppEvents.trigger('questionAdd:saved', {
                        msg: "The question has been added"
                    });

                    App.views.App.postRenderAlert({
                        friendlyMsg: App.polyglot.t("views_question_add_confirm"),
                        type: "info"
                    });

                    App.router.clearPathHistory();

                    App.views.App.navigatePath( "/questions/" + AppViewHelpers.createSlug( data.title ) + "/" + data.questionID, { trigger: true } );
                })
                .fail( function( jqXHR, textStatus, errorThrown ) {

                    this.questionSubmitted = false;

                    this.submitButton.start();

                    AppEvents.trigger("v::questionAdd::addQuestion::error", {
                        "msg":          "Error attempting to save question. [status:" + jqXHR.status + " error:" + errorThrown + "]",
                        "friendlyMsg":  App.polyglot.t("views_question_add_error"),
                        "showAlert":    true,
                        "type":         "alert"
                    });
                });
            }
        },

        updateCatDesc: function( e ) {

            var cat = _.findWhere( App.config.questionCategories, {"tag": $(e.currentTarget).val() } );

            this.$("#question-category-desc").text( cat ? cat.desc : "" );
        }
    });

    return QuestionAddView;
});
