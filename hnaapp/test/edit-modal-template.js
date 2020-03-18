'use strict';

fbapp.export('edit-modal-template', function(fbapp, undefined) {

  function createModal(data) {
    return `
<div id="#editModal">
</div>`;
  }

  return {
    create: function() {
      return {
        show: function(data) {
          $('#editModal').show();
        },

        hide: function() {
        }
      };
    }
  };
});
