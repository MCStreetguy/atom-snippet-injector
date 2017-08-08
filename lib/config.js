'use babel';

import Util from './util.js';
const fs = require('fs');
const path = require('path');

export default class Config {

  constructor(state) {
    if(new.target === Config) throw TypeError("Cannot instantiate abstract class Config.");
  }

  static retrieve() {
    return JSON.parse(fs.readFileSync(path.join(__dirname,'db','config.json')));
  }

  static get(key) {
    var res = atom.config.get('snippet-injector.'+key);
    var intern = this.retrieve()[key].default;
    if(res !== null && res !== undefined) {
      return res;
    } else if(intern !== null && intern !== undefined) {
      return intern;
    } else {
      return undefined;
    }
  }

  static set(key,value) {
    return atom.config.set('snippet-injector.'+key, value);
  }
}
