'use strict';

var app = app || {};
var tagSelect;

(function(app) {
  app.paste = function () {
    var range = document.getElementById('url').createTextRange();
    range.execCommand('paste');
  };

  app.add = function () {
    var form = document.getElementById('form');
    if (form.checkValidity() === true) {
      hnaapp.db.collection('pictures').doc().set({
        url: $('#url').val(),
        tags: tagSelect.value(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }).then(function () {
        alert('OK');
        location.href = 'index.html';
      }).catch(function (error) {
        alert(error);
      });
    }
    form.classList.add('was-validated');
  };

  var tags = [];
  hnaapp.db.collection("tags").get().then(function (docs) {
    docs.forEach(function (doc) {
      tags.push({ label: doc.data().name, value: doc.data().name });
    });
  }).then(function () {
    console.log(tags);
    tagSelect = new SelectPure(".tags", {
      options : tags,
      multiple: true,
      autocomplete: true,
      icon: "fa fa-times"
    });
  });
})(app);
