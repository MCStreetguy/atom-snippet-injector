'use babel';

import { dirname } from 'path';
import Snippet from './snippet.js';
import Util from './util.js';
import Config from './config.js';
const fs = require('fs');
const path = require('path');
const os = require('os');

export default class Storage {

  dir = '';
  homedir = os.homedir();

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
    if(Config.get('enableDebugging')) {
      console.time("storage:init duration");
    }

    var store = this.homedir;
    var temp = '';
    if(!path.isAbsolute(directory)) {
      temp = store;
    }

    if(store.indexOf('/')>-1) {
      directory = directory.split('\\');
    } else if(store.indexOf('\\'>-1)) {
      directory = directory.split('/');
    }
    directory.forEach(function(currentValue,index) {
      if(currentValue !== "" && currentValue !== " " && Util.isset(currentValue,'string')) {
        temp = path.join(temp,currentValue);
        try {
          fs.statSync(temp);
        } catch(e) {
          fs.mkdirSync(temp);
        }
      }
    });
    this.dir = temp;
    console.log(this.dir);

    if(Config.get('enableDebugging')) {
      console.timeEnd("storage:init duration");
    }
  }

  store(snippet) {
    if(Config.get('enableDebugging')) {
      console.time("storage:store duration");
    }

    try {
      if(Util.isset(snippet,Snippet)) {
        fs.writeFileSync(path.join(this.dir,snippet.getUID().split(' ').join('-')+'.json'),JSON.stringify(snippet.serialize(),null,2));
        var temp = fs.existsSync(path.join(this.dir,snippet.getUID().split(' ').join('-')+'.json'));
        if(window.localStorage.getItem('snippet-injector-debug') === 'true' && window.localStorage.getItem('snippet-injector-debug-time') === 'true') {
          console.timeEnd("storage:store duration");
        }
        return temp;
      } else {
        if(window.localStorage.getItem('snippet-injector-debug') === 'true' && window.localStorage.getItem('snippet-injector-debug-time') === 'true') {
          console.timeEnd("storage:store duration");
        }
        return false;
      }
    } catch (e) {
      console.error(e);
      atom.notifications.addError('An Error occured while storing data!', {detail: e.message});
      return false;
    }
  }

  retrieveFiles() {
    if(this.dir === '') {
      throw new TypeError('Storage directory has not been initialized.');
    } else {
      try {
        if(Config.get('enableDebugging')) {
          // console.time("storage:retrieveFiles duration");
        }
        var temp = fs.readdirSync(this.dir);
        if(Config.get('enableDebugging')) {
          // console.timeEnd("storage:retrieveFiles duration");
        }
        return temp;
      } catch(e) {
        console.error(e);
        atom.notifications.addError('An Error occured while reading storage!', {detail: e.message});
        return false;
      }
    }
  }

  retrieveFile(uid) {
    if(this.dir === '') {
      throw new TypeError('Storage directory has not been initialized.');
    } else {
      try {
        if(Config.get('enableDebugging')) {
          // console.time("storage:retrieveFile duration");
        }
        var temp = fs.readFileSync(path.join(this.dir,uid.split(' ').join('-')+'.json'));
        if(Config.get('enableDebugging')) {
          // console.timeEnd("storage:retrieveFile duration");
        }
        return temp;
      } catch(e) {
        console.error(e);
        atom.notifications.addError('An Error occured while reading data!', {detail: e.message});
        return false;
      }
    }
  }

  static testFile(uid) {
    var file;
    try {
      file = this.retrieveFile(uid);
    } catch (e) {
      return false;
    } finally {
      return (file !== false);
    }
  }

  deleteFile(uid) {
    if(this.dir === '') {
      throw new TypeError('Storage directory has not been initialized.');
    } else {
      try {
        if(Config.get('enableDebugging')) {
          console.time("storage:deleteFile duration");
        }
        if(fs.existsSync(path.join(this.dir,uid.split(' ').join('-')+'.json'))) {
          fs.unlinkSync(path.join(this.dir,uid.split(' ').join('-')+'.json'));
          if(Config.get('enableDebugging')) {
            console.timeEnd("storage:deleteFile duration");
          }
          return true;
        } else {
          if(Config.get('enableDebugging')) {
            console.timeEnd("storage:deleteFile duration");
          }
          return false;
        }
      } catch(e) {
        console.error(e);
        atom.notifications.addError('An Error occured while deleting data!', {detail: e.message});
        return false;
      }
    }
  }

  migrate() {
    if(this.dir === '') {
      throw new TypeError('Storage directory has not been initialized.');
    } else {
      try {
        if(Config.get('enableDebugging')) {
          console.time("storage:migrate duration");
        }

        var files = this.retrieveFiles();
        if(files.length > 0) {
          var changed = 0;
          var migrated = 'The following snippets have been migrated:\n';
          var store = this.dir;
          var _this = this;
          files.forEach(function(current) {
            if(current.endsWith('.snippet.json')) {
              fs.renameSync(path.join(store,current),path.join(store,current.replace('.snippet.json','.json')));
              current = current.replace('.snippet.json','');
            } else {
              current = current.replace('.json','');
            }
            _this.backup(current);

            var snippet = new Snippet(JSON.parse(_this.retrieveFile(current)));
            var res = Util.compareVersions(Snippet.getLastUpdate(),snippet.getVersion());
            if(res === Snippet.getLastUpdate() || res === undefined) {
              snippet.setVersion(Util.getPackageVersion());
              // _this.deleteFile(current);
              _this.store(snippet);

              migrated += '- \''+snippet.getTitle()+'\'\n';
              changed++;
            }
          });
          migrated += '\n\nHappy Coding :)';
          if(changed > 0) {
            atom.notifications.addSuccess('Successfully migrated snippets to newer version.', {detail: migrated});
          }
        }

        if(Config.get('enableDebugging')) {
          console.timeEnd("storage:migrate duration");
        }
      } catch(e) {
        console.error(e);
        atom.notifications.addFatalError('An Error occured while migrating the local storage! This may impact your stored data.', {detail: e.message});
        // atom.notifications.addInfo('Here comes the notification about backups.', null);
        return false;
      }
    }
  }

  backup(uid) {
    try {
      if(Config.get('enableDebugging')) {
        console.time("storage:backup duration");
      }
      var backupdir = path.join(this.homedir,'.atom','recovery','snippet-injector');
      if(!fs.existsSync(backupdir)) {
        fs.mkdirSync(backupdir);
      }
      if(fs.existsSync(path.join(this.dir,uid+'.json'))) {
        var snippet = JSON.parse(this.retrieveFile(uid));
        snippet.backup_timestamp = Date.now();
        fs.writeFileSync(path.join(backupdir,uid+'.json'),JSON.stringify(snippet));
      }
      if(Config.get('enableDebugging')) {
        console.timeEnd("storage:backup duration");
      }
    } catch(e) {
      console.error(e);
      atom.notifications.addError('An Error occured during data backup!', {detail: e.message});
      return false;
    }
  }

  restore(uid) {
    try {
      if(Config.get('enableDebugging')) {
        console.time("storage:restore duration");
      }
      var backupdir = path.join(this.homedir,'.atom','recovery','snippet-injector');
      if(!fs.existsSync(backupdir)) {
        fs.mkdirSync(backupdir);
      }

      if(fs.existsSync(path.join(this.backupdir,uid+'.json'))) {
        var snippet = JSON.parse(fs.readFileSync(path.join(this.backupdir,uid+'.json')));
        snippet.backup_timestamp = undefined;
        this.store(snippet);
      }
      if(Config.get('enableDebugging')) {
        console.timeEnd("storage:restore duration");
      }
    } catch(e) {
      console.error(e);
      atom.notifications.addError('An Error occured during data restore!', {detail: e.message});
      return false;
    }
  }

  retrieveBackups() {
    try {
      if(Config.get('enableDebugging')) {
        console.time("storage:restore duration");
      }
      var backupdir = path.join(this.homedir,'.atom','recovery','snippet-injector');
      if(fs.existsSync(this.backupdir)) {
        var temp = fs.readdirSync(backupdir);
        if(Config.get('enableDebugging')) {
          console.timeEnd("storage:restore duration");
        }
        return temp;
      } else {
        if(Config.get('enableDebugging')) {
          console.timeEnd("storage:restore duration");
        }
        return false;
      }
    } catch(e) {
      console.error(e);
      atom.notifications.addError('An Error occured while reading storage!', {detail: e.message});
      return false;
    }
  }
}
