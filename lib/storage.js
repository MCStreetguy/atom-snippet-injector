'use babel';

import { dirname } from 'path';
import Snippet from './snippet.js';
const fs = require('fs');

export default class Storage {

  dir = '';
  storageDir = dirname(atom.config.getUserConfigPath());

  constructor(state) {
    if(state !== undefined && state !== null && typeof state === 'object') {
      if(state.dir !== undefined && state.dir !== null && typeof state.dir === 'string') {
        this.init(state.dir);
      }
    }
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {
    return {
      dir: this.dir
    };
  }

  // Tear down any state and detach
  destroy() {}

  init(directory) {
    var temp = '\\';
    var store = this.storageDir;
    directory.split('/').join('\\').split('\\').forEach(function(currentValue,index) {
      if(currentValue !== "" && currentValue !== " " && currentValue !== null && currentValue !== undefined) {
        temp += currentValue+'\\';
        try {
          fs.statSync(store+temp);
        } catch(e) {
          fs.mkdirSync(store+temp);
        }
      }
    });
    this.dir = temp;
  }

  store(snippet) {
    if(snippet !== null && snippet !== undefined && snippet instanceof Snippet) {
      fs.writeFileSync(this.storageDir+this.dir+snippet.getTitle().split(' ').join('-')+'.snippet.json',JSON.stringify(snippet));
      return fs.existsSync(this.storageDir+this.dir+snippet.getTitle().split(' ').join('-')+'.snippet.json');
    } else {
      return false;
    }
  }

  retrieveFiles() {
    if(this.dir === '') {
      throw new TypeError('Storage directory has not been initialized.');
    } else {
      return fs.readdirSync(this.storageDir+this.dir);
    }
  }

  retrieveFile(snippetTitle) {
    if(this.dir === '') {
      throw new TypeError('Storage directory has not been initialized.');
    } else {
      return fs.readFileSync(this.storageDir+this.dir+snippetTitle.split(' ').join('-')+'.snippet.json');
    }
  }
}
