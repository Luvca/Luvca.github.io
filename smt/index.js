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
        if (res.errors) {
          view.showInputError(res.errors);
        } else {
          store.lastSearchConditions = data;
          view.updateSearchResult(res);
        }
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
