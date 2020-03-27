'use strict';

var app = app || {};

(function(app) {
  var api = smt.import('api');
  var view;
  var inProgress = false;

  $(function() {
    try {
      view = smt.import('view').create();
      $('#fb-search-posts-button').on('click', true, app.searchPosts);
      $('#fb-read-next-button').on('click', false, app.searchPosts);
      $('#fb-create-posts-button').on('click', false, app.createPosts);
      $('#fb-show-settings-button').on('click', false, app.showSettings);
      $('#fb-save-post-button').on('click', app.savePost);
      $('#fb-save-settings-button').on('click', app.saveSettings);
      $(document).on('click', '.fb-edit-post-button', app.editPost);
      $(document).on('click', '.fb-search', app.selectSearchText);
      $(document).on('click', '.fb-read-dropbox-button', app.readDropbox);
    } catch(e) {
      api.handleError(e);
    }
  });

  app.selectSearchText = function(event) {
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

  app.createPosts = function(event) {
    try {
      view.editPost({
        fields: {
          urls: []
        }
      });
      app.readDropbox(event);
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

  app.readDropbox = function(event) {
    view.readDropbox(event);
  };

  app.savePost = function(event) {
    if (!confirm('OK ?')) return;
    if (inProgress) return;
    inProgress = true;

    try {
      var post = view.getPost(event);
      api.savePost(post).then(() => {
        view.updatePost(post);
      }).catch((error) => {
        console.log(error);
        api.handleError(e);
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
}(app));
