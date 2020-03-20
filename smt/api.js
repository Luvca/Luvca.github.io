'use strict';

smt.export('api', function(smt, undefined) {
  var messages = smt.import('messages');

  return {
    post: function(url, data, dataType, option) {
      var testData = [{
          id: 'hoge1',
          title: 'fuga1'
        }, {
          id: 'hoge2',
          title: 'fuga2'
        }];
      return {
        done: function(callback) {
          callback(testData);
        }
      };
    },

    getHtml: function(url) {
      return $.ajax(url, {
        type: 'GET'
      }).fail((xhr, status, thrown) => {
      });
    },

      bindDomain: function (url, companyCode) {
          var $defer = $.Deferred();
          var postData = JSON.stringify({ "CompanyCode": companyCode });
          var contentType = 'application/json; charset=utf-8';
          return $.ajax(url, {
              type: 'POST',
              dataType: "json",
              data: postData,
              contentType: contentType,
              headers: {
                  "RequestVerificationToken": $("[name='__RequestVerificationToken']").val(),
                  'Content-Type': 'application/json; charset=utf-8'
              },
              cache: false
          })
              .fail(function (xhr, status, thrown) {

                  if (status == "400") {
                      var result = xhr.responseJSON;
                  }
              });
      },
    download: function (data, fileName) {
      const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
      var blob = new Blob([bom, data], { type: "text/plain" });
      window.navigator.msSaveBlob(blob, fileName);
    },

    downloadCsv: function (url, postData, fileName) {
      var $defer = $.Deferred();

      try {
        var request = new XMLHttpRequest();
        request.open('POST', url, true);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.responseType = 'blob';
        request.onload = function () {
          if (request.status === 200) {
            var data = request.response;
            var blob = new Blob([data], { type: 'text/csv; charset=shift_jis' });
            window.navigator.msSaveBlob(blob, fileName);
            $defer.resolve();
          } else {
            $defer.reject(request, request.status);
          }
        };
        request.onerror = function () {
          $defer.reject(request, request.status);
        };

        request.send(postData);
      } catch (e) {
        $defer.reject(undefined, undefined, e);
      }

      return $defer.promise();
    },

    downloadMemberCsv: function (url, param, fileName) {
      var $defer = $.Deferred();
      try {
        var request = new XMLHttpRequest();
        request.open('POST', url, true);
        request.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        request.setRequestHeader("RequestVerificationToken", $("[name='__RequestVerificationToken']").val());
        request.responseType = 'blob';
        request.onload = function () {
          if (request.status === 200) {
            var data = request.response;
            var blob = new Blob([data], { type: 'text/csv; charset=shift_jis' });
            window.navigator.msSaveBlob(blob, fileName);
            $defer.resolve();
          } else {
            $defer.reject(request, request.status);
          }
        };
        request.onerror = function () {
          $defer.reject(request, request.status);
        };
        request.send(JSON.stringify({ "MailAddress": param }));
      } catch (e) {
        $defer.reject(undefined, undefined, e);
      }
      return $defer.promise();
    },

    importCsv: function (url, file) {
      var formData = new FormData();
      var uploadFile = $('#' + file).prop('files')[0];
      formData.append(file, uploadFile);
      return $.ajax(url, {
        type: "POST",
        dataType: 'json',
        data: formData,
        processData: false,
        contentType: false,
        cache: false,
        headers: {
          "RequestVerificationToken": $("[name='__RequestVerificationToken']").val()
        }
      }).done(function (data, status, xhr) {
        var result = xhr;
      }).fail(function (xhr, status, thrown) {
        var result = xhr;
      }).always(function () {
      });
    },

    progressDisplay: function (isProgress) {
    },

    handleError: function (e) {
      console.error(e.message);
    },

    serverErrorHandling: function (xhr) {

      const STATUS_INTERNAL_SERVER_ERROR = 500;

      //サーバーエラー時はエラーページへ遷移
      if (xhr.status == STATUS_INTERNAL_SERVER_ERROR) window.location = '/smt/error';
      //それ以外の場合はブラウザのダイアログで以下のメッセージを表示する。
      else alert('想定外のエラーが発生しました。\r\nブラウザを閉じて再度ログインしなおしてください。');
    },
  };
});
