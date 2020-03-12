'use strict';

var app = app || {};

(function (app) {
  app.createCarouselItem = (url, index) => {
    var active = '';
    if (index === 0) {
      active = ' active';
    } else {
      active = '';
    }
    return `
<div class="carousel-item${active}">
  <img class="d-block w-100 hna-url" src="${url}">
</div>
`;
  };

  app.createWomanBadge = (woman) => `
<a href="?women=${woman}">
  <span class="badge badge-danger hna-woman">${woman}</span>
</a>
`;

  app.createTagBadge = (tag) => `
<a href="?tags=${tag}">
  <span class="badge badge-danger hna-tag">${tag}</span>
</a>
`;

  app.createCard = (id, data, timestamp) => `
<div id="${id}" class="card box-shadow mb-2">
  <div id="hnaCarousel${id}" class="carousel slide" data-ride="carousel">
    <div class="carousel-inner">
      ${data.urls.map(app.createCarouselItem).join('')}
      <a class="carousel-control-prev" href="#hnaCarousel${id}" role="button" data-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="sr-only">Previous</span>
      </a>
      <a class="carousel-control-next" href="#hnaCarousel${id}" role="button" data-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="sr-only">Next</span>
      </a>
    </div>
  </div>
  <div class="card-body pt-2">
    <p class="card-text hna-title">${data.title}</p>
    <span class="hna-women"></span>
    ${data.tags.map(app.createTagBadge).join('')}
    <div class="d-flex justify-content-between align-items-center mt-2">
      <button type="button" class="btn btn-sm btn-outline-secondary pt-0 mr-1" data-id="${id}">View</button>
      <button type="button" class="btn btn-sm btn-outline-secondary pt-0 mr-auto" data-toggle="modal" data-target="#editDialog" data-id="${id}">Edit</button>
      <!--
      <button type="button" class="btn btn-sm btn-outline-secondary pt-0" onclick="app.deletePicture('${id}');">Delele</button>
      -->
      </div>
    <p class="card-text">
      <small class="text-muted">
        <span class="hna-type">${data.type}</span>
        <span>&#x00D7;</span>
        <span>${data.urls.length}</span>
        <span class="hna-presence d-none">${data.presence}</span>
        <span class="hna-timestamp">${timestamp.toLocaleString('ja-JP').replace(/\//g, '-')}</span>
      </small>
    </p>
  </div>
</div>
`;

  app.createUrls = (url) => `
<div class="input-group">
  <input name="hnaUrl" class="form-control" value="${url}">
  <div class="input-group-append">
    <button type="button" class="form-control" onclick="app.delUrl(this);">&times;</button>
  </div>
</div>
`;

  app.addUrl = () => {
    $('#pictureUrls').append(app.createUrls(''));
  };

  app.delUrl = (e) => {
    $(e).parent().parent().remove();
  };

  app.postPicture = (urls, title, createdAt) => {
    var timestamp = new Date();
    var fields = {
      urls: urls.map((e) => e.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '')),
      title: title,
      tags: ['new'],
      createdAt: createdAt,
      updatedAt: timestamp
    };
    console.log(fields);
    app.db.pictures.add(fields).then(function(doc) {
      //$('#batchDialog').modal('hide');
      $('#pictures').prepend(app.createCard(doc.id, fields, fields.createdAt));
      //women.forEach((w) => {
      //  $(`#${doc.id}`).find('.hna-women').append(app.createWomanBadge(w));
      //});
    }).then(function() {
      //$('img.lazy').lazyload({
      //  effect: 'fadeIn',
      //  effectspeed: 1000
      //});
    }).catch(function(error) {
      alert(error);
    });
  };

  app.deletePicture = (id, callback) => {
    if (confirm('OK')) {
      app.db.pictures.doc(id).delete().then(() => {
        $(`#${id}`).fadeOut('normal', function() {
          $(`#${id}`).remove();
          if (callback) callback();
        });
      }).catch((error) => {
        alert(error);
      });
    };
  }

  app.loadPicture = (id, name, timestamp, callback) => {
    $('#pictureList').append(`
<div id="${id.substring(3)}" class="card mb-2"></div>
`);
    callback(id, name, timestamp);
  };

  app.loadPictureDiv = (id, url, title, timestamp) => {
    var direct = url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
    $(`#${id.substring(3)}`).append(`
<div class="form-check form-check-inline">
  <input name="pictureToAdd" type="checkbox" class="form-check-input" value="${direct}" data-title="${title}" data-timestamp="${timestamp}">
  <label class="form-check-label" for="pictureToAdd">${title}</label>
</div>
<img class="card-img-bottom hna-picture" src="${direct}">
`);
  };
  
  app.showFolder = (name, title, timestamp) => {
    $('#pictureList').append(`
<div class="card mb-2">
  <button type="button" class="btn btn-outline-secondary w-100" onclick="app.reloadPicture('${name}');">${name}</button>
  <!--
  <div class="input-group">
    <input id="path" class="form-control" value="${name}">
    <div class="input-group-append">
      <button type="button" class="btn btn-outline-secondary" onclick="app.reloadPicture('${name}');">↑</button>
    </div>
  </div>
  -->
</div>
`);
  };

  app.reloadPicture = (name) => {
    $('#path').val(name);
    $('#getPictures').click();
  };

  app.selectAll = (check) => {
    $('input[name="pictureToAdd"]').prop('checked', check.checked);
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
      //autocomplete: true,
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
      //autocomplete: true,
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
  if (app.args.has('type')) {
    query = query.where('type', '==', app.args.get('type'));
  }
  if (app.args.has('presence')) {
    query = query.where('presence', '==', app.args.get('presence'));
  }
  if (app.args.has('women')) {
    //query = query.where('women', 'array-contains-any', app.args.get('women').split(','));
    query = query.where('women', 'array-contains-any', app.args.get('women').split(',').map((e) => {
      //console.log(e);
      return app.db.women.doc(e);
    }));
    //console.log(app.args.get('women').split(','));
    //console.log(app.args.get('women').split(',').map((e) => {
    //  console.log(e);
    //  return app.db.women.doc(e);
    //}));
  } else if (app.args.has('tags')) {
    query = query.where('tags', 'array-contains-any', app.args.get('tags').split(','));
  }
  query.get().then((ref) => {
    // Sort by create timestamp in descending order
    ref.docs.sort(function(a, b) {
      if (a.data().createdAt < b.data().createdAt) return 1;
      else return -1;
    }).forEach((doc) => {
      $('#pictures').append(app.createCard(doc.id, doc.data(), doc.data().createdAt.toDate()));
      if (doc.data().women) {
        var women = $(`#${doc.id}`).find('.hna-women');
        doc.data().women.forEach((ref) => {
          ref.get().then((w) => {
            women.append(app.createWomanBadge(w.id));
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
      $('#pictures').prepend(app.createCard(doc.id, fields, fields.createdAt));
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
        $('#hnaUrl0').val($(e).attr('src'));
      } else {
        $(this).find('#pictureUrls').append(app.createUrls($(e).attr('src')));
      }
    });
    $(this).find('.hna-timestamp').val(card.find('.hna-timestamp').text());
    $(this).find('.hna-title').val(card.find('.hna-title').text());
    $(this).find('input[name="type"]').filter(`[value=${card.find('.hna-type').text()}]`).prop('checked', true);
    $(this).find('input[name="presence"]').filter(`[value=${card.find('.hna-presence').text()}]`).prop('checked', true);
    women = card.find('.hna-woman').map((i, v) => $(v).text()).get();
    tags = card.find('.hna-tag').map((i, v) => $(v).text()).get()
  } else {
    $(this).find('.modal-title').text('Add');
    $(this).find('.hna-id').val('');
    $(this).find('.hna-timestamp').val('');
  }

  app.db.women.orderBy('phoneticName').get().then(function(docs) {
    app.womenSelectOptions = [];
    docs.forEach(function(doc) {
      app.womenSelectOptions.push({ label: doc.data().name, value: doc.id});
    })
  }).then(function() {
    app.createWomenSelect(app.womenSelectOptions, women);
  });

  app.db.tags.get().then(function(docs) {
    app.tagsSelectOptions = [];
    docs.forEach(function(doc) {
      app.tagsSelectOptions.push({ label: doc.id, value: doc.id});
    })
  }).then(function() {
    app.createTagsSelect(app.tagsSelectOptions, tags);
  });
});

//
// Batch Dialog
//
$('#batchDialog').on('show.bs.modal', function(event) {
  console.log(app.args.get('k'));
  $(this).find('#accessToken').val(app.args.get('k'));
  $('#path').val('/#ladies');
  $('#getPictures').click();
});

//
// Save Picture
//
$('#saveChanges').on('click', function(event) {
  var form = $('#editDialogForm');
  if (form.get(0).checkValidity() === true) {
    //form.find('.spinner-border').show();
    //var timestamp = firebase.firestore.FieldValue.serverTimestamp();
    var timestamp = new Date();
    var id = form.find('.hna-id').val();
    var createdAt = form.find('.hna-timestamp').val();
    var women = app.womenSelect.value();
    var fields = {
      urls: form.find('input[name="hnaUrl"]').serializeArray().map((e) => e.value).filter((e) => e.length > 0),
      title: form.find('.hna-title').val(),
      type: form.find('input[name="type"]:checked').val(),
      presence: form.find('input[name="presence"]:checked').val(),
      women: women.map((w) => app.db.women.doc(w)),
      tags: app.tagsSelect.value(),
      updatedAt: timestamp
    };
    if (id) {
      app.db.pictures.doc(id).set(fields, { merge: true }).then(function() {
        $('#editDialog').modal('hide');
        console.log(fields.updatedAt);
        $(`#${id}`).replaceWith(app.createCard(id, fields, createdAt));
        women.forEach((w) => {
          $(`#${id}`).find('.hna-women').append(app.createWomanBadge(w));
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
        $('#pictures').prepend(app.createCard(doc.id, fields, fields.createdAt));
        women.forEach((w) => {
          $(`#${doc.id}`).find('.hna-women').append(app.createWomanBadge(w));
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
// Delete Picture
//
$('#deletePicture').on('click', function(event) {
  var form = $('#editDialogForm');
  var id = form.find('.hna-id').val();
  app.deletePicture(id, function() {$('#editDialog').modal('hide')});
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
    var timestamp = new Date();
    var fields = {
      name: name,
      phoneticName: phoneticName,
      //createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      //updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      createdAt: timestamp,
      updatedAt: timestamp
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
    var timestamp = new Date();
    var fields = {
      //createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      //updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      createdAt: timestamp,
      updatedAt: timestamp
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

//
// List Pictures
//
$('#getPictures').on('click', function(event) {
  var token = $('#accessToken').val();
  $('#pictureList').empty();
  
  $.ajax({
    url: 'https://api.dropboxapi.com/2/files/list_folder',
    type: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    dataType: 'json',
    data: JSON.stringify({
      'path': $('#path').val()
    })
  }).done((list) => {
    list.entries.sort(function(a, b) {
      if (a.client_modified < b.client_modified) return -1;
      else return 1;
    }).forEach((item, index, array) => {
      if (item['.tag'] === 'file' && item.name.split('.').pop().match(/jpe?g|png|gif|bmp/i)) {
        app.loadPicture(item.id, item.name, item.client_modified, function(id, name, timestamp) {
          $.ajax({
            url: 'https://api.dropboxapi.com/2/sharing/list_shared_links',
            type: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            dataType: 'json',
            data: JSON.stringify({
              'path': `${id}`,
              'direct_only': true
            })
          }).done((share) => {
            if (share.links.length === 0) {
              $.ajax({
                url: 'https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings',
                type: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                dataType: 'json',
                data: JSON.stringify({
                  'path': `${id}`
                })
              }).done((newShare) => {
                app.loadPictureDiv(id, newShare.url, name.replace(/\.[^/.]+$/, ''), timestamp);
              }).fail((error) => {
                console.log(error);
              }).always(() => {
              });
            } else {
              app.loadPictureDiv(id, share.links[0].url, name.replace(/\.[^/.]+$/, ''), timestamp);
            }
          }).fail((error) => {
            console.log(error);
          }).always(() => {
          });
        });
      } else if (item['.tag'] === 'folder') {
        app.showFolder($('#path').val() + '/' + item.name);
      }
    });
  }).fail((error) => {
      console.log(error);
  }).always(() => {
  })
});

//
// Go Batch
//
$('#goBatchSingle').on('click', function(event) {
  var checked = $('#batchDialog').find('input[name="pictureToAdd"]:checked').get();
  if (checked.length > 0) {
    if (confirm('OK?')) {
      var urls = checked.map((e) => $(e).val());
      var title = $('#batchDialog').find('#batchTitle').val();
      var timestamp = new Date(Math.min.apply(null, checked.map((e) => new Date($(e).data('timestamp')))));
      console.log(urls);
      console.log(title);
      console.log(timestamp);
      app.postPicture(urls, title, timestamp);
    }
  }
  $('#batchDialog').modal('hide');
});

$('#goBatchMulti').on('click', function(event) {
  var checked = $('#batchDialog').find('input[name="pictureToAdd"]:checked').get();
  if (checked.length > 0) {
    if (confirm('OK?')) {
      checked.forEach((e) => {
        console.log($(e).val());
        console.log($(e).data('title'));
        console.log($(e).data('timestamp'));
        app.postPicture([$(e).val()], $(e).data('title'), new Date($(e).data('timestamp')))
      });
    }
  }
  $('#batchDialog').modal('hide');
});
