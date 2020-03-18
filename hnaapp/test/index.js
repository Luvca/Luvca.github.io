'use strict';

var app = app || {};

(function (app) {
  var api = fbapp.import('api');
  var eventHub = fbapp.import('event-hub');
  var view;
  var store = {
    executingSearch: false
  };

  //
  // document ready
  //
  $(function() {
    try {
      var viewTemplate = fbapp.import('list-view-template');
      view = viewTemplate.create({
        bindElement: {
          searchForm: $('#searchForm'),
          resultArea: $('#searchResult'),
          editModal: $('#editModal'),
          editModalId: $('#editModalId')
        }
      });

      eventHub.on('edit-button-clicked', function(param) {
        app.showEditModal(param.data);
      });
    } catch {
    } finally {
    }
  });

  app.search = () => {
    if (store.executingSearch) return;
    store.executingSearch = true;
    try {
      var data = view.getSearchOption();
      view.reset();
      api.displayProgress(true);
      api.get(data).then((result) => {
        view.render(result);
      }).catch((error) => {
      });
    } catch {
    } finally {
    }
  };

  app.showEditModal = (data) => {
    view.showEditModal(data);
  };
}(app));
