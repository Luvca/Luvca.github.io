'use strict';

var app = app || {};

(function (app) {
  var cardTemplate = (picture) => `
    <div id="${picture.id}" class="card box-shadow">
      <img class="lazy card-img-top" data-original="${picture.url}">
      <div class="card-body">
        <p class="card-text">${picture.title}</p>
        ${picture.tags}
        <p class="card-text"><small class="text-muted">${picture.comment}</small></p>
        <div class="d-flex justify-content-between align-items-center">
          <div class="btn-group">
            <button type="button" class="btn btn-sm btn-outline-secondary">View</button>
            <button type="button" class="btn btn-sm btn-outline-secondary open-edit-dialog" data-toggle="modal" data-target="#editDialog" data-id="${picture.id}">Edit</button>
            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="app.delete('${picture.id}');">Delete</button>
          </div>
        </div>
        <p class="card-text"><small class="text-muted">9 mins</small></p>
      </div>
    </div>
  `;

  var tagsTemplate = (tag) => `<a href="?tags=${tag}"><span class="badge badge-danger hna-tag">${tag}</span></a>`;

  var pictures = [];
  var query = hnaapp.db.collection('pictures');
  if (hnaapp.args.tags)
    query = query.where('tags', 'array-contains-any', hnaapp.args.tags.split(','));
  query.orderBy('createdAt', 'desc').get().then(function (docs) {
    docs.forEach(function (doc) {
      pictures.push(cardTemplate({
        id: doc.id,
        title: doc.data().title,
        url: doc.data().url,
        comment: doc.data().comment,
        tags: doc.data().tags.map(tagsTemplate).join('')
      }));
      //pictures.push({ title: doc.data().title, url: doc.data().url, comment: doc.data().comment });
      //doc.data() is never undefined for query doc snapshots
    });
  }).then(function () {
    //$('#pictures').append(pictures.map(cardTemplate).join(''));
    $('#pictures').append(pictures.join(''));
    //$(function($) {
      $('img.lazy').lazyload({
        effect: 'fadeIn',
        effectspeed: 1000
      });
    //});
  });

  app.delete = function(id) {
    if (confirm('OK?')) {
      hnaapp.db.collection('pictures').doc(id).delete().then(function() {
        $(`#${id}`).remove();
        alert('Done.');
      }).catch(function(error) {
        alert(error);
      });
    }
  };
}(app));

$(function() {
  $('#debug').val(JSON.stringify(hnaapp.args));
});


  $('.open-sedit-dialog').on('show.bs.modal', function(event) {
    var button = $(event.relatedTarget);
    var id = button.data('id');
    var dialog = $(this);
    dialog.find('.dialog-url').val(id);
  });