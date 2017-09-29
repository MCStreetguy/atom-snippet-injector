'use babel';

import Util from './util';
import Snippet from './snippet';
import AtomSync from './sync';
const path = require('path');
const os = require('os');
const fs = require('fs');

export default class StorageInterface {

  directory = '';
  snippets = [];
  ready = false;
  _autosave_pid = undefined;
  atom_sync = undefined;
  db = undefined;
  remote_snippets = [];

  constructor(callback) {
    var state = {
      directory: atom.config.get('snippet-injector.storageDirectory'),
      autosave: atom.config.get('snippet-injector.autosaveInterval'),
      silentautosave: atom.config.get('snippet-injector.disableAutosaveNotification'),
      autosync: atom.config.get('snippet-injector.atomSync'),
      onAfterInit: callback,
      db: {
        enable: atom.config.get('snippet-injector.database.enable'),
        host: atom.config.get('snippet-injector.database.server'),
        port: atom.config.get('snippet-injector.database.port'),
        user: atom.config.get('snippet-injector.database.username'),
        pass: atom.config.get('snippet-injector.database.password')
      }
    };

    if(Util.isset(state,'object')) {
      if(Util.isset(state.directory,'string')) {

        var base = os.homedir();
        if(base.includes('/')) {
          var path_parts = state.directory.split('\\').join('/').split('/');
        } else if(base.includes('\\')) {
          var path_parts = state.directory.split('/').join('\\').split('\\');
        } else {
          throw new TypeError('Expected path to contain delimiter, considered invalid.');
        }

        var dir = path.join(path.isAbsolute(state.directory) ? path_parts.splice(0,1) : base);
        path_parts.forEach(function(e,i,a) {
          dir = path.join(dir,e);
          try {
            fs.statSync(dir);
          } catch(e) {
            fs.mkdirSync(dir);
          }
        });
        this.directory = dir;

        if(Util.isset(callback,'function')) {
          this._reload(callback);
        } else {
          this._reload(function(res) {
            if(Util.isset(res.warn,'string')) {
              atom.notifications.addWarning(res.warn, null);
            } else {
              atom.notifications.addSuccess('Storage was successfully initialized.', {
                detail: res.loaded+' Snippets loaded, '+res.dropped+' Files ignored.'
              });
            }
          });
        }

      } else {
        throw new TypeError('Expected string as parameter, invalid given.');
      }

      if(Util.isset(state.autosave,'number') && state.autosave >= 60) {
        this.initAutosave(state.autosave,state.silentautosave);
      }

      if(state.autosync) {
        this.atom_sync = new AtomSync();
        this.atom_sync.sync(this.snippets);
      }

      if(state.db.enable && Util.isset(state.db.host,'string') && Util.isset(state.db.port,'number') && Util.isset(state.db.user,'string') && Util.isset(state.db.pass,'string')) {

      }
    }
  }

  // Returns an object that represents the current object state
  serialize() {
    return {
      directory: this.directory,
      snippets: this.snippets,
      _autosave_pid: this._autosave_pid,
      _snippets_cson: this._snippets_cson_data
    }
  }

  // Tear down any state and detach
  dispose() {
    this._save();
  }

  initAutosave(interval, silent) {
    if(Util.isset(interval,'number') && interval > 0) {
      if(Util.isset(this._autosave_pid,'number')) {
        clearInterval(this._autosave_pid);
      }
      var _this = this;
      this._autosave_pid = setInterval(function() {
        _this._save(!silent);
      }, interval*1000);
    }
  }

  _getIndex(search) {
    if(Util.isset(search,'object')) {
      if(Util.isset(search.uid,'string')) {
        var temp = undefined;
        this.snippets.forEach(function(e,i,a) {
          if(e.getUID() === search.uid) {
            temp = i;
          }
        });
        return temp;
      } else if(Util.isset(search.element,'object')) {
        var temp = undefined;
        this.snippets.forEach(function(e,i,a) {
          if(e === search.element) {
            temp = i;
          }
        });
        return temp;
      }
    }
    return undefined;
  }

  async _reload(callback) {
    var _this = this;
    _this.ready = false;
    _this.snippets = [];

    var files = fs.readdirSync(_this.directory);
    if(files.length > 0) {
      var dropped = 0;
      files.forEach(function(e,i,a) {
        if(fs.statSync(path.join(_this.directory,e)).isFile()) {
          var content = JSON.parse(fs.readFileSync(path.join(_this.directory,e)));
          if(Snippet.validate(content)) {
            _this.snippets.push(new Snippet(content));
          } else {
            dropped++;
          }
        }
      });

      _this._save(false);

      _this.ready = true;

      if(Util.isset(callback,'function')) {
        callback({
          loaded: _this.snippets.length,
          dropped: dropped,
          warn: null
        });
      } else {
        return true;
      }
    } else if(Util.isset(callback,'function')) {
      _this.ready = true;

      callback({
        loaded: 0,
        dropped: 0,
        warn: 'Storage directory is empty. Aborted loading.'
      });
    } else {
      _this.ready = true;
      return false;
    }
  }

  _save(notify) {
    if(this.ready) {
      var dir = this.directory;
      this.snippets.forEach(function(e,i,a) {
        var file = path.join(dir,e.getUID()+'.json');
        fs.writeFileSync(file,JSON.stringify(e.serialize(),null,2));
      });
      if(Util.isset(notify,'boolean') && notify) {
        atom.notifications.addInfo('Snippet Injector completed autosave.', null);
      }
    }
  }

  get(uid) {
    if(this.ready) {
      var i = this._getIndex({uid: uid});
      if(Util.isset(i,'number')) {
        return this.snippets[i];
      }
    }
    return undefined;
  }

  getIndex(uid) {
    if(this.ready) {
      return this._getIndex({uid: uid});
    } else {
      return undefined;
    }
  }

  contains(uid) {
    return (this.getIndex(uid) > -1)
  }

  add(snippet) {
    if(snippet instanceof Snippet && this.ready) {
      this.snippets.push(snippet);
      (this.atom_sync !== undefined) && this.atom_sync.sync(this.snippets);
    } else if(Snippet.validate(snippet) && this.ready) {
      this.snippets.push(new Snippet(snippet));
      (this.atom_sync !== undefined) && this.atom_sync.sync(this.snippets);
    } else {
      return false;
    }
    return true;
  }

  replace(snippet) {
    if(this.ready && Util.isset(this._getIndex({uid: snippet.uid}),'number')) {
      if(snippet instanceof Snippet) {
        this.snippets[this._getIndex({uid: snippet.uid})] = snippet;
        (this.atom_sync !== undefined) && this.atom_sync.sync(this.snippets);
      } else if(Snippet.validate(snippet) && this.ready) {
        this.snippets[this._getIndex({uid: snippet.uid})] = new Snippet(snippet);
        (this.atom_sync !== undefined) && this.atom_sync.sync(this.snippets);
      } else {
        return false;
      }
      return true;
    } else {
      return false;
    }
    return true;
  }

  remove(uid) {
    if(Util.isset(uid,'string') && this.ready) {
      var i = this._getIndex({uid: uid});
      if(Util.isset(i,'number')) {
        var snip = this.get(uid);
        (this.atom_sync !== undefined) && this.atom_sync.remove(snip);
        try {
          fs.unlinkSync(path.join(this.directory,snip.getUID()+'.json'));
        } catch (e) {}

        this.snippets.splice(i,1);
        return true;
      }
      return false;
    } else {
      return false;
    }
  }

  data() {
    return this.snippets;
  }
}
