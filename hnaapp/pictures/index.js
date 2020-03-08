'use strict';

var app = app || {};

(function (app) {
  app.createImage = (url) => `
<div class="row mb-1">
  <div class="col">
    <a class="hna-url" href="${url}">
      <img class="lazy card-img-top" data-original="${url}">
    </a>
  </div>
</div>
`;

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
  ${data.urls.map(app.createImage).join('')}
  <div class="card-body pt-2">
    <p class="card-text hna-title">${data.title}</p>
    <div class="hna-women"></div>
    ${data.tags.map(app.createTags).join('')}
    <!--
    <p class="card-text">
      <small class="text-muted">${data.comment} ${data.createdAt}</small>
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

  app.createSeries = (num, url) => `
<small class="text-muted hna-num">${num}</small>
<a class="hna-url2" href="${url}">
  <img class="lazy card-img-top" src="${url}">
</a> `;

  app.createUrls = (url) => `
<div class="input-group">
  <input name="hnaUrl" class="form-control" value="${url}">
  <div class="input-group-append">
    <button type="button" class="form-control btn-del" onclick="app.delUrl(this);">&times;</button>
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

  app.addUrl = function() {
    $('#pictureUrls').append(app.createUrls(''));
  };

  app.delUrl = function(e) {
    $(e).parent().parent().remove();
  };
}(app));

//
// Document ready
//
$(function() {
  // URL parameters
  app.args = new URLSearchParams(location.search);

  // Firebase project configuration
  var firebaseConfig = {
    projectId: "hna-data"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  app.db = firebase.firestore();
  app.db.pictures = app.db.collection('pictures');
  app.db.women = app.db.collection('women');
  app.db.tags = app.db.collection('tags');

  // Select for women
  app.womenSelect = {};
  app.womenSelectOptions = [];
  app.createWomenSelect = function(options, value) {
    app.womenSelect = new SelectPure('#hnaWomen', {
      options: options,
      multiple: true,
      autocomplete: true,
      icon: 'fa fa-times',
      value: value
    });
  };

  // Select for tags
  app.tagsSelect = {};
  app.tagsSelectOptions = [];
  app.createTagsSelect = function(options, value) {
    app.tagsSelect = new SelectPure('#hnaTags', {
      options: options,
      multiple: true,
      autocomplete: true,
      icon: 'fa fa-times',
      value: value
    });
  };

  // File
  /*var uploadFile = document.getElementById('uploadFile');
  uploadFile.addEventListener('change', function (e) {
    var file = e.srcElement.files[0];
    var fr = new FileReader();
    fr.addEventListener('load', function() {
      var url = fr.result;
      var img = new Image();
      img.src = url;
      img.height = 200;
      document.body.appendChild(img);
    });
    fr.readAsDataURL(file);
  });*/

  // Pictures
  var query = app.db.pictures;
  //if (app.args.has('series')) {
  //  query = query.where('series', '==', app.args.get('series'));
  //} else {
  //  query = query.where('num', '==', 0);
  //}
  if (app.args.has('women')) {
    query = query.where('women', 'array-contains-any', app.args.get('women').split(','));
  } else if (app.args.has('tags')) {
    query = query.where('tags', 'array-contains-any', app.args.get('tags').split(','));
  }
  query.get().then((ref) => {
    ref.docs.sort(function(a, b) {
      if (a.data().createdAt < b.data().createdAt) return 1;
      else return -1;
    }).forEach((doc) => {
      $('#pictures').append(app.createCard(doc.id, doc.data()));
      if (doc.data().women) {
        var women = $(`#${doc.id}`).find('.hna-women');
        doc.data().women.forEach((ref) => {
          ref.get().then((w) => {
            women.append(app.createWomen(w.id));
          });
        });
      }
    })
  }).then(() => {
    $('img.lazy').lazyload({
      effect: 'fadeIn',
      effectspeed: 1000
    });
  });

  if (app.args.has("add")) {
    //$('#editDialog').modal('show');
    var timestamp = firebase.firestore.FieldValue.serverTimestamp();
    var fields = {
      url: decodeURI(app.args.get("add")),
      type: 'photo',
      num: 0,
      tags: [],
      createdAt: timestamp,
      updatedAt: timestamp
    };
    app.db.pictures.add(fields).then(function(doc) {
      $('#pictures').prepend(app.createCard(doc.id, fields));
    }).then(function() {
      $('img.lazy').lazyload({
        effect: 'fadeIn',
        effectspeed: 1000
      });
    }).catch(function(error) {
      alert(error);
    });
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
    $('#pictureUrls').empty();
    card.find('.hna-url').get().forEach((e, i) => {
      if (i === 0) {
        $('#hnaUrl0').val($(e).attr('href'));
      } else {
        $(this).find('#pictureUrls').append(app.createUrls($(e).attr('href')));
      }
    });
    $(this).find('.hna-title').val(card.find('.hna-title').text());
    $(this).find('.hna-series').val(card.find('.hna-series').text());
    $(this).find('.hna-num').val(card.find('.hna-num').text());
    $(this).find('input[name="type"]').filter(`[value=${card.find('.hna-type').text()}]`).prop('checked', true);
    women = card.find('.hna-woman').map((i, v) => $(v).text()).get();
    tags = card.find('.hna-tag').map((i, v) => $(v).text()).get()
  } else {
    $(this).find('.modal-title').text('Add');
    $(this).find('.hna-num').val(0);
  }

  app.db.women.orderBy('phoneticName').get().then(function(docs) {
    docs.forEach(function(doc) {
      app.womenSelectOptions.push({ label: doc.data().name, value: doc.id});
    })
  }).then(function() {
    app.createWomenSelect(app.womenSelectOptions, women);
  });

  app.db.tags.get().then(function(docs) {
    docs.forEach(function(doc) {
      app.tagsSelectOptions.push({ label: doc.id, value: doc.id});
    })
  }).then(function() {
    app.createTagsSelect(app.tagsSelectOptions, tags);
  });
});

