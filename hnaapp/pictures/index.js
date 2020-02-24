'use strict';

var app = app || {};

(function (app) {
  app.cardTemplate = (picture) => `
    <div id="${picture.id}" class="card box-shadow">
      <img class="lazy card-img-top picture-url" data-original="${picture.url}">
      <div class="card-body">
        <p class="card-text picture-title">${picture.title}</p>
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
  app.tagsTemplate = (tag) => `<a href="?tags=${tag}"><span class="badge badge-danger hna-tag">${tag}</span></a> `;
  app.tags = [];
  app.tagSelect = {};

  app.delete = function(id) {
    if (confirm('OK?')) {
      hnaapp.db.collection('pictures').doc(id).delete().then(() => {
        $(`#${id}`).remove();
        alert('Done.');
      }).catch((error) => {
        alert(error);
      });
    }
  };
}(app));

$(function() {
  $('#debug').val(JSON.stringify(hnaapp.args));

  var pictures = [];
  var query = hnaapp.db.collection('pictures');
  if (hnaapp.args.tags)
    query = query.where('tags', 'array-contains-any', hnaapp.args.tags.split(','));
  query.orderBy('createdAt', 'desc').get().then((docs) => {
    docs.forEach((doc) => {
      pictures.push(app.cardTemplate({
        id: doc.id,
        title: doc.data().title,
        url: doc.data().url,
        comment: doc.data().comment,
        tags: doc.data().tags.map(app.tagsTemplate).join('')
      }));
    });
  }).then(() => {
    $('#pictures').append(pictures.join(''));
      $('img.lazy').lazyload({
        effect: 'fadeIn',
        effectspeed: 1000
      });
  });
  hnaapp.db.collection("tags").get().then(function(docs) {
    docs.forEach(function(doc) {
      app.tags.push({ label: doc.data().name, value: doc.data().name });
    });
  }).then(function() {
    //app.tagSelect = new SelectPure(".picture-tags", {
      //options : tags,
      //multiple: true,
      //autocomplete: true,
      //icon: "fa fa-times"
    //});
  });
});

$('#editDialog').on('show.bs.modal', function(event) {
  var button = $(event.relatedTarget);
  var id = button.data('id');
  var card = $(`#${id}`);
  var url = card.find('.picture-url').attr('src');
  var title = card.find('.picture-title').text();
  var tags = card.find('.hna-tags').text();
  var dialog = $(this);
  dialog.find('#editForm').removeClass('was-validated');
  dialog.find('.modal-title').text('Edit');
  dialog.find('.picture-id').val(id);
  dialog.find('.picture-url').val(url);
  dialog.find('.picture-title').val(title);
  app.tagSelect = new SelectPure('.picture-tags', {
    option: app.tags,
    multiple: true,
    autocomplete: true,
    icon: 'fa fa-times',
    value: tags
});

$('#saveChanges').on('click', function(event) {
  var form = $('#editForm');
  if (form.get(0).checkValidity() === true) {
    form.find('.spinner-border').show();
    var id = form.find('.picture-id').val();
    var fields = {
      url: form.find('.picture-url').val(),
      title: form.find('.picture-title').val(),
      tags: app.tagSelect.value(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    if (id) {
      hnaapp.db.collection('pictures').doc(id).set(fields, { merge: true }).then(function() {
        alert('Done.');
        $('#editDialog').modal('hide');
      }).catch(function(error) {
        alert(error);
      });
    } else {
      fields.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      hnaapp.db.collection('pictures').add(fields).then(function() {
        alert('Done.');
        $('#editDialog').modal('hide');
      }).catch(function(error) {
        alert(error);
      });
    }
  } else {
    form.addClass('was-validated');
  }
});