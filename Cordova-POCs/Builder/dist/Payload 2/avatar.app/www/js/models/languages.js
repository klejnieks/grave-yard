define([
    'backbone',
    'App'
], function (Backbone, App) {

    var LanguagesModel = Backbone.Model.extend({

        defaults: {
          languages: []
        },

        initialize: function (options) {
          
          var languages = [{
                  languageID:  'en_US',
                  nameEnglish: 'English',
                  nameNative:  'English',
                  langCode:    'en'
              },
              {
                  languageID:   'zh_CN',
                  nameEnglish:  'Chinese',
                  nameNative:   '简体中文',
                  langCode:     'zh'
              },
              {
                  languageID:   'es_ES',
                  nameEnglish:  'Spanish',
                  nameNative:   'Español',
                  langCode:     'es'
              },
              {
                  languageID:   'pt_BR',
                  nameEnglish:  'Portuguese',
                  nameNative:   'Português',
                  langCode:     'pt'
              }
          ];
          
          this.set('languages', languages);
        }
    });
    
    return LanguagesModel;
});