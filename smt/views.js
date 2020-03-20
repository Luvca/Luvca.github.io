'use strict';

(function (undefined) {

  var REGX_TEMPLATE = /\${(\w+)}/g;
  var views = null;

  smt.export('views', function () {

    if (views) return views;

    views = {

      /**
       * すごく簡易的なテンプレートエンジン。ES6のテンプレートリテラルの代わり。
       * 使い方：
       * 1.置換したい部分を${property_name}の構文で記述します。
       * 2.paramに、置換する値を持ったObjectを渡します。
       * 例）views.template("my name is ${name}", { name: "Ann" }); // -> "my name is Ann" と出力
       *
       * [制約]
       * ・テンプレート部分に処理やネストするプロパティを記述することはできません。
       * @param {string} s - テンプレート文字列
       * @param {Object} param - テンプレート文字列にBindingするパラメータオブジェクト
       */
      template: function (s, param) {
        // ES6のテンプレートリテラルのかわり。mustache導入するかも。
        if (!param) return s;
        return s.replace(REGX_TEMPLATE, function (m, key) {
          return param[key] || '';
        });
      },
    };
    return views;
  });
}());
