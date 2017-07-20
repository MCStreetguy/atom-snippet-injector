'use babel';

import { dirname } from 'path';
import Snippet from './snippet.js';
const fs = require('fs');
const os = require('os');

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
    var store = this.storageDir;
    var divider;

    if(store.indexOf('/')>-1) {
      divider = '/';
      directory = directory.split('\\').join('/');
    } else if(store.indexOf('\\'>-1)) {
      divider = '\\';
      directory = directory.split('/').join('\\');
    }

    var temp = divider;

    directory.split(divider).forEach(function(currentValue,index) {
      if(currentValue !== "" && currentValue !== " " && currentValue !== null && currentValue !== undefined) {
        temp += currentValue+divider;
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
      fs.writeFileSync(this.storageDir+this.dir+snippet.getUID().split(' ').join('-')+'.json',JSON.stringify(snippet));
      return fs.existsSync(this.storageDir+this.dir+snippet.getUID().split(' ').join('-')+'.json');
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
      return fs.readFileSync(this.storageDir+this.dir+snippetTitle.split(' ').join('-')+'.json');
    }
  }

  testFile(uid) {
    try {
      var file = this.retrieveFile(uid);
    } catch (e) {
      return false;
    } finally {
      return true;
    }
  }

  deleteFile(snippetTitle) {
    if(fs.existsSync(this.storageDir+this.dir+snippetTitle.split(' ').join('-')+'.json')) {
      fs.unlinkSync(this.storageDir+this.dir+snippetTitle.split(' ').join('-')+'.json');
      return true;
    } else {
      return false;
    }
  }
}
