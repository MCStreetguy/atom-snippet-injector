'use babel';

import Util from './util.js';

export default class StorageInterface {

  snippets = new Array();
  

  constructor(state) {
    if(Util.isset(state,'object')) {

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

  load() {

  }
}
