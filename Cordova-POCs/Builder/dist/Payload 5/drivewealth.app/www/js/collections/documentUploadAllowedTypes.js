define([
  'backbone'
], function (Backbone) {

  return Backbone.Collection.extend({

    url: function() {
      return 'data/document-upload-allowed-types.json';
    }
  });
});