define([
  'backbone'
], function (Backbone) {

  return Backbone.Collection.extend({

    url: function() {
      return 'data/goal-image-allowed-types.json';
    }
  });
});