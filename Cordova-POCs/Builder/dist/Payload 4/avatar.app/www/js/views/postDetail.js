define([
    'backbone',
    'App',
    'App.Events',
    'App.Views.Helpers',
    'text!templates/post-detail.html',
    "text!templates/tags.html",
    "text!templates/tag-row.html",
    'moment'
], function( Backbone, App, AppEvents, AppViewHelpers, postDetailTemplate, tagsTemplate, tagRowTemplate, moment ) {

    var PostDetailView = Backbone.View.extend({

        postLiked: false,

        events: {
            "click .post-like, .post-dislike":  "submitPostLike",
            "click .tag, div[data-target-path]": function( e ) {
                App.views.App.navigate( e );
            },
            "click .favorite": function( e ) {
                App.views.App.updateFavorite( e );
            }
        },

        tagPromise: null,

        initialize: function( options ) {

            // Render the back button in the action bar
            App.views.App.renderMenuButton("back");

            // Render action item...fav icon link
//            this.renderActionItem();

            App.views.App.renderActionItem({
                "type":             "favorite",
                "id":               this.model.get("eduContentID"),
                "favoriteType":     "post"
            });

            // Check for tags search promise
            if ( options.tagPromise ) {
                this.tagPromise = options.tagPromise;
            }

            // Render view on model change
            this.listenTo( this.model, "change", this.render );

            this.template = _.template( postDetailTemplate );
            this.templateTags =     _.template( tagsTemplate );
            this.templateTagRow =   _.template( tagRowTemplate );
        },

        render: function( ) {

            var data = {},
                _this = this;

            _.extend(
                data,
                this.model.toJSON(), {
                    "moment":    moment,
                    "polyglot":  App.polyglot
                },
                AppViewHelpers
            );

            this.$el.empty().html( this.template( data ) );

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

            this.$("#post-byline-container").css( "background-image", "url(" + data.urlImage + ")" );

            document.body.scrollTop = document.documentElement.scrollTop = 0;
            return this;
        },

        removeView: function() {

            this.stopListening();

            this.undelegateEvents();
        },

        submitPostLike: function( e ) {

            var action = $(e.currentTarget).is("[data-post-dislike]") ? "dislike" : "like";

            e.preventDefault();

            if ( !this.postLiked ) {

                this.postLiked = true;

                this.model.likePost( action )
                    .done( function( data, textStatus, jqXHR ) {
                        AppEvents.trigger("post:" + action, {
                            "msg":          "Post has been liked/disliked",
                            "friendlyMsg":  App.polyglot.t("views_post_detail_confirm", {"action": action}),
                            "showAlert":    true,
                            "removeAfter":  3000
                        });
                    })
                    .fail( function( jqXHR, textStatus, errorThrown ) {
                        AppEvents.trigger("v::postDetail::submitPostLike::error", {
                            "showAlert":    true,
                            "type":         "alert",
                            "msg":          "Error attempting to like post. [status:" + jqXHR.status + " error:" + errorThrown + "]",
                            "friendlyMsg":  App.polyglot.t("views_post_detail_error", {"action": action})
                        });
                    });
            }
        }
    });

    return PostDetailView;
});
