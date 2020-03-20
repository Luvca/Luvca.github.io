'use strict';

var app = app || {};

(function (app) {
  // Card
  app.createCard = (id, data, timestamp) => `
<div id="${id}" class="card box-shadow mb-2">
  <div id="hnaCarousel${id}" class="carousel slide" data-interval="false" data-ride="false">
    <div class="carousel-inner">
      ${data.urls.map(app.createCarouselItem).join('')}
      <a class="carousel-control-prev" href="#hnaCarousel${id}" role="button" data-slide="prev">
        <span class="carousel-control-prev-icon"></span>
        <span class="sr-only">Previous</span>
      </a>
      <a class="carousel-control-next" href="#hnaCarousel${id}" role="button" data-slide="next">
        <span class="carousel-control-next-icon"></span>
        <span class="sr-only">Next</span>
      </a>
    </div>
  </div>
  <div class="card-body pt-2">
    <p class="card-text hna-title">${data.title}</p>
    <span class="hna-women"></span>
    ${app.createWomanBadges(data.women)}
    ${app.createAuthorBadges(data.authors)}
    ${app.createTagBadges(data.tags)}
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
        <span class="hna-timestamp">${timestamp.toLocaleString('ja-JP').replace(/\//g, '-')}</span>
        <div class="m-0 p-0">${id}</div>
      </small>
    </p>
  </div>
</div>
`;

  // Carousel Item
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

  // Women badges
  app.createWomanBadges = (women) => {
    if (!women) return '';
    return women.map((w) => `
<a href="?women=${w}">
  <span class="badge badge-danger hna-woman">${w}</span>
</a>
`).join('');
  };

  // Author badges
  app.createAuthorBadges = (authors) => {
    if (!authors) return '';
    return authors.map((a) => `
<a href="?authors=${a}">
  <span class="badge badge-danger hna-author-badge">${a}</span>
</a>
`).join('');
  };

  // Tag badges
  app.createTagBadges = (tags) => {
    if (!tags) return '';
    return tags.map((t) => `
<a href="?tags=${t}">
  <span class="badge badge-danger hna-tag">${t}</span>
</a>
`).join('');
  };

  // Type radio
  app.createTypeRadio = (type, suffix) => `
<div class="form-check form-check-inline">
  <input class="form-check-input" type="radio" name="type" id="type${type}${suffix}" value="${type}" required>
  <label class="form-check-label" for="type${type}${suffix}">${type}</label>
</div>
`;

  // Women select
  app.createWomenSelectOptions = (callback) => {
    app.womenSelectOptions = [];
    app.db.women.orderBy('phoneticName').get().then((ref) => {
      ref.forEach(function(e) {
        app.womenSelectOptions.push({ label: e.data().name, value: e.id});
        if (app.womenSelectOptions.length === ref.size) {
          if (callback) {
            callback();
          }
        }
      })
    })
  };

  app.createWomenSelect = (id, value) => {
    return new SelectPure(id, {
      options: app.womenSelectOptions,
      multiple: true,
      //autocomplete: true,
      icon: 'fa fa-times',
      value: value
    });
  };

  // Authors select
  app.createAuthorsSelectOptions = (callback) => {
    app.authorsSelectOptions = [];
    app.db.authors.orderBy('phoneticName').get().then((ref) => {
      ref.forEach(function(e) {
        app.authorsSelectOptions.push({ label: e.data().name, value: e.id});
        if (app.authorsSelectOptions.length === ref.size) {
          if (callback) {
            callback();
          }
        }
      })
    })
  };

  app.createAuthorsSelect = (id, value) => {
    return new SelectPure(id, {
      options: app.authorsSelectOptions,
      multiple: true,
      //autocomplete: true,
      icon: 'fa fa-times',
      value: value
    });
  };

  // Tags select
  app.createTagsSelectOptions = (callback) => {
    app.tagsSelectOptions = [];
    app.db.tags.get().then((ref) => {
      app.tagsSelectOptions = [];
      ref.forEach((doc) => {
        app.tagsSelectOptions.push({ label: doc.id, value: doc.id});
        if (app.tagsSelectOptions.length === ref.size) {
          if (callback) {
            callback();
          }
        }
      })
    })
  };

  app.createTagsSelect = (id, value) => {
    return new SelectPure(id, {
      options: app.tagsSelectOptions,
      multiple: true,
      //autocomplete: true,
      icon: 'fa fa-times',
      value: value
    });
  };

  app.search = () => {
    $('#pictures').empty();
    app.lastVisible = null;
    app.readPicture();
  };

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

  app.postPicture = (urls, title, type, women, authors, tags, createdAt) => {
    var timestamp = new Date();
    var fields = {
      urls: urls.map((e) => e.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '')),
      title: title,
      type: type,
      //women: women.map((w) => app.db.women.doc(w)),
      //women: women,
      //tags: tags,
      createdAt: createdAt,
      updatedAt: timestamp
    };
    if (women && women.length > 0) fields.women = women;
    if (authors && authors.length > 0) fields.authors = authors;
    if (tags && tags.length > 0) fields.tags = tags;
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
      console.log(error);
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
  };

  app.readPicture = () => {
    var query = app.db.pictures;
    var filter = $('input[name="hnaSearch"]:checked').val();
    if (filter === 'title' && $('#titleSearch').val().length > 0) {
      query = query.orderBy('title').startAt($('#titleSearch').val()).endAt($('#titleSearch').val() + '\uf8ff');
    } else  {
      if (filter === 'type' && $('#typeSearch').val().length > 0) {
        query = query.where('type', '==', $('#typeSearch').val());
      } else if (filter === 'women' && $('#womenSearch').val().length > 0) {
        //console.log($('#womenSearch').val());
        //query = query.where('women', 'array-contains-any', s('#womenSearch').val().split(',').map((e) => {
        //  return app.db.women.doc(e);
        //}));
        query = query.where('women', 'array-contains-any', $('#womenSearch').val().split(','));
      } else if (filter === 'tags' && $('#tagsSearch').val().length > 0) {
        query = query.where('tags', 'array-contains-any', $('#tagsSearch').val().split(','));
      }
  
      query = query.orderBy($('input[name="hnaOrderBy"]:checked').val(), 'desc');
    }

    if (app.lastVisible) {
      console.log('startAfter');
      query = query.startAfter(app.lastVisible);
    }
  
    query = query.limit(parseInt($('#hnaLimit').val()));
  
    query.get().then((ref) => {
      if (ref.size === 0) {
        $('#readNext').prop('disabled', true);
      }
      // Get the last visible document
      app.lastVisible = ref.docs[ref.docs.length - 1];
      // Sort by create timestamp in descending order
      ref.docs/*.sort(function(a, b) {
        if (app.args.has('recent')) {
          if (a.data().updatedAt < b.data().updatedAt) return 1;
          else return -1;
        } else {
          if (a.data().createdAt < b.data().createdAt) return 1;
          else return -1;
        }
      })*/.forEach((doc) => {
        $('#pictures').append(app.createCard(doc.id, doc.data(), doc.data().createdAt.toDate()));
        /*
        if (doc.data().women) {
          var women = $(`#${doc.id}`).find('.hna-women');
          doc.data().women.forEach((ref) => {
            ref.get().then((w) => {
              women.append(app.createWomanBadge(w.id));
            });
          });
        }
        */
      /*}).then(() => {
      $('img.lazy').lazyload({
        effect: 'fadeIn',
        effectspeed: 1000*/
      });
    }).catch((error) => {
      console.log(error);
    });
  };

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
  <button type="button" class="btn btn-outline-info btn-block" onclick="app.reloadPicture('${name}');">${name}</button>
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
  if (app.args.has('type')) $('#typeSearch').val(app.args.get('type'));
  if (app.args.has('women')) $('#womenSearch').val(app.args.get('women'));
  if (app.args.has('tags')) $('#tagsSearch').val(app.args.get('tags'))
  if (app.args.has('recent')) {
    $('#hnaOrderByUpdatedAt').prop('checked', true);
  } else {
    $('#hnaOrderByCreatedAt').prop('checked', true);
  }
  if (app.args.has('limit')) $('#hnaLimit').val(app.args.get('limit'));

  // Firebase project configuration
  var firebaseConfig = {};
  if (app.args.has('db')) {
    firebaseConfig.projectId = app.args.get('db');
  } else {
    firebaseConfig.projectId = 'fruit-basket-data';
  }
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  app.db = firebase.firestore();
  app.db.pictures = app.db.collection('posts');
  app.db.types = app.db.collection('types');
  app.db.women = app.db.collection('women');
  app.db.authors = app.db.collection('authors');
  app.db.tags = app.db.collection('tags');

  // Types radio
  app.db.types.get().then((ref) => {
    ref.docs.sort((a, b) => {
      if (a.id < b.id) return 1;
      else return -1;
    }).forEach((e) => {
      $('#hnaTypes').append(app.createTypeRadio(e.id, ''));
      $('#hnaTypesBatch').append(app.createTypeRadio(e.id, 'Batch'));
    })
  });

  // Women select
  app.womenSelectOptions = [];
  app.createWomenSelectOptions();
  app.womenSelectEdit = {};
  app.womenSelectBatch = {};

  // Authors select
  app.authorsSelectOptions = [];
  app.createAuthorsSelectOptions();
  app.authorsSelectEdit = {};
  app.authorsSelectBatch = {};

  // Tags select
  app.tagsSelectOptions = [];
  app.createTagsSelectOptions();
  app.tagsSelectEdit = {};
  app.tagsSelectBatch = {};

  app.lastVisible;
  app.readPicture();

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

  /*
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
  */
});

