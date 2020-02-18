'use strict';

var hnadata = hnadata || {};

(function (hnadata) {
  // Firebase project configuration
  var firebaseConfig = {
    projectId: "sasatests"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  hnadata.db = firebase.firestore();
}(hnadata));
