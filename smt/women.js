'use strict';

smt.export('women', function (smt, undefined) {
  var api = smt.import('api');
  var women = [];

  return {
    create: function() {
      api.getWomen().then((ref) => {
        ref.forEach((doc) => {
          women.push(doc.id);
        });
      });
      return {
        getAll: function() {
          return women;
        },

        getAllSelectPure: function() {
          return women.map((a) => {return {label: a, value: a}});
        },

        add: function(woman) {
          women.push(woman.id);
          women.sort();
        }
      };
    }
  }
});
