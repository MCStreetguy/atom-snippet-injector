'use babel';

import Util from './util.js';
import Snippet from './snippet.js';
const path = require('path');
const os = require('os');
const fs = require('fs');

export default class StorageInterface {

  directory = '';
  snippets = [];
  ready = false;

  constructor(state) {
    if(Util.isset(state,'object')) {
      if(Util.isset(state.directory,'string')) {

        var base = os.homedir();
        if(base.includes('/')) {
          var delimiter = '/';
          var path_parts = state.directory.split('\\').join('/').split('/');
        } else if(base.includes('\\')) {
          var delimiter = '\\';
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

        this._reload(function(res) {
          if(Util.isset(res.warn,'string')) {
            atom.notifications.addWarning(res.warn, null);
          } else {
            atom.notifications.addSuccess('Storage was successfully initialized.', {
              detail: res.loaded+' Snippets loaded, '+res.dropped+' Files ignored.'
            });
          }
        });

      } else {
        throw new TypeError('Expected string as parameter, invalid given.');
      }
    }
  }

  // Returns an object that represents the current object state
  serialize() {
    return {
      directory: this.directory,
      snippets: this.snippets
    }
  }

  // Tear down any state and detach
  destroy() {
    this._save();
  }

  async _reload(callback) {
    var _this = this;
    _this.ready = false;
    _this.snippets = [];

    var files = fs.readdirSync(_this.directory);
    if(files.length > 0) {
      var dropped = 0;
      files.forEach(function(e,i,a) {
        var content = JSON.parse(fs.readFileSync(path.join(_this.directory,e)));
        if(Snippet.validate(content)) {
          _this.snippets.push(new Snippet(content));
        } else {
          dropped++;
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

  _save() {
    this.snippets.forEach(function(e,i,a) {
      fs.writeFileSync(path.join(this.directory,e.getUID()+'.json'),JSON.parse(e.serialize()));
    });
  }

  getByProperty(property,value) {
    if(new Snippet().hasOwnProperty(property) && this.ready) {
      return this.snippets.filter(function(e,i,a) {
        return (e[property] === value);
      });
    } else {
      return undefined;
    }
  }

  get(index) {
    if(index < this.snippets.length && this.ready) {
      return this.snippets[index];
    } else {
      return undefined;
    }
  }

  getIndex(snippet) {
    if(this.ready) {
      return this.snippets.indexOf(snippet);
    } else {
      return undefined;
    }
  }

  getIndexByProperty(property,value) {
    if(new Snippet().hasOwnProperty(property) && this.ready) {
      this.snippets.forEach(function(e,i,a) {
        if(e[property] === value) {
          return i;
        }
      });
      return undefined;
    } else {
      return undefined;
    }
  }

  add(snippet) {
    if(snippet instanceof Snippet && this.ready) {
      this.snippets.push(snippet);
    } else if(Snippet.validate(snippet) && this.ready) {
      this.snippets.push(new Snippet(snippet));
    } else {
      return false;
    }
    return true;
  }

  replace(snippet,index) {
    if(index < this.snippets.length && this.ready) {
      if(snippet instanceof Snippet) {
        this.snippets[index] = snippet;
      } else if(Snippet.validate(snippet) && this.ready) {
        this.snippets[index] = new Snippet(snippet);
      } else {
        return false;
      }
      return true;
    } else {
      return false;
    }
    return true;
  }

  remove(index) {
    if(index < this.snippets.length && this.ready) {
      return this.snippets.splice(index,1);
    } else {
      return false;
    }
  }

  all() {
    return this.snippets;
  }
}
