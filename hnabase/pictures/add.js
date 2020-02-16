'use strict';

var tagSelect;

(function() {
  window.addEventListener('load', function () {
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.getElementsByClassName('needs-validation');

    // Loop over them and prevent submission
    var validation = Array.prototype.filter.call(forms, function (form) {
      form.addEventListener('submit', function (event) {
        if (form.checkValidity() === false) {
          event.preventDefault();
          event.stopPropagation();
        } else {
          hnadata.db.collection('pictures').add({
            url: $('#url').val()
          }).then(function () {
            alert('OK');
          });
        }
        form.classList.add('was-validated');
      }, false);
    });
  }, false);

  var tags = [];
  hnadata.db.collection("tags").get().then(function (docs) {
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
})();