$(document).on('hidden.bs.modal', '.modal', function () {
  $('.modal:visible').length && $(document.body).addClass('modal-open');
});

/*
$('#hnaSearchType').on('click', function(event) {
  $('#typeSearch').prop('disabled', false);
  $('#womenSearch').prop('disabled', true);
  $('#tagsSearch').prop('disabled', true);
});

$('#hnaSearchWomen').on('click', function(event) {
  $('#womenSearch').prop('disabled', false);
  $('#typeSearch').prop('disabled', true);
  $('#tagsSearch').prop('disabled', true);
});

$('#hnaSearchTags').on('click', function(event) {
  $('#tagsSearch').prop('disabled', false);
  $('#typeSearch').prop('disabled', true);
  $('#womenSearch').prop('disabled', true);
});
*/

$('.search-title').on('click', function(event) {
  $('#hnaSearchTitle').prop('checked', true);
  $('.hna-order-by').prop('disabled', true);
});

$('.search-type').on('click', function(event) {
  $('#hnaSearchType').prop('checked', true);
  $('.hna-order-by').prop('disabled', false);
});

$('.search-women').on('click', function(event) {
  $('#hnaSearchWomen').prop('checked', true);
  $('.hna-order-by').prop('disabled', false);
});

$('.search-tags').on('click', function(event) {
  $('#hnaSearchTags').prop('checked', true);
  $('.hna-order-by').prop('disabled', false);
});

