'use babel';

export default class ClassName {

  someProperty = null;

  constructor(state) {
    if(state !== null && state !== undefined && typeof state === 'object') {
      for(var key in state) {
        if(ClassName.hasOwnProperty(key)) {
          this[key] = state[key];
        }
      }
    }
  }

  // Returns an object that represents the current object state
  serialize() {
    var serialized = new Object();
    for(var key in this) {
      serialized[key] = this[key];
    }
    return serialized;
  }

  // Tear down any state and detach
  destroy() {
    for(var key in this) {
      this[key] = undefined;
    }
  }
}
