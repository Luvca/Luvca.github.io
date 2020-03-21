'use strict';

smt.export('api', function(smt, undefined) {
  var messages = smt.import('messages');

  return {
    getPost: function(option) {
      return smt.db.collection('posts').orderBy('updatedAt', 'desc').limit(5).get();
    },

    getTags: function() {
      return smt.db.collection('tags').limit(3).get();
    },

    progressDisplay: function(isProgress) {
    },

    handleError: function (e) {
      console.error(e);
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
