'use strict';

(function (undefined) {

  var messages = null;

  smt.export('messages', function () {

    if (messages) return messages;

    /** メッセージリスト 
     * key : メッセージキー  msg : メッセージ*/
    var messageList = [
      { key: 'csv-import', msg: 'CSVアップロードを行います。\r\nよろしいですか。' },
      { key: 'csv-export', msg: 'CSV出力を行います。\r\nよろしいですか。' },
      { key: 'not-result', msg: '検索結果が見つかりませんでした。' },
      { key: 'conf-add', msg: '登録を行います。\r\nよろしいですか。' },
      { key: 'conf-upd', msg: '更新を行います。\r\nよろしいですか。' },
      { key: 'conf-import', msg: 'CSVインポートを行います。\r\nよろしいですか。' },
      { key: 'conf-del', msg: '削除を行います。\r\nよろしいですか。' },
      { key: 'comp-add-req', msg: '登録リクエストが完了しました。' },
      { key: 'comp-upd-req', msg: '更新リクエストが完了しました。' },
      { key: 'comp-del-req', msg: '削除リクエストが完了しました。' },
      { key: 'comp-import-read', msg: 'CSVアップロードが完了しました。インポートを実行してください。' },
      { key: 'comp-import-req', msg: 'CSVインポート処理を開始しました。このままお待ちいただくか、操作ログで結果を確認してください。' },
      { key: 'comp-import-run', msg: 'CSVインポート処理を実行しています。このままお待ちいただくか、操作ログで結果を確認してください。' },
      { key: 'comp-import-res', msg: 'CSVインポート処理が完了しました。' },
      { key: 'error-import-file', msg: 'CSVファイルを指定してください。' },
      { key: 'error-import-req', msg: 'CSVインポートでエラーが発生しました。\r\n操作ログを確認してください。' },
       
        { key: 'error-add-req', msg: '登録リクエストが失敗しました。' },
        { key: 'error-upd-req', msg: '更新リクエストが失敗しました。' },
        { key: 'error-del-req', msg: '削除リクエストが失敗しました。' },
      { key: 'system-error', msg: '不明なシステムエラーが発生しました。\r\nシステム管理者に問い合わせてください。' },
    ];

    messages = {

      /**
       * メッセージを取得します。
       * @param {any} getKey メッセージキー
       */
      getMessage: function(getKey) {
        var message;

        messageList.forEach(function (obj, idx) {
          if (obj['key'] == getKey) message = obj['msg'];
        });

        if (message == null) throw new Error("Message associated with key is not defined. key=[" + getKey + "]");

        return message;
      },

      /**
       * エラーメッセージを表示します。
       * @param {any} getKey メッセージキー
       */
      showError: function (getKey) {
        var msg = this.getMessage(getKey);
        alert(msg);
      },

      /**
       * 確認メッセージを表示します。
       * @param {any} getKey メッセージキー
       */
      showConfirm: function (getKey) {
        var msg = this.getMessage(getKey);
        return confirm(msg);
      },

    };

    return messages;
  });
}());
