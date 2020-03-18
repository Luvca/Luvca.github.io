'use strict';

var fbapp = fbapp || {};

(function (fbapp, undefined) {
  var container = {};

  fbapp.import = (name) => {
    var factory = container[name];
    if (!factory) throw new Error(`module is not found. name=[${name}]`);
    return factory(this);
  };

  fbapp.export = (name, factory) => {
    if (container[name]) throw new Error(`module is already registered. name=[${name}]`);
    if (!factory) throw new Error('parameter of factory is required.');
    container[name] = factory;
  };
}(fbapp));

(function() {
  var eventHub = null;
  fbapp.export('event-hub', function() {
    if (eventHub) return eventHub;
    var eventStore = {};

    eventHub = {
      publish: function(name, param) {
        var listeners = eventStore[name];
        if (listeners) {
          listeners.forEach((f) => f(param));
        }
      },

      on: function(name, listener) {
        var listeners = eventStore[name];
        if (!listeners) {
          eventStore[name] = [listener];
        } else {
          listeners.push(listener);
        }
      }
    };
    return eventHub;
  });
}());
