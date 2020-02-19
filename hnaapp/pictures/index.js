'use strict';

var app = app || {};

(function (app) {
  var cardTemplate = ({ id, title, url, comment, tags }) => `
    <div id="${id}" class="card box-shadow">
      <img class="lazy card-img-top" data-original="${url}">
      <div class="card-body">
        <p class="card-text">${title}</p>
        ${tags}
        <p class="card-text"><small class="text-muted">${comment}</small></p>
        <div class="d-flex justify-content-between align-items-center">
          <div class="btn-group">
            <button type="button" class="btn btn-sm btn-outline-secondary">View</button>
            <button type="button" class="btn btn-sm btn-outline-secondary">Edit</button>
            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="app.delete('${id}');">Delete</button>
          </div>
        </div>
        <p class="card-text"><small class="text-muted">9 mins</small></p>
      </div>
    </div>
  `;

  var tagsTemplate = (tag) => `<span class="badge badge-danger hna-tag">${tag}</span> `;

  var pictures = [];
  var query = hnadata.db.collection('pictures');
  if (hnadata.args['tags'])
    query = query.where('tags', 'in', hnadata.args['tags'].split(','));
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
      hnadata.db.collection('pictures').doc(id).delete().then(function() {
        $(`#${id}`).remove();
        alert('Done.');
      }).catch(function(error) {
        alert(error);
      });
    }
  };
}(app));

$(function() {
  $('#debug').val(JSON.stringify(hnadata.args));
});