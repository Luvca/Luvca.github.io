'use strict';

smt.export('types', function (smt, undefined) {
  var api = smt.import('api');
  var types = [];

  return {
    create: function() {
      api.getTypes().then((ref) => {
        ref.forEach((doc) => {
          types.push(doc.id);
        });
      });
      return {
        getAll: function() {
          return types;
        }
      };
    }
  }
});
