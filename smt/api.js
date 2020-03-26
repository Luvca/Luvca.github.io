'use strict';

smt.export('api', function(smt, undefined) {
  return {
    getPosts: function(option) {
      return smt.db.collection('posts').orderBy('updatedAt', 'desc').limit(25).get();
    },

    savePost: function(post) {
      return smt.db.collection('posts').doc(post.id).set(post.fields);
    },

    getTypes: function() {
      return smt.db.collection('types').get();
    },

    getWomen: function() {
      return smt.db.collection('women').orderBy('phoneticName').get();
    },

    getAuthors: function() {
      return smt.db.collection('authors').orderBy('phoneticName').get();
    },

    getTags: function() {
      return smt.db.collection('tags').get();
    },

    intersect: function(a, b) {
      var setA = new Set(a);
      var setB = new Set(b);
      return Array.from(new Set([...setA].filter(e => (setB.has(e)))));
    },

    showProgress: function(inProgress) {
    },

    handleError: function(e) {
      console.error(e);
      alert(e + ' ' + e.stack);
    }
  };
});
