'use strict';

var app = app || {};

(function(app) {
  var api = smt.import('api');
  var view;
  var inProgress = false;

  $(function() {
    try {
      view = smt.import('view').create();
      $(document).on('click', '#fb-search-posts-button', app.searchPosts);
      $(document).on('click', '.fb-edit-post-button', app.editPost);
      $(document).on('click', '#fb-save-post-button', app.savePost);
    } catch(e) {
      api.handleError(e);
    }
  });

  app.searchPosts = function() {
    if (inProgress) return;
    inProgress = true;

    try {
      var option = view.getSearchOption();
      view.reset();
      api.showProgress(true);
      api.getPosts(option).then((res) => {
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
