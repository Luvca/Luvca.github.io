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
          title: 'fb-post-title',
          women: 'fb-post-women',
          authors: 'fb-post-authors',
          tags: 'fb-post-tags'
        }
      });
    } catch(e) {
      api.handleError(e);
    }
  });

  app.search = function() {
    if (store.executingSearch) return;
    store.executingSearch = true;

    try {
      var data = view.getSearchOption();
      view.reset();
      api.progressDisplay(true);
      api.getPost(data).then((res) => {
        store.lastSearchConditions = data;
        view.updateSearchResult(res);
    }).catch((error) => {
        api.serverErrorHandling(error);
      });
    } catch (e) {
      store.executingSearch = false;
      api.progressDisplay(false);
      api.handleError(e);
    }
  };
}(app));
