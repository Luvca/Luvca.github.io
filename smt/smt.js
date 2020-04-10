'use strict';

var smt = smt || {};

(function (smt, undefined) {
  var container = {};

  firebase.initializeApp({
    projectId: 'fruit-basket-data',
    apiKey: 'AIzaSyB7G3nC8SOm2nb-l7hNXIJVtSbMkcGSzq0',
    authDomain: 'fruit-basket-data.firebaseapp.com'
  });
  smt.db = firebase.firestore();
  smt.settings = {};
  smt.clipboard = [];
  smt.opacity = 0;

  smt.setSettings = function(settings) {
    smt.settings = settings;
  };

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
