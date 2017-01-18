define([
    'backbone',
    'numeral',
    'App',
    'App.Events',
    'App.Models.Question'
], function ( Backbone, numeral, App, AppEvents, QuestionModel ) {

    var QuestionsCollection = Backbone.Collection.extend({

        model: QuestionModel,

        url: function( ) {
            return App.config.api( ) + '/v1/questions?orderBy=newest';
        },

        forceRefresh: false,

        initialize: function() {

            this.on( "reset", function( ) {
                AppEvents.trigger( "questions:loaded", this );
            });
        },

        // Convenience function for getting the specified post and adding it to the collection
        // Returns jquery promise
        getQuestion: function( id ) {

            var question = new QuestionModel({
                "questionID": id
            }),
            questionDeferred = $.Deferred();

            question.fetch({ "context":this })
                .done( function( data ) {

                    // Check for id
                    if ( !data.questionID ) {

                        AppEvents.trigger( "c::questions::getQuestion::error", {
                            "msg": "Question could not be loaded.  Missing question id. [data: " + data.questionID + "]",
                            "friendlyMsg": App.polyglot.t("collections_questions_not_loaded"),
                            "showMessage": true
                        });

                        questionDeferred.rejectWith( this, ["Question details could not be loaded"] );

                        return;
                    }
        
                    // Add it to the collection   
                    this.add( question, {
                        "merge": true
                    });

                    this.forceRefresh = true;
 
                    AppEvents.trigger( "question:loaded", question );

                    questionDeferred.resolveWith( this, [data] );
                })
                .fail( function( jqXHR, textStatus, errorThrown ) {

                    AppEvents.trigger( "c::question::getQuestion::error", {
                        "msg": "Question could not be loaded [status: " + jqXHR.status + " error: " + errorThrown + "]",
                        "friendlyMsg": App.polyglot.t("collections_questions_not_loaded"),
                        "showMessage": true
                    });

                    questionDeferred.rejectWith( this, ["Question details could not be loaded"] );
                });

            return questionDeferred;
        }

    });

    return QuestionsCollection;
});
