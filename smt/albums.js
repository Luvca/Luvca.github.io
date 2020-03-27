'use strict';

smt.export('albums', function (smt, undefined) {
  var api = smt.import('api');
  var albums = [];

  return {
    create: function() {
      api.getAlbums().then((ref) => {
        ref.forEach((doc) => {
          albums.push({label: doc.id, value: doc.id });
        });
      });
      return {
        getAll: function() {
          return albums;
        }
      };
    }
  }
});
