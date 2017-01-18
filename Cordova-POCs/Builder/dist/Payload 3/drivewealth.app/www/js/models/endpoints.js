define([
    'backbone',
    'App'
], function (Backbone, App) {

    var EndpointsModel = Backbone.Model.extend({

        defaults: {
          endpoints: {}
        },

        initialize: function (options) {
          
        var endpoints = {
              api: {
                  UAT:   'http://api.drivewealth.io',
                  PROD:  'https://api.drivewealth.net'
              },
              cdn: {
              	 UAT:   'http://syscdn.drivewealth.io',
                   PROD:  'https://d3an3cesqmrf1x.cloudfront.net'
              },
              applicationLink: {
                  UAT:   'https://fs24.formsite.com/DriveWealth/uat-online-app-en_US/fill?id160=',
                  PROD:  'https://fs24.formsite.com/DriveWealth/online-app-en_US/fill?id160='
              },
              report: {
                  UAT:   'http://reports.drivewealth.io/DriveWealth',
                  PROD:  'https://reports.drivewealth.net/DriveWealth'
              },
              externalDomain: {
                  UAT:   'http://you.drivewealth.io',
                  PROD:  'https://you.drivewealth.com'
              },
              appsDomain: {
                  UAT:   'http://apps.drivewealth.io',
                  PROD:  'https://apps.drivewealth.com'
              }
          };
          
          // Set get example.
          this.set('endpoints', endpoints);
        }
    });
    
    return EndpointsModel;
});