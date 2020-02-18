'use strict';

var hnadata = hnadata || {};

(function (hnadata) {
  // Firebase project configuration
  var firebaseConfig = {
    projectId: "hna-data"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  hnadata.db = firebase.firestore();

  hnadata.args = [...new URLSearchParams(location.search).entries()].reduce((obj, e) => ({...obj, [e[0]]: e[1]}), {});
})(hnadata);