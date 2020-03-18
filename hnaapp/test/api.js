'use strict';

fbapp.export('api', function(fbapp, undefined) {
  return {
    get: function(url) {
      var testData = [{
          id: 'hoge1',
          name: 'fuga1'
        }, {
          id: 'hoge2',
          name: 'fuga2'
        }];
      return {
        then: function(callback) {
          callback(testData);
        }
      };
    },

    displayProgress: function(isProgress) {
    }
  };
});
