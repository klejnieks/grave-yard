define([
    'backbone',
    'App',
    'App.Auth',
    'App.Events',
    'nprogress',
    'App.Views.Header',
    'App.Views.Footer',
    'App.Views.Goals',
    'App.Views.GoalEdit',
    'App.Views.GoalDetail',
    'App.Views.Helpers',
    'App.Views.Home',
    'App.Views.Instruments',
    'App.Views.InstrumentDetail',
    'App.Views.AccountBrief',
    'App.Views.Landing',
    'App.Views.Login',
    'App.Views.Message',
    'App.Views.Marketplace',
    'App.Views.LearningMarkets',
    'App.Views.OrderReview',
    'App.Views.OrderConfirm',
    'App.Views.PasswordReset',
    'App.Views.PasswordSet',
    'App.Views.Positions',
    'App.Views.Posts',
    'App.Views.PostDetail',
    'App.Views.Profile',
    'App.Views.ProfileAddDocument',
    'App.Views.ProfileAddDocuments',
    'App.Views.ProfileEdit',
    'App.Views.Reports',
    'App.Views.Questions',
    'App.Views.QuestionAdd',
    'App.Views.QuestionAddAnswer',
    'App.Views.QuestionDetail',
    'App.Views.ReportRedirect',
    'App.Views.SignUpOneClick',
    'App.Views.Tags',
    'App.Views.Tour',
    'App.Views.UserAdd',
    'text!templates/layouts/layout-small.html',
    'text!templates/layouts/layout-medium.html',
    'text!templates/layouts/layout-unauth-small.html',
    'text!templates/layouts/layout-unauth-medium.html',
    'text!templates/alert.html',
    'text!templates/action-button-small.html',
    'text!templates/action-button-medium.html',
    'text!templates/action-menu-back-small.html',
    'text!templates/action-menu-back-medium.html',
    'text!templates/action-menu-default-small.html',
    'text!templates/action-favorite-small.html',
    'text!templates/action-favorite-medium.html',
    'text!templates/action-icon-small.html',
    'text!templates/layouts/layout-unauth-acquisition-small.html',
    'text!templates/layouts/layout-unauth-acquisition-medium.html',
    'text!templates/layouts/footer-disclaimer.html',
],

   function ( Backbone, App, AppAuth, AppEvents, NProgress, HeaderView, FooterView, GoalsView, GoalEditView, GoalDetailView, AppViewHelpers, HomeView, InstrumentsView, InstrumentDetailView, AccountBriefView, LandingView, LoginView, MessageView, MarketplaceView, LearningMarketsView, OrderReviewView, OrderConfirmView, PasswordResetView, PasswordSetView, PositionsView, PostsView, PostDetailView, ProfileView, ProfileAddDocumentView, ProfileAddDocumentsView, ProfileEditView, ReportsView, QuestionsView, QuestionAddView, QuestionAddAnswerView, QuestionDetailView, ReportRedirectView, SignUpOneClickView, TagsView, TourView, UserAddView, smallLayoutTemplate, mediumLayoutTemplate, smallUnauthLayoutTemplate, mediumUnauthLayoutTemplate, alertMessageTemplate, actionButSmlTemplate, actionButMedTemplate, actionMenuBackSmlTemplate, actionMenuBackMedTemplate, actionMenuDefaultSmlTemplate, actionFavSmlTemplate, actionFavMedTemplate, actionIcoSmlTemplate, smallUnauthAcqTemplate, mediumUnauthAcqTemplate, footerDisclaimerTemplate ) {

        var AppView = Backbone.View.extend({

            //--> TODO: cache template loading
            smallAuthTemplate:          _.template( smallLayoutTemplate ),
            mediumAuthTemplate:         _.template( mediumLayoutTemplate ),
            smallUnauthTemplate:        _.template( smallUnauthLayoutTemplate ),
            mediumUnauthTemplate:       _.template( mediumUnauthLayoutTemplate ),

            alertTemplate:              _.template( alertMessageTemplate ),
            smallActionButTemplate:     _.template( actionButSmlTemplate ),
            mediumActionButTemplate:    _.template( actionButMedTemplate ),
            smallActionFavTemplate:     _.template( actionFavSmlTemplate ),
            mediumActionFavTemplate:    _.template( actionFavMedTemplate ),
            smallActionIcoTemplate:     _.template( actionIcoSmlTemplate ),

            smallMenuBackTemplate:      _.template( actionMenuBackSmlTemplate ),
            mediumMenuBackTemplate:     _.template( actionMenuBackMedTemplate ),
            smallMenuDefaultTemplate:   _.template( actionMenuDefaultSmlTemplate ),

            smallUnauthAcquisitionTemplate:   _.template( smallUnauthAcqTemplate ),
            mediumUnauthAcquisitionTemplate:  _.template( mediumUnauthAcqTemplate ),

            footerDisclaimerTemplate: _.template( footerDisclaimerTemplate ),

            events: {
                "click .nav-list-item, .nav-link, .nav-item, .nav-topbar, #action-button":  "navigate",
                "click #menu-icon-back":       "renderPreviousView",
                "click .action-bar-favorite":  "updateFavorite",
                "click .nav-account":          "selectAccount",
                "submit #tag-search":          "searchTags",
                "click .dds-item":             "selectAccountDropDown",
                "click #trigger-overlay, #overlay-close": "toggleMenu",
                "click .footer-disclaimer-modal":    "toggleDisclaimerModal",
                "click #open-live-acct":       function( ) {
                    App.analytics.track("Begun Live Account", {
                        "category":  "Conversion",
                        "label":     "Global Layout Banner"
                    });
                }
            },

            debouncedResize: null,

            initialize: function( options ){

                var that = this;

                this.debouncedResize = _.debounce( this.resizeMain, 100 );

                // Listen for window resize and redraw layout if necessary
                $( window ).resize( function(){
                    that.resizeLayout();
                });

                // Initialize jquery reference to application modal
                App.$modal = $('#app-modal');

                NProgress.start();

                this.setLayoutSize();

                this.listenTo( AppEvents, "positions:rendered positions:subtemplated instruments:rendered home:rendered home:subtemplated instrument:rendered app:flashQuotes", function( ) {
                    window.setTimeout( App.views.App.removeFlashQuotes, App.config.flashQuotesDisplayTime );
                });

                this.listenTo( AppEvents, "userSession:unauthorized userSession:timeout", function( ) {
                    // User was logged out...navigate to root
                    App.router.navigate( "/logout", { "trigger": true } );
                });

                this.listenTo( AppEvents, "app:layoutRendered", function( ) {
                  NProgress.done();
                  this.currentMarketState = App.marketState;
                });

                this.listenTo( AppEvents, "instruments:quotesUpdated", function( ) {
                    if (this.currentMarketState && this.currentMarketState != App.marketState) {
                      this.refreshLayout();
                      this.currentMarketState = App.marketState;
                    }
                });

                $( window ).on( "orientationchange", function( event ) {
                  that.resizeMenu();
                });


                AppEvents.trigger("app:initialized");
            },

            resizeLayout: function() {

                var layoutSize = this.calculateLayoutSize(),
                    _this = this;

                if ( layoutSize === App.layoutSize ) {
                    // it's the same layout...resize main view if needed
                    if ( App.views.main ) {
                        this.debouncedResize( );
                    }

                    return this;
                }

                App.layoutSize = layoutSize;

                $.when( this.resetLayout( ) )
                    .done( function( ) {

                        _this.renderLayout( );

                        _this.renderMainView( App.router.view, App.router.options );
                    });
            },

            resizeMain: function( ) {

                if ( App.views.main && typeof App.views.main.resize === "function" ) {
                    App.views.main.resize( );
                }
            },

            resetLayout: function( ) {

                var layoutType = App.authType + ( App.specialLayout ? App.specialLayout : "" ),
                    template = this[ App.layoutSize + layoutType + 'Template' ],
                    deferred = $.Deferred( ),
                    _this = this;

                if ( template && layoutType === App.layoutType ) {
                    // same type is rendered...do nothing
                    return;
                }

                this.setLayoutType( layoutType );

                // Load in templates if needed
                $.when( template || App.lazyLoad("text!templates-lazy/layouts/layout-" + App.authType.toLowerCase( ) + "-" + App.specialLayout.toLowerCase( ) + "-" + App.layoutSize.toLowerCase( ) + ".html") )
                .then(
                    function( response ) {

                        if ( typeof response !== "function" ) {
                            _this[ App.layoutSize + App.layoutType + 'Template' ] = _.template( response );
                        }

                        _this.renderLayout( );

                        deferred.resolveWith( this, [] );
                    },
                    function( jqXHR, textStatus, errorThrown ) {

                        AppEvents.trigger("v::app::resetLayout::error", {
                            "showMessage": true,
                            "friendlyMsg": "Layout could not be loaded.",
                            "msg": "Layout could not be loaded. [layoutType: " + layoutType + "]" + errorThrown
                        });

                        deferred.rejectWith( this, [ null, "error", "Layout template could not be loaded." ] );
                    }
                );

                return deferred;
            },

            renderLayout: function( ){

                var data = {},
                    languageID = App.models.userSession ? App.models.userSession.get("languageID") : "",
                    height,
                    template = this[ App.layoutSize + App.layoutType + 'Template' ],
                    acctType,
                    applicationLink = App.config.applicationLink( );

                // Remove old views first
                this.removeViews();

                NProgress.start();

                if (App.models.account) {
                  acctType = (App.models.account.get("accountType") === 2) ? "Live" : "Practice";
                }

                // Build application form link based on language
                if ( languageID !== App.config.defaultLanguageID ) {
                    applicationLink = applicationLink.replace( "en_US", languageID );
                }

                _.extend( data, App.models.user.toJSON(), {
                    "accounts":           App.collections.accounts,
                    "marketStateConfig":  App.config.marketState,
                    "marketStateStatus":  App.marketState,
                    "types":              App.config.accountTypes,
                    "selNickname":        App.models.account ? App.models.account.get("nickname") : "",
                    "selAcct":            App.models.account ? App.models.account.get("accountID") : "",
                    "selAccName":         (App.models.account && App.models.account.get('accountType') == 1) ? "Your Practice Account" : "Your Live Account",
                    "selAcctNo":          App.models.account ? App.models.account.get("accountNo") : "",
                    "selAcctType":        App.models.account ? App.models.account.get("accountType") : "",
                    "selMarketState":     this.getMarketState(),
                    "version":            App.config.version,
                    "userID":             App.models.userSession ? App.models.userSession.get("userID") : "",
                    "hasLiveAcct":        App.collections.accounts.hasLiveAcct,
                    "polyglot":           App.polyglot,
                    "sessionKey":         App.models.userSession? App.models.userSession.get("sessionKey") : "",
                    "base":               App.config.buildType === "phonegap" ? App.config.externalDomain( ) : App.purl.attr("base"),
                    "languageID":         App.models.userSession ? App.models.userSession.get("languageID") : "",
                    "applicationLink":    applicationLink,
                    "buildType":          App.config.buildType,
                    "rootURL":            App.config.rootURL,
                    "externalRootURL":    App.config.externalRootURL,
                    "externalDomain":     App.config.externalDomain( ),
                    "appsDomain":         App.config.appsDomain( ),
                    "cdn":                App.config.cdn( ),
                    "email":              App.models.user.get('emailAddress1'),
                    "userName":           App.models.user.get('username'),
                    "WLPID":              App.config.WLPID,
                    "WLP_Logo":           App.config.companyLogoPath.WLP_Logo
                });

                this.$el.empty().html( template( data ) );

                if ( App.layoutSize == "small" ) {

                    $("body").removeClass("f-topbar-fixed");

                }

                // initialize foundation
                $(document).foundation();

                this.renderViews();

                AppEvents.trigger("app:layoutRendered");

                this.$menu = this.$(".overlay");

                return this;




            },

            renderViews: function(){


                //--> TODO: based on layout??

                App.views.header = new HeaderView({
                    el: '#header'
                });

                App.views.footer = new FooterView({
                    el: '#footer'
                });

                App.views.accountBrief = new AccountBriefView({
                    el: '#account-brief'
                });


            },

            removeViews: function() {

                // Header: Remove old view first if it exists
                if ( typeof App.views.header !== 'undefined' && typeof App.views.header.removeView === 'function' ) {
                    App.views.header.removeView();
                }

                // Footer: Remove old view first if it exists
                if ( typeof App.views.footer !== 'undefined' && typeof App.views.footer.removeView === 'function' ) {
                    App.views.footer.removeView();
                }

                // Account Brief: Remove old view first if it exists
                if ( typeof App.views.accountBrief !== 'undefined' && typeof App.views.accountBrief.removeView === 'function' ) {
                    App.views.accountBrief.removeView();
                }


            },

            renderMainView: function( view, options ) {

                var ViewConstructor;

                options = options || {};

                options = _.extend( options, {
                    el: '#main'
                });

                // Remove action bar buttons and title
                this.removeActionItem();

                this.removeActionTitle();

                // Reset menu
                this.renderMenuButton();

                // Clear the last search if user switches sections
                if ( App.router.section !== App.router.prevSection ) {
                    App.collections.instruments.clearLastSearched( );
                }

                if ( typeof App.views.main !== 'undefined' && typeof App.views.main.removeView === 'function' ) {
                    App.views.main.removeView();
                }

                switch ( view ) {

                    case 'login':
                        ViewConstructor = LoginView;
                        break;

                    case 'instruments':
                        ViewConstructor = InstrumentsView;
                        break;

                    case 'instrument-detail':
                        ViewConstructor = InstrumentDetailView;
                        break;

                    case 'message':
                        ViewConstructor = MessageView;
                        break;

                    case 'marketplace':
                        ViewConstructor = MarketplaceView;
                        break;

                    case 'learningMarkets':
                        ViewConstructor = LearningMarketsView;
                        break;

                    case 'order-review':
                        ViewConstructor = OrderReviewView;
                        break;

                    case 'order-confirm':
                        ViewConstructor = OrderConfirmView;
                        break;

                    case 'positions':
                        ViewConstructor = PositionsView;
                        break;

                    case 'goals':
                        ViewConstructor = GoalsView;
                        break;

                    case 'goal-detail':
                        ViewConstructor = GoalDetailView;
                        break;

                    case 'goal-edit':
                        ViewConstructor = GoalEditView;
                        break;

                    case 'home':
                        ViewConstructor = HomeView;
                        break;

                    case 'posts':
                        ViewConstructor = PostsView;
                        break;

                    case 'post-detail':
                        ViewConstructor = PostDetailView;
                        break;

                    case 'questions':
                        ViewConstructor = QuestionsView;
                        break;

                    case 'question-detail':
                        ViewConstructor = QuestionDetailView;
                        break;

                    case 'question-add-answer':
                        ViewConstructor = QuestionAddAnswerView;
                        break;

                    case 'question-add':
                        ViewConstructor = QuestionAddView;
                        break;

                    case 'profile':
                        ViewConstructor = ProfileView;
                        break;

                    case 'profile-edit':
                        ViewConstructor = ProfileEditView;
                        break;

                    case 'reports':
                        ViewConstructor = ReportsView;
                        break;

                    case 'tour':
                        ViewConstructor = TourView;
                        break;

                    case 'user-add':
                        ViewConstructor = UserAddView;
                        break;

                    case 'password-reset':
                        ViewConstructor = PasswordResetView;
                        break;

                    case 'password-set':
                        ViewConstructor = PasswordSetView;
                        break;

                    case 'tags':
                        ViewConstructor = TagsView;
                        break;

                    case 'profile-add-document':
                        ViewConstructor = ProfileAddDocumentView;
                        break;

                    case 'profile-add-documents':
                        ViewConstructor = ProfileAddDocumentsView;
                        break;

                    case 'signup-one-click':
                        ViewConstructor = SignUpOneClickView;
                        break;

                    case 'report-redirect':
                        ViewConstructor = ReportRedirectView;
                        break;

                    // Use landing as default
                    default:
                        ViewConstructor = LandingView;
                        break;
                }

                try {

                    App.views.main = new ViewConstructor( options );

                    App.views.main.render();

                    if ( !App.views.main.noScroll ) {
                        if ( App.layoutSize === 'small' ) {
                            $("[data-offcanvas]").scrollTop(0);
                            $("#main").scrollTop(0);
                        } else {
                            $("body, html").scrollTop(0);
                        }
                    }

                    if ( this.postRenderAlertOptions ) {

                        this.renderAlert( this.postRenderAlertOptions );

                        this.postRenderAlertOptions = null;
                    }

                } catch ( e ) {

                    // Something went wrong with rendering...show error message
                    AppEvents.trigger( "v::app::renderMainView::error", {
                        "showMessage": true,
                        "friendlyMsg": App.polyglot.t("views_app_error"),
                        "message": "Error occurred during main view rendering. " + ( e.toString ? e.toString( ) : "" ),
                        "stack": ( e.stack ? e.stack : "" )
                    });
                }

                NProgress.done();

            },

            toggleMenu: function ( ) {
              if( this.$menu &&  this.$menu.hasClass('open') ) {
                 this.$menu.removeClass('open');
                 this.$menu.css("transform","translateY(0px)");
                 $('body').css("position", "relative");
              }
              else if(this.$menu){
                this.$menu.addClass('open')
                this.$menu.css("height", window.innerHeight + 'px');
                this.$menu.css("transform","translateY(1965px)");
                this.$menu.scrollTop(0);
                $('body').css("position", "fixed");
              }
            },

            closeMenu: function() {
              if(  this.$menu &&  this.$menu.hasClass('open') ) {
                 this.toggleMenu();
              }
            },

            resizeMenu: function() {
              if( this.$menu &&  this.$menu.hasClass('open') ) {
                this.$menu.css("height", window.innerHeight + 'px');
              }
            },

            renderAlert: function( options ) {

                options = options || {};

                var $main = this.$('#main');

                if ( options.removeAlerts ) {
                    this.removeAlerts();
                }

                $main
                    .prepend( this.alertTemplate( options ) )
                    .foundation();

                // remove alert after set seconds
                if ( options.removeAfter && !isNaN( parseInt( options.removeAfter, 10 ) ) ) {
                    window.setTimeout( App.views.App.removeAlerts, parseInt( options.removeAfter, 10 ) );
                }

                //--> TODO: Have alert float above content
                $("html").scrollTop(0);
            },

            removeAlerts: function() {

                this.$("#app-alert").remove();
            },

            renderMessage: function ( options ) {

                var authType = App.models.userSession.get("userID") ? "Auth" : "Unauth",
                    _this = this;

                $.when( App.views.App.resetLayout( authType ) )
                    .done( function( ) {
                        _this.renderMainView( 'message', options );
                    });
            },

            renderActionItem: function ( options ) {

                var template,
                    type;

                options = options || this.actionItemOptions;

                type = App.getProperty( "type", options );

                if ( type === "button" || ( type === "icon" && App.layoutSize === "medium" ) ) {
                    type = "But";
                } else if ( type === "favorite" ) {
                    type = "Fav";
                } else if ( type === "icon" ) {
                    type = "Ico";
                }

                if ( type ) {

                    this.actionItemOptions = _.clone( options );

                    if ( options.type === "favorite" ) {

                        // Is the user logged in?
                        options.loggedIn = App.models.userSession.loggedIn();

                        options.isFavorited = _.findWhere( App.collections.favorites.groupedByType[options.favoriteType], { "ID":options.id } ) ? true : false;
                    }

                    this.removeActionItem();

                    template = this[ App.layoutSize + "Action" + type + "Template"];

                    if ( App.layoutSize === 'small' ) {
                        this.$('#small-nav').append( template( options ) );
                    } else if ( App.layoutSize === 'medium' ) {
                        this.$('#main-action-button').html( template( options ) );
                    }
                }
            },

            removeActionItem: function() {

                this.$('#action-bar').remove();
            },

            renderActionTitle: function ( options ) {

                if ( typeof options.title !== 'undefined' ) {
                    this.$("#main-action-title").html( options.title );
                }
            },

            removeActionTitle: function() {

            	this.$("#main-action-title").empty().text( App.layoutSize === 'small' ? App.config.WLP_CompanyName : '' ) ;
            },

            // Use this to render/replace the menu button (e.g., show the back arrow)
            renderMenuButton: function( type ) {

                var content = "&nbsp;";

                if ( type === 'back' ) {
                    content = this[ App.layoutSize + "MenuBackTemplate"]({});
                } else if ( App.layoutSize === "small" ) {
                    content = this.smallMenuDefaultTemplate({});
                }

                this.$("#main-action-menu").html( content );

                //--> TODO: can we call this at a lower scope?
                $(document).foundation();
            },

            toggleDisclaimerModal: function( ) {

              var data = {};

              _.extend( data, {
                  "polyglot":           App.polyglot,
                  "buildType":  App.config.buildType,
              });

              App.views.App.toggleModal(
                  this.footerDisclaimerTemplate(data),
                  "medium"
              );

            },

            postRenderAlert: function( options ) {

                this.postRenderAlertOptions = options;
            },

            navigate: function( e ) {

                var $target = $(e.currentTarget),
                    pathname = App.getProperty( "currentTarget.pathname", e );

                // If link has target attribute, assume external link
                if ( $target.is("[target]") ) {

                    //mixpanel.track( "Viewed External", { "Target": App.getProperty( "currentTarget.href", e ) } );
                    return;
                }

                e.preventDefault();

                e.stopPropagation();

                // Trigger NProgress only if view/route is changed
                if (( window.location.href.indexOf(pathname) === -1) || (window.location.href.indexOf(pathname+"?") === -1 && pathname == "/" ) ) {
                  NProgress.start();
                }


                if ( pathname ) {

                    App.router.navigate( pathname + this.buildReferralQuery( ), { trigger: true } );

                } else if ( typeof e.currentTarget.id !== 'undefined' && $(e.currentTarget).attr("data-target-path") ) {
                    App.router.navigate( $(e.currentTarget).attr("data-target-path") + e.currentTarget.id + this.buildReferralQuery( ), { trigger: true } );
                }

                // close the slidedown menu...small layout only
                if ( App.layoutSize === 'small' ) {
                    this.closeMenu();
                }
            },

            navigatePath: function( path, trigger ) {

                trigger = ( trigger === false ? false : true );

                App.router.navigate( path + this.buildReferralQuery( ), { trigger: trigger } );

            },

            buildReferralQuery: function( ) {

                var referralCode = App.models.userSession.get("referralCode");

                return referralCode ? ( "?r=" + referralCode ) : "";
            },

            renderPreviousView: function() {

                NProgress.start();

                // Drop current path
                App.paths.pop();

                App.router.navigate( ( App.paths.length > 0 ? App.paths.pop() : "/" + App.router.section ) + this.buildReferralQuery( ) , { trigger: true } );
            },

            // determine which layout size to use
            calculateLayoutSize: function() {

                return Modernizr.mq( App.config.targetSizes.medium ) ? 'medium' : 'small';
            },

            // set the layout size
            setLayoutSize: function() {

                App.layoutSize = this.calculateLayoutSize();

                return App.layoutSize;
            },

            // Set the layout type...defaults to authenticated
            setLayoutType: function( type ) {

                App.layoutType = ( typeof type !== "undefined" ) ? type : "Auth";

                return App.layoutType;
            },

            toggleModal: function( content, size ) {

                var newStatus = App.$modal.hasClass('open') ? 'close' : 'open';

                size = size || App.modal;

                if ( newStatus === 'open' ) {
                    App.$modal.empty().html( content );
                }

                App.$modal
                    .removeClass( App.modal )
                    .addClass( size )
                    .foundation( 'reveal', newStatus, {
                        animation: 'fadeAndPop'
                    })
                    .on( 'closed', function(){
                        App.$modal.empty();
                    });

                App.modal = size;

                return newStatus;
            },

            updateFavorite: function( e ) {

                var $target = $(e.currentTarget),
                    that = this,
                    type,
                    id,
                    favPromise;

                e.preventDefault();

                e.stopPropagation();

                $target.addClass("expandOpen");

                type = $target.attr("data-favorite-type");

                id = $target.attr("data-favorite-id");

                if ( type && id ) {

                    favPromise = App.collections.favorites.update( type, id )
                        .done( function( data, textStatus, jqXHR ) {
                            if ( $target.hasClass("action-bar-favorite") ) {
                                // Fav icon is in action bar
                                that.renderActionItem();
                            } else {
                                // Fav icon is in main view
                                App.views.main.render({
                                    "favRefresh": true
                                });
                            }

                            // Check if instrument is being added
                            if ( type === "instrument" && _.findWhere( data[App.models.account.id], {"ID":id, "type":type} ) ) {
                                instrument = App.collections.instruments.get( id );

                                if ( instrument ) {
                                    App.analytics.track('Favorited Product', {
                                        id:        id,
                                        sku:       instrument.get("symbol"),
                                        name:      instrument.get("name"),
                                        price:     instrument.get("rateAsk"),
                                        category:  ( App.models.account.get("accountType") === 2 ) ? "Live" : "Practice"
                                    });
                                }
                            }
                        })
                        .fail( function( jqXHR, textStatus, errorThrown ) {
                            AppEvents.trigger("v::app::updateFavorite::error", {
                                "showMessage": true,
                                "friendlyMsg": App.polyglot.t("views_app_favorite_error"),
                                "msg": "Error during loading of favorites. " + errorThrown
                            });
                        });
                }

                return favPromise;
            },

            removeFlashQuotes: function( ) {

                App.views.main.$(".rate-up, .rate-down").removeClass("rate-up rate-down");
            },

            clearUserData: function( ) {

                App.models.userSession.clearUser();

                App.models.user.clearUser();

                App.models.account.clearData();

                App.collections.orders.reset();

                App.collections.instruments.reset();

                App.collections.positions.reset();

                App.collections.goals.reset();

                App.collections.favorites.resetData();

                App.collections.featureToggles.reset();

                App.collections.accounts.reset();

                App.collections.questions.reset();

                App.collections.posts.reset();

                //App.polyglot.clear( );
            },

            getMarketState: function( ) {

                if ( App.models.account && App.config.marketState[ App.models.account.get("accountType") ] ) {
                    return App.config.marketState[ App.models.account.get("accountType") ][ App.marketState ];
                } else {
                    return App.config.marketState["default"][ App.marketState ];

                }
            },

            selectAccount: function( e ) {

                e.preventDefault();

                e.stopPropagation();

                var $anchor = $(e.currentTarget),
                    account = App.collections.accounts.get( $anchor.attr("data-account-id") ),
                    _this   = this;

                if ( account && ( account.get("accountID") !== App.models.account.get("accountID") ) ) {

                    $.when( App.collections.accounts.fetch( ) )
                    .always( function( ) {

                        App.models.userSession.setAccount( account );

                        App.collections.favorites.setByAccount( account.get("accountID") );

                        _this.refreshLayout( ) ;

                        // Restart bacbone history to run the route again
                        Backbone.history.stop( );

                        Backbone.history.start( );

                        _this.$(".nav-account").removeClass("nav-account-sel ");

                        _this.$("[data-account-id=\"" + account.get("accountID") + "\"]").addClass("nav-account-sel");
                    });
                }
            },

           selectAccountDropDown: function(e) {
               var $target = $(e.currentTarget);
               $target.parent().removeClass("open").css( "left", "-99999px" )
               if ( !(App.models.account.get("accountID") == $target.data("account-id"))) {
                 this.selectAccount(e)
                 if ( App.layoutSize === 'small' ) {
                   $('body').css("position", "relative");
                 }
               }
           },

            refreshViews: function( ) {

                this.renderViews( );

                // If home view, we must reload the favorite models
                if ( App.router.view == "home" ) {
                    App.router.showDefaultView();
                } else {
                    this.renderMainView( App.router.view, App.router.options );
                }
            },

            refreshLayout: function( ) {

                this.renderLayout();
            },

            searchTags: function( e ) {

                e.preventDefault();

                e.stopPropagation();

                var x,
                    len,
                    url = "",
                    $search = $(e.currentTarget),
                    query = $search.find("#tags").val().split(/\s+/);

                for( x = 0, len = query.length; x < len; x++ ){
                    url += ( url.length > 0 ? "-" : "" ) + query[x];
                }

                if ( !url ) {
                    return;
                }

                $search.find("#tags").val("").blur();

                App.router.navigate( "/tags/" + url, { "trigger": true } );
            },

            getCookie: function( key ) {

                if ( App.config.buildType === "phonegap" ) {
                    return window.localStorage.getItem( key );
                } else {
                    return $.cookie( key );
                }
            },

            setCookie: function( key, value, options ) {

                options = options || { "expires": 365, "path": "/" };

                if ( App.config.buildType === "phonegap" ) {

                    window.localStorage.removeItem( key );

                    return window.localStorage.setItem( key, value );
                } else {
                    return $.cookie( key, value, options );
                }
            },

            removeCookie: function( key, options ) {

                options = options || { "expires": 365, "path": "/" };

                if ( App.config.buildType === "phonegap" ) {
                    window.localStorage.removeItem( key );
                } else {
                    $.removeCookie( "camp", options );
                }
            },

            getVisited: function( ) {

                var visited = {},
                    cookie = this.getCookie("bhdt");

                if ( cookie === "true" ) {

                    visited.home = true;

                    this.setCookie( "bhdt", JSON.stringify( visited ) );

                } else {

                    try {
                        visited = JSON.parse( cookie );
                    } catch ( e ) {
                        // No cookie or invalid
                        visited = {};
                    }
                }

                return visited || {};
            },

            getPreferences: function( type ) {

                var pref = {},
                    cookie = this.getCookie( type || "pr" );

                if ( cookie ) {
                    try {
                        pref = JSON.parse( cookie );
                    } catch ( e ) {
                        // No cookie or invalid
                        pref = {};
                    }
                }

                return pref;
            },

            setPreferences: function( pref ) {

                pref = _.extend(
                    App.preferences,
                    pref
                );

                this.setCookie( "pr", JSON.stringify( pref ), { "expires": 365, "path": "/" } );
            },

            removeCampaign: function( ) {

                App.campaign = { };

                this.removeCookie("camp");
            },

            activatePixelTrack: function( ) {

                var fbCamp = App.views.App.getCookie("fb_camp");

                if ( fbCamp && _.indexOf( App.config.fbPixelTrackingCampaigns, fbCamp ) !== -1 ) {

                    App.lazyLoad( "text!/js/templates-lazy/fb-camp/tracking-pixel-" + fbCamp + ".html" )
                    .done( function( content ) {

                        if ( content ) {

                            var template = _.template( content );

                            $("head").append( template({
                                "env": App.config.env( )
                            }));

                            $.removeCookie( "fb_camp" );
                        }
                    });
                }
            }
        });

        return AppView;
    }
);