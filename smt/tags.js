'use strict';

smt.export('tags', function (smt, undefined) {
  var api = smt.import('api');
  var tags = [];

  return {
    create: function() {
      api.getTags().then((ref) => {
        ref.forEach((doc) => {
          tags.push({label: doc.id, value: doc.id });
        });
      });
      return {
        getAll: function() {
          return tags;
        }
      };
    }
  }
});
