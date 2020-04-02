'use strict';

smt.export('women', function (smt, undefined) {
  var api = smt.import('api');
  var women = [];

  return {
    create: function() {
      api.getWomen().then((ref) => {
        ref.forEach((doc) => {
          women.push({name: doc.id, phoneticName: doc.data().phoneticName});
        });
      });
      return {
        getAll: function() {
          return women.map((w => w.name));
        },

        getAllSelectPure: function() {
          return women.map((w) => {return {label: w.name, value: w.name}});
        },

        add: function(woman) {
          women.push({name: woman.id, phoneticName: woman.fields.phoneticName});
          women.sort((a, b) => {
            return (a < b ? -1 : 1);
          });
        }
      };
    }
  }
});
