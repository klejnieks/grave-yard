define([
  'backbone'
], function (Backbone) {

  return Backbone.Collection.extend({

    url: function() {
      return 'data/public-sections.json';
    }
  });
});