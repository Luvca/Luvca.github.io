'use strict';

var hnaapp = hnaapp || {};

(function (hnaapp) {
  // Firebase project configuration
  var firebaseConfig = {
    projectId: "hna-data"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  hnaapp.db = firebase.firestore();

  hnaapp.women = [];
  hnaapp.db.collection("women").get().then(function(docs) {
    docs.forEach(function(doc) {
      app.women.push({ label: doc.data().name, value: doc.data().name });
    })
  });

  hnaapp.args = [...new URLSearchParams(location.search).entries()].reduce((obj, e) => ({...obj, [e[0]]: e[1]}), {});

  hnaapp.emptify = function(value) {
    if (!value) return '';
    return value;
  };
})(hnaapp);
