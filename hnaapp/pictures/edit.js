'use strict';

var app = app || {};
var tagSelect;

(function(app) {
  app.id = hnaapp.args.id;

  app.paste = function() {
    var range = document.getElementById('url').createTextRange();
    range.execCommand('paste');
  };

  app.save = function() {
    var form = $('#form');
    if (form.checkValidity() === true) {
      var firlds = {
        url: $('#url').val(),
        tags: tagSelect.value(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      if (app.id) {
        hnaapp.db.collection('pictures').doc(app.id).set(fields, { merge: true }).then(function() {
          alert('Done.');
          location.href = 'index.html';
        }).catch(function(error) {
          alert(error);
        });
      } else {
        fields.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        hnaapp.db.collection('pictures').add(fields).then(function () {
          alert('Done.');
          location.href = 'index.html';
        }).catch(function (error) {
          alert(error);
        });
      }
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
