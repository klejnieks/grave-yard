define([
  'backbone'
], function (Backbone) {

  return Backbone.Collection.extend({

    url: function() {
      return 'data/default-products.json';
    }
  });
});