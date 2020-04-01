'use strict';

smt.export('tags', function (smt, undefined) {
  var api = smt.import('api');
  var tags = [];

  return {
    create: function() {
      api.getTags().then((ref) => {
        ref.forEach((doc) => {
          tags.push(doc.id);
        });
      });
      return {
        getAll: function() {
          return tags;
        },

        getAllSelectPure: function() {
          return tags.map((a) => {return {label: a, value: a}});
        },

        add: function(tag) {
          tags.push(tag.id);
          tags.sort();
        }
      };
    }
  }
});
