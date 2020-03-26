'use strict';

smt.export('view', function(smt, undefined) {
  var api = smt.import('api');
  var types = smt.import('types').create();
  var women = smt.import('women').create();
  var authors = smt.import('authors').create();
  var tags = smt.import('tags').create();

  function createCard(cardPost, template, callback) {
    var card = $.parseHTML(template);
    $(card).removeClass('d-none');
    $(card).attr('id', cardPost.id);
    var carouselId = `fb-post-carousel-${cardPost.id}`;
    $(card).find('.fb-post-carousel').attr('id', carouselId);
    $(card).find('.fb-post-carousel-control').attr('href', `#${carouselId}`);
    var carouselItems = $(card).find('.fb-post-carousel-items');
    var carouselItemTemplate = $(card).find('.fb-post-carousel-item').prop('outerHTML');
    carouselItems.empty();
    carouselItems.append(cardPost.fields.urls.map((u, i) => {
      var carouselItem = $.parseHTML(carouselItemTemplate);
      $(carouselItem).find('.fb-post-image').attr('src', u);
      if (i === 0)
        $(carouselItem).addClass('active');
      return $(carouselItem).prop('outerHTML');
    }).join(''));
    $(card).find('.fb-post-title').text(cardPost.fields.title);
    $(card).find('.fb-post-type').text(cardPost.fields.type);
    createBadge(card, cardPost.fields.women, '.fb-post-women', '.fb-post-woman');
    createBadge(card, cardPost.fields.authors, '.fb-post-authors', '.fb-post-author');
    createBadge(card, cardPost.fields.tags, '.fb-post-tags', '.fb-post-tag');
    $(card).find('.fb-post-url-count').text(cardPost.fields.urls.length);
    if (cardPost.fields.createdAt) {
      try {
        $(card).find('.fb-post-created-at').text(cardPost.fields.createdAt.toLocaleString('ja-JP').replace(/\//g, '-'));
      } catch {}
      //$(card).find('.fb-post-created-at').text(Date.parse(cardPost.fields.createdAt).toLocaleString('ja-JP').replace(/\//g, '-'));
      //$(card).find('.fb-post-created-at').text(Date.parse(cardPost.fields.createdAt));
    }
    $(card).find('.fb-post-id').text(cardPost.id);
    callback(card);
  }

  function createBadge(card, items, areaClass, badgeClass) {
    if (items) {
      var area = $(card).find(areaClass);
      var template = $(card).find(badgeClass).prop('outerHTML');
      items.forEach((e) => {
        var badge = $.parseHTML(template);
        $(badge).text(e);
        $(area).append(badge);
      });
    }
  }

  function createSelectPure(container, options, values) {
    $(container).text('');
    return new SelectPure(container, {
      options: options,
      multiple: true,
      icon: 'fa fa-times',
      value: api.intersect(values, options.map((e) => e.label))
    });
  }

  return {
    create: function() {
      var $resultArea = $('#search-result');
      var $infoMessageArea = $('#info-msg-area');
      var $cardTemplate = $('#fb-card-template').prop('outerHTML');
      var $editDialog = $('#editDialog');
      var $postUrls = $editDialog.find('#fb-post-urls');
      var urlTemplate = $($postUrls).html();
      var typeHolder = $editDialog.find('.fb-post-types');
      var typeTemplate = $(typeHolder).html();

      return {
        reset: function () {
          $resultArea.parent().scrollTop(0);
          $resultArea.empty();
          $infoMessageArea.empty();
        },

        showPosts: function(result) {
          if (result.length === 0) {
            $infoMessageArea.append('No posts.');
          } else {
            result.forEach((ref) => {
              var fields = ref.data();
              try {
                fields.createdAt = fields.createdAt.toDate();
              } catch {}
              createCard({id: ref.id, fields: fields}, $cardTemplate, function(card) {
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
          $editDialog.find('#fb-post-id').val(cardPost.id);
          $editDialog.find('#fb-post-created-at').val(cardPost.fields.createdAt);
          $postUrls.empty();
          cardPost.fields.urls.forEach((u) => {
            var postUrl = $.parseHTML(urlTemplate);
            $(postUrl).find('.fb-post-url').val(u);
            $postUrls.append(postUrl);
          });
          $editDialog.find('#fb-post-title').val(cardPost.fields.title);
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
          $womenSelect = createSelectPure('#fb-post-women', women.getAll(), cardPost.fields.women);
          $authorsSelect = createSelectPure('#fb-post-authors', authors.getAll(), cardPost.fields.authors);
          $tagsSelect = createSelectPure('#fb-post-tags', tags.getAll(), cardPost.fields.tags);
          $editDialog.modal('show');
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
          createCard(data, $cardTemplate, function(card) {
            var current = $(`#${data.id}`);
            current.replaceWith(card);
          });
          $editDialog.modal('hide');
        }
      };
    }
  };
});
