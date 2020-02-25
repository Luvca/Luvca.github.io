'use strict';

var hnaapp = hnaapp || {};

(function (hnaapp) {
  // Firebase project configuration
  var firebaseConfig = {
    projectId: "hna-data"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  var db = firebase.firestore();
  hnaapp.db = {};
  hnaapp.db.pictures = db.collection("pictures");
  hnaapp.db.women = db.collection("women");
  hnaapp.db.tags = db.collection("tags");

  hnaapp.women = [];
  hnaapp.db.women.get().then(function(docs) {
    docs.forEach(function(doc) {
      hnaapp.women.push({ label: doc.data().name, value: doc.data().name });
    })
  });

  hnaapp.tags = [];
  hnaapp.db.tags.get().then(function(docs) {
    docs.forEach(function(doc) {
      hnaapp.tags.push({ label: doc.data().name, value: doc.data().name });
    });
  });

  hnaapp.args = [...new URLSearchParams(location.search).entries()].reduce((obj, e) => ({...obj, [e[0]]: e[1]}), {});

  hnaapp.emptify = function(value) {
    if (!value) return '';
    return value;
  };
})(hnaapp);
