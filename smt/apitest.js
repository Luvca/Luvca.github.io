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
                  "img/iisstart.png",
                  "img/bio-photo-1.jpeg"
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
      console.log(post);
      return {
        then: function(callback) {
          if (callback) callback();
          return {
            catch: function() {
            }
          };
        }
      };
    },

    deletePost: function(post) {
      console.log(post);
      return {
        then: function(callback) {
          if (callback) callback();
          return {
            catch: function() {
            }
          };
        }
      };
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
            id: 'ある'
          }, {
            id: 'ばむ'
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
