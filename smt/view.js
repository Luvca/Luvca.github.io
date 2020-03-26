'use strict';

smt.export('view', function(smt, undefined) {
  var api = smt.import('api');
  var messages = smt.import('messages');
  var views = smt.import('views');
  var types = smt.import('types').create();
  var women = smt.import('women').create();
  var authors = smt.import('authors').create();
  var tags = smt.import('tags').create();

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

  function createCard(cardpost, template, callback) {
    var card = $.parseHTML(template);
    $(card).removeClass('d-none');
    $(card).attr('id', cardpost.id);
    var carouselId = `fb-post-carousel-${cardpost.id}`;
    $(card).find('.fb-post-carousel').attr('id', carouselId);
    $(card).find('.fb-post-carousel-control').attr('href', `#${carouselId}`);
    var carouselItems = $(card).find('.fb-post-carousel-items');
    var carouselItemTemplate = $(card).find('.fb-post-carousel-item').prop('outerHTML');
    carouselItems.empty();
    carouselItems.append(cardpost.fields.urls.map((u, i) => {
      var carouselItem = $.parseHTML(carouselItemTemplate);
      $(carouselItem).find('.fb-post-image').attr('src', u);
      if (i === 0)
        $(carouselItem).addClass('active');
      return $(carouselItem).prop('outerHTML');
    }).join(''));
    $(card).find('.fb-post-title').text(cardpost.fields.title);
    $(card).find('.fb-post-type').text(cardpost.fields.type);
    $(card).find('.fb-post-url-count').text(cardpost.fields.urls.length);
    console.log(cardpost.fields.createdAt);
    if (cardpost.fields.createdAt) {
      try {
        $(card).find('.fb-post-created-at').text(cardpost.fields.createdAt.toLocaleString('ja-JP').replace(/\//g, '-'));
      } catch {}
      //$(card).find('.fb-post-created-at').text(Date.parse(cardpost.fields.createdAt).toLocaleString('ja-JP').replace(/\//g, '-'));
      //$(card).find('.fb-post-created-at').text(Date.parse(cardpost.fields.createdAt));
    }
    $(card).find('.fb-post-id').text(cardpost.id);
    if (cardpost.fields.women) {
      var womenArea = $(card).find('.fb-post-women');
      var womanTemplate = $(card).find('.fb-post-woman').prop('outerHTML');
      cardpost.fields.women.forEach((w) => {
        var womanBadge = $.parseHTML(womanTemplate);
        $(womanBadge).text(w);
        $(womenArea).append(womanBadge);
      });
    }
    if (cardpost.fields.authors) {
      var authorsArea = $(card).find('.fb-post-authors');
      var authorTemplate = $(card).find('.fb-post-author').prop('outerHTML');
      cardpost.fields.authors.forEach((a) => {
        var authorBadge = $.parseHTML(authorTemplate);
        $(authorBadge).text(a);
        $(authorsArea).append(authorBadge);
      });
    }
    if (cardpost.fields.tags) {
      var tagsArea = $(card).find('.fb-post-tags');
      var tagTemplate = $(card).find('.fb-post-tag').prop('outerHTML');
      cardpost.fields.tags.forEach((t) => {
        var tagBadge = $.parseHTML(tagTemplate);
        $(tagBadge).text(t);
        $(tagsArea).append(tagBadge);
      });
    }
    callback(card);
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
      var editDialog = $('#editDialog');
      var postUrls = editDialog.find('#fb-post-urls');
      var urlTemplate = $(postUrls).html();
      var typeHolder = editDialog.find('.fb-post-types');
      var typeTemplate = $(typeHolder).html();

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
              var fields = ref.data();
              fields.createdAt = fields.createdAt.toDate();
              createCard({id: ref.id, fields: fields}, cardTemplate, function(card) {
                $resultArea.append(card);
              })
            });
            $('html,body').animate({ scrollTop: $resultArea.offset().top })
          }
        },

        editPost: function(event) {
          var card = $(event.target.closest('.card'));
          var cardPost = {
            id: card.attr('id'),
            fields: {
              urls: card.find('.fb-post-image').get().map((i) => $(i).attr('src')),
              title: card.find('.fb-post-title').text(),
              type: card.find('.fb-post-type').text(),
              women: card.find('.fb-post-woman').get().map((w) => $(w).text()),
              authors: card.find('.fb-post-author').get().map((a) => $(a).text()),
              tags: card.find('.fb-post-tag').get().map((t) => $(t).text()),
              createdAt: card.find('.fb-post-created-at').text()
            }
          };
          editDialog.find('#fb-post-id').val(cardPost.id);
          editDialog.find('#fb-post-created-at').val(cardPost.fields.createdAt);
          postUrls.empty();
          cardPost.fields.urls.forEach((u) => {
            var postUrl = $.parseHTML(urlTemplate);
            $(postUrl).find('.fb-post-url').val(u);
            postUrls.append(postUrl);
          });
          editDialog.find('#fb-post-title').val(cardPost.fields.title);
          typeHolder.empty();
          types.getAll().forEach((t) => {
            var typeItem = $.parseHTML(typeTemplate);
            var radio = $(typeItem).find('input[name="fb-post-type"]');
            radio.attr('value', t);
            if (t === cardPost.fields.type)
              radio.prop('checked', true);
            $(typeItem).find('.fb-post-type').text(t);
            typeHolder.append(typeItem);
          });
          $('#fb-post-women').text('');
          $womenSelect = new SelectPure('#fb-post-women', {
            options: women.getAll(),
            multiple: true,
            icon: 'fa fa-times',
            value: api.intersect(cardPost.fields.women, women.getAll().map((e) => e.label))
          });
          $('#fb-post-authors').text('');
          $authorsSelect = new SelectPure('#fb-post-authors', {
            options: authors.getAll(),
            multiple: true,
            icon: 'fa fa-times',
            value: api.intersect(cardPost.fields.authors, authors.getAll().map((e) => e.label))
          });
          $('#fb-post-tags').text('');
          $tagsSelect = new SelectPure('#fb-post-tags', {
            options: tags.getAll(),
            multiple: true,
            icon: 'fa fa-times',
            value: api.intersect(cardPost.fields.tags, tags.getAll().map((e) => e.label))
          });
          editDialog.modal('show');
        },

        getPost: function(event) {
          var dialog = $(event.target.closest('.modal'));
          return {
            id: dialog.find('#fb-post-id').val(),
            fields: {
              urls: dialog.find('.fb-post-url').get().map((u) => $(u).val()),
              title: dialog.find('#fb-post-title').val(),
              type: dialog.find('input[name="fb-post-type"]:checked').val(),
              women: $womenSelect.value(),
              ahthors: $authorsSelect.value(),
              tags: $tagsSelect.value(),
              createdAt: Date.parse(dialog.find('#fb-post-created-at').val()),
              updatedAt: new Date()
            }
          };
        },

        updatePost: function(data) {
          createCard(data, cardTemplate, function(card) {
            var current = $(`#${data.id}`);
            current.replaceWith(card);
          });
          $('#editDialog').modal('hide');
        }
      };
    }
  };
});
