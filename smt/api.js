'use strict';

smt.export('api', function(smt, undefined) {
  var messages = smt.import('messages');

  return {
    getPosts: function(option) {
      return smt.db.collection('posts').orderBy('updatedAt', 'desc').limit(25).get();
    },

    savePost: function(id, fields) {
      return smt.db.collection('posts').doc(id).set(fields);
    },

    getWomen: function() {
      return smt.db.collection('women').orderBy('phoneticName').get();
    },

    getAuthors: function() {
      return smt.db.collection('authors').orderBy('phoneticName').get();
    },

    getTags: function() {
      return smt.db.collection('tags').get();
    },

    intersect: function(a, b) {
      var setA = new Set(a);
      var setB = new Set(b);
      return Array.from(new Set([...setA].filter(e => (setB.has(e)))));
    },

    progressDisplay: function(isProgress) {
    },

    handleError: function (e) {
      console.error(e);
      alert(e);
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
