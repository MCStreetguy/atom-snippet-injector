'use babel';

import { dirname } from 'path';
import Snippet from './snippet.js';
import Util from './util.js';
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

  retrieveFile(uid) {
    if(this.dir === '') {
      throw new TypeError('Storage directory has not been initialized.');
    } else {
      return fs.readFileSync(this.storageDir+this.dir+uid.split(' ').join('-')+'.json');
    }
  }

  testFile(uid) {
    if(this.dir === '') {
      throw new TypeError('Storage directory has not been initialized.');
    } else {
      try {
        var file = this.retrieveFile(uid);
      } catch (e) {
        return false;
      } finally {
        return true;
      }
    }
  }

  deleteFile(uid) {
    if(this.dir === '') {
      throw new TypeError('Storage directory has not been initialized.');
    } else {
      if(fs.existsSync(this.storageDir+this.dir+uid.split(' ').join('-')+'.json')) {
        fs.unlinkSync(this.storageDir+this.dir+uid.split(' ').join('-')+'.json');
        return true;
      } else {
        return false;
      }
    }
  }

  migrate() {
    if(this.dir === '') {
      throw new TypeError('Storage directory has not been initialized.');
    } else {
      var files = this.retrieveFiles();
      if(files.length > 0) {
        var changed = 0;
        var migrated = 'The following snippets have been migrated:\n';
        var store = this.storageDir+this.dir;
        var _this = this;
        files.forEach(function(current) {
          if(current.endsWith('.snippet.json')) {
            fs.renameSync(store+current,store+current.replace('.snippet.json','.json'));
            current = current.replace('.snippet.json','');
          } else {
            current = current.replace('.json','');
          }

          var snippet = new Snippet(JSON.parse(_this.retrieveFile(current)));
          var res = Util.compareVersions(Util.getPackageVersion(),snippet.getVersion());
          if(res === Util.getPackageVersion() || res === undefined) {
            snippet.setVersion(Util.getPackageVersion());
            snippet.setUID(Util.generateUID({
              unique: true,
              tester: storage.testFile,
              timeout: 25,
              length: 20,
              prefix: 'sn',
              insertstring: 'SNIPPET'
            }));
            _this.store(snippet);
            _this.deleteFile(current);
            migrated += '\''+snippet.getTitle()+'\'\n';
            changed++;
          }
        });
        if(changed > 0) {
          atom.notifications.addInfo('Successfully migrated snippets within local storage to newer version.', {detail: migrated});
        }
      }
    }
  }
}
