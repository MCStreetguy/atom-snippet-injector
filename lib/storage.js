'use babel';

import Util from './util.js';
import Snippet from './snippet.js';
const path = require('path');
const os = require('os');
const fs = require('fs');
const CSON = require('cson');

export default class StorageInterface {

  directory = '';
  snippets = [];
  ready = false;
  _autosave_pid = undefined;
  _snippets_cson = path.join(path.dirname(atom.config.getUserConfigPath()),'snippets.cson');
  _snippets_cson_data = undefined;

  constructor(callback) {
    var state = {
      directory: atom.config.get('snippet-injector.storageDirectory'),
      autosave: atom.config.get('snippet-injector.autosaveInterval'),
      autosync: atom.config.get('snippet-injector.atomSync'),
      onAfterInit: callback
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
        this.initAutosave(state.autosave);
      }

      if(Util.isset(state.autosync,'boolean') && state.autosync) {
        this.initAtomSync();
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

  initAutosave(interval) {
    if(Util.isset(interval,'number') && interval > 0) {
      if(Util.isset(this._autosave_pid,'number')) {
        this._autosave_pid = clearInterval(this._autosave_pid);
      }
      this._autosave_pid = setInterval(this._save, interval*1000, true);
    }
  }

  initAtomSync() {
    this._snippets_cson_data = CSON.parse(fs.readFileSync(this._snippets_cson));
    this._atom_sync();
  }

  _atom_sync() {
    var _this = this;
    _this.snippets.forEach(function(e) {
      // var prefix = e.getTags().length ? e.getTags().join(' ').toLowerCase() : e.getTitle().toLowerCase();
      var prefix = e.getTitle().toLowerCase();
      var scope = e.getScope();

      if(_this._snippets_cson_data.hasOwnProperty(scope)) {
        if(_this._snippets_cson_data[scope].hasOwnProperty(e.getTitle())) {
          _this._snippets_cson_data[scope][e.getTitle()]['body'] = e.getContent();
          _this._snippets_cson_data[scope][e.getTitle()]['prefix'] = prefix;
        } else {
          var temp = new Object();
          temp[e.getTitle()] = {
            value: {
              body: e.getContent(),
              prefix: prefix
            },
            writable: true,
            configurable: true,
            enumerable: true
          };

          Object.defineProperties(_this._snippets_cson_data[scope],temp);
        }
      } else {
        var temp = new Object();
        var temp2 = new Object();
        temp2[e.getTitle()] = {
          body: e.getContent(),
          prefix: prefix
        };
        temp[scope] = {
          value: temp2,
          writable: true,
          configurable: true,
          enumerable: true
        };

        Object.defineProperties(_this._snippets_cson_data,temp);
      }
    });
    console.log(_this._snippets_cson_data);
    fs.writeFileSync(_this._snippets_cson,CSON.stringify(_this._snippets_cson_data));
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
        fs.writeFileSync(file,JSON.stringify(e.serialize()));
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

  add(snippet) {
    if(snippet instanceof Snippet && this.ready) {
      this.snippets.push(snippet);
      if(this._snippets_cson_data !== undefined) {
        this._atom_sync();
      }
    } else if(Snippet.validate(snippet) && this.ready) {
      this.snippets.push(new Snippet(snippet));
      if(this._snippets_cson_data !== undefined) {
        this._atom_sync();
      }
    } else {
      return false;
    }
    return true;
  }

  replace(snippet) {
    if(this.ready && Util.isset(this._getIndex({uid: snippet.uid}),'number')) {
      if(snippet instanceof Snippet) {
        this.snippets[this._getIndex({uid: snippet.uid})] = snippet;
        if(this._snippets_cson_data !== undefined) {
          this._atom_sync();
        }
      } else if(Snippet.validate(snippet) && this.ready) {
        this.snippets[this._getIndex({uid: snippet.uid})] = new Snippet(snippet);
        if(this._snippets_cson_data !== undefined) {
          this._atom_sync();
        }
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
    if(index < this.snippets.length && this.ready) {
      var i = this._getIndex({uid: uid});
      if(Util.isset(i,'number')) return this.snippets.splice(i,1);
      return false;
    } else {
      return false;
    }
  }

  data() {
    return this.snippets;
  }
}
