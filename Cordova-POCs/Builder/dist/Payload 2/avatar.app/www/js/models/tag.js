define([
    'backbone',
    'App',
    'App.Events',
    'App.Views.Helpers'
], function ( Backbone, App, AppEvents, AppViewHelpers ) {

    var TagModel = Backbone.Model.extend({

        defaults: {
            "type":  "",
            "ID":    "",
            "path":  ""
        },

        initialize: function( options ) {

            var parts = this.get("url").match(/[\w\-\.!~\*\'"(),]+/g),
                type,
                path,
                ID;

            if ( _.isArray( parts ) && parts.length > 1 ) {

                type = App.config.apiTypeMap[ parts[0] ];

                ID = parts[1];

                path = "/" + App.config.urlViewMap[ type ] + "/"; 

                if ( type == "post" || type == "question" ) {
                    // Add the title
                    path += AppViewHelpers.createSlug( this.get("title") ) + "/";
                }

                this.set({
                    "type":  type,
                    "ID":    ID,
                    "path":  path 
                });
            }
        }
    }); 
    
    return TagModel;
});
