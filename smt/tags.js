'use strict';

smt.export('tags', function (smt, undefined) {
  var api = smt.import('api');
  var tags = [];

  return {
    create: function() {
      api.getTags().then((ref) => {
        ref.forEach((doc) => {
          tags.push({name: doc.id, phoneticName: doc.data().phoneticName});
        });
      });
      return {
        getAll: function() {
          return tags.sort((a, b) => {
            return (a.phoneticName < b.phoneticName ? -1 : 1);
          }).map((t => t.name));
        },

        getAllSelectPure: function() {
          return tags.sort((a, b) => {
            return (a.phoneticName < b.phoneticName ? -1 : 1);
          }).map((a) => {return {label: a.name, value: a.name}});
        },

        add: function(tag) {
          tags.push({name: tag.id, phoneticName: tag.fields.phoneticName});
          tags.sort((a, b) => {
            return (a.phoneticName < b.phoneticName ? -1 : 1);
          });
        }
      };
    }
  }
});
