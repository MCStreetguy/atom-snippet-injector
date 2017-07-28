'use babel';

export default class IMEX {

  constructor(state) {
    if(new.target === IMEX) throw TypeError("Cannot instantiate abstract class IMEX.");
  }

  // Returns an object that represents the current object state
  serialize() {
    return undefined;
  }

  // Tear down any state and detach
  destroy() {}
}
