'use babel';

import Util from './util';

export default class Stats {

  count = 0;

  constructor(state) {
    if(Util.isset(state,'object')) {
      if(Util.isset(state.count,'number')) {
        this.count = state.count;
      }
    }
  }

  // Returns an object that represents the current object state
  serialize() {
    return {
      count: this.count
    };
  }

  // Tear down any state and detach
  destroy() {}

  increaseUsageCount() {
    this.count += 1;
  }

  getCount() {
    return this.count;
  }
}
