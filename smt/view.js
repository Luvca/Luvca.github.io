'use strict';

smt.export('view', function(smt, undefined) {
  var api = smt.import('api');
  var dropbox = smt.import('dropbox');
  var types = smt.import('types').create();
  var albums = smt.import('albums').create();
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
      var img = $(carouselItem).find('.fb-post-image');
      img.attr('src', u);
      //$('img.lazy').lazyload({
      //  effect: 'fadeIn',
      //  effectspeed: 1000
      //});
      $(carouselItem).find('.fb-post-url').text(u);
      if (i === 0)
        $(carouselItem).addClass('active');
      return $(carouselItem).prop('outerHTML');
    }).join(''));
    $(card).find('.fb-post-title').text(cardPost.fields.title);
    $(card).find('.fb-post-type').text(cardPost.fields.type);
    createBadge(card, cardPost.fields.women, '.fb-post-women', '.fb-post-woman');
    createBadge(card, cardPost.fields.authors, '.fb-post-authors', '.fb-post-author');
    createBadge(card, cardPost.fields.tags, '.fb-post-tags', '.fb-post-tag');
    createBadge(card, cardPost.fields.albums, '.fb-post-albums', '.fb-post-album');
    $(card).find('.fb-post-url-count').text(cardPost.fields.urls.length);
    if (cardPost.fields.createdAt) {
      try {
        $(card).find('.fb-post-created-at').text(cardPost.fields.createdAt.toLocaleString('ja-JP').replace(/\//g, '-'));
      } catch {}
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
      var $searchLimit = $('#fb-search-limit');
      var $searchType = $('#fb-search-type');
      var $searchAlbum = $('#fb-search-album');
      var $resultArea = $('#search-result');
      var $infoMessageArea = $('#info-msg-area');
      var $cardTemplate = $('#fb-card-template').prop('outerHTML');
      var $readNextButton = $('#fb-read-next-button');
      var $editDialog = $('#editDialog');
      var $editForm = $('#editForm');
      var $dropboxDialog = $('#fb-dropbox-dialog');
      var $settingsDialog = $('#fb-settings-dialog');
      var $dropboxCode = $('#fb-dropbox-code');
      var $dropboxImages = $('#fb-dropbox-images');
      var dropboxImageTemplate = $dropboxImages.html();
      var $postUrls = $editDialog.find('#fb-post-urls');
      var urlTemplate = $postUrls.html();
      var typeHolder = $editDialog.find('.fb-post-types');
      var typeTemplate = typeHolder.html();
      var lastVisible;

      return {
        reset: function() {
          $resultArea.parent().scrollTop(0);
          $resultArea.empty();
          $infoMessageArea.empty();
          lastVisible = undefined;
        },

        setupSearch: function() {
          $searchType.empty();
          $searchType.append($('<option>').append('(Type)'));
          types.getAll().forEach((t) => {
            $($('<option>', {value: t}).append(t)).appendTo($searchType);
          });
          $searchAlbum.empty();
          $searchAlbum.append($('<option>').append('(Album)'));
          albums.getAll().forEach((a) => {
            $($('<option>', {value: a}).append(a)).appendTo($searchAlbum);
          });
          $womenSelectSearch = createSelectPure('#fb-post-women-search', women.getAll());
          $authorsSelectSearch = createSelectPure('#fb-post-authors-search', authors.getAll());
          $tagsSelectSearch = createSelectPure('#fb-post-tags-search', tags.getAll());
          $('input[name="fb-search"]').prop('checked', false);
        },

        closeDialog: function(event) {
          var dialog = $(event.target.closest('.modal'));
          $(dialog).modal('hide');
        },

        getSearchOption: function() {
          return {
            filter: $('input[name="fb-search"]:checked').val(),
            text: $('input[name="fb-search"]:checked').closest('div').find('.fb-search').val(),
            women: $womenSelectSearch.value(),
            authors: $authorsSelectSearch.value(),
            tags: $tagsSelectSearch.value(),
            orderBy: $('input[name="fb-search-order-by"]:checked').val(),
            limit: parseInt($searchLimit.val()),
            lastVisible: lastVisible
          };
        },

        selectSearchText: function(target) {
          var div = $(target.closest('.form-check-inline'));
          div.find('input[name="fb-search"]').prop('checked', true);
        },

        showPosts: function(result) {
          if (result.docs.length === 0) {
            $infoMessageArea.append('No more posts.');
            $readNextButton.addClass('d-none');
          } else {
            lastVisible = result.docs[result.docs.length - 1];
            var divider = $('<div>');
            $resultArea.append(divider);
            result.docs.forEach((ref, i) => {
              var fields = ref.data();
              try {
                fields.createdAt = fields.createdAt.toDate();
              } catch {}
              createCard({id: ref.id, fields: fields}, $cardTemplate, function(card) {
                $resultArea.append(card);
              })
            });
            $('html,body').animate({ scrollTop: divider.offset().top });
            $readNextButton.removeClass('d-none');
          }
        },

        pickPost: function(event) {
          var card = $(event.target.closest('.card'));
          return {
            id: card.attr('id'),
            fields: {
              urls: card.find('.fb-post-url').get().map((i) => $(i).text()),
              title: card.find('.fb-post-title').text(),
              type: card.find('.fb-post-type').text(),
              women: card.find('.fb-post-woman').get().map((w) => $(w).text()),
              authors: card.find('.fb-post-author').get().map((a) => $(a).text()),
              tags: card.find('.fb-post-tag').get().map((t) => $(t).text()),
              albums: card.find('.fb-post-album').get().map((a) => $(a).text()),
              createdAt: card.find('.fb-post-created-at').text()
            }
          };
        },

        editPost: function(card) {
          $editForm.removeClass('was-validated');
          // Id
          $editDialog.find('#fb-post-id').val(card.id);
          // Created at
          $editDialog.find('#fb-post-created-at').val(card.fields.createdAt);
          // Images
          $postUrls.empty();
          card.fields.urls.forEach((u) => {
            var postUrl = $.parseHTML(urlTemplate);
            $(postUrl).find('.fb-post-url').attr('src', u);
            $postUrls.append(postUrl);
          });
          // Title
          $editDialog.find('#fb-post-title').val(card.fields.title);
          // Type
          typeHolder.empty();
          types.getAll().forEach((t) => {
            var typeItem = $.parseHTML(typeTemplate);
            var radio = $(typeItem).find('input[name="fb-post-type"]');
            radio.attr('value', t);
            if (t === card.fields.type)
              radio.prop('checked', true);
            $(typeItem).find('.fb-post-type').text(t);
            typeHolder.append(typeItem);
          });
          // Google
          $('#fb-google-title').prop('href', `https://www.google.co.jp/search?q=${card.fields.title}+${card.fields.type}+adult`);
          // Badges
          $albumsSelect = createSelectPure('#fb-post-albums', albums.getAllSelectPure(), card.fields.albums);
          $womenSelect = createSelectPure('#fb-post-women', women.getAll(), card.fields.women);
          $authorsSelect = createSelectPure('#fb-post-authors', authors.getAll(), card.fields.authors);
          $tagsSelect = createSelectPure('#fb-post-tags', tags.getAll(), card.fields.tags);
          $editDialog.modal('show');
          // Delete button
          if (!card.id) {
            $('#fb-delete-post-button').addClass('d-none');
            $('#fb-post-individual-area').removeClass('d-none');
          } else {
            $('#fb-delete-post-button').removeClass('d-none');
            $('#fb-post-individual-area').addClass('d-none');
          }
        },

        toggleAllImagesSelect: function(event) {
          $('input[name="fb-dropbox-image"]').prop('checked', event.target.checked);
        },

        selectDropboxImages: function() {
          $dropboxDialog.find('input[name="fb-dropbox-image"]:checked').get().forEach((i) => {
            var postUrl = $.parseHTML(urlTemplate);
            var url = $(i).closest('.card').find('img').attr('src');
            $(postUrl).find('.fb-post-url').attr('src', url);
            $postUrls.append(postUrl);
          });
          $dropboxDialog.modal('hide');
        },

        readDropbox: function(event) {
          var folder = $(event.target).val();
          console.log(folder);
          $dropboxImages.empty();
          dropbox.listFolder(folder).done((res) => {
            res.entries.sort(function(a, b) {
              if (a.name < b.name) return -1;
              else return 1;
            }).forEach((item) => {
              if (item['.tag'] === 'file' && item.name.split('.').pop().match(/jpe?g|png|gif|bmp/i)) {
                var dropboxItem = $.parseHTML(dropboxImageTemplate);
                $dropboxImages.append(dropboxItem);
                dropbox.listShare(item.id).done((res) => {
                  if (res.links.length === 0) {
                    dropbox.createShare(item.id).done((res) => {
                      var directUrl = dropbox.directUrl(res.url);
                      $(dropboxItem).find('input[name="fb-dropbox-image"]').attr('value', directUrl);
                      $(dropboxItem).find('.fb-dropbox-image').text(item.name.replace(/\.[^/.]+$/, ''));
                      $(dropboxItem).find('img').attr('src', directUrl);
                      //createDropboxImage($dropboxImages, dropboxImageTemplate, item.name, res.url);
                    }).fail((error) => {
                      console.log(error);
                    });
                  } else {
                    var directUrl = dropbox.directUrl(res.links[0].url);
                    $(dropboxItem).find('input[name="fb-dropbox-image"]').attr('value', directUrl);
                    $(dropboxItem).find('.fb-dropbox-image').text(item.name.replace(/\.[^/.]+$/, ''));
                    $(dropboxItem).find('img').attr('src', directUrl);
                    //createDropboxImage($dropboxImages, dropboxImageTemplate, item.name, res.links[0].url);
                  }
                }).fail((error) => {
                  console.log(error);
                });
              } else if (item['.tag'] == 'folder' && !item.name.endsWith('★')) {
                $dropboxImages.append(`
                <div class="card mb-2">
                  <button type="button" class="btn btn-outline-info btn-block fb-select-dropbox-folder" value="${folder}/${item.name}">${item.name}</button>
                </div>`)
              }
            });
            $dropboxDialog.modal('show');
          }).fail((error) => {
            console.log(error);
            alert(error.responseText);
          });
        },

        addAuthor: function(event) {
          $('#fb-author-type').val(event.data.type);
          $('#fb-author-dialog').modal('show');
        },

        getAuthor: function(event) {
          return {
            type: $('#fb-author-type').val(),
            data: {
              id: $('#fb-author-name').val(),
              fields: {
                name: $('#fb-author-name').val(),
                phoneticName: $('#fb-author-phonetic-name').val()
              }
            }
          }
        },

        validateAuthor: function(callback) {
          if ($('#fb-preson-form').get(0).checkValidity() === true) {
            if (callback) {
              callback();
              $('#fb-author-dialog').modal('hide');
            }
          } else {
            $('#fb-preson-form').addClass('was-validated');
          }
        },

        getPost: function(event) {
          var dialog = $(event.target.closest('.modal'));
        //alert(dialog.find('#fb-post-created-at').val());
        //alert(new Date(Date.parse(dialog.find('#fb-post-created-at').val().replace(/-/g, '/'))));
          return {
            id: dialog.find('#fb-post-id').val(),
            individual: $('#fb-post-individual:checked').val(),
            fields: {
              urls: dialog.find('.fb-post-url').get().map((u) => $(u).attr('src')),
              title: dialog.find('#fb-post-title').val(),
              type: dialog.find('input[name="fb-post-type"]:checked').val(),
              women: $womenSelect.value(),
              authors: $authorsSelect.value(),
              tags: $tagsSelect.value(),
              albums: $albumsSelect.value(),
              createdAt: new Date(Date.parse(dialog.find('#fb-post-created-at').val().replace(/-/g, '/'))),
              updatedAt: new Date()
            }
          };
        },

        validatePost: function(callback) {
          if ($editForm.get(0).checkValidity() === true) {
            if (callback) {
              callback();
            }
          } else {
            $editForm.addClass('was-validated');
          }
        },

        updatePost: function(data) {
          createCard(data, $cardTemplate, function(card) {
            var current = $(`#${data.id}`);
            if (current.length) {
              current.replaceWith(card);
            }
            else
              $resultArea.prepend(card);
          });
          $editDialog.modal('hide');
        },

        deletePost: function(data) {
          $(`#${data.id}`).fadeOut('normal', function() {
            $(`#${data.id}`).remove();
          });
          $editDialog.modal('hide');
        },

        upUrl: function(event) {
          var src = event.target.closest('table');
          var srcImg = $(src).find('img');
          var srcUrl = srcImg.attr('src');
          var dst = src.previousSibling.previousSibling;
          if (dst) {
            dst = dst.previousSibling;
            var dstImg = $(dst).find('img');
            var dstUrl = dstImg.attr('src');
            dstImg.attr('src', srcUrl);
            srcImg.attr('src', dstUrl);
          }
        },

        downUrl: function(event) {
          var src = event.target.closest('table');
          var srcImg = $(src).find('img');
          var srcUrl = srcImg.attr('src');
          var dst = src.nextSibling.nextSibling;
          if (dst) {
            dst = dst.nextSibling;
            var dstImg = $(dst).find('img');
            var dstUrl = dstImg.attr('src');
            dstImg.attr('src', srcUrl);
            srcImg.attr('src', dstUrl);
          }
        },

        deleteUrl: function(event) {
          var src = event.target.closest('table');
          $(src).remove();
        },

        showSettings: function() {
          console.log($settingsDialog);
          $settingsDialog.modal('show');
        },

        getSettings: function() {
          console.log($('#fb-dropbox-code').val());
          return {
            dropboxCode: $dropboxCode.val()
          };
        }
      };
    }
  };
});
