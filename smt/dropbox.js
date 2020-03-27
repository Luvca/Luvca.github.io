'use strict';

smt.export('dropbox', function(smt, undefined) {
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
      return ajax(
        'https://api.dropboxapi.com/2/files/list_folder', 
        JSON.stringify({
          'path': path
        })
      );
    },

    listShare: function(path) {
      return ajax(
        'https://api.dropboxapi.com/2/sharing/list_shared_links', 
        JSON.stringify({
          'path': path,
          'direct_only': true
        })
      );
    },

    createShare: function(path) {
      return ajax(
        'https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', 
        JSON.stringify({
          'path': path
        })
      );
    },

    directUrl: function(url) {
      return url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
    }
  };
});
