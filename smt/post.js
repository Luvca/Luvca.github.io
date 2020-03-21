'use strict';

smt.export('paging', function (smt, undefined) {
  var tags = smt.import('tags').create();

  function copyData(event) {
    var dialog = event.target;
    var data = event.data;
    var postId = event.relatedTarget.getAttribute('data-id');
    $(dialog).find(`.${data.title}`).val($(`#${postId}`).find(`.${data.title}`).text());
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
        tags: 'fb-post-tags'
      };
      $editDialog.on('show.bs.modal', itemClass, copyData);
      //var api = smt.import('api');
      //var html;
      //api.getHtml('post.html').done((res) => {
        //html = res;
        //var doc = new DOMParser().parseFromString(res, 'text/html');
        //var editDialog = $(doc).find('#editDialog');
        //$('body').append(editDialog);
        //$('#editDialog').on('show.bs.modal', copyData);
      //});

      return {
        createCard: function(post) {
          var tagBadges = post.data().tags ? post.data().tags.map((t) => `
            <span class="badge badge-danger hna-tag">${t}</span>`).join('') : '';
          return `
            <div id="${post.id}" class="card box-shadow mb-2 fb-post">
              <div class="card-body pt-2">
                <h6 class="card-title ${itemClass.postTitle}">${post.data().title}</h6>
                ${tagBadges}
                <div class="d-flex justify-content-between align-items-center mt-2">
                  <button type="button" class="btn btn-sm btn-outline-secondary pt-0" data-toggle="modal" data-target="#${$editDialog.attr('id')}" data-id="${post.id}">Edit</button>
                </div>
              </div>
              <div class="card-footer text-muted">
                <div>${post.data().updatedAt.toDate().toLocaleString('ja-JP').replace(/\//g, '-')}</div>
              </div>
            </div>`;
          //var doc = new DOMParser().parseFromString(html, 'text/html');
          //var card = $(doc).find('.fb-post');
          //$(card).attr('id', data.id);
          //$(card).find('.fb-post-title').text(data.title);
          //$(card).find('.fb-edit-post').attr('data-id', data.id);
          //return card;
        }
      };
    }
  }
});
