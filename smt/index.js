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
      $(document).on('click', '.fb-edit-post-button', app.editPost);
      $('#fb-save-post-button').on('click', app.savePost);
      $(document).on('click', '.fb-search', app.selectSearchText);
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

  app.editPost = function(event) {
    try {
      view.editPost(event);
    } catch(e) {
      api.handleError(e);
    } finally {
    }
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
}(app));
