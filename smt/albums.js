'use strict';

smt.export('albums', function (smt, undefined) {
  var api = smt.import('api');
  var albums = [];

  return {
    create: function() {
      api.getAlbums().then((ref) => {
        ref.forEach((doc) => {
          albums.push(doc.id);
        });
      });
      return {
        getAll: function() {
          return albums;
        },

        getAllSelectPure: function() {
          return albums.map((a) => {return {label: a, value: a}});
        },

        add: function(album) {
          albums.push(album.id);
          albums.sort();
        }
      };
    }
  }
});
