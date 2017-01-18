/* Application level events aggregator */
define([
    'backbone',
    'App',
    'App.Models.Exception'
], function ( Backbone, App, ExceptionModel ) {

    var AppEvents = _.extend( {}, Backbone.Events );

    //AppEvents.on('window:error', function ( e ) {
    //    alert('hello window error');
    //});

    AppEvents.on('all', function( eventName, data ) {

        var parts = eventName.split("::"),
            type = _.last( parts ),
            exception,
            detail = "";

        // Submit error exception to API if logged in
        if ( type == "error" && App.models.userSession && App.models.userSession.loggedIn( ) && App.exceptions < App.config.maxExceptions ) {

            detail += "App Version: " + App.config.version + "\n";

            detail += "URL: " + ( document.URL || "" ) + "\n";
    
            if ( App.userAgent.browser ) {
                detail += "Browser: " + App.userAgent.browser.name + " " + App.userAgent.browser.version + "\n";
            }

            if ( App.userAgent.os ) {
                detail += "OS: " + App.userAgent.os.name + " " + App.userAgent.os.version + "\n"; 
            }

            detail += "Message: " + data.msg + "\n";    

            exception = new ExceptionModel({
                "callStack": data.stack ? data.stack : "",
                "detail": detail,
                "exceptionCode": eventName,
                "lineNo": "",
                "moduleName": parts[1], 
                "sessionKey": App.models.userSession.get("sessionKey"), 
                "summary": data.friendlyMsg 
            });

            exception.save( );

            App.exceptions += 1;
        }

        if ( App.config.debug ) {

            if ( type == "error" ) {
                console.error( ( new Date( ) ).getTime() + ' Event Name "' + eventName + '"');
            } else {
                console.info( ( new Date( ) ).getTime() + ' Event Name "' + eventName + '"');
            }

            if ( typeof data === 'object' ) {
                console.dir( data );
               
                if ( data.stack ) {
                    console.log( data.stack );
                } 
            }
        }

        // Trigger alert box
        if ( typeof data === 'object' && data.showAlert ) {

            App.views.App.renderAlert( data );
        }

        // Trigger message page
        if ( typeof data === 'object' && data.showMessage && App.views.App ) {

            App.views.App.renderMessage( data );
        }
    });


    return AppEvents;
});