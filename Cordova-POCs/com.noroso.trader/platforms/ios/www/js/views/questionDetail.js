define([
    'backbone',
    'App',
    'App.Events',
    'App.Views.Helpers',
    'ladda',
    'moment',
    'text!templates/question-detail.html',
    'text!templates/question-answer-form.html',
    'text!templates/question-answer-extras.html',
    'text!templates/question-extras.html',
    "text!templates/tags.html",
    "text!templates/tag-row.html"
], function( Backbone, App, AppEvents, AppViewHelpers, Ladda, moment, questionDetailTemplate, questionAnswerFormTemplate, questionAnswerExtrasTemplate, questionExtrasTemplate, tagsTemplate, tagRowTemplate ) {

    var QuestionDetailView = Backbone.View.extend({

        // Use this reference to control the ladda animation
        submitButton: null,

        // Set to true when answer is being submitted
        answerSubmitted: false,

        // Hold ids of answers already voted for
        answersVotedOn: [],

        // Set to true when the user owns the question in view
        userOwnsQuestion: false,

        // Set to answer id if deeplinking to answer
        deepLinkAnswerID: null,

        // Set to true if user has liked/disliked question
        questionLiked: false,

        // Set this to true when this is a deep link so app view doesn't force scroll
        noScroll: false,

        tagPromise: null,

        events: {
            "click .answer-like, .answer-dislike":      "submitAnswerVote",
            "click .question-like, .question-dislike":  "submitQuestionLike",
            "click .answer-accept":                     "submitAnswerAccept",
            "click .answer-link":                       "toggleAnswerExtras",
            "click .question-link":                     "toggleQuestionExtras",
            "click #answer-insert":                     "renderAnswerForm",
            "submit form#answer-add-form":              "addAnswer",
            "click .tag, div[data-target-path]": function( e ) {
                App.views.App.navigate( e );
            },
            "click .favorite": function( e ) {
                App.views.App.updateFavorite( e );
            },
            "click .link-login": function( e ) {

                e.preventDefault();

                App.router.routeToLogin();
            }
        },

        initialize: function( options ) {

            // Render the back button in the action bar
            App.views.App.renderMenuButton("back");

            // Render the favorite icon in the action bar
            App.views.App.renderActionItem({
                "type":             "favorite",
                "id":               this.model.get("questionID"),
                "favoriteType":     "question"
            });

            // Render view on model change
            this.listenTo( this.model, "change", function( ) {
                this.render();
            });

            // Is this a deep link?
            if ( options.answerID ) {

                this.deepLinkAnswerID = options.answerID;

                this.noScroll = true;
            }

            this.userOwnsQuestion = this.model.get("avatarUrl") === App.models.user.get("avatarUrl");

            this.template =                _.template( questionDetailTemplate );
            this.templateAnswerForm =      _.template( questionAnswerFormTemplate );
            this.templateAnswerExtras =    _.template( questionAnswerExtrasTemplate );
            this.templateQuestionExtras =  _.template( questionExtrasTemplate );
            this.templateTags =            _.template( tagsTemplate );
            this.templateTagRow =          _.template( tagRowTemplate );

            // Check for tags search promise
            if ( options.tagPromise ) {
                this.tagPromise = options.tagPromise;
            }
        },

        render: function( ) {

            var data = this.model.toJSON(),
                $deepLinkAnswer,
                answers = [],
                acceptedAnswer,
                _this = this;

            // Remove tool tips
            this.removeToolTips();

            // Reorder answers to show accepted first, then ordered by number of votes desc
            acceptedAnswer = _.findWhere( this.model.get("answers"), { "acceptedAnswer":true } );

            if ( acceptedAnswer ) {
                answers.push( acceptedAnswer );
            }

            answers = answers.concat( _.difference( this.model.get("answers"), answers ) );

            _.extend(
                data, {
                    "answers":           answers,
                    "moment":            moment,
                    "userOwnsQuestion":  this.userOwnsQuestion,
                    "loggedIn":          App.models.userSession.loggedIn(),
                    "polyglot":          App.polyglot
                },
                AppViewHelpers
            );

            this.$el.empty().html( this.template( data ) );

            $( document ).foundation({"abide": {
                "validators": {
                    "nonEmptyString":  App.config.validators.nonEmptyString
                }
            } });



            // Populate tags when done
            if ( this.tagPromise ) {
                this.tagPromise.done( function( data, textStatus, jqXHR ) {

                    data = {
                        "tags":            App.collections.tags.toJSON(),
                        "helpers":         AppViewHelpers,
                        "templateTagRow":  _this.templateTagRow,
                        "moment":          moment,
                        "favorites":       App.collections.favorites.toJSON(),
                        "loggedIn":        App.models.userSession.loggedIn(),
                        "parent":          _this.model,
                        "polyglot":        App.polyglot
                    };

                    _this.$("#tags-container").empty().html( _this.templateTags( { "data": data } ) );
                });
            }

            // Scroll to answer for deep link
            if ( this.deepLinkAnswerID ) {

                $deepLinkAnswer = this.$("div[data-answer-id=" + this.deepLinkAnswerID + "]");

                if ( $deepLinkAnswer.length > 0 ) {
                    $("html, body").scrollTop( $deepLinkAnswer.offset().top );
                }

                // Don't scroll on every render after first
                this.deepLinkAnswerID = null;
            }

            return this;
        },

        removeView: function() {

            // Remove tool tips
            this.removeToolTips();

            this.stopListening();

            this.undelegateEvents();
        },

        submitAnswerVote: function( e ) {

            var action = $(e.currentTarget).is("[data-answer-downvote]") ? "dislike" : "like",
                answerID = $(e.currentTarget).closest("[data-answer-id]").attr("data-answer-id"),
                votePromise = null;

            e.preventDefault();

            if ( !App.models.userSession.loggedIn() ) {
                AppEvents.trigger("v::questionDetail::submitAnswerVote::warning", {
                    "msg":          "Invalid user attempting to vote",
                    "friendlyMsg":  App.polyglot.t("views_question_detail_login"),
                    "showAlert":    true,
                    "type":			"alert"
                });
                return;
            }

            // Confirm this answer has not been voted on already
            if ( _.indexOf( this.answersVotedOn, answerID ) === -1 ) {

                this.answersVotedOn.push( answerID );

                votePromise = this.model.voteOnAnswer( answerID, action )
                    .done( function( ) {
                        AppEvents.trigger("answerVote:" + action, {
                            "msg":          "Vote has been added to answer",
                            "friendlyMsg":  App.polyglot.t("views_question_detail_vote"),
                            "showAlert":    true,
                            "removeAfter":  3000
                        });
                    })
                    .fail( function( jqXHR, textStatus, errorThrown ) {

                        var friendlyMsg = App.polyglot.t("views_question_detail_vote_error");

                        if ( jqXHR.status === 403 ) {
                            friendlyMsg = App.polyglot.t("views_question_detail_vote_duplicate");
                        }

                        AppEvents.trigger("v::questionDetail::submitAnswerVote::warning", {
                            "msg":          "Error attempting to vote",
                            "friendlyMsg":  friendlyMsg,
                            "showAlert":    true,
                            "type":         "alert"
                        });
                    });
            }
        },

        submitAnswerAccept: function( e ) {

            var answerID = $(e.currentTarget).closest("[data-answer-id]").attr("data-answer-id");

            e.preventDefault();

            if ( this.userOwnsQuestion ) {

                if ( !App.models.userSession.loggedIn() ) {
                    AppEvents.trigger("v::questionDetail::submitAnswerAccept::warning", {
                        "showAlert":    true,
                        "type":			"info",
                        "msg":          "Invalid user attempting to accept answer",
                        "friendlyMsg":  App.polyglot.t("views_question_detail_answer_accept")
                    });
                    return;
                }

                answeredPromise = this.model.acceptAnswer( answerID )
                    .done( function( ) {
                        AppEvents.trigger("questionAnswer:answered", {
                            "msg":          "The question has been marked as answered.",
                            "friendlyMsg":  App.polyglot.t("views_question_detail_answer_confirm"),
                            "showAlert":    true
                        });
                    })
                    .fail( function( jqXHR, textStatus, errorThrown ) {
                        AppEvents.trigger("v::questionDetail::submitAnswerAccept::error", {
                            "showAlert":    true,
                            "type":         "alert",
                            "msg":          "Error attempting to mark question as answered [status:" + jqXHR.status + " error:" + errorThrown + "]",
                            "friendlyMsg":  App.polyglot.t("views_question_detail_answer_accept_error")
                        });
                    });
            }

        },

        toggleAnswerLink: function( e ) {

            var answerID = $(e.currentTarget).closest("[data-answer-id]").attr("data-answer-id");

            e.preventDefault();

            this.$("#answer-link-" + answerID).toggleClass("hide");
        },

        toggleAnswerExtras: function( e ) {

            var data = { },
                newStatus,
                questionID = this.model.get("questionID"),
                answerID = $( e.currentTarget ).closest("[data-answer-id]").attr("data-answer-id"),
                title = this.model.get("title"),
                that = this,
                shareUrl = window.location.origin + "/questions/" + AppViewHelpers.createSlug( title ) + "/" + questionID + "/answer/" + answerID,
                referral;

            e.preventDefault();

            // Add referral code if logged in
            if ( App.models.userSession.loggedIn( ) && ( referral = App.models.userSession.get("referralCode") ) ) {
                shareUrl += "?r=" + referral;
            }

            _.extend(
                data, {
                    "answerID":    answerID,
                    "questionID":  questionID,
                    "title":       title,
                    "shareUrl":    shareUrl,
                    "polyglot":    App.polyglot
                },
                AppViewHelpers
            );

            newStatus = App.views.App.toggleModal(
                this.templateAnswerExtras( data ),
                "small"
            );

            this.flagAnswerButton = Ladda.create( $("#answer-extras-flag")[0] );

            if ( newStatus === "open" ){
                App.$modal.find("button#answer-extras-flag").on( 'click', function( ) {
                    that.flagAnswer( answerID );
                });
            }
        },

        toggleQuestionExtras: function( e ) {

            var data = { },
                newStatus,
                questionID = this.model.get("questionID"),
                title = this.model.get("title"),
                that = this,
                shareUrl = window.location.origin + "/questions/" + AppViewHelpers.createSlug( title ) + "/" + questionID + "/",
                referral;

            e.preventDefault();

            // Add referral code if logged in
            if ( App.models.userSession.loggedIn( ) && ( referral = App.models.userSession.get("referralCode") ) ) {
                shareUrl += "?r=" + referral;
            }

            _.extend(
                data, {
                    "questionID":  questionID,
                    "title":       title,
                    "shareUrl":    shareUrl,
                    "polyglot":    App.polyglot
                },
                AppViewHelpers
            );

            newStatus = App.views.App.toggleModal(
                this.templateQuestionExtras( data ),
                "small"
            );

            this.flagQuestionButton = Ladda.create( $("#question-extras-flag")[0] );

            if ( newStatus === "open" ){
                App.$modal.find("button#question-extras-flag").on( 'click', function( ) {
                    that.flagQuestion( questionID );
                });
            }
        },

        flagAnswer: function( answerID ) {

            var that = this;

            if ( !App.models.userSession.loggedIn() ) {

                App.views.App.toggleModal();

                AppEvents.trigger("v::questionDetail::flagAnswer::warning", {
                    "showAlert":    true,
                    "type":         "alert",
                    "msg":          "Invalid user attempting to flag answer",
                    "friendlyMsg":  App.polyglot.t("views_question_detail_answer_flag")
                });
                return;
            }

            this.model.flagAnswer( answerID )
            .done( function( data, textStatus, jqXHR ) {
                AppEvents.trigger('answerFlag:error', {
                    "friendlyMsg": App.polyglot.t("views_question_detail_answer_flag_confirm"),
                    "msg": '',
                    "showAlert": true,
                    "removeAlerts": true
                });
            })
            .fail( function( jqXHR, textStatus, errorThrown ) {
                if ( jqXHR.status === 403 ) {
                    // Answer has already been flagged
                    AppEvents.trigger("v::questionDetail::flagAnswer::warning", {
                        friendlyMsg: App.polyglot.t("views_question_detail_answer_flag_duplicate"),
                        msg: "Unable to flag answer. [status:" + jqXHR.status + " error:" + errorThrown + "]",
                        showAlert: true,
                        removeAlerts: true
                    });
                } else {
                    AppEvents.trigger("v::questionDetail::flagAnswer::error", {
                        "showAlert": true,
                        "removeAlerts": true,
                        "friendlyMsg": App.polyglot.t("views_question_detail_answer_flag_error"),
                        "msg": "Unable to flag answer. [status:" + jqXHR.status + " error:" + errorThrown + "]"
                    });
                }
            })
            .always( function( ) {

                that.flagAnswerButton.stop();

                App.views.App.toggleModal();
            });
        },

        flagQuestion: function( questionID ) {

            var that = this;

            if ( !App.models.userSession.loggedIn() ) {

                App.views.App.toggleModal();

                AppEvents.trigger("v::questionDetail::flagQuestion::warning", {
                    "msg":          "Invalid user attempting to flag question",
                    "friendlyMsg":  App.polyglot.t("views_question_detail_question_flag"),
                    "showAlert":    true,
                    "type":         "alert"
                });
                return;
            }

            this.model.flagQuestion( questionID )
            .done( function( data, textStatus, jqXHR ) {
                AppEvents.trigger('questionFlag:success', {
                    friendlyMsg: App.polyglot.t("views_question_detail_question_flag_confirm"),
                    msg: '',
                    showAlert: true,
                    removeAlerts: true
                });
            })
            .fail( function( jqXHR, textStatus, errorThrown ) {

                if ( jqXHR.status === 403 ) {
                    // Question has already been flagged
                    AppEvents.trigger("v::questionDetail::flagQuestion::warning", {
                        friendlyMsg: App.polyglot.t("views_question_detail_question_flag_duplicate"),
                        msg: "Unable to flag question. [status:" + jqXHR.status + " error:" + errorThrown + "]",
                        showAlert: true,
                        removeAlerts: true
                    });
                } else {
                    AppEvents.trigger("v::questionDetail::flagQuestion::error", {
                        friendlyMsg: App.polyglot.t("views_question_detail_question_flag_duplicate"),
                        msg: "Unable to flag question. [status:" + jqXHR.status + " error:" + errorThrown + "]",
                        showAlert: true,
                        removeAlerts: true
                    });
                }
            })
            .always( function( ) {

                that.flagQuestionButton.stop();

                App.views.App.toggleModal();
            });
        },

        renderAnswerForm: function( e ) {

            var $answerDiv = $(e.currentTarget);

            if ( !App.collections.accounts.hasLiveAcct ) {

                AppEvents.trigger("v::questionDetail::renderAnswerForm::warning", {
                    "msg":          "Invalid user attempting to answer question.",
                    "friendlyMsg":  App.polyglot.t("views_question_detail_render_answer"),
                    "showAlert":    true,
                    "type":         "alert"
                });

                return;
            }

            $answerDiv.parent().empty().html( this.templateAnswerForm( { "polyglot": App.polyglot } ) );

            // Set up jquery references
            this.$addAnswerForm = this.$("#answer-add-form");
            this.$answerContent = this.$("#answer-add-content");

            // Initialize foundation abide form validation
            this.$addAnswerForm.foundation( { "abide": {
                live_validate: true
            }});

            // Set up ladda button animation
            this.submitButton = Ladda.create( this.$("#answer-add-submit")[0] );
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

                        that.answerSubmitted = false;

                        that.submitButton.stop();

                        that.render();

                        //-->TODO: route to answer after API wired in
                        //App.router.navigate( "questions/" + AppViewHelpers.createSlug( this.get("title") ) + "/" + this.get("questionID") + "/answer/" + data.answerID, { trigger: true } );

                    })
                    .fail( function( jqXHR, textStatus, errorThrown ) {

                        AppEvents.trigger("v::questionDetail::addAnswer::error", {
                            friendlyMsg: App.polyglot.t("views_question_detail_add_answer_error"),
                            msg: "Unable to add answer. [status:" + jqXHR.status + " error:" + errorThrown + "]",
                            showAlert: true
                        });

                        that.submitButton.stop();

                        that.answerSubmitted = false;
                    });
            }

        },

        submitQuestionLike: function( e ) {

            var action = $(e.currentTarget).is("[data-question-dislike]") ? "dislike" : "like";

            e.preventDefault();

            if ( !this.questionLiked ) {

                if ( !App.models.userSession.loggedIn() ) {
                    AppEvents.trigger("v::questionDetail::submitQuestionLike::warning", {
                        "showAlert":    true,
                        "type":			"alert",
                        "msg":          "Invalid user attempting to vote on question",
                        "friendlyMsg":  App.polyglot.t("views_question_detail_question_like_login")
                    });
                    return;
                }

                this.questionLiked = true;

                this.model.likeQuestion( action )
                    .done( function( data, textStatus, jqXHR ) {
                        AppEvents.trigger("question:" + action, {
                            "msg":          "Question has been " + action + "ed",
                            "friendlyMsg":  App.polyglot.t("views_question_detail_question_like", {"action": action}),
                            "showAlert":    true,
                            "removeAfter":  3000
                        });
                    })
                    .fail( function( jqXHR, textStatus, errorThrown ) {

                        var friendlyMsg = App.polyglot.t("views_question_detail_question_like_error", {"action": action});

                        if ( jqXHR.status === 403 ) {
                            friendlyMsg = App.polyglot.t("views_question_detail_question_like_duplicate");
                        }

                        AppEvents.trigger("v::questionDetail::submitQuestionLike::error", {
                            "showAlert":    true,
                            "type":         "alert",
                            "msg":          "Error attempting to like question. [status:" + jqXHR.status + " error:" + errorThrown + "]",
                            "friendlyMsg":  friendlyMsg
                        });
                    });
            }
        }
    });

    return QuestionDetailView;
});
