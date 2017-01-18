define([
    'backbone',
    'App'
], function (Backbone, App) {

    var ApplicationModel = Backbone.Model.extend({

        defaults: {
          foo: 'bar'
        },

        initialize: function (options) {
          
          // Set get example.
          this.set('bar', this.get('foo'));
        }
    });
    
    return ApplicationModel;
});