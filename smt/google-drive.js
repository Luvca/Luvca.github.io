'use strict';

smt.export('google-drive', function(smt, undefined) {
  function ajax(url, data) {
    return $.ajax({
      url: url,
      type: 'POST',
      headers: {
        'Authorization': `Bearer ${smt.settings.dropboxCode}`,
        'Content-Type': 'application/json'
      },
      dataType: 'json',
      data: data
    })
  }

  return {
    listFolder: function(path) {
      var url = (path.length == 0) ? '1oKkw3icNxyiv56o2WOKiGwAYBmREwXvO' : path;
      return gapi.client.drive.files.list({
        'fields': "nextPageToken, files(id, name, modifiedTime, webContentLink, parents, mimeType)",
        'orderBy': 'name',
        'q': `"${url}" in parents`
      });
    },

    directUrl: function(url) {
      return url.replace('&export=download', '');
    }
  };
});
