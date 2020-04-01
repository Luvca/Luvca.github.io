'use strict';

var app = app || {};

(function(app) {
  var api = smt.import('api');
  var view;
  var inProgress = false;
  var opacity = true;

  $(function() {
    try {
      view = smt.import('view').create();
      // Main window
      $('#fb-corner').on('click', true, app.setupSearch);
      $(document).on('click', '.fb-close-dialog', app.closeDialog);
      $(document).on('click', '.fb-search', app.selectSearchText);
      $(document).on('DOMSubtreeModified', '.select-pure__select', app.selectSearchText);
      $('#fb-search-posts-button').on('click', true, app.searchPosts);
      $('#fb-read-next-button').on('click', false, app.searchPosts);
      $('#fb-add-post-button').on('click', false, app.addPost);
      $('#fb-show-settings-button').on('click', false, app.showSettings);
      $(document).on('click', '.fb-remove-opacity', app.removeOpacity);
      // Card
      $(document).on('click', '.fb-edit-post-button', app.editPost);
      // Edit Dialog
      $('#fb-add-images-button').on('click', app.addImages);
      $(document).on('click', '.fb-up-url-button', app.upUrl);
      $(document).on('click', '.fb-down-url-button', app.downUrl);
      $(document).on('click', '.fb-delete-url-button', app.deleteUrl);
      $('#fb-toggle-all-images-select').on('click', app.toggleAllImagesSelect);
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

  app.closeDialog = function(event) {
    view.closeDialog(event);
  };

  app.selectSearchText = function(event) {
    view.selectSearchText(event.target);
  };

  app.searchPosts = function(event) {
    if (inProgress) return;
    inProgress = true;
    try {
      if (event.data)
        view.reset();
      api.showProgress(true);
      var option = view.getSearchOption();
      console.log(option);
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
          urls: [],
          createdAt: new Date()
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

  app.addImages = function(event) {
    try {
      view.readDropbox(event);
    } catch(e) {
      api.handleError(e);
    } finally {
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

  app.showSettings = function(event) {
    view.showSettings();
  };

  app.saveSettings = function(event) {
    var settings = view.getSettings();
    console.log(settings);
    smt.setSettings(settings);
  };

  app.removeOpacity = function() {
    if (opacity) {
      $('img').css('opacity', '1');
      opacity = false;
    } else {
      $('img').css('opacity', '0.1');
      opacity = true;
    }
  };
}(app));
