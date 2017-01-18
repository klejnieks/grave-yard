define([
    "backbone",
    "App",
    "App.Events",
    "App.Models.Report",
    "App.Collections.Reports",
    "App.Views.ReportsList",
    "ladda",
    "text!templates/reports.html",
    "text!templates/reports-form.html",
    "picker",
    "pickerDate",
    "moment"
], function( Backbone, App, AppEvents, ReportModel, ReportsCollection, ReportsListView, Ladda, reportsTemplate, reportsFormTemplate, picker, pickerDate, moment) {

    var ReportsView = Backbone.View.extend({

        submitButton: null,

        reportSubmitted: false,

        events: {
          "click .dds-item"                 : "selectNameDropDown",
          "change input[name='time-range']" : "selectTime",
          "change input[name='custom-date']": "resetLayout",
          "submit form#report-form"         : "getReport"
        },

        initialize: function( options ) {

            // setting up default "this week" date on the model
            var now = moment().utc(),
                defaultEndDate = now.format("YYYY-MM-DDT[23:59:59.999Z]"),
                start_initial_date = now.day(7).day(-7),
                defaultStartDate = moment(start_initial_date).utc().format("YYYY-MM-DDT[00:00:00.000Z]");

            this.model = new ReportModel();

            this.template = _.template( reportsTemplate );

            this.templateForm = _.template( reportsFormTemplate );

            this.model.set("DateStart", defaultStartDate);

            this.model.set("DateEnd", defaultEndDate);

            this.listenTo( AppEvents, "reports:loaded", function( ) {
                this.submitButton.stop( );
                this.$('#request-report-submit').hide();
            }, this);

            App.views.App.renderActionTitle({
                   "title": App.polyglot.t("Request Report")
            });

            this.model.on("change:DateStart", this.resetLayout , this);
            this.model.on("change:DateEnd", this.resetLayout , this);
        },

        render: function() {

            var data = { "polyglot":  App.polyglot },
                from_$input,
                from_picker,
                to_$input,
                to_picker;

            this.$el.empty().html( this.template( data ) );


            from_$input = $('#start_date').pickadate({
                    max: true,
                    container: "body"
                  });
            from_picker = from_$input.pickadate('picker');

            to_$input = $('#end_date').pickadate({
                  max: true,
                  container: "body"
                });
            to_picker = to_$input.pickadate('picker');

            if ( from_picker.get('value') ) {
              to_picker.set('min', from_picker.get('select'));
            }
            if ( to_picker.get('value') ) {
              from_picker.set('max', to_picker.get('select') );
            }

            from_picker.on('set', function(event) {
              if ( event.select ) {
                to_picker.set('min', from_picker.get('select'));
              }
            });
            
            to_picker.on('set', function(event) {
              if ( event.select ) {
                from_picker.set('max', to_picker.get('select'));
              }
            });

            this.submitButton = Ladda.create( this.$("#request-report-submit")[0] );

            this.$reportForm = this.$("#report-form").foundation();

            $(document).foundation();

            return this;
        },

        removeView: function() {

            this.stopListening();
            this.undelegateEvents();
            this.resetLayout();
        },

        selectNameDropDown: function(e) {
            this.resetLayout();
            var $target = $(e.currentTarget),
                name = $target.data("report-name"),
                fullName = $target.children().find('.dds-item-name').text(),
                fullDesc = $target.children().find('.dds-item-desc').text(),
                reportButtonName = this.$('#report-drop-btn').find('.dds-item-name'),
                reportButtonDesc = this.$('#report-drop-btn').find('.dds-item-desc'),
                activeIcon = $target.siblings().children().find('.icon-answered'),
                targetIcon = $target.children().find('.icon-answered');
            this.model.set("reportName", name);
            if ( !(App.models.account.get("reportName") == $target.data("report-name"))) {
              reportButtonName.text(fullName);
              reportButtonDesc.text(fullDesc);
              activeIcon.removeClass('active');
              targetIcon.addClass('active');
              this.setModelReportName(name);
            }
        },

        setModelReportName: function(name) {
          if (name == "PositionRestingOrder") {
            this.$(".date-range-container").slideUp();
            this.$(".custom-date-inputs").slideUp();
            this.$(".format-group-nav").slideDown("slow");
          } else if (name == "Statement" || name == "Trade Confirm") {
            this.$(".format-group-nav").slideUp();
            this.$(".date-range-container").slideDown("slow");
            if ( this.$("input[name=time-range]:checked").val( ) === "custom" ) {
                this.$(".custom-date-inputs").show( );
            }
          } else if (name == "FinTrans" || name == "OrderTrans") {
            this.$(".date-range-container").slideDown("slow");
            this.$(".format-group-nav").slideDown("slow");
            if ( this.$("input[name=time-range]:checked").val( ) === "custom" ) {
                this.$(".custom-date-inputs").show( );
            }
          } else if (name == "1099-B" || name == "Instrument") {
            this.$(".date-range-container").slideUp();
            this.$(".custom-date-inputs").slideUp();
            this.$(".format-group-nav").slideUp();
          };
        },

        resetLayout: function() {
          this.$('#request-report-submit').show();
          if (App.views.reportsList) App.views.reportsList.$el.empty();
          if (App.views.reportsList) App.views.reportsList.removeView();

        },


        selectTime: function(e) {

            var value =     $(e.currentTarget).val(),
                end_date =  moment();

            e.preventDefault();

            this.$("#start_date, #end_date").prop("required", false);

            this.$(".custom-date-inputs").slideUp();

            switch (value) {
                case "week":
                    start_date = moment().day(7).day(-7);
                    break;
                case "month":
                    var days = moment().date() - 1;
                    start_date = moment().subtract("days", days);
                    break;
                case "year":
                    var year = moment().year();
                    start_date = moment().set('year', year).set('month', 0).set('date', 1);
                    break;
                case "custom":
                    start_date = undefined;
                    this.setCustomDate();
                    break;
                default:
                    start_date = end_date = null;
            }

            if (start_date && end_date) {

                this.model.set("DateStart", moment(start_date).utc().format("YYYY-MM-DDT[00:00:00.000Z]"));

                this.model.set("DateEnd", moment(end_date).utc().format("YYYY-MM-DDT[23:59:59.999Z]"));
            };
        },

        setCustomDate: function() {

            this.$("#start_date, #end_date").prop("required", true);

            this.$(".custom-date-inputs").slideDown();

            this.model.set("DateStart", undefined);

            this.model.set("DateEnd", undefined);
        },

        getStartDate: function() {

            var reportName = this.model.get("reportName");

            if (reportName != "PositionRestingOrder" || reportName != "1099-B" || reportName != "Instrument") {

                if (this.model.get("DateStart") === undefined) {

                    return moment(new Date(this.$('#start_date').val()).toISOString()).format("YYYY-MM-DDT[00:00:00.000Z]");

                } else {

                    return this.model.get("DateStart");
                }
            } else {

                return "";
            }
        },

        getEndDate: function() {

            var reportName = this.model.get("reportName");

            if (reportName != "PositionRestingOrder" || reportName != "1099-B" || reportName != "Instrument") {

                if (this.model.get("DateEnd") === undefined) {

                    return moment(new Date(this.$('#end_date').val()).toISOString()).format("YYYY-MM-DDT[23:59:59.999Z]");

                } else {

                    return this.model.get("DateEnd");
                }
            } else {

                return "";
            }
        },

        getReport: function(e) {
          e.preventDefault();
          var name = this.model.get("reportName");
          if ( name == "Statement" || name == "Trade Confirm" || name == "1099-B" ) {
            this.submitButton.start( );
            this.listStatementsAndConfirms(name);
          } else {
            this.requestReport();
          }
        },

        listStatementsAndConfirms: function(name) {
          var type;
           if (name == "Statement") {
             type = "02";
           } else if ( name == "Trade Confirm" ) {
             type = "01";
           } else if ( name == "1099-B" ) {
             type = "03";
           }
          this.collection = new ReportsCollection();
          if ( name == "1099-B" ) {
            this.collection.fetch({
                reset: true,
                data: {
                  accountID: App.models.account.get("accountID"),
                  type: type
                }
              });
          } else {
            this.collection.fetch({
                reset: true,
                data: {
                  accountID: App.models.account.get("accountID"),
                  type: type,
                  startDate: this.getStartDate(),
                  endDate: this.getEndDate()
                }
              });
          }
          App.views.reportsList = new ReportsListView({
              el: '#reports-list',
              collection: this.collection,
              reportName: name
          });

        },

        requestReport: function(e) {

            var form,
                reportData,
                reportName = this.model.get("reportName");

            if ( !this.reportSubmitted ) {

                this.reportSubmitted = true;

                this.submitButton.start( );

                // Remove existing alerts if they exist
                App.views.App.removeAlerts();

                if ( App.config.buildType === "phonegap" ) {

                    reportData = {
                        "reportname"   :  reportName,
                        "reportformat" :  this.$("input[name='format']:checked").val(),
                        "datestart"    :  this.getStartDate(),
                        "dateend"      :  this.getEndDate(),
                        "url"          :  App.config.report( ),
                        "sessionkey"   :  App.models.userSession.get("sessionKey"),
                        "buildtype"    :  App.config.buildType,
                        "LanguageID"   :  App.models.userSession.get("languageID"),
                        "WlpId"        :  App.config.WLPID
                    };

                    if ( reportName === "CoinTrans" ) {
                        _.extend( reportData, {
                            "userid": App.models.userSession.get("userID")
                        });
                    } else if ( reportName === "ReferralSummaryPerformance" ) {
                        _.extend( reportData, {
                            "userid":       App.models.userSession.get("userID"),
                            "accounttype":  App.models.account.get("accountType")
                        });
                    } else if ( reportName === "Instrument" ) {
                        _.extend( reportData, {
                            "TradeStatus":     "1",
                            "InstrumentType":  "-1"
                        });
                    } else {
                        _.extend( reportData, {
                            "accountnumber":  App.models.account.get("accountNo")
                        });
                    }

                    window.open( App.config.externalDomain( ) + "/report-redirect?" + $.param( reportData ), "_system");

                } else {

                    reportData = {
                        "ReportName"   :  reportName,
                        "ReportFormat" :  this.$("input[name='format']:checked").val(),
                        "DateStart"    :  this.getStartDate(),
                        "DateEnd"      :  this.getEndDate(),
                        "url"          :  App.config.report( ),
                        "sessionKey"   :  App.models.userSession.get("sessionKey"),
                        "buildType"    :  App.config.buildType,
                        "LanguageID"   :  App.models.userSession.get("languageID"),
                        "WlpId"        :  App.config.WLPID
                    };

                    if ( reportName === "CoinTrans" ) {
                        _.extend( reportData, {
                            "UserId": App.models.userSession.get("userID")
                        });
                    } else if ( reportName === "ReferralSummaryPerformance" ) {
                        _.extend( reportData, {
                            "IbUserId":     App.models.userSession.get("userID"),
                            "AccountType":  App.models.account.get("accountType")
                        });
                    } else if ( reportName === "Instrument" ) {
                        _.extend( reportData, {
                            "TradeStatus":     "1",
                            "InstrumentType":  "-1"
                        });
                    } else {
                        _.extend( reportData, {
                            "AccountNumber":  App.models.account.get("accountNo")
                        });
                    }

                    // Build form element and submit
                    form = this.templateForm( reportData );

                    $( form ).appendTo( this.el ).submit( ).remove( );
                }

                this.submitButton.stop( );

                this.reportSubmitted = false;

            }
        },

        onReportSent: function() {

          AppEvents.trigger("v::report::success", {
              removeAlerts: true,
              showAlert: false,
              friendlyMsg: App.polyglot.t("views_report_create_success"),
              msg: "Report request successfully sent."
          });
        }
    });

    return ReportsView;
});
