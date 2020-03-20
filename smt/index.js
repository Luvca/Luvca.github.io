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
      view = smt.import('list-view-template').create({
        bindElement: {
          searchForm: $('#search-form'),
          errorMessagePanel: $('#error-msg-area'),
          infoMessagePanel: $('#info-msg-area'),
          resultArea: $('#search-result')
        }
      });
    } catch (e) {
      api.handleError(e);
    }
  });

  /***************************************************
   * public interface
   ***************************************************/
  app.search = function() {
    if (store.executingSearch) return;
    store.executingSearch = true;

    try {
      var data = view.getSearchOption();
      view.reset();
      api.progressDisplay(true);
      api.post('users/search', data).done(function (res) {
        if (res.errors) {
          view.showInputError(res.errors);
        } else {
          store.lastSearchConditions = data;
          view.updateSearchResult(res);
        }
      })/*.fail(function (xhr, status, thrown) {
        api.serverErrorHandling(xhr);
      }).always(function () {
        store.executingSearch = false;
        api.progressDisplay(false);
      })*/;
    } catch (e) {
      store.executingSearch = false;
      api.progressDisplay(false);
      api.handleError(e);
    }
  };
}(app));
