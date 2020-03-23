'use strict';

var app = app || {};

(function(app) {
  var api = smt.import('api');
  var view;
  var store = {
    lastSearchConditions: null,
    executingSearch: false
  };

  $(function() {
    try {
      view = smt.import('view').create({
        bindElement: {
          searchForm: $('#search-form'),
          errorMessagePanel: $('#error-msg-area'),
          infoMessagePanel: $('#info-msg-area'),
          resultArea: $('#search-result'),
          editDialog: $('#editDialog')
        },
        itemClass: {
          id: 'fb-post-id',
          title: 'fb-post-title',
          women: 'fb-post-women',
          authors: 'fb-post-authors',
          tags: 'fb-post-tags'
        }
      });

      $(document).on('click', '#fb-search-posts-button', app.searchPosts);
      $(document).on('click', '.fb-edit-post-button', app.editPost);
      $(document).on('click', '#fb-save-post-button', app.savePost);
    } catch(e) {
      api.handleError(e);
    }
  });

  app.searchPosts = function() {
    if (store.executingSearch) return;
    store.executingSearch = true;

    try {
      var option = view.getSearchOption();
      view.reset();
      api.progressDisplay(true);
      api.getPosts(option).then((res) => {
        store.lastSearchConditions = option;
        view.showPosts(res);
      }).catch((error) => {
        api.handleError(error);
      });
    } catch(e) {
      api.handleError(e);
    } finally {
      store.executingSearch = false;
      api.progressDisplay(false);
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
    if (store.executingSearch) return;
    store.executingSearch = true;

    try {
      var post = view.getPost(event);
      api.savePost(post.id, post.fields).then(() => {
        view.updatePost(post);
      }).catch((error) => {
        console.log(error);
        api.serverErrorHandling(error);
      });
    } catch(e) {
      api.handleError(e);
    } finally {
      store.executingSearch = false;
    }
  };
}(app));
