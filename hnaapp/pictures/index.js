'use strict';

var app = app || {};

(function (app) {
  //app.women = [];
  app.womanSelect = {};
  app.createWomen = (woman) => `<a href="?women=${woman}"><span class="badge badge-danger hna-woman">${woman}</span></a> `;

  //app.tags = [];
  app.tagSelect = {};
  app.createTags = (tag) => `<a href="?tags=${tag}"><span class="badge badge-danger hna-tag">${tag}</span></a> `;

  app.createCard = (picture) => `
    <div id="${picture.id}" class="card box-shadow">
      <a class="picture-url" href="${picture.url}"><img class="lazy card-img-top" data-original="${picture.url}"></a>
      <div class="card-body">
        <p class="card-text picture-title">${picture.title}</p>
        <p class="card-text womanref">${picture.womanData.name}</p>
        ${picture.women}
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

  app.delete = function(id) {
    if (confirm('OK?')) {
      $(`#${id}`).fadeOut('normal', function() {
        $(this).remove();
        hnaapp.db.pictures.doc(id).delete().then(() => {
        }).catch((error) => {
          alert(error);
        });
      });
    }
  };
}(app));

$(function() {
  var query = hnaapp.db.pictures;
  if (hnaapp.args.women)
    query = query.where('women', 'array-contains-any', hnaapp.args.women.split(','));
  else if (hnaapp.args.tags)
    query = query.where('tags', 'array-contains-any', hnaapp.args.tags.split(','));
  query.orderBy('createdAt', 'desc').get().then((docs) => {
    docs.forEach((doc) => {
      var data = doc.data();
      if (data.womanRef) {
        data.womanRef.get().then(w => {
          data.womanData = w.data();
          $('#pictures').append(app.createCard(data));
        });
      } else {
        $('#pictures').append(app.createCard(data));
      }
      /*$('#pictures').append(app.createCard({
        id: doc.id,
        url: doc.data().url,
        title: doc.data().title,
        comment: doc.data().comment,
        womanRefs: doc.data().womanRefs,
        women: doc.data().women.map(app.createWomen).join(''),
        tags: doc.data().tags.map(app.createTags).join('')
      }));*/
    });
  }).then(() => {
    $('img.lazy').lazyload({
      effect: 'fadeIn',
      effectspeed: 1000
    });
  });

  if (hnaapp.args.add)
    $('#editDialog').modal('show');
});

$('#editDialog').on('show.bs.modal', function(event) {
  var button = $(event.relatedTarget);
  var id = button.data('id');
  var card = $(`#${id}`);
  var url = card.find('.picture-url').attr('href');
  var title = card.find('.picture-title').text();
  var women = card.find('.hna-woman').map(function() { return $(this).text(); }).get();
  console.log(women);
  var tags = card.find('.hna-tag').map(function() { return $(this).text(); }).get();
  console.log(tags);
  var dialog = $(this);
  dialog.find('#editForm').removeClass('was-validated');
  dialog.find('.modal-title').text('Edit');
  dialog.find('.picture-id').val(id);
  dialog.find('.picture-url').val(url);
  dialog.find('.picture-title').val(title);
  $('#pictureWomen').text('');
  app.womanSelect = new SelectPure('#pictureWomen', {
    options: hnaapp.women,
    multiple: true,
    autocomplete: true,
    icon: 'fa fa-times',
    value: women
  });
  $('#pictureTags').text('');
  app.tagSelect = new SelectPure('#pictureTags', {
    options: hnaapp.tags,
    multiple: true,
    autocomplete: true,
    icon: 'fa fa-times',
    value: tags
  });
});

$('#saveChanges').on('click', function(event) {
  var form = $('#editForm');
  if (form.get(0).checkValidity() === true) {
    form.find('.spinner-border').show();
    var id = form.find('.picture-id').val();
    var url = form.find('.picture-url').val();
    var title = form.find('.picture-title').val();
    var type = form.find('input[name="type"]:checked').val();
    var women = app.womanSelect.value();
    var tags = app.tagSelect.value();
    var fields = {
      url: url,
      title: title,
      type: type,
      women: women,
      womanRefs: hnaapp.db.women.doc('時越芙美江'),
      //test: 'hoge',
      tags: tags,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    if (id) {
      hnaapp.db.pictures.doc(id).set(fields, { merge: true }).then(function() {
        $('#editDialog').modal('hide');
        $(`#${id}`).replaceWith(app.createCard({
          id: id,
          url: url,
          title: title,
          women: women.map(app.createWomen).join(''),
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
      hnaapp.db.pictures.add(fields).then(function() {
        $('#editDialog').modal('hide');
        $('#pictures').prepend(app.createCard({
          id: id,
          url: url,
          title: title,
          women: women.map(app.createWomen).join(''),
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
    //$('html,body').animate({ scrollTop: $('セレクタ').offset().top} );
  } else {
    form.addClass('was-validated');
  }
});

$('#saveWoman').on('click', function(event) {
  var form = $('#womanForm');
  if (form.get(0).checkValidity() === true) {
    //form.find('.spinner-border').show();
    var name = form.find('.woman-name').val();
    var phoneticName = form.find('.woman-phonetic-name').val();
    var fields = {
      name: name,
      phoneticName: phoneticName,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    //if (id) {
      //hnaapp.db.women.doc(id).set(fields, { merge: true }).then(function() {
        //$('#womanDialog').modal('hide');
      //}).catch(function(error) {
        //alert(error);
      //});
    //} else {
      fields.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      hnaapp.db.women.doc(name).set(fields).then(function() {
        var women = app.womanSelect.value();
        women.push(name);
        hnaapp.women.push({ label: name, value: name});
        $('#pictureWomen').text('');
        app.womanSelect = new SelectPure('#pictureWomen', {
    options: hnaapp.women,
    multiple: true,
    autocomplete: true,
    icon: 'fa fa-times',
    value: women
  });
        $('#womanDialog').modal('hide');
      }).catch(function(error) {
        alert(error);
      });
    //}
  } else {
    form.addClass('was-validated');
  }
});
