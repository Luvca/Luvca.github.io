'use strict';

var hnabase = hnabase || { };

(function (hnabase) {
  firebase.initializeApp({
    projectId: 'hna-data'
  });
  hnabase.db = firebase.firestore();
  hnabase.dbtags = hnabase.db.collection('tags');

  hnabase.pictures = function () {
    return [
      { url: '../../assets/img/iisstart.png', title: 'test 1', comment: 'This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.' },
      { url: '../../assets/img/iisstart.png', title: 'test 2'  },
      { url: '../../assets/img/iisstart.png', title: 'test 3'  },
      { url: '../../assets/img/iisstart.png', title: 'test 4'  },
      { url: '../../assets/img/iisstart.png', title: 'test 5'  },
    ];
  };

  hnabase.tags = function () {
    return [
      { label: "New Yorkt", value: "NY" },
      { label: "Washington", value: "WA" },
      { label: "California", value: "CA" },
      { label: "New Jersey", value: "NJ" },
      { label: "North Carolina", value: "NC" }
    ];
  };

  hnabase.debugText = 'hello world 1';
}(hnabase));