$(function () {
  'use strict';

  $(document).ready(function () {
    $('#form').validator().on('submit', function (e) {
      if (e.isDefaultPrevented()) {
      } else {
          alert('all OK !');
      }
    });
  });
});