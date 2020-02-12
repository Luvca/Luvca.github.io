'use strict';

var app = app || { };

(function (app) {
  var cardTemplate = ({ title, url, comment }) => `
    <div class="card box-shadow">
      <img class="lazy card-img-top" data-original="${url}">
      <div class="card-body">
        <p class="card-text">${title}</p>
        <p class="card-text"><small class="text-muted">${comment}</small></p>
        <div class="d-flex justify-content-between align-items-center">
          <div class="btn-group">
            <button type="button" class="btn btn-sm btn-outline-secondary">View</button>
            <button type="button" class="btn btn-sm btn-outline-secondary">Edit</button>
          </div>
        </div>
        <p class="card-text"><small class="text-muted">9 mins</small></p>
      </div>
    </div>
  `;

  // Initialize Cloud Firestore through Firebase
  /*
  firebase.initializeApp({
    projectId: 'hnabase'
  });
  var db = firebase.firestore();
  var pictures = db.collection("pictures");
  var result;
  [ "hoge", "fuga" ].forEach((tag, i) => {
    if (i === 0) {
      result = collection.where("tags", "array-contains", tag).get();
    } else {
      $.merge(result, collection.where("tags", "array-contains", tag).get());
    }
  });
  result.then((docs) => {
    docs.forEach((doc) => {
      console.log(`${doc.id} => ${doc.data()}`);
    });
  });

  */

  $(document).ready(function () {
    $('#pictures').append(hnabase.pictures().map(cardTemplate).join(''));
  });
  
  $(function($) {
    $('img.lazy').lazyload({
      effect: 'fadeIn',
      effectspeed: 1000
    });
  });

  app.test = function () {
    return 'test';
  };
}(app));