'use strict';

smt.export('authors', function (smt, undefined) {
  var api = smt.import('api');
  var authors = [];

  return {
    create: function() {
      api.getAuthors().then((ref) => {
        ref.forEach((doc) => {
          authors.push({name: doc.id, phoneticName: doc.data().phoneticName});
        });
      });
      return {
        getAll: function() {
          return authors.map((a) => a.name);
        },

        getAllSelectPure: function() {
          return authors.map((a) => {return {label: a.name, value: a.name}});
        },

        add: function(author) {
          authors.push({name: author.id, phoneticName: author.fields.phoneticName});
          authors.sort((a, b) => {
            return (a < b ? -1 : 1);
          });
        }
      };
    }
  }
});
