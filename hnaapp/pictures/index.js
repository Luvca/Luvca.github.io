'use strict';

var app = app || {};

(function (app) {
  app.createWomen = (woman) => `
    <a href="?women=${woman}">
      <span class="badge badge-danger hna-woman">${woman}</span>
    </a> `;

  app.createTags = (tag) => `
    <a href="?tags=${tag}">
      <span class="badge badge-danger hna-tag">${tag}</span>
    </a> `;

  app.createCard = (id, data) => `
    <div id="${id}" class="card box-shadow">
      <a class="hna-url" href="${data.url}">
        <img class="lazy card-img-top" data-original="${data.url}">
      </a>
      <div class="card-body">
        <p class="card-text hna-title">${data.title}</p>
        <div class="hna-women"></div>
        ${data.tags.map(app.createTags).join('')}
        <!--
        <p class="card-text">
          <small class="text-muted">${data.comment}</small>
        </p>
        -->
        <div class="d-flex justify-content-between align-items-center mt-2">
          <div class="btn-group">
            <button type="button" class="btn btn-sm btn-outline-secondary pt-0">View</button>
            <button type="button" class="btn btn-sm btn-outline-secondary pt-0" data-toggle="modal" data-target="#editDialog" data-id="${id}">Edit</button>
            <button type="button" class="btn btn-sm btn-outline-secondary pt-0 hna-delete-button" onclick="app.delete('${id}');">Delete</button>
          </div>
        </div>
        <p class="card-text">
          <small class="text-muted hna-type">${data.type}</small>
        </p>
      </div>
    </div>
  `;

  app.delete = function(id) {
    if (confirm('OK?')) {
      $(`#${id}`).fadeOut('normal', function() {
        $(this).remove();
        app.db.pictures.doc(id).delete().then(() => {
        }).catch((error) => {
          alert(error);
        });
      });
    }
  };
}(app));

//
// Document Ready
//
$(function() {
  // Firebase project configuration
  var firebaseConfig = {
    projectId: "hna-data"
  };
  // Initialize Firebasew
  firebase.initializeApp(firebaseConfig);
  app.db = firebase.firestore();
  app.db.pictures = app.db.collection('pictures');
  app.db.women = app.db.collection('women');
  app.db.tags = app.db.collection('tags');
  app.womanSelect = {};
  app.tagSelect = {};
  app.args = {};

  var query = app.db.pictures;
  if (app.args.women) {
    query = query.where('women', 'array-contains-any', app.args.women.split(','));
  } else if (app.args.tags) {
    query = query.where('tags', 'array-contains-any', app.args.tags.split(','));
  }
  query.orderBy('createdAt', 'desc').get().then((docs) => {
    docs.forEach((doc) => {
      $('#pictures').append(app.createCard(doc.id, doc.data()));
      if (doc.data().women) {
        var women = $(`#${doc.id}`).find('.hna-women');
        doc.data().women.forEach((ref) => {
          ref.get().then((w) => {
            women.append(app.createWomen(w.id));
          });
        });
      }
    });
  }).then(() => {
    $('img.lazy').lazyload({
      effect: 'fadeIn',
      effectspeed: 1000
    });
  });

  if (app.args.add) {
    $('#editDialog').modal('show');
  }
});

//
// Edit Dialog
//
$('#editDialog').on('show.bs.modal', function(event) {
  $(this).find('textarea, :text, select').val('').end().find(':checked').prop('checked', false);
  $(this).find('#editDialogForm').removeClass('was-validated');
  $('#hnaWomen').text('');
  $('#hnaTags').text('');
  var women = [];
  var tags = [];
  var id = $(event.relatedTarget).data('id');
  if (id) {
    var card = $(`#${id}`);
    $(this).find('.modal-title').text('Edit');
    $(this).find('.hna-id').val(id);
    $(this).find('.hna-url').val(card.find('.hna-url').attr('href'));
    $(this).find('.hna-title').val(card.find('.hna-title').text());
    $(this).find('input[name="type"]').filter(`[value=${card.find('.hna-type').text()}]`).prop('checked', true);
    women = card.find('.hna-woman').map((i, v) => $(v).text()).get();
    tags = card.find('.hna-tag').map((i, v) => $(v).text()).get()
  } else {
    $(this).find('.modal-title').text('Add');
  }

  var dbWomen = [];
  app.db.women.orderBy('phoneticName').get().then(function(docs) {
    docs.forEach(function(doc) {
      dbWomen.push({ label: doc.data().name, value: doc.id});
    })
  }).then(function() {
    app.womanSelect = new SelectPure('#hnaWomen', {
      options: dbWomen,
      multiple: true,
      autocomplete: true,
      icon: 'fa fa-times',
      value: women
    });
  });

  var dbTags = [];
  app.db.tags.get().then(function(docs) {
    docs.forEach(function(doc) {
      dbTags.push({ label: doc.data().name, value: doc.data().name });
    });
  }).then(function() {
    app.tagSelect = new SelectPure('#hnaTags', {
      options: dbTags,
      multiple: true,
      autocomplete: true,
      icon: 'fa fa-times',
      value: tags
    });
  });
});

//
// Save Changes
//
$('#saveChanges').on('click', function(event) {
  var form = $('#editDialogForm');
  if (form.get(0).checkValidity() === true) {
    //form.find('.spinner-border').show();
    var timestamp = firebase.firestore.FieldValue.serverTimestamp();
    var id = form.find('.hna-id').val();
    var women = app.womanSelect.value();
    var fields = {
      url: form.find('.hna-url').val(),
      title: form.find('.hna-title').val(),
      type: form.find('input[name="type"]:checked').val(),
      women: women.map((w) => app.db.women.doc(w)),
      tags: app.tagSelect.value(),
      updatedAt: timestamp
    };
    if (id) {
      app.db.pictures.doc(id).set(fields, { merge: true }).then(function() {
        $('#editDialog').modal('hide');
        $(`#${id}`).replaceWith(app.createCard(id, fields));
        women.forEach((w) => {
          $(`#${id}`).find('.hna-women').append(app.createWomen(w));
        });
      }).then(function() {
        $('img.lazy').lazyload({
          effect: 'fadeIn',
          effectspeed: 1000
        });
      }).catch(function(error) {
        alert(error);
      });
    } else {
      fields.createdAt = timestamp;
      app.db.pictures.add(fields).then(function(doc) {
        $('#editDialog').modal('hide');
        $('#pictures').prepend(app.createCard(doc.id, fields));
        women.forEach((w) => {
          $(`#${doc.id}`).find('.hna-women').append(app.createWomen(w));
        });
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

//
//
//
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
      //app.db.women.doc(id).set(fields, { merge: true }).then(function() {
        //$('#womanDialog').modal('hide');
      //}).catch(function(error) {
        //alert(error);
      //});
    //} else {
      fields.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      app.db.women.doc(name).set(fields).then(function() {
        var women = app.womanSelect.value();
        women.push(name);
        app.women.push({ label: name, value: name});
        $('#hnaWomen').text('');
        app.womanSelect = new SelectPure('#hnaWomen', {
    options: app.women,
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
