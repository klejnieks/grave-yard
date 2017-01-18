define([
    'backbone',
    'App',
    'App.Events'
], function ( Backbone, App, AppEvents ) {

    var QuestionModel = Backbone.Model.extend({

        defaults: {
            "title":             "",
            "acceptedAnswerID":  "",
            "answers":           [],
            "avatarUrl":         "",
            "content":           "",
            "countAnswer":       0,
            "countDislike":      0,
            "countLike":         0,
            "countView":         0,
            "createdWhen":       "",
            "displayName":       "",
            "status":            "O",
            "tags":              []
        },

        idAttribute: "questionID",

        url: function( ) {
            return App.config.api( ) + "/v1/questions/" + ( this.id ? this.id : ""); 
        },

        initialize: function( options ) {

            this.type = "question";
        },
    
        addAnswer: function( data ) {

            var jqXHR,
                timer;

            if ( App.engageTimer( App.config.apiTimerCaptureRate ) ) {
                timer = new App.Timer( "API", "POST /v1/answers" );
            }

            jqXHR = $.ajax({
                url:            this.url() + "/answers",
                type:           "POST",
                data:           JSON.stringify( data ), 
                dataType:       "json",
                contentType:    'application/json',
                accepts:        'application/json',
                context:        this,
                headers: {
                    "accept":                   "application/json",
                    "x-mysolomeo-session-key":  App.models.userSession.get("sessionKey")
                }
            })
            .done( function( data, textStatus, jqXHR ) {

                if ( timer ) {
                    timer.end( "success" );
                }

                 // Add the answer to the question array
                this.get("answers").push( data );

                // Increment count of answers
                this.set( "countAnswer", this.get( "countAnswer" ) + 1 );

                AppEvents.trigger("question:added", {
                    "msg": "Answer added to question"
                });
            })
            .fail( function( jqXHR, textStatus, errorThrown ) {

                if ( timer ) {
                    timer.end( "fail" );
                }
 
                AppEvents.trigger("m::question::addAnswer::error", {
                    msg: "Answer could not be added. [status: " + jqXHR.status + " error: " + errorThrown + "]"
                });    
            });

            return jqXHR;
        },

        voteOnAnswer: function( answerID, action ) {
        
            var jqXHR,
                timer;

            if ( App.engageTimer( App.config.apiTimerCaptureRate ) ) {
                timer = new App.Timer( "API", "PUT /v1/answers/{ID}?action=" + action );
            }

            jqXHR = $.ajax({
                url:            this.url() + "/answers/" + answerID + "?action=" + action,
                type:           "PUT",
                dataType:       "text",
                contentType:    'application/json',
                accepts:        'application/json',
                context:        this,
                headers: {
                    "accept":                   "application/json",
                    "x-mysolomeo-session-key":  App.models.userSession.get("sessionKey")
                }
            })
            .done( function( data, textStatus, jqXHR ) {

                // Increment/Decrement count vote 
                var answer = _.findWhere(this.get("answers"), {
                    "answerID": answerID
                });

                if ( timer ) {
                    timer.end( "success" );
                }

                if ( typeof answer === 'object' ) {
                    answer.countLike += ( action === "like" ? 1 : 0 );
                    answer.countDislike += ( action === "dislike" ? 1 : 0 );
                    this.trigger("change");
                }

                AppEvents.trigger("answerVote:" + action, {
                    "msg": "Vote added to answer"
                });
            })
            .fail( function( jqXHR, textStatus, errorThrown ) {

                if ( timer ) {
                    timer.end( "fail" );
                }

                AppEvents.trigger("m::question::voteOnAnswer::error", {
                    msg: "Vote could not be added to answer. [status: " + jqXHR.status + " error: " + errorThrown + "]"
                });    
            });

            return jqXHR;
        },

        acceptAnswer: function ( answerID ) {

            var jqXHR,
                timer;

            if ( App.engageTimer( App.config.apiTimerCaptureRate ) ) {
                timer = new App.Timer( "API", "PUT /v1/answers/{ID}?action=answered" );
            }

            jqXHR = $.ajax({
                url:            this.url() + "/answers/" + answerID + "?action=answered",
                type:           "PUT",
                dataType:       "text",
                contentType:    'application/json',
                accepts:        'application/json',
                context:        this,
                headers: {
                    "accept":                   "application/json",
                    "x-mysolomeo-session-key":  App.models.userSession.get("sessionKey")
                }
            })
            .done( function( data, textStatus, jqXHR ) {

                if ( timer ) {
                    timer.end( "success" );
                }
 
                this.set( "acceptedAnswerID", answerID );

                _.each( this.get("answers"), function( answer ) {
                    answer.acceptedAnswer = ( answer.answerID === answerID ) ? true : false;
                });

                this.trigger("change");

                AppEvents.trigger("answerAccept:answered", {
                    "msg": "Question marked as answer"
                });
            })
            .fail( function( jqXHR, textStatus, errorThrown ) {

                if ( timer ) {
                    timer.end( "fail" );
                }

                 AppEvents.trigger("m::question::acceptAnswer::error", {
                    msg: "Question could not be marked as answered. [status: " + jqXHR.status + " error: " + errorThrown + "]"
                });    
            });

            return jqXHR;

        },

        likeQuestion: function( action ) {

            var likePromise = this.save({}, {
                "url":          this.url() + "?action=" + action,
                "dataType":     "text",
                "context":      this,
                "contentType":  "application/json",
                "accepts":      "application/json",
                "data":         "", 
                "headers": {
                    "accept":   "application/json"
                }
            })
            .done( function( data, textStatus, jqXHR ) {

                // increment like / dislike count
                if ( action === "like" ) {
                    this.set( "countLike", this.get("countLike") + 1 );
                } else {
                    this.set( "countDislike", this.get("countDislike") + 1 );
                }

                AppEvents.trigger("questionLike:" + action, {
                    "msg": ( action === "like" ? "Like" : "Dislike" ) + " added to question"
                });
            })
            .fail( function( jqXHR, textStatus, errorThrown ) {
                AppEvents.trigger("m::question::likeQuestion::error", {
                    msg: "Like/Dislike could not be added to question. [status: " + jqXHR.status + " error: " + errorThrown + "]"
                });    
            });


            return likePromise;
        },

        flagAnswer: function( answerID ) {

            var jqXHR, 
                timer;

            if ( App.engageTimer( App.config.apiTimerCaptureRate ) ) {
                timer = new App.Timer( "API", "PUT /v1/answers/{ID}?action=flag" );
            }

            jqXHR = $.ajax({
                "url":          this.url() + "/answers/" + answerID + "?action=flag",
                "type": "PUT",
                "dataType": "text",
                contentType:    'application/json',
                accepts:        'application/json',
                context:        this,
                headers: {
                    "accept":                   "application/json",
                    "x-mysolomeo-session-key":  App.models.userSession.get("sessionKey")
                }

            })
            .done( function( data, textStatus, jqXHR ) {

                var answer = _.findWhere( this.get("answers"), { "answerID": answerID } );

                if ( timer ) {
                    timer.end( "success" );
                }
 
                answer.status = "P";

                this.trigger("change");

                AppEvents.trigger("answer:flagged", {
                    "msg": "Answer has been flagged"
                });
            })
            .fail( function( jqXHR, textStatus, errorThrown ) {

                if ( timer ) {
                    timer.end( "fail" );
                }

                if ( jqXHR.status !== 403 ) {
                    AppEvents.trigger("m::question::flagAnswer::error", {
                        msg: "Answer could not be flagged as inappropriate. [status: " + jqXHR.status + " error: " + errorThrown + "]"
                    });    
                }
            });

            return jqXHR;
        },

        flagQuestion: function( questionID ) {

            var jqXHR,
                timer;

            if ( App.engageTimer( App.config.apiTimerCaptureRate ) ) {
                timer = new App.Timer( "API", "PUT /v1/questions/{ID}?action=flag" );
            }

            jqXHR = $.ajax({
                "url":        this.url() + "?action=flag",
                "type":       "PUT",
                "dataType":   "text",
                contentType:  'application/json',
                accepts:      'application/json',
                context:      this,
                headers: {
                    "accept":                   "application/json",
                    "x-mysolomeo-session-key":  App.models.userSession.get("sessionKey")
                }

            })
            .done( function( data, textStatus, jqXHR ) {

                if ( timer ) {
                    timer.end( "success" );
                }
 
                this.trigger("change");

                AppEvents.trigger("question:flagged", {
                    "msg": "Question has been flagged"
                });
            })
            .fail( function( jqXHR, textStatus, errorThrown ) {

                if ( timer ) {
                    timer.end( "fail" );
                }

                if ( jqXHR.status !== 403 ) {
                    AppEvents.trigger("m::question::flagQuestion::error", {
                        msg: "Question could not be flagged. [status: " + jqXHR.status + " error: " + errorThrown + "]"
                    });    
                }
            });

            return jqXHR;
        }

    });

    return QuestionModel;
});
