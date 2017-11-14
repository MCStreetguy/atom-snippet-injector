'use babel';

import Util from './util';
import Snippet from './snippet';
import AtomSync from './sync';
import CouchDB from 'couchdb-wrapper';
const path = require('path');
const os = require('os');
const fs = require('fs');

const DB_NAME = 'snippet-injector-data';

export default class StorageInterface {

  directory = '';
  snippets = [];
  ignored = [];
  ready = false;
  _autosave_pid = undefined;
  atom_sync = undefined;
  db = undefined;
  _autosync_pid = undefined;

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
        pass: atom.config.get('snippet-injector.database.password'),
        sync: atom.config.get('snippet-injector.database.syncInterval')*1000
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
              atom.notifications.addWarning(res.warn);
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

      if(state.db.enable && Util.isset(state.db.host,'string') && Util.isset(state.db.port,'number') && Util.isset(state.db.user,'string') && Util.isset(state.db.pass,'string') && Util.isset(state.db.sync,'number')) {
        this.initDatabase(state.db.host,state.db.port,state.db.user,state.db.pass,state.db.sync);
      }
    }
  }

  // Returns an object that represents the current object state
  serialize() {
    return {
      directory: this.directory,
      snippets: this.snippets,
      _autosave_pid: this._autosave_pid,
      _snippets_cson: this._snippets_cson_data,
      atomsync: this.atom_sync,
      db: this.db
    }
  }

  // Tear down any state and detach
  dispose() {
    this._save();
  }

  _db_error(msg,buttons) {
    var _this = this;
    if(!Util.isset(buttons,'object')) buttons = [];
    buttons.push({
      text: 'Dismiss',
      onDidClick: function () {
        not.dismiss();
      }
    });

    var detail = 'CouchDB module threw: '+msg;
    // if(buttons.filter(function(e) {
    //   return (e.text === 'Fix Sync problems');
    // }).length > 0) {
    //   detail += '\n\n(Use "Fix Sync problems" on your own risk!)';
    // }

    var not = atom.notifications.addError('An Error occured while initializing database connection!', {
      detail: detail,
      dismissable: true,
      icon: 'database',
      buttons: buttons
    });

    _this._autosync_pid = clearInterval(_this._autosync_pid);
  }

  initDatabase(host,port,user,pass,syncinterval) {
    var _this = this;

    try {
      _this.db = new CouchDB({
        host: host,
        port: port,
        username: user,
        password: pass
      });

      if(_this._autosync_pid != undefined) clearInterval(_this._autosync_pid);
      _this._autosync_pid = setInterval(function() {
        _this.syncDatabase(_this);
      },syncinterval);

      setImmediate(function () {
        _this.syncDatabase(_this);
      });
    } catch(e) {
      this._db_error(e.message,[{
        text: 'Retry',
        onDidClick: function() {
          atom.notifications.getNotifications().forEach(function(e) {
            if(e.type === 'error' && e.message.startsWith('An Error occured while initializing database connection')) {
              e.dismiss();
            }
          });
          _this.initDatabase(
            atom.config.get('snippet-injector.database.server'),
            atom.config.get('snippet-injector.database.port'),
            atom.config.get('snippet-injector.database.username'),
            atom.config.get('snippet-injector.database.password'),
            atom.config.get('snippet-injector.database.syncInterval')*1000
          );
        }
      }]);
    }
  }

  syncDatabase(_this) {
    var cdb = _this.db;

    cdb.allDbs(function(data) {
      if(data.status === 'done') {
        if(data.response.indexOf(DB_NAME) < 0) {
          var res = cdb.createDb(DB_NAME);
          if(!res.status === 'done') {
            _this._db_error(res.msg,[{
              text: 'Retry',
              onDidClick: function() {
                atom.notifications.getNotifications().forEach(function(e) {
                  if(e.type === 'error' && e.message.startsWith('An Error occured while initializing database connection')) {
                    e.dismiss();
                  }
                });
                _this.initDatabase(
                  atom.config.get('snippet-injector.database.server'),
                  atom.config.get('snippet-injector.database.port'),
                  atom.config.get('snippet-injector.database.username'),
                  atom.config.get('snippet-injector.database.password'),
                  atom.config.get('snippet-injector.database.syncInterval')*1000
                );
              }
            }]);
            return undefined;
          }
        }

        var snippets = _this.data().filter(function(e) {
          return e.getDbInfo().synchronized;
        });
        var remotes = cdb.getDocs(DB_NAME);

        if(remotes.status === 'done') {
          var remsnippets = remotes.response.rows;

          for (var i = 0; i < snippets.length; i++) {
            var snippet = snippets[i];

            if(Util.isset(snippet.getDbInfo().revision,'string') && Util.isset(snippet.getDbInfo().identifier,'string') && snippet.getDbInfo().revision !== '' && snippet.getDbInfo().identifier !== '') {
              var remsnippet = remsnippets.filter(function(e) {
                return (e.id === snippet.getDbInfo().identifier);
              })[0];

              if(remsnippet) {
                if(CouchDB.parseRevision(snippet.getDbInfo().revision) > CouchDB.parseRevision(remsnippet.value.rev)) {
                  // upload snippet
                  var result = cdb.updateDoc(DB_NAME,snippet.getDbInfo().identifier,snippet._rev,snippet);
                  if(result.status === 'done' || result.status === 'pending') {
                    snippet.setDbInfo({
                      synchronized: true,
                      identifier: result.response.id,
                      revision: result.response.rev
                    })

                    _this.replace(snippet);
                  } else {
                    _this._db_error(result.msg,[{
                      text: 'Fix Sync problems',
                      onDidClick: function() {
                        atom.notifications.getNotifications().forEach(function(e) {
                          if(e.type === 'error' && e.message.startsWith('An Error occured while initializing database connection')) {
                            e.dismiss();
                          }
                        });
                        _this.syncRepair();
                      }
                    }]);
                    return undefined;
                  }


                } else if(CouchDB.parseRevision(snippet.getDbInfo().revision) < CouchDB.parseRevision(remsnippet.value.rev)) {
                  // download snippet
                  var result = cdb.getDoc(DB_NAME,remsnippet.id);
                  if(result.status === 'done' || result.status === 'pending') {
                    _this.add(result.response);
                  } else {
                    _this._db_error(result.msg,[{
                      text: 'Fix Sync problems',
                      onDidClick: function() {
                        atom.notifications.getNotifications().forEach(function(e) {
                          if(e.type === 'error' && e.message.startsWith('An Error occured while initializing database connection')) {
                            e.dismiss();
                          }
                        });;
                        _this.syncRepair();
                      }
                    }]);
                    return undefined;
                  }


                } else {
                  // identical, do nothing
                }
              } else {
                // upload snippet
                var result = cdb.postDoc(DB_NAME,snippet);
                if(result.status === 'done' || result.status === 'pending') {
                  snippet.setDbInfo({
                    synchronized: true,
                    identifier: result.response.id,
                    revision: result.response.rev
                  })

                  _this.replace(snippet);
                } else {
                  _this._db_error(result.msg,[{
                    text: 'Fix Sync problems',
                    onDidClick: function() {
                      atom.notifications.getNotifications().forEach(function(e) {
                        if(e.type === 'error' && e.message.startsWith('An Error occured while initializing database connection')) {
                          e.dismiss();
                        }
                      });;
                      _this.syncRepair();
                    }
                  }]);
                  return undefined;
                }


              }
            } else {
              // upload snippet
              var result = cdb.postDoc(DB_NAME,snippet);
              if(result.status === 'done' || result.status === 'pending') {
                snippet.setDbInfo({
                  synchronized: true,
                  identifier: result.response.id,
                  revision: result.response.rev
                })

                _this.replace(snippet);
              } else {
                _this._db_error(result.msg,[{
                  text: 'Fix Sync problems',
                  onDidClick: function() {
                    atom.notifications.getNotifications().forEach(function(e) {
                      if(e.type === 'error' && e.message.startsWith('An Error occured while initializing database connection')) {
                        e.dismiss();
                      }
                    });;
                    _this.syncRepair();
                  }
                }]);
                return undefined;
              }
            }
          }

          for (var i = 0; i < remsnippets.length; i++) {
            var remsnippet = remsnippets[i];
            var snippet = snippets.filter(function(e) {
              return (e.getDbInfo().identifier === remsnippet.id);
            })[0];

            if(!snippet && !_this._isBurried(remsnippet.id)) {
              // download snippet
              var result = cdb.getDoc(DB_NAME,remsnippet.id);
              if(result.status === 'done' || result.status === 'pending') {
                _this.add(result.response);
              } else {
                _this._db_error(result.msg,[{
                  text: 'Fix Sync problems',
                  onDidClick: function() {
                    atom.notifications.getNotifications().forEach(function(e) {
                      if(e.type === 'error' && e.message.startsWith('An Error occured while initializing database connection')) {
                        e.dismiss();
                      }
                    });;
                    _this.syncRepair();
                  }
                }]);
                return undefined;
              }
            }
          }
        } else {
          _this._db_error(remotes.msg,[{
            text: 'Retry',
            onDidClick: function() {
              atom.notifications.getNotifications().forEach(function(e) {
                if(e.type === 'error' && e.message.startsWith('An Error occured while initializing database connection')) {
                  e.dismiss();
                }
              });
              _this.initDatabase(
                atom.config.get('snippet-injector.database.server'),
                atom.config.get('snippet-injector.database.port'),
                atom.config.get('snippet-injector.database.username'),
                atom.config.get('snippet-injector.database.password'),
                atom.config.get('snippet-injector.database.syncInterval')*1000
              );
            }
          }]);
          return undefined;
        }

      } else {
        _this._db_error(data.msg,[{
          text: 'Retry',
          onDidClick: function() {
            atom.notifications.getNotifications().forEach(function(e) {
              if(e.type === 'error' && e.message.startsWith('An Error occured while initializing database connection')) {
                e.dismiss();
              }
            });
            _this.initDatabase(
              atom.config.get('snippet-injector.database.server'),
              atom.config.get('snippet-injector.database.port'),
              atom.config.get('snippet-injector.database.username'),
              atom.config.get('snippet-injector.database.password'),
              atom.config.get('snippet-injector.database.syncInterval')*1000
            );
          }
        }]);
        return undefined;
      }
    });

    _this._save(false);
  }

  syncRepair() {
    var _this = this;
    var cdb = _this.db;

    cdb.allDbs(function(data) {
      if(data.status === 'done') {
        if(data.response.indexOf(DB_NAME) >= 0) {
          _this.data().filter(function(e) {
            return e.getDbInfo().synchronized;
          }).forEach(function(snippet) {
            var identifier = snippet._id;
            var revision = snippet._rev;

            if(identifier && revision) {
              var remote = cdb.getDoc(DB_NAME,identifier);

              if(remote.status === 'done') {
                if(CouchDB.parseRevision(revision) > CouchDB.parseRevision(remote.response._rev)) {
                  var result = cdb.updateDoc(DB_NAME,identifier,revision,snippet);
                  if(result.status === 'done' || result.status === 'pending') {
                    snippet.setDbInfo({
                      synchronized: true,
                      identifier: result.response.id,
                      revision: result.response.rev
                    })

                    _this.replace(snippet);
                  } else {
                    _this._db_error(result.msg);
                  }
                } else if(CouchDB.parseRevision(revision) < CouchDB.parseRevision(remote.response._rev)) {
                  _this.replace(remote.response);
                } else {
                  // identical, do nothing
                }
              } else {
                // Remove db meta info
                snippet._id = undefined;
                snippet._rev = undefined;
                snippet.setDbInfo({
                  synchronized: snippet.getDbInfo().synchronized,
                  identifier: '',
                  revision: ''
                });
              }
            } else {
              // Remove db meta info
              snippet._id = undefined;
              snippet._rev = undefined;
              snippet.setDbInfo({
                synchronized: snippet.getDbInfo().synchronized,
                identifier: '',
                revision: ''
              });
            }
          });
          _this._save(false);
          _this.syncDatabase(_this);
        } else {
          // Db doesnt exist, do nothing
        }
      } else {
        // Server Error
        _this._db_error(data.msg);
      }
    });
  }

  _buryCorpse(snippet) {
    if(!snippet instanceof Snippet) snippet = new Snippet(snippet);
    var corpse = {
      uid: snippet.getUID(),
      _id: snippet._id
    }

    if(this.ignored.indexOf(corpse) < 0) {
      this.ignored.push(corpse);
    }
  }

  _isBurried(u_id) {
    return (this.ignored.filter(function(e) {
      return (u_id === e.uid || u_id === e._id);
    }).length > 0);
  }

  _remoteDelete(snippet) {
    var _this = this;
    var cdb = _this.db;

    cdb.allDbs(function(data) {
      if(data.status === 'done') {
        if(data.response.indexOf(DB_NAME) >= 0) {
          var res = cdb.deleteDoc(DB_NAME,snippet._id,snippet._rev);
          if(res.status !== 'done') {
            _this._db_error(res.msg,[{
              text: 'Fix Sync problems',
              onDidClick: function() {
                atom.notifications.getNotifications().forEach(function(e) {
                  if(e.type === 'error' && e.message.startsWith('An Error occured while initializing database connection')) {
                    e.dismiss();
                  }
                });;
                _this.syncRepair();
              }
            }]);
            return undefined;
          }
        }
      } else {
        _this._db_error(data.msg,[{
          text: 'Retry',
          onDidClick: function() {
            atom.notifications.getNotifications().forEach(function(e) {
              if(e.type === 'error' && e.message.startsWith('An Error occured while initializing database connection')) {
                e.dismiss();
              }
            });
            _this.initDatabase(
              atom.config.get('snippet-injector.database.server'),
              atom.config.get('snippet-injector.database.port'),
              atom.config.get('snippet-injector.database.username'),
              atom.config.get('snippet-injector.database.password'),
              atom.config.get('snippet-injector.database.syncInterval')*1000
            );
          }
        }]);
        return undefined;
      }
    });
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

    try {
      _this.ignored = JSON.parse(fs.readFileSync(path.join(path.dirname(atom.config.getUserConfigPath()),'storage','snippet-injector','.dbignores')));
    } catch(e) {
      _this.ignored = [];
    }

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

      // await _this._save(false);
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
      fs.writeFileSync(path.join(path.dirname(atom.config.getUserConfigPath()),'storage','snippet-injector','.dbignores'),JSON.stringify(this.ignored));
      if(Util.isset(notify,'boolean') && notify) {
        atom.notifications.addInfo('Snippet Injector completed autosave.');
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
          if(snip.getDbInfo().synchronized) {
            if(snip.getAuthor() === os.userInfo().username) {
              this._remoteDelete(snip);
            } else {
              this._buryCorpse(snip);
            }
          }
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
