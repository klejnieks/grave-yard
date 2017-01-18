define([
    "backbone",
    "App",
    "App.Events",
    "numeral",
    "moment"
], function ( Backbone, App, AppEvents, numeral, moment ) {

    var InstrumentModel = Backbone.Model.extend({

        defaults: { 
            barData: {}
        },

        idAttribute: "instrumentID",

        url: function( ) {
            return App.config.api( ) + "/v1/instruments/" + this.id + "?options=F";
        },

        initialize: function() {
  
            this.type = "instrument";
 
            this.updateRates();
        },

        bars: {},

        // Update the rate change since open
        updateRates: function( data ) {

            data = data || {};

            var rateAsk,
                rateBid,
                rateOpen, 
                prevRateAsk = this.get("rateAsk"),
                prevRateBid = this.get("rateBid"),
                rateChangeOpen,
                rateChangeAskFlash,
                rateChangeBidFlash;

            rateAsk = data.rateAsk || this.get("rateAsk");

            rateBid = data.rateBid || this.get("rateBid");

            rateOpen = data.rateOpen || this.get("rateOpen");

            if ( rateOpen ) {
                rateChangeOpen = rateAsk - rateOpen; 
            }

            if ( prevRateAsk ) {
                rateChangeAskFlash = rateAsk - prevRateAsk;
            }

            if ( prevRateBid ) {
                rateChangeBidFlash = rateBid - prevRateBid;
            }

            this.set({
                "rateAsk":              rateAsk,
                "rateBid":              rateBid,
                "rateOpen":             rateOpen,
                "prevRateAsk":          prevRateAsk,
                "prevRateBid":          prevRateBid,
                "rateChangeOpen":       rateChangeOpen,
                "rateChangeOpenRatio":  ( rateOpen ? rateChangeOpen / rateOpen : null ),
                "rateChangeAskFlash":   rateChangeAskFlash, 
                "rateChangeBidFlash":   rateChangeBidFlash
            });
        },

        // get the chart data
        getBars: function( options ) {

            var timer,
                now = moment( ),
                barsDeferred = $.Deferred( ),
                data = {},
                defaults = {
                    "range": "1Y"
                },
                chartOptions,
                barData = this.get("barData");

            options = options || {};

            if ( App.engageTimer( App.config.apiTimerCaptureRate ) ) {
                timer = new App.Timer( "API", "GET /v1/quotes" );
            }

            options = _.extend( 
                defaults,
                options
            );

            if ( !App.config.chartOptions[ options.range ] ) {
                options.range = defaults.range;
            }

            data.instrumentID = this.id;

            // Does this data already exist and is it fresh?
            if ( barData[ options.range ] && ( moment( ).unix( ) - barData[ options.range ][ "updated" ] < App.config.chartDataExp ) ) {

                barsDeferred.resolveWith( this, [ barData[ options.range ][ "data" ], "success", null ] );

                return barsDeferred;
            }

            chartOptions = App.config.chartOptions[ options.range ];

            data.compression = chartOptions.compression;

            if ( options.range === "5D" || options.range === "1D" ) {

                data.tradingDays = chartOptions.tradingDays; 

            } else {

                data.dateStart = now.clone().subtract( chartOptions.shortUnit, chartOptions.shortValue ).utc().format("YYYY-MM-DDT[00:00:00Z]");

                //data.dateEnd = now.utc().format("YYYY-MM-DDTHH:mm:ss[Z]");
                data.dateEnd = now.utc().add( 1, "d" ).format("YYYY-MM-DDT[00:00:00Z]");
            }
 
            $.ajax({
                "url":  App.config.api( ) + "/v1/bars",
                "data":         data,
                "contentType":  "application/json",
                "accepts":      "application/json",
                "context":      this,
                "type":         "GET",
                "headers": {
                    "accept":                   "application/json",
                    "x-mysolomeo-session-key":  App.models.userSession.get("sessionKey")
                }

            })
            .done(function( response, textStatus, jqXHR ) {

                var i,
                    j,
                    parts,
                    data = [],
                    barData = jQuery.extend( true, {}, this.get("barData") );

                if ( timer ) {
                    timer.end( "success" );
                }


                if ( !response.data ) {

                    AppEvents.trigger("m::instrument::getBars::error", {
                        "msg": "Bars data load fail. No data returned."
                    });

                    barsDeferred.rejectWith( this, [ jqXHR, "error", "Bars load failure. No data returned." ] );

                    return;
                }

                response = response.data.split("|");

                for ( i = 0, j = response.length; i < j; i++ ) {

                    parts = response[i].split(",");

                    // Convert data to proper format
                    //--> TODO: check for valid data??
                    data.push({
                        "date":   moment( parts[0] ).toDate(),
                        "open":   +parts[1],
                        "high":   +parts[2],
                        "low":    +parts[3],
                        "close":  +parts[4],
                        "vol":    +parts[5] 
                    }); 
                } 

                //data = _.sortBy( data, function( d ) { return d.date } );

                barData[ options.range ] = { 
                    "data": data,
                    "updated": moment( ).unix( )
                };

                this.set( "barData", barData );
 
                AppEvents.trigger("m::instrument::getBars::loaded", {
                    "msg": "Bars data loaded"
                });

                barsDeferred.resolveWith( this, [ data, "success", jqXHR ] );

            })
            .fail(function( jqXHR, textStatus, errorThrown ){

                if ( timer ) {
                    timer.end( "fail" );
                }

                AppEvents.trigger("m::instrument::getBars::error", {
                    "msg": "Bars data load fail. [status:" + jqXHR.status + "]" + errorThrown
                });

                barsDeferred.rejectWith( this, [ jqXHR, "error", "Bars load failure" ] );

            });

            return barsDeferred; 
        },

        hasData: function( ) {

            return ( this.get("rateAsk") && this.get("rateBid") );
        }
    });

    return InstrumentModel;
});
