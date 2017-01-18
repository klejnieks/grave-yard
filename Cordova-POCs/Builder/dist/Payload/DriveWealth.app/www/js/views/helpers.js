// Generic hepler functions to be used in templates by views
define( ['numeral'], function() {

    var helpers = {};

    helpers.formatMoney = function( amount, showSymbol, scale ) {

        showSymbol = showSymbol === false ? false : true;

        // Number of places to right of decimal...default to 2
        scale = scale || 2;
    
        // If no value for amount is passed in, do not display anything
        if ( typeof amount === 'undefined' || ( !amount && amount !== 0 ) ) {
            return 'n/a';
        }

        return ( showSymbol ? '$' : '' ) + numeral( amount ).format("0,0." + ( new Array( scale + 1 ) ).join("0") );
    };

    // Just like format money, except sign is extracted out before symbol (e.g., '- $4.99')
    helpers.formatMoneySignSymbol = function( amount ) {

        if ( typeof amount === 'undefined' || ( !amount && amount !== 0 ) ) {
            return '';
        }

        return helpers.extractSign( amount ) + " " + helpers.formatMoney( helpers.removeSign( amount ) );
    };

    // Return amount rounded to nearest whole dollar
    helpers.formatDollars = function( amount ) {
    
        // If no value for amount is passed in, do not display anything
        if ( typeof amount === 'undefined' || ( !amount && amount !== 0 ) ) {
            return '';
        }

        return '$' + numeral( amount ).format('0,0');
    };

    helpers.extractSign = function( amount ) {

        if ( typeof amount === "undefined" || ( !amount && amount !== 0 ) ) {
            return "";
        }

        return ( +(numeral( amount ).format("0.00")) >= 0 ) ? '+' : '-';
    };

    helpers.removeSign = function ( amount ) {

        return Math.abs( amount );
    };

    helpers.formatOrderType = function( ordType ) {
      
        var orderType = "";
 
        if ( ordType == 1 ) {
            orderType = "Market";
        } else if ( ordType ==2 ) {
            orderType = "Limit";  
        } else {
            orderType = "Stop";
        }
        return orderType; 
    };

    helpers.formatOrderSide = function( side ) {
        
        return side == 'B' ? 'Buy' : 'Sell';
    };

    helpers.formatOrderSidePast = function( side ) {

        return side == "B" ? "Bought" : "Sold";
    };

    helpers.formatOrderSideType = function( side, ordType ) {

        var display;

        display = helpers.formatOrderSide( side );

        // Only add type if it's a stop or limit order
        display += ( ordType == 2 || ordType == 3 ) ? '<br>' + helpers.formatOrderType( ordType ) : ''; 

        return display;
    };

    helpers.formatTags = function( tags ) {

        var numTags = $.isArray( tags ) ? tags.length : 0,
            i = 0,
            formattedTags = "";

        for ( i; i < numTags; i++ ) {
            formattedTags += " #" + tags[i];
        }
    
        return formattedTags;
    };

    helpers.getImage = function( images ) {

        //--> TODO: return default image
        return $.isArray( images ) && images.length > 0 ? images[0] : ''; 
    };

    helpers.formatWholePercent = function( ratio ) {

        return numeral( ratio ).format('0%');
    };

    helpers.formatPercent = function( ratio ) {

        return numeral( ratio ).format("0.00%");
    };

    helpers.formatMoneyAndPercent = function( rate, ratio ) {
        return helpers.extractSign( rate ) + helpers.formatMoney( helpers.removeSign( rate ) ) + " (" + helpers.formatPercent( ratio ) + ")";
    };

    helpers.capitalizeFirst = function( string ) {
        return ( string ? string : "" ).charAt(0).toUpperCase() + ( string ? string : "" ).slice(1);
    };
 
    helpers.capitalizeEach = function( string ) {
        return string.replace(/\w\S*/g, function(txt){
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    };

    helpers.formatText = function( text ) {

        text = text.replace( /\\n/gi, "<br>" );

        return text;
    };

    helpers.createSlug = function( text ) {

        text = text || "";

        return text
            .toLowerCase()
            .replace(/ /g,'-')
            .replace(/[^\w-]+/g,'');
    };

    helpers.escapeHtml = function( text ) {

        var entity = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': '&quot;',
            "'": '&#39;',
            "/": '&#x2F;'
        };

        return String(text).replace(/[&<>"'\/]/g, function (s) {
            return entity[s];
        });
    };

    helpers.formatFlashRate = function( rate, prevRate, rateChange, showSymbol ) {

        showSymbol = showSymbol || true;

        var newRate = "",
            i = 0,
            rateLength;

        rate = helpers.formatMoney( rate, showSymbol );

        rateLength = rate.length; 

        if ( prevRate ) {

            prevRate = helpers.formatMoney( prevRate, showSymbol );

            for (; i < rateLength; i++ ){
                if ( rate[i] == prevRate[i] ) {
                    newRate += rate[i]; 
                } else {
                    newRate += "<span class=\"" + ( rateChange > 0 ? "rate-up" : "rate-down" ) + "\">" + rate.substring(i) + "</span>";
                    break;
                }
            } 
        } 

        return newRate || rate; 
    };

    helpers.getUrlParts = function( url ) {
        return ( url ? url : "" ).match(/[\w\-\.!~\*\'"(),]+/g);
    };

    return helpers;
});
