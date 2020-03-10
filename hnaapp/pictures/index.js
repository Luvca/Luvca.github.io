'use strict';

var app = app || {};

(function (app) {
  app.createImage = (url) => `
<div mb-1>
  <a class="hna-url" href="${url}">
    <img class="lazyxx card-img-top" src="${url}">
  </a>
</div>
`;

  app.createImages = (urls) => {
    var result = [];
    urls.forEach((e, i, a) => {
      if (i > 0) {
        result.push(e);
      }
      if (result.length === a.length - 1) {
        return result.map(app.createImage).join('');
    });
  };

  app.createWomen = (woman) => `
<a href="?women=${woman}">
  <span class="badge badge-danger hna-woman">${woman}</span>
</a>
`;

  app.createTags = (tag) => `
<a href="?tags=${tag}">
  <span class="badge badge-danger hna-tag">${tag}</span>
</a>
`;

  app.createCard = (id, data, updatedAt) => `
<div id="${id}" class="card box-shadow mb-2">
  ${app.createImage(data.urls[0])}
  ${app.createImages(data.urls)}
  ${data.urls.map(app.createImage).join('')}
  <div class="card-body pt-2">
    <p class="card-text hna-title">${data.title}</p>
    <span class="hna-women"></span>
    ${data.tags.map(app.createTags).join('')}
    <!--
    <p class="card-text">
      <small class="text-muted">${data.comment}</small>
    </p>
    -->
    <div class="d-flex justify-content-between align-items-center mt-2">
      <div class="btn-groupxx">
        <button type="button" class="btn btn-sm btn-outline-secondary pt-0" data-id="${id}">View</button>
        <button type="button" class="btn btn-sm btn-outline-secondary pt-0 mr-auto" data-toggle="modal" data-target="#editDialog" data-id="${id}">Edit</button>
        <button type="button" class="btn btn-sm btn-outline-secondary pt-0" data-id="${id}">Delele</button>

      </div>
    </div>
    <p class="card-text">
      <small class="text-muted hna-type">${data.type}</small>
      <small class="text-muted">${updatedAt.toLocaleString('ja-JP').replace(/\//g, '-')}</small>
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

  app.addUrl = function() {
    $('#pictureUrls').append(app.createUrls(''));
  };

  app.delUrl = function(e) {
    $(e).parent().parent().remove();
  };

  app.postPicture = function(urls, title) {
    var timestamp = new Date();
    var fields = {
      urls: urls.map((e) => e.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '')),
      title: title,
      tags: ['new'],
      createdAt: timestamp,
      updatedAt: timestamp
    };
    console.log(fields);
    app.db.pictures.add(fields).then(function(doc) {
      //$('#batchDialog').modal('hide');
      $('#pictures').prepend(app.createCard(doc.id, fields, fields.createdAt));
      //women.forEach((w) => {
      //  $(`#${doc.id}`).find('.hna-women').append(app.createWomen(w));
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
  //if (app.args.has('series')) {
  //  query = query.where('series', '==', app.args.get('series'));
  //} else {
  //  query = query.where('num', '==', 0);
  //}
  console.log(app.args);
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
        $('#hnaUrl0').val($(e).attr('href'));
      } else {
        $(this).find('#pictureUrls').append(app.createUrls($(e).attr('href')));
      }
    });
    $(this).find('.hna-title').val(card.find('.hna-title').text());
    $(this).find('input[name="type"]').filter(`[value=${card.find('.hna-type').text()}]`).prop('checked', true);
    women = card.find('.hna-woman').map((i, v) => $(v).text()).get();
    tags = card.find('.hna-tag').map((i, v) => $(v).text()).get()
  } else {
    $(this).find('.modal-title').text('Add');
    $(this).find('.hna-id').val('');
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
// Save Picture
//
$('#saveChanges').on('click', function(event) {
  var form = $('#editDialogForm');
  if (form.get(0).checkValidity() === true) {
    //form.find('.spinner-border').show();
    //var timestamp = firebase.firestore.FieldValue.serverTimestamp();
    var timestamp = new Date();
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
        console.log(fields.updatedAt);
        $(`#${id}`).replaceWith(app.createCard(id, fields, fields.updatedAt));
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
        $('#pictures').prepend(app.createCard(doc.id, fields, fields.createdAt));
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
// Delete Picture
//
$('#deletePicture').on('click', function(event) {
  if (confirm('OK?')) {
    $('#editDialog').modal('hide');
    var form = $('#editDialogForm');
    var id = form.find('.hna-id').val();
    $(`#${id}`).fadeOut('normal', function() {
      $(`#${id}`).remove();
      app.db.pictures.doc(id).delete().then(() => {
      }).catch((error) => {
        alert(error);
      });
    });
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
// Batch
//
$('#goBatch').on('click', function(event) {
  if (confirm('OK?')) {
    var token = $('#accessToken').val();
    var title = $('#title').val();
  
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
      var urls = [];
      list.entries.sort(function(a, b) {
        if (a.server_modified < b.server_modified) return 1;
        else return -1;
      }).forEach((item, index, array) => {
        $.ajax({
          url: 'https://api.dropboxapi.com/2/sharing/list_shared_links',
          type: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          dataType: 'json',
          data: JSON.stringify({
            'path': `${item.id}`
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
                'path': `${item.id}`
              })
            }).done((newShare) => {
              urls.push(newShare.links[0].url);
              console.log(JSON.stringify(newShare.links[0].url));
              if (urls.length === array.length) {
                app.postPicture(urls, title);
              }
            }).fail((error) => {
              console.log(error);
            }).always(() => {
            });
          } else {
            urls.push(share.links[0].url);
            console.log(JSON.stringify(share.links[0].url));
            if (urls.length === array.length) {
              app.postPicture(urls, title);
            }
        }
        }).fail((error) => {
          console.log(error);
        }).always(() => {
        });
      });
    }).fail((error) => {
        console.log(error);
    }).always(() => {
    })
  }
  $('#batchDialog').modal('hide');
});