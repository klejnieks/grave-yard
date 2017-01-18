define([
    'backbone',
    'App',
    'App.Events',
    'App.Views.Helpers',
    'ladda',
    'text!templates/question-add-answer.html'
], function( Backbone, App, AppEvents, AppViewHelpers, Ladda, questionAddAnswerTemplate, moment ) {

    var QuestionAddAnswerView = Backbone.View.extend({

        // Use this reference to control the ladda animation
        submitButton: null,

        // Set to true when answer is being submitted
        answerSubmitted: false,

        events: {
            "submit form#answer-add-form": "addAnswer"
        },

        initialize: function( options ) {
    
            // Render the back button in the action bar
            App.views.App.renderMenuButton("back");

            this.template = _.template( questionAddAnswerTemplate );
        },

        render: function( ) {

            var data = this.model.toJSON();

            _.extend(
                data,
                AppViewHelpers
            );

            this.$el.empty().html( this.template( data ) );

            // Set up jquery references
            this.$addAnswerForm = this.$("#answer-add-form");
            this.$answerContent = this.$("#answer-add-content");

            // Initialize foundation abide form validation
            this.$addAnswerForm.foundation( "abide", {} );

            // Set up ladda button animation
            this.submitButton = Ladda.create( this.$("#answer-add-submit")[0] );

            return this;
        },

        addAnswer: function( e ) {

            var answerData,
                that = this;

            e.preventDefault();

            if ( !this.answerSubmitted ) {

                this.answerSubmitted = true;

                this.submitButton.start();

                // Remove existing alerts if they exist
                App.views.App.removeAlerts();

                answerData = {
                    "questionID":   this.model.get("questionID"),
                    "content":      this.$answerContent.val()
                };
           
                answerPromise = this.model.addAnswer( answerData )
                    .done( function( data ) {

                        App.router.clearPathHistory();

                        App.views.App.navigatePath( "questions/" + AppViewHelpers.createSlug( this.get("title") ) + "/" + this.get("questionID"), { trigger: true } );
                    })
                    .fail( function( jqXHR, textStatus, errorThrown ) {

                        AppEvents.trigger("v::questionAddAnswer::addAnswer::error", {
                            friendlyMsg: App.polyglot.t("views_question_add_answer_error"),
                            msg: "Unable to add answer [status:" + jqXHR.status + " error:" + errorThrown + "]",
                            showAlert: true
                        });       

                        that.submitButton.stop();

                        that.answerSubmitted = false;
                    }); 
            }

        },

        removeView: function( ) {

            this.stopListening();

            this.undelegateEvents();
        }
    });

    return QuestionAddAnswerView;
});
