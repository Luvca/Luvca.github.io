'use strict';

smt.export('api', function(smt, undefined) {
  return {
    searchPosts: function(option) {
      return {
        then: function(callback) {
          callback({docs: [{
            id: 'ほげ',
            data: function() {
              return {
                urls: [
                  "../assets/img/bio-photo.png"
                ],
                title: 'ふが'
              };
            }
          }]});

          return {
            catch: function() {
            }
          };
        }
      };
    },

    savePost: function(post) {
      return smt.db.collection('posts').doc(post.id).set(post.fields);
    },

    getTypes: function() {
      return {
        then: function(callback) {
          callback([{
            id: 'ハロー'
          }, {
            id: 'ワールド'
          }]);
        }
      }
    },

    getWomen: function() {
      return {
        then: function(callback) {
          callback([{
            id: 'ハロー'
          }, {
            id: 'ワールド'
          }]);
        }
      }
    },

    getAuthors: function() {
      return {
        then: function(callback) {
          callback([{
            id: 'ハロー'
          }, {
            id: 'ワールド'
          }]);
        }
      }
    },

    getTags: function() {
      return {
        then: function(callback) {
          callback([{
            id: 'ハロー'
          }, {
            id: 'ワールド'
          }]);
        }
      }
    },

    getAlbums: function() {
      return {
        then: function(callback) {
          callback([{
            id: 'ハロー'
          }, {
            id: 'ワールド'
          }]);
        }
      }
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
