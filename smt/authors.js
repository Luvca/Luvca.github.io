'use strict';

smt.export('authors', function (smt, undefined) {
  var api = smt.import('api');
  var authors = [];

  return {
    create: function() {
      api.getAuthors().then((ref) => {
        ref.forEach((doc) => {
          authors.push(doc.id);
        });
      });
      return {
        getAll: function() {
          return authors;
        },

        getAllSelectPure: function() {
          return authors.map((a) => {return {label: a, value: a}});
        },

        add: function(author) {
          authors.push(author.id);
          authors.sort();
        }
      };
    }
  }
});
