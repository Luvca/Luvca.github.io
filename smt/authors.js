'use strict';

smt.export('authors', function (smt, undefined) {
  var api = smt.import('api');
  var authors = [];

  return {
    create: function() {
      api.getAuthors().then((ref) => {
        ref.forEach((doc) => {
          authors.push({label: doc.id, value: doc.id });
        });
      });
      return {
        getAll: function() {
          return authors;
        }
      };
    }
  }
});
