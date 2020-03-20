'use strict';

/****************************************************************************************
 ** エントリーポイント
 ****************************************************************************************/

var smt = smt || {};

(function (smt, undefined) {

  var container = {};

  smt.import = function (name) {
    var factory = container[name];
    if (!factory) throw new Error("module is not found. name=[" + name + "]");
    return factory(this);
  }

  smt.export = function (name, factory) {
    if (container[name]) throw new Error("modle is already registered. name=" + name);
    if (!factory) throw new Error("parameter of factory is required.");

    container[name] = factory;
  };

}(smt));

/****************************************************************************************
 ** 標準コンポーネントの登録
 ****************************************************************************************/

(function () {
  // event hub is global singleton.
  var eventHub = null;
  smt.export('event-hub', (function () {

    if (eventHub) return eventHub;

    var eventStore = {};
    eventHub = {

      /**
       * イベントを発行します。subscribeしているListenerをすべて呼び出します。
       * @param {string} name - イベント名
       * @param {Object} param - イベントパラメータ。形はイベントごとに異なる。
       */
      publish: function (name, param) {
        var listeners = eventStore[name];
        if (listeners) {
          listeners.forEach(function (f) { f(param); });
        }
      },

      /**
       * イベントを購読します。設定したリスナーは、publishのタイミングでコールされます。
       * @param {string} name - イベント名
       * @param {Function} listener - イベントハンドラ
       */
      on: function (name, listener) {
        var listeners = eventStore[name];
        if (!listeners) {
          eventStore[name] = [listener];
        } else {
          listeners.push(listener);
        }
      },
    };
    return eventHub;
  }));
}());
