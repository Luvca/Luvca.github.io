'use strict';

smt.export('post', function (smt, undefined) {
  var api = smt.import('api');
  var women = smt.import('women').create();
  var authors = smt.import('authors').create();
  var tags = smt.import('tags').create();

  function setupDialog(event) {
    var dialog = event.target;
    var itemClass = event.data;
    var postId = $(event.relatedTarget.closest('.card')).attr('id');
    var post = $(`#${postId}`);
    $(`#${itemClass.women}`).text('');
    $(`#${itemClass.authors}`).text('');
    $(`#${itemClass.tags}`).text('');
    $(dialog).find(`.${itemClass.id}`).val(postId);
    $(dialog).find(`.${itemClass.title}`).val(post.find(`.${itemClass.title}`).text());
    var postWomen = post.find(`.${itemClass.women}`).map((i, v) => $(v).text()).get();
    $womenSelect = new SelectPure(`#${itemClass.women}`, {
      options: women.getAll(),
      multiple: true,
      icon: 'fa fa-times',
      value: api.intersect(postWomen, women.getAll().map((e) => e.label))
    });
    var postAuthors = post.find(`.${itemClass.authors}`).map((i, v) => $(v).text()).get();
    $authorsSelect = new SelectPure(`#${itemClass.authors}`, {
      options: authors.getAll(),
      multiple: true,
      icon: 'fa fa-times',
      value: api.intersect(postAuthors, authors.getAll().map((e) => e.label))
    });
    var postTags = post.find(`.${itemClass.tags}`).map((i, v) => $(v).text()).get();
    $tagsSelect = new SelectPure(`#${itemClass.tags}`, {
      options: tags.getAll(),
      multiple: true,
      icon: 'fa fa-times',
      value: api.intersect(postTags, tags.getAll().map((e) => e.label))
    });
  }

  function savePost(event) {
    var dialog = $(this).closest('.modal');
    var itemClass = event.data;
    var id = dialog.find(`.${itemClass.id}`).val();
    var fields = {
      title: dialog.find(`.${itemClass.title}`).val(),
      updatedAt: new Date()
    };
    api.savePost(id, fields).then(() => {
      dialog.modal('hide');
      alert('Saved.');
    }).catch((error) => {
      console.log(error);
    });
  }
  
  return {
    create: function(init) {
      var bindElement = init.bindElement || {};
      var itemClass = init.itemClass || {};
      var $editDialog = bindElement.editDialog;
      //$editDialog.on('show.bs.modal', itemClass, setupDialog);
      //$('#fb-save-post').on('click', itemClass, savePost);

      return {
        createCard: function(post) {
          var womanBadges = post.data().women ? post.data().women.map((w) => `
            <span class="badge ${itemClass.women}">${w}</span>`).join('') : '';

          var authorBadges = post.data().authors ? post.data().authors.map((a) => `
            <span class="badge ${itemClass.authors}">${a}</span>`).join('') : '';

          var tagBadges = post.data().tags ? post.data().tags.map((t) => `
            <span class="badge ${itemClass.tags}">${t}</span>`).join('') : '';

          var urlCount = post.data().urls ? post.data().urls.length : 0;
          var createdAt = post.data().createdAt ? post.data().createdAt.toDate().toLocaleString('ja-JP').replace(/\//g, '-') : '';
          return `
            <div id="${post.id}" class="card box-shadow mb-2 fb-post">
              <div class="card-body pt-2">
                <h5 class="card-title ${itemClass.title}">${post.data().title}</h5>
                ${womanBadges}
                ${authorBadges}
                ${tagBadges}
                <div class="d-flex justify-content-between align-items-center mt-2">
                  <button type="button" class="btn btn-sm btn-outline-secondary pt-0 fb-edit-post-button" data-target="#${$editDialog.attr('id')}">Edit</button>
                </div>
              </div>
              <div class="card-footer text-muted small fb-card-footer">
                <div>
                  <span>${post.data().type}</span>
                  <span>&#x00D7;</span>
                  <span>${urlCount}</span>
                </div>
                <div>created: ${createdAt}</div>
                <div>${post.id}</div>
              </div>
            </div>`;
        }
      };
    }
  }
});
