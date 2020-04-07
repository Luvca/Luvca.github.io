'use strict';

var app = app || {};

(function(app) {
  var api = smt.import('api');
  var view = smt.import('view').create();
  var inProgress = false;

  $(function() {
    try {
      // Common
      $(document).on('click', '.fb-close-dialog', app.closeDialog);
      // Search
      $('#fb-humburger-button').on('click', true, app.setupSearch);
      $(document).on('click', '.fb-search', app.selectSearchText);
      $(document).on('DOMSubtreeModified', '.select-pure__select', app.selectSearchText);
      $('#fb-search-heart').on('click', app.setLoveFilter);
      $('#fb-search-posts-button').on('click', {reset: true}, app.searchPosts);
      $('#fb-show-settings-button').on('click', false, app.showSettings);
      // List
      $('#fb-add-post-button').on('click', false, app.addPost);
      $('#fb-test-button').on('click', false, app.test);
      $('#fb-read-next-button').on('click', {reset: false}, app.searchPosts);
      $(document).on('click', '.fb-reset', app.reset);
      $(document).on('click', '.fb-back-to-top', app.backToTop);
      $(document).on('click', '.fb-set-opacity', app.setOpacity);
      // Card
      $(document).on('click', '.fb-edit-post-button', app.editPost);
      $(document).on('click', '.fb-copy-post-button', app.copyPost);
      // Edit Dialog
      $('#fb-add-url-button').on('click', app.addUrl);
      $('#fb-add-images-button').on('click', app.addImages);
      $('#fb-toggle-all-images-select').on('click', app.toggleAllImagesSelect);
      $('#fb-post-heart').on('click', app.toggleLove);
      $(document).on('click', '.fb-copy-url-button', app.copyUrl);
      $(document).on('click', '.fb-paste-url-button', app.pasteUrl);
      $(document).on('click', '.fb-up-url-button', app.upUrl);
      $(document).on('click', '.fb-down-url-button', app.downUrl);
      $(document).on('click', '.fb-delete-url-button', app.deleteUrl);
      $('#fb-add-album-button').on('click', app.addAlbum);
      $('#fb-save-album-button').on('click', app.saveAlbum);
      $('#fb-add-woman-button').on('click', app.addWoman);
      $('#fb-save-woman-button').on('click', app.saveWoman);
      $('#fb-add-author-button').on('click', app.addAuthor);
      $('#fb-save-author-button').on('click', app.saveAuthor);
      $('#fb-add-tag-button').on('click', app.addTag);
      $('#fb-save-tag-button').on('click', app.saveTag);
      $('#fb-save-post-button').on('click', app.savePost);
      $('#fb-delete-post-button').on('click', app.deletePost);
      // Dropbox Dialog
      $('#fb-select-images-button').on('click', app.selectDropboxImages);
      $(document).on('click', '.fb-select-dropbox-folder', app.selectDropboxFolder);
      // Settings Dialog
      $('#fb-save-settings-button').on('click', app.saveSettings);
    } catch(e) {
      api.handleError(e);
    }
  });

  app.setupSearch = function() {
    view.setupSearch();
  };

  app.reset = function () {
    view.setupSearch();
    view.reset();
  };

  app.closeDialog = function(event) {
    view.closeDialog(event);
  };

  app.selectSearchText = function(event) {
    view.selectSearchText(event.target);
  };

  app.setLoveFilter = function(event) {
    var love = $('#fb-search-love').val();
    if (love.length == 0) {
      $('#fb-search-love').val('love');
      $('#fb-search-heart').css('color', 'red').removeClass('fa-heart-o').addClass('fa-heart');
    } else {
      $('#fb-search-love').val('');
      $('#fb-search-heart').css('color', 'gray').removeClass('fa-heart').addClass('fa-heart-o');
    }
  };

  app.searchPosts = function(event) {
    if (inProgress) return;
    inProgress = true;
    try {
      if (event.data.reset) {
        view.reset();
      }
      api.showProgress(true);
      var option = view.getSearchOption();
      api.searchPosts(option).then((res) => {
        view.showPosts(res);
      }).catch((error) => {
        api.handleError(error);
      });
    } catch(e) {
      api.handleError(e);
    } finally {
      inProgress = false;
      api.showProgress(false);
    }
  };

  app.addPost = function(event) {
    try {
      view.editPost({
        fields: {
          urls: []
        }
      });
    } catch(e) {
      api.handleError(e);
    } finally {
    }
  };

  app.editPost = function(event) {
    try {
      var post = view.pickPost(event);
      view.editPost(post);
    } catch(e) {
      api.handleError(e);
    } finally {
    }
  };

  app.copyPost = function(event) {
    if (!confirm('OK ?')) return;
    var post = view.pickPost(event);
    post.id = api.createId();
    var res = api.savePost(post);
    view.updatePost(post);
    res.catch((error) => {
      api.handleError(error);
    });
  };

  app.savePost = function(event) {
    if (!confirm('OK ?')) return;
    if (inProgress) return;
    inProgress = true;
    try {
      view.validatePost(() => {
        var post = view.getPost(event);
        if (!post.individual) {
          if (!post.id) {
            post.id = api.createId();
          }
          var res = api.savePost(post);
          view.updatePost(post);
          res.catch((error) => {
            api.handleError(error);
          });
        } else {
          post.fields.urls.forEach((u) => {
            var p = {};
            p.id = api.createId();
            p.fields = post.fields;
            p.fields.urls = [u];
            var res = api.savePost(p);
            view.updatePost(p);
            res.catch((error) => {
              api.handleError(error);
            });
          });
        }
      });
    } catch(e) {
      console.log(e);
      api.handleError(e);
    } finally {
      inProgress = false;
    }
  };

  app.deletePost = function(event) {
    if (!confirm('OK ?')) return;
    if (inProgress) return;
    inProgress = true;
    try {
      var post = view.getPost(event);
      api.deletePost(post).then(() => {
        view.deletePost(post);
      }).catch((error) => {
        console.log(error);
        alert(error);
      });
    } catch(e) {
      api.handleError(e);
    } finally {
      inProgress = false;
    }
  };

  app.addUrl = function() {
    view.addUrl();
  };

  app.addImages = function(event) {
    try {
      view.readDropbox(event);
    } catch(e) {
      api.handleError(e);
    } finally {
    }
  };

  app.copyUrl = function(event) {
    smt.clipboard.push($(event.target.closest('.fb-image-table')).find('img').attr('src'));
  };

  app.pasteUrl = function(event) {
    if (smt.clipboard.length > 0) {
      var url = smt.clipboard.pop();
      $(event.target.closest('.fb-image-table')).find('img').attr('src', url);
      api.setOpacity();
    }
  };

  app.upUrl = function(event) {
    view.upUrl(event);
  };

  app.downUrl = function(event) {
    view.downUrl(event);
  };
  
  app.deleteUrl = function(event) {
    view.deleteUrl(event);
  };

  app.toggleAllImagesSelect = function(event) {
    view.toggleAllImagesSelect(event);
  };

  app.selectDropboxFolder = function(event) {
    try {
      view.readDropbox(event);
    } catch(e) {
      api.handleError(e);
    }
  };

  app.selectDropboxImages = function(event) {
    view.selectDropboxImages();
  };

  app.toggleLove = function(event) {
    var love = $('#fb-post-love').val();
    if (love.length == 0) {
      $('#fb-post-love').val('love');
      $('#fb-post-heart').css('color', 'red').removeClass('fa-heart-o').addClass('fa-heart');
    } else {
      $('#fb-post-love').val('');
      $('#fb-post-heart').css('color', 'gray').removeClass('fa-heart').addClass('fa-heart-o');
    }
  };

  app.addAlbum = function(event) {
    view.addAlbum(event);
  };

  app.saveAlbum = function(event) {
    if (!confirm('OK ?')) return;
    if (inProgress) return;
    inProgress = true;
    try {
      var album = view.getAlbum(event);
      view.validateAlbum(album, () => {
        api.saveAlbum(album).catch((error) => {
          console.log(error);
          api.handleError(error);
        });
      });
    } catch(e) {
      api.handleError(e);
    } finally {
      inProgress = false;
    }
  };

  app.addWoman = function(event) {
    view.addWoman(event);
  };

  app.saveWoman = function(event) {
    if (!confirm('OK ?')) return;
    if (inProgress) return;
    inProgress = true;
    try {
      var woman = view.getWoman(event);
      view.validateWoman(woman, () => {
        api.saveWoman(woman).catch((error) => {
          api.handleError(error);
        });
      });
    } catch(e) {
      api.handleError(e);
    } finally {
      inProgress = false;
    }
  };

  app.addAuthor = function(event) {
    view.addAuthor(event);
  };

  app.saveAuthor = function(event) {
    if (!confirm('OK ?')) return;
    if (inProgress) return;
    inProgress = true;
    try {
      var author = view.getAuthor(event);
      view.validateAuthor(author, () => {
        api.saveAuthor(author).catch((error) => {
          console.log(error);
          api.handleError(error);
        });
      });
    } catch(e) {
      api.handleError(e);
    } finally {
      inProgress = false;
    }
  };

  app.addTag = function(event) {
    view.addTag(event);
  };

  app.saveTag = function(event) {
    if (!confirm('OK ?')) return;
    if (inProgress) return;
    inProgress = true;
    try {
      var tag = view.getTag(event);
      view.validateTag(tag, () => {
        api.saveTag(tag).catch((error) => {
          console.log(error);
          api.handleError(error);
        });
      });
    } catch(e) {
      api.handleError(e);
    } finally {
      inProgress = false;
    }
  };

  app.showSettings = function(event) {
    view.showSettings();
  };

  app.saveSettings = function(event) {
    var settings = view.getSettings();
    smt.setSettings(settings);
  };

  app.backToTop = function() {
    $('body, html').scrollTop(0);
  };

  app.setOpacity = function() {
    smt.opacity++;
    api.setOpacity();
  };

  app.test = function() {
    console.log('test');
    $.ajax('https://photoslibrary.googleapis.com/v1/mediaItems:search', {
      type: 'POST',
      dataType: 'json',
      data: [],
      headers: {
        "Authentication": "Bearer 4/yQFVtRimBQjoodNILEgu5ct5TMvpPNmKVL8RuG2gbig4rStu-cwz_2tr1ggu_ZsDyiBci4oOUvfkldE3NDw7y8A"
      }
    }).done((data, status, xhr) => {
      console.log(status);
      console.log(data);
    }).fail((xhr, status, thrown) => {
      api.handleError(xhr.status);
    });
  };
}(app));
