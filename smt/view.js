'use strict';

smt.export('view', function(smt, undefined) {
  var api = smt.import('api');
  var messages = smt.import('messages');
  var views = smt.import('views');
  var women = smt.import('women').create();
  var authors = smt.import('authors').create();
  var tags = smt.import('tags').create();
  var domParser = new DOMParser();

  function partialSerialize($form) {

    var path = $form.attr('data-binding-path');
    if (!path) return $form.serialize();

    var data = $form.serializeArray();

    var obj = {};
    for (var idx = 0; idx < data.length; idx++) {
      var name = data[idx].name;
      if (path && name !== '__RequestVerificationToken') {
        name = name.replace(path, '');
      }
      obj[name] = data[idx].value;
    }
    return $.param(obj);
  }

  return {
    create: function(init) {
      var bindElement = init.bindElement || {};
      var itemClass = init.itemClass || {};
      var $searchForm = bindElement.searchForm;
      var $errorMessagePanel = bindElement.errorMessagePanel;
      var $infoMessagePanel = bindElement.infoMessagePanel;
      var $resultArea = bindElement.resultArea;
      var post = smt.import('post').create({
        bindElement: bindElement,
        itemClass: itemClass
      });
      var cardTemplate = $('#fb-card-template').html();

      return {
        getSearchOption: function () {
          var data = partialSerialize($searchForm);
          return data;
        },

        getUploadFile: function () {
          var data = partialSerialize($uploadFile);
          return data;
        },

        reset: function () {
          //検索結果クリア
          $resultArea.parent().scrollTop(0);
          $resultArea.empty();
          //エラーメッセージエリアクリア
          $errorMessagePanel.empty();
          //情報メッセージエリアクリア
          $infoMessagePanel.empty();
        },

        showSuccessInfoMessage: function (listAction) {
          var messageKey = views.template('comp-${action}', {
            action: listAction
          });
          $errorMessagePanel.empty();
          $infoMessagePanel.append("<label>" + messages.getMessage(messageKey) + "</label>");
        },

        showErrorInfoMessage: function (listAction) {
          var messageKey = views.template('error-${action}', {
            action: listAction
          });
          $errorMessagePanel.append("<label>" + messages.getMessage(messageKey) + "</label>");
        },

        showInputError: function (err) {
          var html = '';

          if (Array.isArray(err)) {
            for (var key in err) {
              html += '<li>' + err[key] + '</li>';
            }
          } else {
            html += '<li>' + err + '</li>';
          }

          $errorMessagePanel.html('<ul>' + html + '</ul>');
        },

        showPosts: function(result) {
          if (result.length === 0) {
            $infoMessagePanel.append(messages.getMessage('not-result'));
          } else {
            result.forEach((ref) => {
              var card = $.parseHTML(cardTemplate);
              $(card).attr('id', ref.id);
              $(card).find('.fb-post-title').text(ref.data().title);
              if (ref.data().women) {
                var womenArea = $(card).find('.fb-post-women');
                var womanTemplate = $(card).find('.fb-post-woman').prop('outerHTML');
                ref.data().women.forEach((w) => {
                  var womanBadge = $.parseHTML(womanTemplate);
                  $(womanBadge).text(w);
                  $(womenArea).append(womanBadge);
                });
              }
              if (ref.data().authors) {
                var authorsArea = $(card).find('.fb-post-authors');
                var authorTemplate = $(card).find('.fb-post-author').prop('outerHTML');
                ref.data().authors.forEach((a) => {
                  var authorBadge = $.parseHTML(authorTemplate);
                  $(authorBadge).text(a);
                  $(authorsArea).append(authorBadge);
                });
              }
              $resultArea.append(card);
            });
            $('html,body').animate({ scrollTop: $resultArea.offset().top })
          }
        },

        editPost: function(event) {
          var card = $(event.target.closest('.card'));
          var dialog = $('#editDialog');
          dialog.find(`.${itemClass.id}`).val(card.attr('id'));
          dialog.find(`.${itemClass.title}`).val(card.find(`.${itemClass.title}`).text());
          $(`#${itemClass.women}`).text('');
          var postWomen = card.find(`.${itemClass.women}`).map((i, v) => $(v).text()).get();
          $womenSelect = new SelectPure(`#${itemClass.women}`, {
            options: women.getAll(),
            multiple: true,
            icon: 'fa fa-times',
            value: api.intersect(postWomen, women.getAll().map((e) => e.label))
          });
          $(`#${itemClass.authors}`).text('');
          var postAuthors = card.find(`.${itemClass.authors}`).map((i, v) => $(v).text()).get();
          $authorsSelect = new SelectPure(`#${itemClass.authors}`, {
            options: authors.getAll(),
            multiple: true,
            icon: 'fa fa-times',
            value: api.intersect(postAuthors, authors.getAll().map((e) => e.label))
          });
          $(`#${itemClass.tags}`).text('');
          var postTags = card.find(`.${itemClass.tags}`).map((i, v) => $(v).text()).get();
          $tagsSelect = new SelectPure(`#${itemClass.tags}`, {
            options: tags.getAll(),
            multiple: true,
            icon: 'fa fa-times',
            value: api.intersect(postTags, tags.getAll().map((e) => e.label))
          });
          dialog.modal('show');
        },

        getPost: function(event) {
          var dialog = $(event.target.closest('.modal'));
          return {
            id: dialog.find(`.${itemClass.id}`).val(),
            fields: {
              title: dialog.find(`.${itemClass.title}`).val(),
              updatedAt: new Date()
            }
          };
        },

        updatePost: function(data) {
          var card = $(`#${data.id}`);
          card.find(`.${itemClass.title}`).text(data.fields.title);
          $('#editDialog').modal('hide');
        }
      };
    }
  };
});
