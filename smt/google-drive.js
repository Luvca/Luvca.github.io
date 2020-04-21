'use strict';

smt.export('google-drive', function(smt, undefined) {
  return {
    listFolder: function(path) {
      var url = (path.length == 0) ? '1oKkw3icNxyiv56o2WOKiGwAYBmREwXvO' : path;
      return gapi.client.drive.files.list({
        'fields': "nextPageToken, files(id, name, modifiedTime, webContentLink, parents, mimeType, thumbnailLink)",
        'orderBy': 'name',
        'q': `"${url}" in parents`
      });
    },
  };
});
