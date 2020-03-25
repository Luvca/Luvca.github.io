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
      var cardTemplate = $('#fb-card-template').prop('outerHTML');

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
              $(card).removeClass('d-none');
              $(card).attr('id', ref.id);
              var carouselId = `fb-post-carousel-${ref.id}`;
              $(card).find('.fb-post-carousel').attr('id', carouselId);
              $(card).find('.fb-post-carousel-control').attr('href', carouselId);
              var carouselItems = $(card).find('.fb-post-carousel-items');
              var carouselItemTemplate = $(card).find('.fb-post-carousel-item').prop('outerHTML');
              carouselItems.empty();
              carouselItems.append(ref.data().urls.map((u, i) => {
                var carouselItem = $.parseHTML(carouselItemTemplate);
                $(carouselItem).find('.fb-post-url').attr('src', u);
                if (i === 0)
                  $(carouselItem).addClass('active');
                return $(carouselItem).prop('outerHTML');
              }).join(''));
              $(card).find('.fb-post-title').text(ref.data().title);
              $(card).find('.fb-post-type').text(ref.data().type);
              $(card).find('.fb-post-url-count').text(ref.data().urls.length);
              $(card).find('.fb-post-created-at').text(ref.data().createdAt.toDate().toLocaleString('ja-JP').replace(/\//g, '-'));
              $(card).find('.fb-post-id').text(ref.id);
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
              if (ref.data().tags) {
                var tagsArea = $(card).find('.fb-post-tags');
                var tagTemplate = $(card).find('.fb-post-tag').prop('outerHTML');
                ref.data().tags.forEach((t) => {
                  var tagBadge = $.parseHTML(tagTemplate);
                  $(tagBadge).text(t);
                  $(tagsArea).append(tagBadge);
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
          $('#fb-post-women').text('');
          var postWomen = card.find('.fb-post-woman').get().map((v) => $(v).text());
          $womenSelect = new SelectPure('#fb-post-women', {
            options: women.getAll(),
            multiple: true,
            icon: 'fa fa-times',
            value: api.intersect(postWomen, women.getAll().map((e) => e.label))
          });
          $('#fb-post-authors').text('');
          var postAuthors = card.find('.fb-post-author').get().map((v) => $(v).text());
          $authorsSelect = new SelectPure('#fb-post-authors', {
            options: authors.getAll(),
            multiple: true,
            icon: 'fa fa-times',
            value: api.intersect(postAuthors, authors.getAll().map((e) => e.label))
          });
          $('#fb-post-tags').text('');
          var postTags = card.find('.fb-post-tag').get().map((v) => $(v).text());
          $tagsSelect = new SelectPure('#fb-post-tags', {
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
