'use strict';

fbapp.export('list-view-template', function(fbapp, undefined) {
  function toQueryString($form) {
  }

  function createCard(data) {
    return `
<div id="${data.id}" class="card box-shadow mb-2">
  <span>${data.id}</span>
  <span>${data.name}</span>
  <button class="fb-edit-button" data-card-id="${data.id}">Edit</button>
</div>`;
  }

  function showEditModal(evt) {
    var id = evt.target.getAttribute('data-card-id');
    var card = $(`#${id}`);
  }

  return {
    create: function(init) {
      var bindElement = init.bindElement || {};
      var $searchForm = bindElement.searchForm;
      var $resultArea = bindElement.resultArea;
      var $editModal = bindElement.editModal;
      var $editModalId = bindElement.editModalId;

      return {
        getSearchOption: function() {
          var data = toQueryString($searchForm);
          return data;
        },

        reset: function() {
          $resultArea.parent().scrollTop(0);
          $resultArea.empty();
        },

        render: function(result) {
          result.forEach((data, index) => {
            $resultArea.append(createCard(data));
            if (index === data.length - 1) {
              $('.fb-edit-button').addEventListener('click', showEditModal);
            }
          });
        },
      };
    }
  };
});
