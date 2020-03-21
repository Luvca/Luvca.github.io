'use strict';

smt.export('paging', function (smt, undefined) {
  var tags = smt.import('tags').create();

  function copyData(event) {
    var dialog = event.target;
    var data = event.data;
    var postId = event.relatedTarget.getAttribute('data-id');
    $(dialog).find(`.${data.title}`).val($(`#${postId}`).find(`.${data.title}`).text());
    $(`#${data.women}`).text('');
    $(`#${data.authors}`).text('');
    $(`#${data.tags}`).text('');
    $tagsSelect = new SelectPure(`#${data.tags}`, {
      options: tags.getAll(),
      multiple: true,
      icon: 'fa fa-times',
      //value: ['Jane']
    });
  }
  
  return {
    create: function(init) {
      var bindElement = init.bindElement || {};
      var $editDialog = bindElement.editDialog;
      var itemClass = {
        title: 'fb-post-title',
        women: 'fb-post-women',
        authors: 'fb-post-authors',
        tags: 'fb-post-tags'
      };
      $editDialog.on('show.bs.modal', itemClass, copyData);

      return {
        createCard: function(post) {
          var womanBadges = post.data().women ? post.data().women.map((w) => `
            <span class="badge badge-danger hna-woman">${w}</span>`).join('') : '';

          var authorBadges = post.data().authors ? post.data().authors.map((a) => `
          <span class="badge badge-danger hna-author">${a}</span>`).join('') : '';

          var tagBadges = post.data().tags ? post.data().tags.map((t) => `
            <span class="badge badge-danger hna-tag">${t}</span>`).join('') : '';

          return `
            <div id="${post.id}" class="card box-shadow mb-2 fb-post">
              <div class="card-body pt-2">
                <h6 class="card-title ${itemClass.postTitle}">${post.data().title}</h6>
                ${womanBadges}
                ${authorBadges}
                ${tagBadges}
                <div class="d-flex justify-content-between align-items-center mt-2">
                  <button type="button" class="btn btn-sm btn-outline-secondary pt-0" data-toggle="modal" data-target="#${$editDialog.attr('id')}" data-id="${post.id}">Edit</button>
                </div>
              </div>
              <div class="card-footer text-muted">
                <div>${post.data().updatedAt.toDate().toLocaleString('ja-JP').replace(/\//g, '-')}</div>
              </div>
            </div>`;
        }
      };
    }
  }
});
