'use babel';

import { dirname } from 'path';
import Snippet from './snippet.js';

export default class Storage {

  dir = '';
  storageDir = dirname(atom.config.getUserConfigPath());

  constructor(state) {
    if(state !== undefined && state !== null && typeof state === 'object') {
      this.init(state.dir);
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
    this.dir = directory;
    try {
      fs.statSync(this.storageDir+this.dir);
    } catch(e) {
      fs.mkdirSync(this.storageDir+this.dir);
    }
  }

  store(snippet) {
    if(snippet !== null && snippet !== undefined && snippet instanceof Snippet) {
      console.log(this.storageDir);
      console.log(this.dir);
      console.log(snippet);
      fs.writeFileSync(this.storageDir+this.dir+snippet.getTitle()+'.snippet',JSON.stringify(snippet));
      return fs.existsSync(this.storageDir+this.dir+snippet.getTitle()+'.snippet');
    } else {
      return false;
    }
  }

  retrieveFiles() {
    if(this.dir === '') {
      throw new TypeError('Storage directory has not been initialized.');
    } else {
      return fs.readDirSync(this.storageDir+this.dir);
    }
  }

  retrieveFile(fileName) {
    if(this.dir === '') {
      throw new TypeError('Storage directory has not been initialized.');
    } else {
      return fs.readFileSync(this.storageDir+this.dir+fileName);
    }
  }
}
