define([
    'backbone'
], function (Backbone) {

  return Backbone.Collection.extend({

    url: function() {
      return 'data/languages.json';
    }
  });
});