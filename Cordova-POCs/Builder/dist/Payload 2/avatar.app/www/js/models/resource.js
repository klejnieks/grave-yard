define([
    'App'
], function ( App ) {
  
    var currentLang = 'en_US';
  
    return {
      get: function (key) {
        return App.config.resources[key][currentLang];
      }
    };
});
