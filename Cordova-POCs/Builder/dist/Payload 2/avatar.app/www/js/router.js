// Filename: /js/router.js
define([
    'backbone',
    'App',
    'App.Models.UserSession',
    'App.Events',
    'App.Views.Helpers',
    'purl'
], function ( Backbone, App, UserSessionModel, AppEvents, AppViewHelpers, purl ) {

    var AppRouter = Backbone.Router.extend({

        routes: {
            "education(/)":                                 "showPosts",
            "education/tags/:tags(/)":                      "showPosts",
            "education/:title/:id(/)":                      "showPostDetail",
            // Old education category name
            "learn(/)":                                     "showPosts",
            "learn/tags/:tags(/)":                          "showPosts",
            "learn/:title/:id(/)":                          "showPostDetail",


            "goals(/)":                                     "showGoals",
            "goals/add(/)":                                 "showGoalAdd",
            "goals/:id(/)":                                 "showGoalDetail",
            "goals/edit/:id(/)":                            "showGoalEdit",

            "login(/)":                                     "showLogin",
            "logout(/)":                                    "showLogout",

            "marketplace(/)":                               "showMarketplace",
            "marketplace/learningmarkets(/)":               "showLearningMarkets",

            "password/reset(/)":                            "showPasswordReset",
            "password/set(/)":                              "showPasswordSet",

            "stocks-etfs(/)":                               "showInstruments",
            "stocks-etfs/symbols/:symbols(/)":              "showInstruments",
            "stocks-etfs/tags/:symbols(/)":                 "showInstruments",
            "stocks-etfs/:id(/)":                           "showInstrumentDetail",
            "stocks-etfs/:id/:tab(/)":                      "showInstrumentDetail",
            "stocks-etfs/:id/chart/:range(/)":              "showInstrumentDetail",
            "stocks-etfs/:id/order/review(/)":              "showOrderReview",
            "stocks-etfs/:id/order/confirm/:orderID(/)":    "showOrderConfirm",
            // Old Stocks / ETFs category
            "products(/)":                                  "showInstruments",
            "products/symbols/:symbols(/)":                 "showInstruments",
            "products/tags/:symbols(/)":                    "showInstruments",
            "products/:id(/)":                              "showInstrumentDetail",
            "products/:id/order/review(/)":                 "showOrderReview",
            "products/:id/order/confirm/:orderID(/)":       "showOrderConfirm",

            "profile(/)":                                   "showProfile",
            "profile/edit(/)":                              "showProfileEdit",
            "profile/add-document(/)":                      "showProfileAddDocument",
            "profile/add-documents(/)":                     "showProfileAddDocuments",

            "reports(/)":                                   "showReports",

            "portfolio(/)":                                 "showPositions",
            // Old portfolio category
            "investments(/)":                               "showPositions",

            "questions(/)":                                 "showQuestions",
            "questions/tags/:tags(/)":                      "showQuestions",
            "questions/add":                                "showQuestionAdd",
            "questions/:title/:id(/)":                      "showQuestionDetail",
            "questions/:title/:id/add-answer(/)":           "showQuestionAddAnswer",
            "questions/:title/:id/answer/:answerID(/)":     "showQuestionAnswer",

            "signup(/)":                                    "showUserAdd",

            "tags/:tags(/)":                                "showTags",

            "tour(/)":                                      "showTour",

            // Landing pages
            "signup-one-click(/)":                          "showSignUpOneClick",
            "report-redirect(/)":                           "showReportRedirect",
            "upload(/)":                                    "showProfileAddDocument",
            "upload-2forms(/)":                             "showProfileAddDocuments",
            "reporting(/)":                                 "showReports",

            // Default view
            "(/)":                                          "showDefaultView",

            // Catch all route
            "*other":                                       "routeNotFound"
        },

        execute: function(callback, args) {
        	
            var regex = new RegExp("([^?=&]+)(=([^&]*))+");

            App.history.push( Backbone.history.location.pathname );

            App.history = App.history.slice( -App.config.pathHistoryLength );

            // Remove query string arg
            if (callback) {
                callback.apply( this, _.filter( args, function( arg ) { return !regex.test( arg ); } ) );
            }

        },

        RouterException: function( message ) {

            this.message = message;

            this.name = 'RouterException';
        },

        // ***IMPORTANT***
        // This must be called first in each route handler.
        // Will redirect to login and thrown a router exception if page is private and session key is not found.
        // If session key is found but no data exists, an attempt to refresh the user session will be made.  If this fails,
        // user will be redirected to login.
        //
        // @param   object  options
        // Avaialble Options
        //   forceAuth    Pass in true if you want to force authentication on a public section.
        //   (e.g., deep path on public section requires login "/questions/:title/:id/add-answer")
        checkAuth: function( options ) {

            options = options || {};

            var isPublic =      true,
                hasKey =        false,
                hasUser =       false,
                parts =         null,
                userPromise =   null,
                that =          this,
                forceAuth =     options.forceAuth ? options.forceAuth : false;

            this.view = '';
            this.options = {};

            // Set forwarding path if user is redirected to login
            this.forward = Backbone.history.location.pathname;

            // Get section
            parts = Backbone.history.location.pathname.match(/[\w\-\.!~\*\'"(),]+/g);
            this.prevSection = this.section;
            this.section = ( $.isArray( parts ) && parts.length > 0 ) ? parts[0] : "root";

            // Reset paths if you are you at the root
            if ( ( !parts || typeof parts !== 'object' || parts.length === 0  )  ) {
                App.paths = ["/"];
            } else {
                App.paths.push( Backbone.history.location.pathname );
            }

            // Check for session key
            hasKey = App.models.userSession.get('sessionKey') ? true : false;

            // Check if model has user data
            hasUser = App.models.userSession.get("userID") && !App.models.userSession.get("forceRefresh") ? true : false;

            // Check if the resource is public
            isPublic = ( !forceAuth && _.indexOf( App.config.publicSections, this.section) !== -1 ) ? true : false ;

            if ( !isPublic && !hasKey ) {

                // No key...navigate to login
                this.forward = Backbone.history.fragment;

                this.navigate( '/login', { trigger: true } );

                throw new this.RouterException("Requires login.");
            } else if ( hasKey && !hasUser ) {

                // Attempt to refresh the user
                userPromise = App.models.userSession.refreshUser()
                    .fail( function( message ) {
                        // Session key is invalid...redirect to login
                        that.routeToLogin();
                    });
            }

            this.auth = {
                "isPublic":     isPublic,
                "hasKey":       hasKey,
                "hasUser":      hasUser,
                "userPromise":  userPromise
            };

            return this.auth;
        },

        showLogin: function() {

            App.paths = [];

            this.section = "";

            this.view = 'login';

            this.options = {
                model: App.models.userSession
            };

            this.renderMain();
        },

        showLogout: function( ) {

            var that = this;

            this.view = "logout";

            this.forward = "";

            $.when( !App.models.userSession.id || App.models.userSession.logoutUser() )
                .then(
                    function( userResponse ) {
                        App.views.App.postRenderAlert({
                            "friendlyMsg": App.polyglot.t("router_logout"),
                            "type":        "warning"
                        });

                        that.routeToLogin({"forward": false});
                    },
                    function( jqXHR, textStatus, errorThrown ) {
                        App.views.App.postRenderAlert({
                            "friendlyMsg": App.polyglot.t("router_logout_error")
                        });

                        that.routeToLogin({"forward": false});
                    }
                );
        },

        showMarketplace: function( ) {

          var auth,
              that = this;

          try {
              auth = this.checkAuth();
          } catch( e ) {
              // requires login
              return false;
          }

          this.view = 'marketplace';

          $.when( auth.userPromise )
            .then(
                function( userResponse ) {
                    // done
                    that.renderMain( );

                },
                function( jqXHR, textStatus, errorThrown ) {
                    // fail
                    App.views.App.postRenderAlert({
                        friendlyMsg: App.polyglot.t("router_marketplace_not_found"),
                        type: "alert"
                    });
                }
          );

        },

        showLearningMarkets: function ( ) {

          var auth,
              that = this;

          try {
              auth = this.checkAuth();
          } catch( e ) {
              // requires login
              return false;
          }

          this.view = 'learningMarkets';

          $.when( auth.userPromise )
            .then(
                function( userResponse ) {
                    // done
                    that.renderMain( );

                },
                function( jqXHR, textStatus, errorThrown ) {
                    // fail
                    App.views.App.postRenderAlert({
                        friendlyMsg: App.polyglot.t("router_learningmarkets_not_found"),
                        type: "alert"
                    });
                }
          );

        },

        showInstruments: function( symbols ) {

            var auth,
                that = this,
                searchType,
                recentPromise,
                toLoad = "";

            try {
                auth = this.checkAuth();
            } catch( e ) {
                // requires login
                return false;
            }

            this.view = 'instruments';

            symbols = symbols ? symbols.split("-") : [];

            $.when( auth.userPromise )
                .then(
                    function( instrumentsResponse ) {

                        var searchType,
                            recent,
                            needed,
                            defaultList;

                        that.options = {
                            "collection": App.collections.instruments
                        };

                        if ( symbols.length > 0 ) {

                            searchType = Backbone.history.location.pathname.match(/^(\/products|\/stocks-etfs)\/tags/) ? "tags" : "symbols";

                            that.options[ searchType ] = symbols;

                            // Load the instruments
                            if ( App.collections.featureToggles.isEnabled("html5-quotes-thin") ) {

                                if ( searchType === "tags" ) {

                                    // Search by tags
                                    App.collections.instruments.search( { "tag": symbols.join(",") } )
                                    .always( function( instruments ) {
                                        that.renderMain( );
                                    });

                                } else {

                                    // Get instruments by symbols
                                    App.collections.instruments.getInstruments( symbols.join(",") )
                                    .always( function( instruments ) {
                                        that.renderMain( );
                                    });
                                }
                            } else {

                                that.renderMain( );
                            }

                        } else {

                            // Get recently viewed if user has them
                            recent = App.models.user.getAllRecentInstrumentSymbols( );

                            if ( recent.length > 0  ) {
                                that.options.recent = recent;
                            } else {
                                defaultList = App.config.defaultProducts;
                            }

                            // Check if we have them in the collection
                            needed = _.difference( ( recent.length > 0 ? recent : defaultList ), App.collections.instruments.pluck("symbol") );

                            if ( needed.length > 0 ) {
                                // Get instruments needed by symbols
                                App.collections.instruments.getInstruments( needed.join(",") )
                                .always( function( instruments ) {
                                    that.renderMain( );
                                });

                            } else {
                                that.renderMain( );
                            }
                        }
                    },

                    function( jqXHR, textStatus, errorThrown ) {

                    }
                );
        },

        showInstrumentDetail: function( id, tab ) {

            var auth,
                that = this,
                instrument,
                order,
                range,
                availTabs = [ "order" ];

            try {
                auth = this.checkAuth();
            } catch( e ) {
                // requires login
                return false;
            }

            this.view = 'instrument-detail';

            // Check if url contains a chart range passed via tab
            if ( tab && _.indexOf( availTabs, tab ) === -1 ) {

                if( App.config.chartOptions[ tab ] ) {
                    range = tab;
                }

                tab = null;
            }

            // Check that instrument exists in collection
            instrument = App.collections.instruments.getInstrumentBySymbolOrId( id );

            // Check for an existing order....(e.g., when a user hits the backspace button
            order = App.collections.orders.find( function( order ) {
                return order.get("ordStatus") == -1 && ( order.get("symbol") == id || order.get("instrumentID") == id );
            });

            $.when( auth.userPromise )
                .then(
                    function( userResponse, instrumentsResponse ) {

                        var tagPromise,
                            tags,
                            promise;

                        if ( !instrument ) {
                            if( id.search(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/) !== -1 ) {
                                promise = App.collections.instruments.getInstrument( id );
                            } else {
                                promise = App.collections.instruments.getInstruments( id );
                            }
                        }

                        $.when( instrument || promise )
                        .then(
                            function( instrumentResponse ) {

                                instrument = App.collections.instruments.getInstrumentBySymbolOrId( id );

                                if ( !instrument ) {
                                    that.routeNotFound();
                                    return;
                                }

                                // Temporary: only search first tag
                                tags = instrument.get("tags");

                                // Initiate tag search
                                tagPromise = App.collections.tags.search( _.first(tags) );

                                that.options = {
                                    "model":       instrument,
                                    "order":       order,
                                    "tagPromise":  tagPromise,
                                    "showTab":     tab,
                                    "range":       range
                                };

                                that.renderMain();
                            },
                            function( jqXHR, textStatus, errorThrown ) {

                                // fail..ignore user refresh failure
                                if ( ! this instanceof UserSessionModel ) {
                                    AppEvents.trigger( "router:error", {
                                        "msg":              "Instrument [" + id + "] not found",
                                        "friendlyTitle":    App.polyglot.t("Error"),
                                        "friendlyMsg":      App.polyglot.t("router_instrument_detail_not_found"),
                                        "showMessage":      true
                                    });
                                }
                            }
                        );
                    },
                    function( jqXHR, textStatus, errorThrown ) {
                        // fail..ignore user refresh failure
                    }
                );
        },

        showOrderReview: function( instrument ) {

            var order,
                accountPromise,
                auth,
                that = this;

            try {
                auth = this.checkAuth();
            } catch( e ) {
                // requires login
                return false;
            }

            this.view = 'order-review';

            if ( App.models.account ) {
               accountPromise = App.models.account.fetch( );
            }

            order = App.collections.orders.find( function( order ) {
                return order.get("ordStatus") == -1 && ( order.get("symbol") == instrument || order.get("instrumentID") == instrument );
            });

            $.when( auth.userPromise, accountPromise )
                .then(
                    function( userResponse ) {

                        // done
                        if ( typeof order !== 'object' ) {

                            AppEvents.trigger( "router:error", {
                                "msg":              "Order not found in collection",
                                "friendlyTitle":    App.polyglot.t("Error"),
                                "friendlyMsg":      App.polyglot.t("router_order_review_not_found"),
                                "showMessage":      true
                            });

                            return;
                        }

                        that.options = {
                            "model":  order
                        };

                        that.renderMain();
                    },
                    function( jqXHR, textStatus, errorThrown ) {
                        // fail..ignore user refresh failure
                        if ( ! this instanceof UserSessionModel ) {
                            AppEvents.trigger( "router:error", {
                                "showMessage": true,
                                "friendlyTitle": App.polyglot.t("Error"),
                                "friendlyMsg": App.polyglot.t("router_order_review_error")
                            });
                        }
                    }
                );
        },

        showPositions: function() {

            var auth,
                that = this;

            try {
                auth = this.checkAuth();
            } catch( e ) {
                // requires login
                return false;
            }

            this.view = 'positions';

            $.when( auth.userPromise )
                .then(
                    function( userResponse ) {
                        // done
                        that.options = {
                            "collection": App.collections.positions
                        };

                        that.renderMain();
                    },
                    function( jqXHR, textStatus, errorThrown ) {
                        // fail..user will be redirected
                    }
                );
        },

        showGoals: function() {

            var auth,
                that = this;

            try {
                auth = this.checkAuth();
            } catch( e ) {
                // requires login
                return false;
            }

            this.view = 'goals';

            $.when( auth.userPromise )
                .then(
                    function( userResponse ) {
                        // done
                        that.options = {
                            "collection": App.collections.goals
                        };

                        that.renderMain();
                    },
                    function( jqXHR, textStatus, errorThrown ) {
                        // fail..ignore user refresh failure
                        if ( ! this instanceof UserSessionModel ) {
                            AppEvents.trigger( "router:error", {
                                "showMessage": true,
                                "friendlyTitle": App.polyglot.t("Error"),
                                "friendlyMsg": App.polyglot.t("router_goals_load_error")
                            });
                        }
                    }
                );
        },

        showGoalAdd: function() {

            var auth,
                goal,
                that = this;

            try {
                auth = this.checkAuth();
            } catch( e ) {
                // requires login
                return false;
            }

            this.view = "goal-edit";

            $.when( auth.userPromise )
                .then(
                    function( userResponse ) {

                        // done
                        that.options = { };

                        that.renderMain();
                    },
                    function( jqXHR, textStatus, errorThrown ) {
                        // user routed to login
                    }
                );
        },

        showGoalDetail: function( id ) {

            var auth,
                goal,
                that = this;

            try {
                auth = this.checkAuth();
            } catch( e ) {
                // requires login
                return false;
            }

            this.view = "goal-detail";

            goal = App.collections.goals.get( id );

            if ( !goal ) {
                goal = null;
            }

            // Always refresh goal on detail view
            $.when( auth.userPromise || !goal || goal.fetch({ "reset": true }) )
                .then(
                    function( userResponse ) {

                        var tagPromise,
                            tags;

                        // done
                        goal = App.collections.goals.get( id );

                        if ( !goal ) {
                            that.routeNotFound();
                            return;
                        }

                        // Temporary: only search first tag
                        tags = goal.get("tags");

                        // Initiate tag search
                        tagPromise = App.collections.tags.search( _.first(tags) );

                        that.options = {
                            "model": goal,
                            "tagPromise": tagPromise
                        };

                        that.renderMain();
                    },
                    function( jqXHR, textStatus, errorThrown ) {
                        // user routed to login
                    }
                );
        },

        showGoalEdit: function( id ) {

            var auth,
                goal,
                that = this;

            try {
                auth = this.checkAuth();
            } catch( e ) {
                // requires login
                return false;
            }

            this.view = "goal-edit";

            goal = App.collections.goals.get( id );

            if ( !goal ) {
                goal = null;
            }

            // Always refresh goal on edit view
            $.when( auth.userPromise || !goal || goal.fetch({ "reset": true }) )
                .then(
                    function( userResponse ) {

                        // done
                        goal = App.collections.goals.get( id );

                        if ( !goal ) {
                            that.routeNotFound();
                            return;
                        }

                        that.options = {
                            "model": goal
                        };

                        that.renderMain();
                    },
                    function( jqXHR, textStatus, errorThrown ) {
                        // user routed to login
                    }
                );
        },

        showDefaultView: function( other ) {

            var auth,
                that = this,
                favModels;

            try {
                auth = this.checkAuth();
            } catch( e ) {
                // requires login
                return false;
            }

            if ( auth.hasUser || auth.userPromise ) {
                this.view = "home";
            } else {
                this.view = "landing";
            }

            this.options = {};

            $.when( auth.userPromise )
                .then(
                    function( userResponse ) {

                        if ( that.view === "home" ) {

                            if ( App.collections.favorites.modelsAreLoaded( ) && !App.collections.favorites.forceRefresh ) {
                                favModels = true;
                            }

                            // Load in the favorited models
                            $.when( favModels || App.collections.favorites.loadAll( { "threshold": App.config.homeFavThreshold } ) )
                                .always( function( data, textStatus, jqXHR ) {

                                    that.options = {
                                        "collection": App.collections.favorites
                                    };

                                    that.renderMain();
                                })
                                .fail( function( jqXHR, textStatus, errorThrown ) {
                                    // a fav model failed to load...log it and move on
                                    AppEvents.trigger( "router:error", {
                                        "friendlyMsg": App.polyglot.t("router_favorite_load_error"),
                                        "msg": "A favorite could not be found. API error"
                                    });
                                });
                        } else {
                            that.renderMain();
                        }
                    },
                    function( ) {
                        // fail...do nothing, user will be redirected in checkAuth
                    }
                );
        },

        showOrderConfirm: function( symbol, orderID ) {

            var order,
                auth,
                that = this;

            try {
                auth = this.checkAuth();
            } catch( e ) {
                // requires login
                return false;
            }

            this.view = 'order-confirm';

            order = App.collections.orders.get( orderID );

            $.when( auth.userPromise )
                .then(
                    function( userResponse ) {

                        // done
                        if ( typeof order !== 'object' ) {

                            AppEvents.trigger( "router:error", {
                                "msg":              "Order Not Found",
                                "friendlyTitle":    App.polyglot.t("Error"),
                                "friendlyMsg":      App.polyglot.t("router_order_not_found"),
                                "showMessage":      true
                            });

                            return;
                        }

                        that.options = {
                            "model":  order
                        };

                        that.renderMain();
                    },
                    function( jqXHR, textStatus, errorThrown ) {
                        // fail..ignore user refresh failure
                        if ( ! this instanceof UserSessionModel ) {
                            AppEvents.trigger( "router:error", {
                                "showMessage": true,
                                "friendlyTitle": App.polyglot.t("Error"),
                                "friendlyMsg": App.polyglot.t("router_order_review_error")
                            });
                        }
                    }
                );
        },

        showPosts: function( tags ) {

            var auth,
                posts = App.collections.posts,
                that = this;

            try {
                auth = this.checkAuth();
            } catch( e ) {
                // requires login
                return false;
            }

            this.view = "posts";

            tags = tags ? tags.split("-") : [];

            if ( !posts.length || posts.forceRefresh ) {
                // This will force a refresh on the collection
                posts = null;
            }

            $.when( auth.userPromise, posts || App.collections.posts.fetch({"reset":true}) )
                .then(
                    function( userResponse, postsResponse ) {
                        // done
                        that.options = {
                            "collection":  App.collections.posts,
                            "tags":        tags
                        };

                        that.renderMain();
                    },
                    function( jqXHR, textStatus, errorThrown ) {
                        // fail..ignore user refresh failure
                        if ( ! this instanceof UserSessionModel ) {
                            AppEvents.trigger( "router:error", {
                                "showMessage": true,
                                "friendlyTitle": App.polyglot.t("Error"),
                                "friendlyMsg": App.polyglot.t("router_posts_load_error")
                            });
                        }
                    }
                );
        },

        showPostDetail: function( title, id ) {

            var post = App.collections.posts.get( id ),
                that = this,
                auth;

            try {
                auth = this.checkAuth();
            } catch( e ) {
                // requires login
                return false;
            }

            this.view = "post-detail";

            if ( !post || !post.get("content") ){
                post = null;
            }

            $.when( auth.userPromise, post || App.collections.posts.getPost( id ) )
                .then(
                    function( userResponse, postsResponse ) {

                        var tagPromise;

                        // done
                        post = App.collections.posts.get( id );

                        if ( !post ) {
                            that.routeNotFound();
                            return;
                        }

                        // Temporary: only search first tag
                        tags = post.get("tags");

                        // Initiate tag search
                        tagPromise = App.collections.tags.search( _.first(tags) );

                        that.options = {
                            "model": post,
                            "tagPromise": tagPromise
                        };

                        that.renderMain();
                    },
                    function( jqXHR, textStatus, errorThrown ) {
                        // fail..ignore user refresh failure
                        if ( ! this instanceof UserSessionModel ) {
                            AppEvents.trigger( "router:error", {
                                "showMessage": true,
                                "friendlyTitle": App.polyglot.t("Error"),
                                "friendlyMsg": App.polyglot.t("router_post_not_found")
                            });
                        }
                    }
                );
        },

        showQuestions: function( tags ) {

            var auth,
                questions = App.collections.questions,
                that = this;

            try {
                auth = this.checkAuth();
            } catch( e ) {
                // requires login
                return false;
            }

            this.view = "questions";

            tags = tags ? tags.split("-") : [];

            if ( !questions.length || questions.forceRefresh ) {
                // This will force a refresh on the collection
                questions = null;
            }

            $.when( auth.userPromise, questions || App.collections.questions.fetch({"reset":true}) )
                .then(
                    function( userResponse, questionsResponse ) {
                        // done
                        that.options = {
                            "collection":  App.collections.questions,
                            "tags":        tags
                        };

                        that.renderMain();
                    },
                    function( jqXHR, textStatus, errorThrown ) {
                        // fail..ignore user refresh failure
                        if ( ! this instanceof UserSessionModel ) {
                            AppEvents.trigger( "router:error", {
                                "showMessage": true,
                                "friendlyTitle": App.polyglot.t("Error"),
                                "friendlyMsg": App.polyglot.t("router_questions_load_error")
                            });
                        }
                    }
                );
        },

        showQuestionDetail: function( title, id ) {

            var question = App.collections.questions.get( id ),
                that = this,
                auth;

            try {
                auth = this.checkAuth();
            } catch( e ) {
                // requires login
                return false;
            }

            this.view = "question-detail";

            if ( !question || !question.get("content") ){
                question = null;
            }

            $.when( auth.userPromise, question || App.collections.questions.getQuestion( id ) )
                .then(
                    function( userResponse, questionsResponse ) {

                        var tagPromise,
                            tags;

                        // done
                        question = App.collections.questions.get( id );

                        if ( !question ) {
                            that.routeNotFound();
                            return;
                        }

                        // Temporary: only search first tag
                        tags = question.get("tags");

                        // Initiate tag search
                        tagPromise = App.collections.tags.search( _.first(tags) );

                        that.options = {
                            "model": question,
                            "tagPromise": tagPromise
                        };

                        that.renderMain();
                    },
                    function( jqXHR, textStatus, errorThrown ) {
                        // fail..ignore user refresh failure
                        if ( ! this instanceof UserSessionModel ) {
                            AppEvents.trigger( "router:error", {
                                "showMessage": true,
                                "friendlyTitle": App.polyglot.t("Error"),
                                "friendlyMsg": App.polyglot.t("router_question_not_found")
                            });
                        }
                    }
                );

        },

        showQuestionAnswer: function( title, id, answerID ) {

            var question = App.collections.questions.get( id ),
                that = this,
                auth;

            try {
                auth = this.checkAuth();
            } catch( e ) {
                // requires login
                return false;
            }

            this.view = "question-detail";

            if ( !question || !question.get("content") ){
                question = null;
            }

            $.when( auth.userPromise, question || App.collections.questions.getQuestion( id ) )
                .then(
                    function( userResponse, questionsResponse ) {

                        var tagPromise,
                            tags;

                        // done
                        question = App.collections.questions.get( id );

                        if ( !question ) {
                            that.routeNotFound();
                            return;
                        }

                        // Temporary: only search first tag
                        tags = question.get("tags");

                        // Initiate tag search
                        tagPromise = App.collections.tags.search( _.first(tags) );

                        that.options = {
                            "model": question,
                            "answerID": answerID,
                            "tagPromise": tagPromise
                        };

                        that.renderMain();
                    },
                    function( jqXHR, textStatus, errorThrown ) {
                        // fail..ignore user refresh failure
                        if ( ! this instanceof UserSessionModel ) {
                            AppEvents.trigger( "router:error", {
                                "showMessage": true,
                                "friendlyTitle": App.polyglot.t("Error"),
                                "friendlyMsg": App.polyglot.t("router_question_not_found")
                            });
                        }
                    }
                );

        },

        showQuestionAddAnswer: function( title, id ){

            var question = App.collections.questions.get( id ),
                auth,
                that = this;

            try {
                auth = this.checkAuth( { "forceAuth": true } );
            } catch( e ) {
                // requires login
                return false;
            }

            this.view = "question-add-answer";

            $.when( auth.userPromise, question || App.collections.questions.getQuestion( id ) )
                .then(
                    function( userResponse, questionResponse ) {
                        // done
                        that.options = {
                            "model": questionResponse instanceof Backbone.Model ? questionResponse : App.collections.questions.get( id )
                        };

                        that.renderMain( );
                    },
                    function( jqXHR, textStatus, errorThrown ) {
                        // fail
                        if ( ! this instanceof UserSessionModel ) {
                            AppEvents.trigger( "router:error", {
                                "showMessage": true,
                                "friendlyTitle": App.polyglot.t("Error"),
                                "friendlyMsg": App.polyglot.t("router_add_answer_not_found")
                            });
                        }
                    }
                );
        },

        showQuestionAdd: function( ) {

            var auth,
                that = this;

            try {
                auth = this.checkAuth( { "forceAuth": true } );
            } catch( e ) {
                // requires login
                return false;
            }

            this.view = "question-add";

            $.when( auth.userPromise )
                .then(
                    function( userResponse ) {
                        // done
                        that.renderMain( );
                    },
                    function( jqXHR, textStatus, errorThrown ) {
                        // fail
                        App.views.App.postRenderAlert({
                            friendlyMsg: App.polyglot.t("router_question_not_found"),
                            type: "alert"
                        });
                        that.routeToLogin();
                    }
                );
        },

        showProfile: function( ) {

            var auth,
                that = this,
                profile;

            try {
                auth = this.checkAuth();
            } catch( e ) {
                // requires login
                return false;
            }

            this.view = 'profile';

            $.when( auth.userPromise )
                .then(
                    function( userResponse ) {
                        // done
                        that.options = {
                            "model": App.models.user
                        };

                        that.renderMain();
                    },
                    function( jqXHR, textStatus, errorThrown ) {
                        // fail...user will be redirected
                    }
                );
        },

        showProfileEdit: function( ) {

            var auth,
                that = this,
                profile;

            try {
                auth = this.checkAuth();
            } catch( e ) {
                // requires login
                return false;
            }

            this.view = 'profile-edit';

            $.when( auth.userPromise )
                .then(
                    function( userResponse ) {
                        // done
                        that.options = {
                            "model": App.models.user
                        };

                        that.renderMain();
                    },
                    function( jqXHR, textStatus, errorThrown ) {
                        // fail...user will be redirected
                    }
                );
        },

        showProfileAddDocument: function( a ) {

            var auth,
                _this = this;

            try {
                auth = this.checkAuth();
            } catch( e ) {
                // requires login
                return false;
            }

            this.view = "profile-add-document";

            $.when( auth.userPromise )
                .then(
                    function( userResponse ) {

                        App.models.user.getUploadedDocs( )
                        .done( function( ) {
                            _this.options = {
                                "model": App.models.user
                            };

                            _this.renderMain();
                        });
                    },
                    function( jqXHR, textStatus, errorThrown ) {
                        // fail...user will be redirected
                    }
                );
        },

        showProfileAddDocuments: function( a ) {

            var auth,
                _this = this;

            try {
                auth = this.checkAuth();
            } catch( e ) {
                // requires login
                return false;
            }

//            if ( purl( window.location.href ).param("upload") ) {
//              App.router.navigate( "/upload-2forms", { "trigger": true } );
//            } else if ( purl( window.location.href ).param("profile") ) {
//              App.router.navigate( "/profile/add-documents", { "trigger": true } );
//            }

            this.view = "profile-add-documents";

            $.when( auth.userPromise )
                .then(
                    function( userResponse ) {

                        App.models.user.getUploadedDocs( )
                        .done( function( ) {
                            _this.options = {
                                "model": App.models.user
                            };

                            _this.renderMain();
                        });
                    },
                    function( jqXHR, textStatus, errorThrown ) {
                        // fail...user will be redirected
                    }
                );
        },

        showReporting: function( a ) {

            var auth,
                _this = this;

            try {
                auth = this.checkAuth();
            } catch( e ) {
                // requires login
                return false;
            }

//            if ( purl( window.location.href ).param("upload") ) {
//              App.router.navigate( "/upload-2forms", { "trigger": true } );
//            } else if ( purl( window.location.href ).param("profile") ) {
//              App.router.navigate( "/profile/add-documents", { "trigger": true } );
//            }

            this.view = "reports";

            $.when( auth.userPromise )
                .then(
                    function( userResponse ) {
                      _this.renderMain();
                    },
                    function( jqXHR, textStatus, errorThrown ) {
                        // fail...user will be redirected
                    }
                );
        },

        showReports: function( ) {

            var auth,
                _this = this;

            try {
                auth = this.checkAuth();
            } catch( e ) {
                // requires login
                return false;
            }

            this.view = "reports";

            this.forward = "";

            $.when( auth.userPromise )
                .then(
                    function( userResponse ) {

                        _this.options = { };

                        _this.renderMain( );
                    },
                    function( jqXHR, textStatus, errorThrown ) {
                        // fail...user will be redirected
                    }
                );
        },

        showTour: function( ) {

            var auth;

            this.view = "tour";

            this.forward = "";

            this.options = {};

            this.renderMain();
        },

        showUserAdd: function( ) {

            var auth;

            this.view = "user-add";

            this.forward = "";

            this.options = {};

            this.renderMain();
        },

        showPasswordReset: function( ) {

            var auth;

            this.view = "password-reset";

            this.options = {};

            this.renderMain();
        },

        showPasswordSet: function( ) {

            var auth;

            this.view = "password-set";

            this.options = {};

            this.renderMain();
        },

        showSignUpOneClick: function( ) {

            var auth,
                missing = "",
                // Do not use purl library here...will fail on unencoded query params...thanks marketing!
                // For the record: these characters in the local-part of the address will break the page [&#%=?]
                params = App.getParams( ),
                required = {
                    "email": params["email"] ? params["email"][0] : undefined
                },
                languageId = App.models.user.get("languageID");

            this.view = "signup-one-click";

            this.forward = "";

            // Check for required params
            _.each( required, function( value, key ) {
                if ( !value ) {
                    missing += ( missing.length === 0 ? "" : "," ) + key;
                }
            });

            if ( missing.length > 0 ) {

                AppEvents.trigger( "router:error", {
                    "showMessage":    true,
                    "friendlyTitle":  App.polyglot.t("signup-one-click-missing-params", {"_": "Missing Parameter"}),
                    "friendlyMsg":    App.polyglot.t("cc-funding-required-params", {"_": "Automated signup could not continue.  Missing parameters"}),
                    "msg":            "Signup one click could not load.  Missing parameters [ " + missing + " ]"
                });

                return;
            }

            App.models.user.clear().set({
                "emailAddress1":  required.email,
                "requestType":    1,
                "languageID":     languageId
            });

            this.options = {
                "model": App.models.user
            };

            this.renderMain();
        },

        showReportRedirect: function( ) {

            var data = {
                "ReportName"   :  App.purl.param("reportname"),
                "ReportFormat" :  App.purl.param("reportformat"),
                "AccountNumber":  App.purl.param("accountnumber"),
                "DateStart"    :  App.purl.param("datestart"),
                "DateEnd"      :  App.purl.param("dateend"),
                "url"          :  App.purl.param("url"),
                "sessionKey"   :  App.purl.param("sessionkey"),
                "UserId"       :  App.purl.param("userid"),
                "AccountType"  :  App.purl.param("accounttype"),
                "TradeStatus"  :  App.purl.param("TradeStatus"),
                "InstrumentType"  :  App.purl.param("InstrumentType")
            };

            this.view = "report-redirect";

            this.forward = "";

            this.options = {
                "data": data
            };

            this.renderMain();
        },

        showTags: function( tags ) {

            var auth,
                _this = this;

            try {
                auth = this.checkAuth();
            } catch( e ) {
                // requires login
                return false;
            }

            this.view = "tags";

            tags =  tags ? tags.split("-") : [];

            // only passing the first search term for now
            if ( tags.length > 0 ) {
                tags = [ tags[0] ];
            }

            $.when( auth.userPromise, App.collections.tags.search( tags ) )
                .then(
                    function( userResponse, tagsResponse ) {
                        // done
                        _this.options = {
                            "collection": App.collections.tags,
                            "tags": tags
                        };

                        _this.renderMain();
                    },
                    function( jqXHR, textStatus, errorThrown ) {
                        // fail..ignore user refresh failure
                        if ( ! this instanceof UserSessionModel ) {
                            AppEvents.trigger( "router:error", {
                                "showMessage": true,
                                "friendlyTitle": App.polyglot.t("Error"),
                                "friendlyMsg": App.polyglot.t("router_tag_search_load_error")
                            });
                        }
                    }
                );
        },

        renderMain: function( ) {

            // Set appropriate layout
            var specialLayout,
                authType = App.models.userSession.get("userID") ? "Auth" : "Unauth",
                languageLoaded = App.models.userSession.languageLoaded,
                pageName,
                eventProp = {},
                pathname = window.location.pathname,
                _this = this;

            if ( _this.view === "login" || _this.view === "password-reset" || _this.view === "password-set" ) {
                // Always use unauth for login and password reset
                authType = "Unauth";
            }

            App.authType = authType;

            // Check for loading language file
            $.when( languageLoaded === false || languageLoaded )
              .always( function( ) {

                App.authType = authType;

                // Is there a 'special' layout
                specialLayout = App.getProperty( "config.specialLayouts." + _this.section + "." + authType, App );

                App.specialLayout = specialLayout;

                // Track mixpanel events
                pageName = window.location.pathname.replace(/\//g, " ").trim( );

                // Anonymize goal and order pathnames
                if ( _this.view == "goal-edit" || _this.view == "goal-detail" || _this.view == "order-confirm" ) {

                    re = new RegExp( "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}", "gi" );

                    pathname = pathname.replace( re, "{ID}" );

                } else if ( _this.options.model ) {

                    eventProp.ID = _this.options.model.id;
                }

                // Track routes with segment.io
                App.analytics.page({
                  name: pageName
                });

                $.when( App.views.App.resetLayout( ) )
                    .done( function(  ) {
                        App.views.App.renderMainView( _this.view, _this.options );
                    });
              });
        },

        routeNotFound: function( ) {

            // Set appropriate layout
            var authType = App.models.userSession.get("userID") ? "Auth" : "Unauth";

            $.when( App.views.App.resetLayout( authType ) )
                .done( function( ) {

                    if ( App.config.buildType === "phonegap" ) {

                        App.router.navigate( "/", { "trigger": true } );

                    } else {
                        AppEvents.trigger( "router:error", {
                            "showMessage": true,
                            "friendlyTitle": App.polyglot.t("Error"),
                            "friendlyMsg": App.polyglot.t("router_page_not_found")
                        });
                    }
                });
        },

        routeToLogin: function( options ) {

            options = options || { "forward": true };

            if ( options.forward ) {
                this.forward = Backbone.history.fragment;
            }

            this.navigate( '/login', { trigger: true } );
        },

        clearPathHistory: function( ) {

            App.paths = [];
        }
    });

    return AppRouter;
});