//
// Edit Dialog
//
$('#editDialog').on('show.bs.modal', function(event) {
  $(this).find('textarea, :text, select').val('').end().find(':checked').prop('checked', false);
  $('#hnaWomen').text('');
  $('#hnaAuthor').text('');
  $('#hnaTags').text('');
  $(this).find('#editDialogForm').removeClass('was-validated');
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
    $('#googleTitle').prop('href', `https://www.google.co.jp/search?q=${card.find('.hna-title').text()}+${card.find('.hna-type').text()}+adult`);
    $(this).find('input[name="type"]').filter(`[value=${card.find('.hna-type').text()}]`).prop('checked', true);
    //$(this).find('input[name="presence"]').filter(`[value=${card.find('.hna-presence').text()}]`).prop('checked', true);
    var women = new Set(card.find('.hna-woman').map((i, v) => $(v).text()).get());
    var dbWomen = new Set(app.womenSelectOptions.map((e) => e.label));
    var existWomen = Array.from(new Set([...women].filter(e => (dbWomen.has(e)))));
    var authors = new Set(card.find('.hna-author-badge').map((i, v) => $(v).text()).get());
    var dbAuthors = new Set(app.authorsSelectOptions.map((e) => e.label));
    var existAuthors = Array.from(new Set([...authors].filter(e => (dbAuthors.has(e)))));
    var tags = new Set(card.find('.hna-tag').map((i, v) => $(v).text()).get());
    var dbTags = new Set(app.tagsSelectOptions.map((e) => e.label));
    var existTags = Array.from(new Set([...tags].filter(e => (dbTags.has(e)))));
    app.womenSelectEdit = app.createWomenSelect('#hnaWomen', existWomen);
    app.authorsSelectEdit = app.createAuthorsSelect('#hnaAuthor', existAuthors);
    app.tagsSelectEdit = app.createTagsSelect('#hnaTags', existTags);
  } else {
    $(this).find('.modal-title').text('Add');
    $(this).find('.hna-id').val('');
    $(this).find('.hna-timestamp').val('');
    app.womenSelectEdit = app.createWomenSelect('#hnaWomen');
    app.authorsSelectEdit = app.createAuthorsSelect('#hnaAuthor');
    app.tagsSelectEdit = app.createTagsSelect('#hnaTags');
  }
});

