'use strict';

smt.export('list-view-template', function(smt, undefined) {
  var messages = smt.import('messages');
  var views = smt.import('views');

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
    create: function (init) {
      var bindElement = init.bindElement || {};
      var $searchForm = bindElement.searchForm;
      var $errorMessagePanel = bindElement.errorMessagePanel;
      var $infoMessagePanel = bindElement.infoMessagePanel;
      var $resultArea = bindElement.resultArea;
      var post = smt.import('paging').create();

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

        updateSearchResult: function (result) {
          if (result.length === 0) {
            $infoMessagePanel.append(messages.getMessage('not-result'));
          } else {
            result.forEach((ref) => {
              $resultArea.append(post.createCard(ref));
            });
            $('html,body').animate({ scrollTop: $resultArea.offset().top })
          }
        }
      };
    }
  };
});
