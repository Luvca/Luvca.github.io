'use strict';

var app = app || {};

(function(app) {
  var api = smt.import('api');
  var view;
  var inProgress = false;

  $(function() {
    try {
      view = smt.import('view').create();
      // Main window
      $('#fb-corner').on('click', true, app.setupSearch);
      $(document).on('click', '.fb-close-dialog', app.closeDialog);
      $(document).on('click', '.fb-search', app.selectSearchText);
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
      $('#fb-add-author-button').on('click', {type: 'authors'}, app.addAuthor);
      $('#fb-save-author-button').on('click', app.saveAuthor);
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
    console.log(event.target);
    view.selectSearchText(event);
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
    view.readDropbox(event);
  };

  app.selectDropboxImages = function(event) {
    view.selectDropboxImages();
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
      view.validateAuthor(() => {
        console.log(author.type);
        api.saveAuthor(author.data).then().catch((error) => {
          console.log(error);
          api.handleError(e);
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
          api.savePost(post).then(() => {
            view.updatePost(post);
          }).catch((error) => {
            console.log(error);
            api.handleError(error);
          });
        } else {
          post.fields.urls.forEach((u) => {
            var p = {};
            p.fields = post.fields;
            p.fields.urls = [u];
            api.savePost(p).then((ref) => {
              p.id = ref.id;
              view.updatePost(p);
            }).catch((error) => {
              console.log(error);
              api.handleError(error);
            });
          });
        }
      });
    } catch(e) {
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
    $('img').css('opacity', '1');
  };
}(app));