//
// Batch Dialog
//
$('#batchDialog').on('show.bs.modal', function(event) {
  $(this).find('textarea, :text, select').val('').end().find(':checked').prop('checked', false);
  $('#hnaWomenBatch').text('');
  $('#hnaAuthorBatch').text('');
  $('#hnaTagsBatch').text('');
  $(this).find('#accessToken').val(app.args.get('k'));
  $('#path').val('/#ladies');
  
  app.womenSelectBatch = app.createWomenSelect('#hnaWomenBatch');
  app.authorsSelectBatch = app.createAuthorsSelect('#hnaAuthorBatch');
  app.tagsSelectBatch = app.createTagsSelect('#hnaTagsBatch');

  $('#getPictures').click();
});

//
// Woman Dialog
//
$('#womanDialog').on('show.bs.modal', function(event) {
  $(this).find('textarea, :text, select').val('').end().find(':checked').prop('checked', false);
  var form = $('#womanForm');
  form.removeClass('was-validated');
  var source = $(event.relatedTarget).data('source');
  var select = $(event.relatedTarget).data('select');
  var women = $(source).find('#hnaWomen .select-pure__selected-label').get().map((e) => $(e).text());
  $('#selectedWomen').val(JSON.stringify(women));
  $('#targetWomen').val(select);
});

//
// Author Dialog
//
$('#authorDialog').on('show.bs.modal', function(event) {
  $(this).find('textarea, :text, select').val('').end().find(':checked').prop('checked', false);
  var form = $('#authorForm');
  form.removeClass('was-validated');
  var source = $(event.relatedTarget).data('source');
  var select = $(event.relatedTarget).data('select');
  var authors = $(source).find('#hnaAuthor .select-pure__selected-label').get().map((e) => $(e).text());
  $('#selectedAuthor').val(JSON.stringify(authors));
  $('#targetAuthor').val(select);
});

//
// Tag Dialog
//
$('#tagDialog').on('show.bs.modal', function(event) {
  $(this).find('textarea, :text, select').val('').end().find(':checked').prop('checked', false);
  var form = $('#tagForm');
  form.removeClass('was-validated');
  var source = $(event.relatedTarget).data('source');
  var select = $(event.relatedTarget).data('select');
  var tags = $(source).find('#hnaTags .select-pure__selected-label').get().map((e) => $(e).text());
  $('#selectedTags').val(JSON.stringify(tags));
  $('#targetTags').val(select);
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
    var women = app.womenSelectEdit.value();
    var authors = app.authorsSelectEdit.value();
    var tags = app.tagsSelectEdit.value();
    var fields = {
      urls: form.find('input[name="hnaUrl"]').serializeArray().map((e) => e.value).filter((e) => e.length > 0),
      title: form.find('.hna-title').val(),
      type: form.find('input[name="type"]:checked').val(),
      //presence: form.find('input[name="presence"]:checked').val(),
      //women: women.map((w) => app.db.women.doc(w)),
      //women: app.womenSelectEdit.value(),
      ///tags: app.tagsSelectEdit.value(),
      updatedAt: timestamp
    };
    if (women && women.length > 0) fields.women = women;
    if (authors && authors.length > 0) fields.authors = authors;
    if (tags && tags.length > 0) fields.tags = tags;
    if (id) {
      app.db.pictures.doc(id).set(fields, { merge: true }).then(function() {
        $('#editDialog').modal('hide');
        $(`#${id}`).replaceWith(app.createCard(id, fields, createdAt));
        //women.forEach((w) => {
        //  $(`#${id}`).find('.hna-women').append(app.createWomanBadge(w));
        //});
      }).then(function() {
        //$('img.lazy').lazyload({
        //  effect: 'fadeIn',
        //  effectspeed: 1000
        //});
      }).catch(function(error) {
        console.log(error);
        alert(error);
      });
    } else {
      fields.createdAt = timestamp;
      app.db.pictures.add(fields).then(function(doc) {
        $('#editDialog').modal('hide');
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
        console.log(error);
        alert(error);
      });
    }
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
    app.db.women.doc(name).set(fields).then(() => {
      app.createWomenSelectOptions(() => {
        var target = $('#targetWomen').val();
        var women = JSON.parse($('#selectedWomen').val());
        women.push(name);
        $('.hna-women').text('');
        if (target == '#hnaWomen') {
          app.womenSelectEdit = app.createWomenSelect(target, women);
        } else {
          app.womenSelectBatch = app.createWomenSelect(target, women);
        }
      });
    }).catch(function(error) {
      console.log(error);
      alert(error);
    });
    $('#womanDialog').modal('hide');
  } else {
    form.addClass('was-validated');
  }
});

