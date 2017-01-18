define([
    'backbone',
    'App',
    'App.Views.Helpers',
    'App.Events',
    'text!templates/profile.html'
], function( Backbone, App, AppViewHelpers, AppEvents, profileTemplate ) {

    var ProfileView = Backbone.View.extend({

        events: { },

        initialize: function( options ) {

            // Render the action button
            App.views.App.renderActionItem({
                "type":  "button",
                "title": "Edit",
                "href":  "/profile/edit"
            });

            // Render the title in the action bar
            App.views.App.renderActionTitle({
                "title": App.polyglot.t("Profile") 
            });

            this.template = _.template( profileTemplate );
        },

        render: function( ) {

            var data = {},
                language = _.findWhere( App.config.languages, { "languageID": this.model.get("languageID") } ),
                country = _.findWhere( App.config.countries, { "ID": this.model.get("countryID") } );

            _.extend( data, this.model.toJSON(), {
                "langNameEnglish":  language ? language.nameEnglish : "",
                "countryName":      country ? country.name : "",
                "polyglot":         App.polyglot 
            });

            this.$el.empty().html( this.template( data ));

            return this;
        },

        removeView: function() {

            this.stopListening(); 

            this.undelegateEvents();
        }
    });

    return ProfileView;
});
