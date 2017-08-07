'use babel';

import Util from './util.js';
import Snippet from './snippet.js';
const path = require('path');
const os = require('os');
const fs = require('fs');

export default class StorageInterface {

  directory = '';
  snippets = new Array();
  ready = false;

  constructor(state) {
    if(Util.isset(state,'object')) {
      if(Util.isset(state.directory,'string')) {

        var base = os.homedir();
        if(base.contains('/')) {
          var delimiter = '/';
          var path_parts = state.directory.split('\\').join('/').split('/');
        } else if(base.contains('\\')) {
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

        if(Util.isset(state.onAfterInit,'function')) {
          this.reload(state.onAfterInit);
        } else {
          this.reload(function(res) {
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
    }
  }

  // Returns an object that represents the current object state
  serialize() {
    var serialized = new Object();
    for(var key in this) {
      serialized[key] = this[key];
    }
    return serialized;
  }

  // Tear down any state and detach
  destroy() {
    for(var key in this) {
      this[key] = undefined;
    }
  }

  async reload(callback) {
    var _this = this;
    _this.ready = false;
    _this.snippets = new Array();

    var files = fs.readdirSync(_this.directory);
    if(files.length > 0) {
      var dropped = 0;
      files.forEach(function(e,i,a) {
        var content = JSON.parse(fs.readFileSync(e));
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
    } else {
      _this.ready = true;

      if(Util.isset(callback,'function')) {
        callback({
          loaded: 0,
          dropped: 0,
          warn: 'Storage directory is empty. Aborted loading.'
        });
      } else {
        return false;
      }
    }
  }
}