//
// Save author
//
$('#saveAuthor').on('click', function(event) {
  var form = $('#authorForm');
  if (form.get(0).checkValidity() === true) {
    //form.find('.spinner-border').show();
    var name = form.find('.author-name').val();
    var phoneticName = form.find('.author-phonetic-name').val();
    var timestamp = new Date();
    var fields = {
      name: name,
      phoneticName: phoneticName,
      //createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      //updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      createdAt: timestamp,
      updatedAt: timestamp
    };
    app.db.authors.doc(name).set(fields).then(() => {
      app.createAuthorsSelectOptions(() => {
        var target = $('#targetAuthor').val();
        var authors = JSON.parse($('#selectedAuthor').val());
        authors.push(name);
        $('.hna-author').text('');
        if (target == '#hnaAuthor') {
          app.authorsSelectEdit = app.createAuthorsSelect(target, authors);
        } else {
          app.authorsSelectBatch = app.createAuthorsSelect(target, authors);
        }
      });
    }).catch(function(error) {
      console.log(error);
      alert(error);
    });
    $('#authorDialog').modal('hide');
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
    app.db.tags.doc(id).set(fields).then(() => {
      app.createTagsSelectOptions(() => {
        var target = $('#targetTags').val();
        var tags = JSON.parse($('#selectedTags').val());
        tags.push(id);
        $('.hna-tags').text('');
        if (target == '#hnaTags') {
          app.tagsSelectEdit = app.createTagsSelect(target, tags);
        } else {
          app.tagsSelectBatch = app.createTagsSelect(target, tags);
        }
      });
    }).catch(function(error) {
      console.log(error);
      alert(error);
    });
    $('#tagDialog').modal('hide');
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
  var women = app.womenSelectBatch.value();
  if (!women) women = [];
  var authors = app.authorsSelectBatch.value();
  if (!authors) authors = [];
  var tags = app.tagsSelectBatch.value();
  if (!tags) tags = [];
  if (!tags.includes('new')) tags.push('new');
  if (checked.length > 0) {
    if (confirm('OK?')) {
      var urls = checked.map((e) => $(e).val());
      var title = $('#batchDialog').find('#batchTitle').val();
      var type = $('#batchDialog').find('input[name="type"]:checked').val();
      var timestamp = new Date(Math.min.apply(null, checked.map((e) => new Date($(e).data('timestamp')))));
      app.postPicture(urls, title, type, women, authors, tags, timestamp);
      $('#batchDialog').modal('hide');
    }
  }
});

$('#goBatchMulti').on('click', function(event) {
  var checked = $('#batchDialog').find('input[name="pictureToAdd"]:checked').get();
  var type = $('#batchDialog').find('input[name="type"]:checked').val();
  var women = app.womenSelectBatch.value();
  if (!women) women = [];
  var authors = app.authorsSelectBatch.value();
  if (!authors) authors = [];
  var tags = app.tagsSelectBatch.value();
  if (!tags) tags = [];
  if (!tags.includes('new')) tags.push('new');
  if (checked.length > 0) {
    if (confirm('OK?')) {
      $('#batchDialog').modal('hide');
      checked.forEach((e) => {
        app.postPicture([$(e).val()], $(e).data('title'), type, women, authors, tags, new Date($(e).data('timestamp')))
      });
    }
  }
});
