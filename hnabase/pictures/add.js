'use strict';

var tags;

(function() {
  window.addEventListener('load', function() {
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.getElementsByClassName('needs-validation');

    // Loop over them and prevent submission
    var validation = Array.prototype.filter.call(forms, function(form) {
      form.addEventListener('submit', function(event) {
        if (form.checkValidity() === false) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add('was-validated');
      }, false);
    });
  }, false);

  tags = new SelectPure(".tags", {
    options : hnabase.tags(),
    multiple: true,
    autocomplete: true,
    icon: "fa fa-times"
  });

  //$('#debug').val(JSON.stringify(hnabase.dbtags()));
})();