//
// Save Picture
//
$('#saveChanges').on('click', function(event) {
  var form = $('#editDialogForm');
  if (form.get(0).checkValidity() === true) {
    //form.find('.spinner-border').show();
    var timestamp = firebase.firestore.FieldValue.serverTimestamp();
    var id = form.find('.hna-id').val();
    var women = app.womenSelect.value();
    var fields = {
      urls: form.find('input[name="hnaUrl"]').serializeArray().map((e) => e.value).filter((e) => e.length > 0),
      title: form.find('.hna-title').val(),
      type: form.find('input[name="type"]:checked').val(),
      women: women.map((w) => app.db.women.doc(w)),
      tags: app.tagsSelect.value(),
      //series: form.find('.hna-series').val(),
      //num: Number(form.find('.hna-num').val()),
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
// Save woman
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
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    app.db.women.doc(name).set(fields).then(function() {
      app.womenSelectOptions.push({ label: name, value: name });
      var women = app.womenSelect.value();
      women.push(name);
      $('#hnaWomen').text('');
      app.createWomenSelect(app.womenSelectOptions, women);
      $('#womanDialog').modal('hide');
    }).catch(function(error) {
      console.log(error);
      alert(error);
    });
  } else {
    form.addClass('was-validated');
  }
});

//
// Save tag
//
$('#saveTag').on('click', function(event) {
  var form = $('#tagForm');
  if (form.get(0).checkValidity() === true) {
    //form.find('.spinner-border').show();
    var id = form.find('.tag-id').val();
    var fields = {
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    app.db.tags.doc(id).set(fields).then(function() {
      app.tagsSelectOptions.push({ label: id, value: id });
      var tags = app.tagsSelect.value();
      tags.push(id);
      $('#hnaTags').text('');
      app.createTagsSelect(app.tagsSelectOptions, tags);
      $('#tagDialog').modal('hide');
    }).catch(function(error) {
      console.log(error);
      alert(error);
    });
  } else {
    form.addClass('was-validated');
  }
});
