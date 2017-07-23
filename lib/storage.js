'use babel';

import { dirname } from 'path';
import Snippet from './snippet.js';
import Util from './util.js';
const fs = require('fs');
// const os = require('os');

export default class Storage {

  dir = '';
  storageDir = dirname(atom.config.getUserConfigPath());

  constructor(state) {
    if(Util.isset(state,'object')) {
      if(Util.isset(state.dir,'string')) {
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
    if(window.snippet_injector_debug.allowDebug && window.snippet_injector_debug.usrPref.timings) {
      console.time("storage:init duration");
    }

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
      if(currentValue !== "" && currentValue !== " " && Util.isset(currentValue,'string')) {
        temp += currentValue+divider;
        try {
          fs.statSync(store+temp);
        } catch(e) {
          fs.mkdirSync(store+temp);
        }
      }
    });
    this.dir = temp;

    if(window.snippet_injector_debug.allowDebug && window.snippet_injector_debug.usrPref.timings) {
      console.timeEnd("storage:init duration");
    }
  }

  store(snippet) {
    if(window.snippet_injector_debug.allowDebug && window.snippet_injector_debug.usrPref.timings) {
      console.time("storage:store duration");
    }

    if(Util.isset(snippet,Snippet)) {
      fs.writeFileSync(path.join(this.storageDir,this.dir,snippet.getUID().split(' ').join('-')+'.json'),JSON.stringify(snippet,null,2));
      var temp = fs.existsSync(path.join(this.storageDir,this.dir,snippet.getUID().split(' ').join('-')+'.json'));
      if(window.snippet_injector_debug.allowDebug && window.snippet_injector_debug.usrPref.timings) {
        console.timeEnd("storage:store duration");
      }
      return temp;
    } else {
      if(window.snippet_injector_debug.allowDebug && window.snippet_injector_debug.usrPref.timings) {
        console.timeEnd("storage:store duration");
      }
      return false;
    }
  }

  retrieveFiles() {
    if(this.dir === '') {
      throw new TypeError('Storage directory has not been initialized.');
    } else {
      if(window.snippet_injector_debug.allowDebug && window.snippet_injector_debug.usrPref.timings) {
        console.time("storage:retrieveFiles duration");
      }
      var temp = fs.readdirSync(path.join(this.storageDir,this.dir));
      if(window.snippet_injector_debug.allowDebug && window.snippet_injector_debug.usrPref.timings) {
        console.timeEnd("storage:retrieveFiles duration");
      }
      return temp;
    }
  }

  retrieveFile(uid) {
    if(this.dir === '') {
      throw new TypeError('Storage directory has not been initialized.');
    } else {
      if(window.snippet_injector_debug.allowDebug && window.snippet_injector_debug.usrPref.timings) {
        console.time("storage:retrieveFile duration");
      }
      var temp = fs.readFileSync(path.join(this.storageDir,this.dir,uid.split(' ').join('-')+'.json'));
      if(window.snippet_injector_debug.allowDebug && window.snippet_injector_debug.usrPref.timings) {
        console.timeEnd("storage:retrieveFile duration");
      }
      return temp;
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
      if(window.snippet_injector_debug.allowDebug && window.snippet_injector_debug.usrPref.timings) {
        console.time("storage:deleteFile duration");
      }
      if(fs.existsSync(path.join(this.storageDir,this.dir,uid.split(' ').join('-')+'.json'))) {
        fs.unlinkSync(path.join(this.storageDir,this.dir,uid.split(' ').join('-')+'.json'));
        if(window.snippet_injector_debug.allowDebug && window.snippet_injector_debug.usrPref.timings) {
          console.timeEnd("storage:deleteFile duration");
        }
        return true;
      } else {
        if(window.snippet_injector_debug.allowDebug && window.snippet_injector_debug.usrPref.timings) {
          console.timeEnd("storage:deleteFile duration");
        }
        return false;
      }
    }
  }

  migrate() {
    if(this.dir === '') {
      throw new TypeError('Storage directory has not been initialized.');
    } else {
      if(window.snippet_injector_debug.allowDebug && window.snippet_injector_debug.usrPref.timings) {
        console.time("storage:migrate duration");
      }

      var files = this.retrieveFiles();
      if(files.length > 0) {
        var changed = 0;
        var migrated = 'The following snippets have been migrated:\n';
        var store = this.storageDir+this.dir;
        var _this = this;
        files.forEach(function(current) {
          if(current.endsWith('.snippet.json')) {
            fs.renameSync(path.join(store,current),path.join(store,current.replace('.snippet.json','.json')));
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
              tester: _this.testFile,
              timeout: 100,
              length: 20,
              prefix: 'sn',
              insertstring: 'SNIPPET'
            }));
            _this.store(snippet);
            _this.deleteFile(current);
            migrated += '- \''+snippet.getTitle()+'\'\n';
            changed++;
          }
        });
        migrated += '\n\nHappy Coding :)';
        if(changed > 0) {
          atom.notifications.addSuccess('Successfully migrated snippets to newer version.', {detail: migrated});
        }
      }

      if(window.snippet_injector_debug.allowDebug && window.snippet_injector_debug.usrPref.timings) {
        console.timeEnd("storage:migrate duration");
      }
    }
  }
}
