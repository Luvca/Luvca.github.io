'use strict';

smt.export('women', function (smt, undefined) {
  var api = smt.import('api');
  var women = [];

  return {
    create: function() {
      api.getWomen().then((ref) => {
        ref.forEach((doc) => {
          women.push({label: doc.id, value: doc.id });
        });
      });
      return {
        getAll: function() {
          return women;
        }
      };
    }
  }
});
