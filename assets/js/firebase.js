'use strict';

var hnadata = hnadata || { };

(function (hnadata) {
  firebase.initializeApp({
    projectId: 'hna-data'
  });
  hnadata.db = firebase.firestore();
}(hnadata));
