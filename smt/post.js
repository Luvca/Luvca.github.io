'use strict';

smt.export('paging', function (smt, undefined) {
  function copyData(event) {
    var dialog = event.target;
    var postId = event.relatedTarget.getAttribute('data-id');
    $(dialog).find('.fb-post-title').val($(`#${postId}`).find('.fb-post-title').text());
    $womenSelect = new SelectPure('#fb-women', {
      options: [
        { label: 'Lucy', value: 'Lucy' },
        { label: 'Jane', value: 'Jane' },
        { label: 'Nina', value: 'Nina' }],
      multiple: true,
      icon: 'fa fa-times',
      value: ['Jane']
    });
  }

  return {
    create: function () {
      var api = smt.import('api');
      var html;
      api.getHtml('post.html').done((res) => {
        html = res;
        var doc = new DOMParser().parseFromString(res, 'text/html');
        //var editDialog = $(doc).find('#editDialog');
        //$('body').append(editDialog);
        $('#editDialog').on('show.bs.modal', copyData);
      });

      return {
        createCard: function(data) {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var card = $(doc).find('.fb-post');
          $(card).attr('id', data.id);
          $(card).find('.fb-post-title').text(data.title);
          $(card).find('.fb-edit-post').attr('data-id', data.id);
          return card;
        }
      };
    }
  }
});
