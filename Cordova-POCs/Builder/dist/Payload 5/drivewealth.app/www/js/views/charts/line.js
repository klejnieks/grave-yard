define([
    "backbone",
    "App",
    "App.Events",
    "moment",
    "d3",
    "numeral",
    "moment"
], function( Backbone, App, AppEvents, moment, d3, numeral, moment ) {

    var LineChartView = Backbone.View.extend({

        events: {},

        chart: {},

        $chartContainer: null,

        currentAsk: null,

        range: null,

        tickValues: [ ],

        initialize: function( options ) {

            this.currentAsk = this.model.get("rateAsk");

            // Listen for quote update
            this.listenTo( AppEvents, "instruments:quotesUpdated", function( ) {
                this.currentAsk = this.model.get("rateAsk");
            });
        },

        render: function( options ) {

            var _this = this,
                tickFormatter,
                yBuffer,
                bisectDate = d3.bisector( function( d ) { return d.date; }).left,
                correction,
                dateExtent = d3.extent( options.data, function( d ) { return d.date; } );

            this.$chartContainer = $( options.container );

            this.range = options.range;

            this.chart.dims = this.getContainerDims( );

            this.chart.data = options.data;

            this.chart.yMin = d3.min( this.chart.data, function( d ) { return d.close; } );

            this.chart.yMax = d3.max( this.chart.data, function( d ) { return d.close; } );

            correction = this.getCorrection( moment(dateExtent[0]).unix( ), moment(dateExtent[1]).unix( ), this.range );

            if ( this.chart.xScale ) {
                d3.select("#instrument-chart svg").remove( );
            }

            // Generate tick formatter based on range
            tickFormatter = this.getTickFormatter( this.range, correction );

            this.chart.xScale = this.getXScale( this.chart.data, this.chart.dims );

            this.chart.yScale = d3.scale.linear()
                .range([( this.chart.dims.height ), 0]);

            this.chart.xAxis = d3.svg.axis()
                .scale( this.chart.xScale )
                .orient("bottom")
                .tickFormat( tickFormatter );

            if ( this.tickValues.length > 0 ) {
                this.chart.xAxis.tickValues( this.tickValues );
            } else {
                this.chart.xAxis.ticks( this.getTickCount( this.range, correction ) );
            }

            this.chart.yAxis = d3.svg.axis()
                .scale( this.chart.yScale )
                .orient("right")
                .ticks( 5 )
                .tickFormat( function( d ){
                    if ( ( _this.chart.yMax - _this.chart.yMin ) < 2 ) {
                        return d3.format(".1f")( d );
                    } else {
                        return d3.format("d")( d );
                    }
                })
                .tickSize( this.chart.dims.width );

            this.chart.svg = d3.select( options.container ).append("svg")
                .attr( "width", this.chart.dims.contWidth )
                .attr( "height", this.chart.dims.contHeight )
                .attr( "viewBox", "0 0 " + this.chart.dims.contWidth + " " + this.chart.dims.contHeight )
                .attr( "preserveAspectRatio", "xMidYMid" )
              .append("g")
                .attr( "transform", "translate(" + this.chart.dims.margin.left + "," + this.chart.dims.margin.top + ")" );

            yBuffer = ( this.chart.yMax - this.chart.yMin ) * 0.05;

            this.chart.yMin = this.chart.yMin - yBuffer;

            this.chart.yMax = this.chart.yMax + yBuffer;

            this.chart.xMax = d3.max( this.chart.data, function( d ) { return d.date; } );

            this.chart.yScale.domain( [ this.chart.yMin, this.chart.yMax ] );

            this.chart.line = d3.svg.line()
                .x( function( d ) { return _this.chart.xScale( d.date ); })
                .y( function( d ) { return _this.chart.yScale( _this.chart.yMin ); } )
                .interpolate( "linear" );

            this.chart.path = this.chart.svg.append("path")
              .datum( this.chart.data )
              .attr( "class", "area" )
              .attr( "d", this.chart.line );

            this.chart.svg.append("g")
              .attr( "class", "x axis" )
              .attr( "transform", "translate(0," + ( this.chart.dims.height ) + ")" )
              .call( this.chart.xAxis );

            this.chart.svg.append("g")
              .attr( "class", "y axis" )
              .call( this.chart.yAxis );

            this.chart.line.y( function( d ) { return _this.chart.yScale( d.close ); });

            this.chart.path.transition()
              .duration(500)
              .attr( "d", this.chart.line );
        },

        update: function( options ) {

            var _this = this,
                line,
                t,
                yBuffer,
                dateExtent = d3.extent( options.data, function( d ) { return d.date; } );

            if ( !d3.select("path") ) {
                return;
            }

            line = d3.select("path").attr("d");

            this.chart.data = options.data;

            this.range = options.range;

            this.tickValues = [];

            this.chart.yMin = d3.min( this.chart.data, function( d ) { return d.close; } );

            this.chart.yMax = d3.max( this.chart.data, function( d ) { return d.close; } );

            correction = this.getCorrection( moment(dateExtent[0]).unix( ), moment(dateExtent[1]).unix( ), this.range );

            yBuffer = ( this.chart.yMax - this.chart.yMin ) * 0.05;

            this.chart.yMin = this.chart.yMin - yBuffer;

            this.chart.yMax = this.chart.yMax + yBuffer;

            this.chart.xMax = d3.max( this.chart.data, function( d ) { return d.date; } );

            // Generate tick formatter based on range
            tickFormatter = this.getTickFormatter( this.range, correction );

            this.chart.xScale = this.getXScale( this.chart.data, this.chart.dims );

            this.chart.xAxis = d3.svg.axis( )
                .scale( this.chart.xScale )
                .orient("bottom")
                .tickFormat( tickFormatter );

            if ( this.tickValues.length > 0 ) {
                this.chart.xAxis.tickValues( this.tickValues );
            } else {
                this.chart.xAxis.ticks( this.getTickCount( this.range, correction ) );
            }

            this.chart.yScale.domain( [ this.chart.yMin, this.chart.yMax ] );

            this.chart.line.x( function( d ) { return _this.chart.xScale( d.date ); });

            this.chart.line.y( function( d ) { return _this.chart.yScale( d.close ); });

            this.chart.line.interpolate( "linear" );

            this.chart.path.datum( this.chart.data );


            t = this.chart.svg.transition( ).duration(1000);

            t.select("path").attrTween("d", pathTween( this.chart.line( this.chart.data ), 4 ) );

            t.select(".y.axis").call( this.chart.yAxis );

            t.select(".x.axis")
                .style( "opacity", 0 )
                .each( function( ) {

                    d3.select(".x.axis").remove( );

                    _this.chart.svg.append("g")
                      .attr( "class", "x axis" )
                      .attr( "transform", "translate(0," + ( _this.chart.dims.height ) + ")" )
                      .call( _this.chart.xAxis );
                });

            t.select(".price-line-group")
                .style( "opacity", 0 )
                .each( function( ) {

                    d3.select(".price-line-group").remove( );
                });


            function pathTween(d1, precision) {
              return function() {
                var path0 = this,
                    path1 = path0.cloneNode(),
                    n0 = path0.getTotalLength(),
                    n1 = (path1.setAttribute("d", d1), path1).getTotalLength();

                // Uniform sampling of distance based on specified precision.
                var distances = [0], i = 0, dt = precision / Math.max(n0, n1);
                while ((i += dt) < 1) distances.push(i);
                distances.push(1);

                // Compute point-interpolators at each distance.
                var points = distances.map(function(t) {
                  var p0 = path0.getPointAtLength(t * n0),
                      p1 = path1.getPointAtLength(t * n1);
                  return d3.interpolate([p0.x, p0.y], [p1.x, p1.y]);
                });

                return function(t) {
                  return t < 1 ? "M" + points.map(function(p) { return p(t); }).join("L") : d1;
                };
              };
            }
        },

        getContainerDims: function( ) {

            var data = {
                "margin": {
                    "top": 5,
                    "right": 30,
                    "bottom": 20,
                    "left": 5
                },
                "contWidth": this.$chartContainer.width( )
            };

            data.contHeight = ( App.config.chartHeightRatio[ App.layoutSize ] * data.contWidth );

            data.width =  data.contWidth - data.margin.left - data.margin.right;

            data.height = data.contHeight - data.margin.top - data.margin.bottom;

            return data;
        },

        getTickFormatter: function( range, correction ) {

            var format;

            if ( correction && correction.range ) {
                range = correction.range;
            }

            switch ( range ) {

                case "2Y":
                    format = d3.time.format("%Y");
                    break;

                case "3M":
                    format = d3.time.format("%b");
                    break;

                case "1M":
                    format = d3.time.format("%b %e");
                    break;

                case "5D":
                    format = d3.time.format("%a");
                    break;

                case "1D":
                    format = d3.time.format("%-I %p");
                    break;

                // Default is first letter of month
                case "1Y":
                default:
                    format = function( d ) {
                        return d3.time.format("%b")( d ).substr( 0, 1 );
                    };
                    break;
            }

            return function( d ) {
                return format( d );
            };
        },

        getTickCount: function( range, correction ) {

            var count;

            if ( correction && correction.range ) {
                range = correction.range;
            }

            switch ( range ) {

                case "2Y":
                    count = 6;
                    break;

                case "1Y":
                    count = 12;
                    break;

                case "3M":
                    count = 4;
                    break;

                case "1M":
                    count = 7;
                    break;

                case "5D":
                    count = 6;
                    break;

                case "1D":
                    count = 6;
                    break;

                default:
                    count = 10;
                    break;
            }

            if ( correction && correction.percent ) {
                count = Math.floor( count * correction.percent );
            }

            return count;
        },

        // Returns an appropriate range and percent correction if data is missing
        //  e.g. IPO stock with 3 months of data might return this for a 1Y range
        //       correction = {
        //          range: "3M",
        //          percent: 0.25
        //       }
        getCorrection: function ( min, max, range ) {

            var correction,
                dataDelta,
                dataMissing,
                expected = (App.config.chartOptions[ range ]).length,
                limit = (App.config.chartOptions[ range ]).corLimit,
                newRange,
                newPercent;

            dataDelta = max - min;

            dataMissing = getPercentMissing( dataDelta, expected );

            if ( dataMissing > limit ) {

                correction = findNearestRange( dataDelta, range );

            } else if ( dataMissing > App.config.chartTickCorrection ) {

                correction = {
                    percent: ( dataDelta / expected )
                };
            }

            function getPercentMissing( delta, expected ) {
                return ( ( expected - delta ) / expected );
            }

            function findNearestRange( delta, range ) {

                var diff = Math.abs( App.config.chartOptions[ range ].length - delta ),
                    percent = delta / App.config.chartOptions[ range ].length;

                _.each( App.config.chartOptions, function ( chart, key ) {
                    if ( Math.abs( chart.length - delta ) < diff ) {
                        range = key;
                        diff = Math.abs( chart.length - delta );
                        percent = delta / chart.length;
                    }
                });

                return {
                    range: range,
                    percent: percent
                };
            }

            return correction;
        },

        getXScale: function( data, chartDims ) {

            var scale,
                dates,
                days,
                domain = [ ],
                range = [ ],
                width = chartDims.width,
                rangeStart,
                lastDay,
                lastMin,
                lastMax,
                lastRange = 0,
                daysDiff,
                daysCount = 1,
                maxDate,
                now,
                tradeEnd,
                i,
                _this = this;

            switch ( this.range ) {

                case "1D":

                    domain.push( d3.min( data, function( d ) { return d.date; } ) );

                    // Check if we're on the same day as the last data point
                    maxDate = moment( d3.max( data, function( d ) { return d.date; } ) );

                    now = moment( );

                    if ( maxDate.day( ) === now.day( ) ) {

                        // Check if it's before the end of trading for the day
                        //--> TODO: Use the actual end of trading for the instrument instead of generic 4:30 EST
                        tradeEnd = moment( now.format("YYYY-MM-DD") + "T16:30:00.000-0500" );

                        if ( now.valueOf( ) < tradeEnd.valueOf( ) ) {
                            // Pad the domain with empty data points to push chart out to close
                            maxDate = tradeEnd;
                        }
                    }

                    domain.push( maxDate.toDate( ) );

                    scale = d3.time.scale()
                        .domain( domain )
                        .range([0, ( chartDims.width ) ]);
                    break;

                case "5D":

                    // Map the dates to an array javascript date objects
                    dates = _.map( data, function( d ) { return d.date; } );

                    // Group by the date with the key as the date and the value as an array of js date objects
                    dates = _.groupBy( dates, function( d ) { return moment( d ).format("MM/DD/YYYY"); } );

                    // Create an array of date strings 'MM/DD/YYYY' in ascending order
                    days = _.sortBy( _.keys( dates ), function( d ) { return new Date( d ); } );

                    // Build up the domain and ranges for the last 5 days...add days missing with range of 0
                    _.each( days, function( d ) {

                        // Check if a day has already been processed
                        if ( lastDay ) {

                            // Get the amount of days difference since the last day processed
                            daysDiff = moment( d, "MM/DD/YYYY" ).diff( moment( lastDay, "MM/DD/YYYY" ), "days" );

                            // Add padding if more than one day (market was closed)
                            for ( i = 1; i < daysDiff; i++ ) {

                                domain.push( moment( lastMax ).add( i - 1, "day" ).toDate() );

                                range.push( lastRange );
                            }
                        }

                        lastMin = d3.min( dates[ d ] );

                        lastMax = d3.max( dates[ d ] );

                        domain.push( lastMin );

                        domain.push( lastMax );

                        range.push( lastRange );

                        // Calculate range width based on day count
                        rangeValue = ( daysCount * width ) / days.length;

                        range.push( rangeValue );

                        // Add date as a tick value
                        _this.tickValues.push( new Date( d ) );

                        lastDay = d;

                        lastRange = rangeValue;

                        daysDiff = null;

                        daysCount++;
                    });

                    scale = d3.time.scale()
                          .domain( domain )
                          .range( range );
                    break;

                default:
                    scale = d3.time.scale()
                        .domain( d3.extent( data, function( d ) { return d.date; } ) )
                        .range([0, ( chartDims.width ) ]);
                    break;
            }

            return scale;
        },

        removeView: function( ){

            this.stopListening();

            this.undelegateEvents();

            this.chart = null;
        },

        resize: function( ) {

            var svg,
                chartDims =  this.$chartContainer ? this.getContainerDims( ) : undefined;

            if ( chartDims ) {
                d3.select("svg")
                  .attr( "width", chartDims.contWidth )
                  .attr( "height", chartDims.contHeight );
            }
        }
    });

    return LineChartView;
});
