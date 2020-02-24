'use strict';

var app = app || {};

(function (app) {
  app.createCard = (picture) => `
    <div id="${picture.id}" class="card box-shadow">
      <img class="lazy card-img-top" data-original="${picture.url}">
      <div class="d-none picture-url">${picture.url}</div>
      <div class="card-body">
        <p class="card-text picture-title">${picture.title}</p>
        ${picture.tags}
        <p class="card-text"><small class="text-muted">${picture.comment}</small></p>
        <div class="d-flex justify-content-between align-items-center">
          <div class="btn-group">
            <button type="button" class="btn btn-sm btn-outline-secondary">View</button>
            <button type="button" class="btn btn-sm btn-outline-secondary" data-toggle="modal" data-target="#editDialog" data-id="${picture.id}">Edit</button>
            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="app.delete('${picture.id}');">Delete</button>
          </div>
        </div>
        <p class="card-text"><small class="text-muted">9 mins</small></p>
      </div>
    </div>
  `;
  app.tags = [];
  app.tagSelect = {};
  app.createTags = (tag) => `<a href="?tags=${tag}"><span class="badge badge-danger hna-tag">${tag}</span></a> `;

  app.delete = function(id) {
    if (confirm('OK?')) {
      $(`#${id}`).fadeOut('normal', function() {
        $(this).remove();
        hnaapp.db.collection('pictures').doc(id).delete().then(() => {
        }).catch((error) => {
          alert(error);
        });
      });
    }
  };
}(app));

$(function() {
  var query = hnaapp.db.collection('pictures');
  if (hnaapp.args.tags)
    query = query.where('tags', 'array-contains-any', hnaapp.args.tags.split(','));
  query.orderBy('createdAt', 'desc').get().then((docs) => {
    docs.forEach((doc) => {
      $('#pictures').append(app.createCard({
        id: doc.id,
        url: doc.data().url,
        title: doc.data().title,
        comment: doc.data().comment,
        tags: doc.data().tags.map(app.createTags).join('')
      }));
    });
  }).then(() => {
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
    if (hnaapp.args.add)
      $('#editDialog').modal('show');
  });;
});

$('#editDialog').on('show.bs.modal', function(event) {
  var button = $(event.relatedTarget);
  var id = button.data('id');
  var card = $(`#${id}`);
  var url = card.find('.picture-url').text();
  var title = card.find('.picture-title').text();
  var tags = card.find('.hna-tag').map(function() { return $(this).text(); }).get();
  console.log(tags);
  var dialog = $(this);
  dialog.find('#editForm').removeClass('was-validated');
  dialog.find('.modal-title').text('Edit');
  dialog.find('.picture-id').val(id);
  dialog.find('.picture-url').val(url);
  dialog.find('.picture-title').val(title);
  $('#pictureTags').text('');
  app.tagSelect = new SelectPure('#pictureTags', {
    options: app.tags,
    multiple: true,
    autocomplete: true,
    icon: 'fa fa-times',
    value: card.find('.hna-tag').map(function() { return $(this).text(); }).get()
  });
});

$('#saveChanges').on('click', function(event) {
  var form = $('#editForm');
  if (form.get(0).checkValidity() === true) {
    form.find('.spinner-border').show();
    var id = form.find('.picture-id').val();
    var url = form.find('.picture-url').val();
    var title = form.find('.picture-title').val();
    var tags = app.tagSelect.value();
    var fields = {
      url: url,
      title: title,
      tags: tags,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    if (id) {
      hnaapp.db.collection('pictures').doc(id).set(fields, { merge: true }).then(function() {
        $('#editDialog').modal('hide');
        $(`#${id}`).replaceWith(app.createCard({
          id: id,
          url: url,
          title: title,
          tags: tags.map(app.createTags).join('')
        }));
      }).then(function() {
        $('img.lazy').lazyload({
          effect: 'fadeIn',
          effectspeed: 1000
        });
      }).catch(function(error) {
        alert(error);
      });
    } else {
      fields.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      hnaapp.db.collection('pictures').add(fields).then(function() {
        $('#editDialog').modal('hide');
        $('#pictures').prepend(app.createCard({
          id: id,
          url: url,
          title: title,
          tags: tags.map(app.createTags).join('')
        }));
      }).then(function() {
        $('img.lazy').lazyload({
          effect: 'fadeIn',
          effectspeed: 1000
        });
      }).catch(function(error) {
        alert(error);
      });
    }
  } else {
    form.addClass('was-validated');
  }
});
