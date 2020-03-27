'use strict';

smt.export('api', function(smt, undefined) {
  return {
    searchPosts: function(option) {
      var query = smt.db.collection('posts');
      if (option.text.length > 0) {
        if (option.filter === 'title') {
          query = query.orderBy('title').startAt(option.text).endAt(option.text + '\uf8ff');
        } else  {
          if (option.filter === 'type') {
            query = query.where('type', '==', option.text);
          } else if (option.filter === 'women') {
            query = query.where('women', 'array-contains-any', option.text.split(','));
          } else if (option.filter === 'tags') {
            query = query.where('tags', 'array-contains-any', option.text.split(','));
          }
          query = query.orderBy(option.orderBy, 'desc');
        }
      } else {
        query = query.orderBy(option.orderBy, 'desc');
      }
      if (option.lastVisible)
        query = query.startAfter(option.lastVisible);
      return query.limit(option.limit).get();
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

    getAlbums: function() {
      return smt.db.collection('albums').get();
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
