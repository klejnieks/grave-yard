var Callbacks = {};

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

var EventManager = {
    on: (at, callback) => {
        if(at == '') return false;
        //var id = callback.__reactBoundContext._reactInternalInstance._rootNodeID;
        var id = guid();
        if(at in Callbacks) {
            Callbacks[at][id] = callback;
        }
        else {
            Callbacks[at] = {};
            Callbacks[at][id] = callback;
        }
        return id;
    },
    trigger: (at, data) => {
        //data = data || '';
        var obj = Callbacks[at];
        for(var prop in obj) {
            if(obj.hasOwnProperty(prop)) {
                obj[prop](data)
            }
        }
    },
    remove: (at, id) => {
        if(Callbacks[at] && Callbacks[at][id]) delete Callbacks[at][id]
    },
    removeAll: (at) => {
        delete Callbacks[at]
    }
};

module.exports = EventManager;
