define([
  'backbone'
], function(Backbone) {

  return Backbone.Collection.extend({

    url: function() {
      return 'data/goal-categories.json';
    }
  });
});