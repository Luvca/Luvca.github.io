'use strict';

smt.export('api', function(smt, undefined) {
  return {
    searchPosts: function(option) {
      var query = smt.db.collection('posts');
      if (option.filter === 'title' && option.text.length > 0) {
        query = query.orderBy('title').startAt(option.text).endAt(option.text + '\uf8ff');
      } else if (option.filter === 'type' && option.text.length > 0) {
          query = query.where('type', '==', option.text).orderBy(option.orderBy, 'desc');
      } else if (option.filter === 'album' && option.text.length > 0) {
          query = query.where('albums', 'array-contains-any', [option.text]).orderBy(option.orderBy, 'desc');
      } else if (option.filter === 'women' && option.women.length > 0) {
        query = query.where('women', 'array-contains-any', option.women).orderBy(option.orderBy, 'desc');
      } else if (option.filter === 'authors' && option.authors.length > 0) {
        query = query.where('authors', 'array-contains-any', option.authors).orderBy(option.orderBy, 'desc');
      } else if (option.filter === 'tags' && option.tags.length > 0) {
        query = query.where('tags', 'array-contains-any', option.tags).orderBy(option.orderBy, 'desc');
      } else {
        query = query.orderBy(option.orderBy, 'desc');
      }
      if (option.lastVisible)
        query = query.startAfter(option.lastVisible);
      return query.limit(option.limit).get();
    },

    savePost: function(post) {
      if (!post.fields.createdAt) {
        post.fields.createdAt = new Date();
      }
      post.fields.updatedAt = new Date();
      return smt.db.collection('posts').doc(post.id).set(post.fields);
    },

    deletePost: function(post) {
      return smt.db.collection('posts').doc(post.id).delete();
    },

    getTypes: function() {
      return smt.db.collection('types').get();
    },

    getAlbums: function() {
      return smt.db.collection('albums').get();
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

    saveAlbum: function(album) {
      return smt.db.collection('albums').doc(album.id).set(album.fields);
    },

    saveWoman: function(woman) {
      return smt.db.collection('women').doc(woman.id).set(woman.fields);
    },

    saveAuthor: function(author) {
      return smt.db.collection('authors').doc(author.id).set(author.fields);
    },

    saveTag: function(tag) {
      return smt.db.collection('tags').doc(tag.id).set(tag.fields);
    },

    createId: function() {
      return smt.db.collection('_').doc().id;
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
    },

    initDialog: function(diaog) {
      $(diaog).find('textarea, :text, select').val('').end().find(':checked').prop('checked', false);
    }
  };
});
