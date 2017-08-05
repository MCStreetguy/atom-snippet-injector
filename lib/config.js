'use babel';

const fs = require('fs');
const path = require('path');

export default class Config {

  constructor(state) {
    if(new.target === Config) throw TypeError("Cannot instantiate abstract class Config.");
  }

  // Returns an object that represents the current object state
  serialize() {
    return undefined;
  }

  // Tear down any state and detach
  destroy() {}

  static retrieve() {
    return JSON.parse(fs.readFileSync(path.join(__dirname,'db','config.json')));
  }

  static get(key) {
    return atom.config.get('snippet-injector.'+key);
  }

  static set(key,value) {
    return atom.config.set('snippet-injector.'+key, value);
  }
}
