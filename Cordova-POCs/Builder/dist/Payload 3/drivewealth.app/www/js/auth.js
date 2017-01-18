define([
    "backbone",
    "App",
    "purl"
], function( Backbone, App, purl ) {

    var backboneSync = Backbone.sync;

    // Override global backbone sync to add session key
    Backbone.sync = function (method, model, options) {

        var sessionKey = App.models.userSession.get("sessionKey"),
            url,
            path,
            timer,
            timingVar,
            type = {
                "create": "POST",
                "read": "GET",
                "update": "PUT",
                "delete": "DELETE"
            },
            re = new RegExp( "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}", "gi" );

        // Add session key if user exists
        if ( sessionKey ) { 
            options.headers = _.extend( ( options.headers ? options.headers : {} ), {
                "x-mysolomeo-session-key": sessionKey
            });
        }

        // Add campaign info if user is being added
        if ( method === "create" && model.type === "user" && App.campaign ) {
            model.set( App.campaign );
        }

        if ( App.engageTimer( App.config.apiTimerCaptureRate ) ) {

            // Track api time
            if ( options && options.url ) {
                url = options.url;
            } else {
                url = ( typeof model.url === "function" ) ? model.url() : model.url;
            }

            url = purl( url );

            path = url.attr("path");

            path = path.split("/");

            _.each( path, function( el, index, list ) {
                // Replace ids with generic placeholder
                if ( re.test( el ) ) {
                    list[index] = "{ID}";
                }
            });

            timingVar = type[method] + " " + path.join("/") + ( url.attr("query") ? ( "?" + url.attr("query") ) : "" );

            this.listenToOnce( model, "sync", function( a,b,c ) {
                timer.end( "success");
            });

            timer = new App.Timer( "API", timingVar );
        }

        return backboneSync( method, model, options );
    };
});