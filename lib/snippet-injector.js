'use babel';

import { CompositeDisposable } from 'atom';
import Util from './util';
import Snippet from './snippet';
import StorageInterface from './storage';
import IconHelper from './icon-helper';
import IMEX from './imex';
import CouchDB from 'couchdb-wrapper';
const fs = require('fs');
const path = require('path');
const os = require('os');
const $ = require('./externals/jquery-3.2.1.min.js');

export default {

  config: {
    storageDirectory: {
      type: 'string',
      default: '.atom/storage/snippet-injector/snippets/',
      title: 'Storage Directory',
      description: 'Relative paths are resolved in relation to your homedir (`~/`)',
      order: 1
    },
    autosaveInterval: {
      type: 'integer',
      default: 600,
      minimum: 59,
      maximum: 3600,
      title: 'Autosave Interval (in seconds)',
      description: 'Small values can impact Atom\'s performance. Values below 60 disable autosave. *(not recommended since this prevents data loss)*',
      order: 2
    },
    disableAutosaveNotification: {
      type: 'boolean',
      default: false,
      order: 3
    },
    atomSync: {
      type: 'boolean',
      default: false,
      title: 'Synchronization',
      description: 'with Atom\'s snippet module (`snippets.cson`)',
      order: 4
    },
    database: {
      type: 'object',
      title: 'CouchDB Setup',
      order: 5,
      properties: {
        enable: {
          type: 'boolean',
          default: false,
          title: 'Enable Database Connection',
          order: 0
        },
        server: {
          type: 'string',
          default: 'localhost',
          order: 1
        },
        port: {
          type: 'number',
          default: '5984',
          order: 2
        },
        username: {
          type: 'string',
          default: '',
          order: 3
        },
        password: {
          type: 'string',
          default: '',
          order: 4
        },
        syncInterval: {
          type: 'number',
          default: 300,
          minimum: 59,
          maximum: 3600,
          title: 'Database Auto-Sync Interval (in seconds)',
          description: 'Values below 60 disable auto-sync. Not recommended, you will not retrieve new snippets from the database until next restart.',
          order: 5
        }
      }
    }
  },
  subscriptions: new CompositeDisposable(),
  storage: null,

  activate(state) {
    var _this = this;

    this.storage = new StorageInterface(function(res) {
      // if(Util.isset(res.warn,'string')) {
      //   atom.notifications.addWarning(res.warn);
      // } else {
      //   atom.notifications.addSuccess('Snippet Injector was successfully initialized and is now ready to use.', {
      //     detail: res.loaded+' Snippets loaded, Happy Coding :)'
      //   });
      // }

      // Main commands
      _this.subscriptions.add(atom.commands.add('atom-text-editor', {
        'snippet-injector:create': () => _this.create(),
        'snippet-injector:insert': () => _this.insert(),
        'snippet-injector:update': () => _this.edit()
      }));
      _this.subscriptions.add(atom.commands.add('atom-workspace', {
        'snippet-injector:export-all': () => _this.expall(),
        'snippet-injector:export': () => _this.exp(),
        'snippet-injector:import': () => _this.imp(),
        'snippet-injector:delete': () => _this.delete()
      }));
      _this.subscriptions.add(atom.commands.add('atom-workspace', {
        'snippet-injector:database-syncnow': function() {
          if(atom.config.get('snippet-injector.database.enable')) {
            _this.storage.syncDatabase(_this.storage);
            atom.notifications.addInfo('Snippet Injector started synchronization. This may take a while.');
          }
        },
        'snippet-injector:storage-savenow': function() {
          _this.storage._save(true);
        }
      }));
      // Config listener
      _this.subscriptions.add(atom.config.onDidChange('snippet-injector.autosaveInterval',function(e) {
        _this.storage.initAutosave(e.newValue,atom.config.get('snippet-injector.disableAutosaveNotification'));
      }));
      _this.subscriptions.add(atom.config.onDidChange('snippet-injector.disableAutosaveNotification', function(e) {
        _this.storage.initAutosave(atom.config.get('snippet-injector.autosaveInterval'),e.newValue);
      }));
      var timeouter = undefined;
      _this.subscriptions.add(atom.config.onDidChange('snippet-injector.storageDirectory',function(e) {
        if(Util.isset(timeouter,'number')) {
          clearTimeout(timeouter);
        }
        timeouter = setTimeout(function() {
          atom.notifications.addInfo('Please restart Atom in order to apply your changes:', {detail: 'Storage Directory -> '+e.newValue});
        }, 500);
      }));
      _this.subscriptions.add(atom.config.onDidChange('snippet-injector.atomSync', function(e) {
        atom.notifications.addInfo('Please restart Atom in order to apply your changes.');
      }));
    });
  },

  deactivate() {
    this.subscriptions.dispose();
    this.storage.dispose();
    for(var key in this) this[key] = null;
  },

  serialize() {
    return {
      storage: this.storage.serialize()
    }
  },

  _logState() {
    var _this = this;
    console.group("Package state");
    console.log({
      subscriptions: _this.subscriptions,
      storage: _this.storage,
      imex: _this.imex_module
    });
    console.groupEnd();
  },

  create() {
    var editor = atom.workspace.getActiveTextEditor();

    var range = editor.getSelectedScreenRange();
    if(range.start.row != range.end.row) {
      range.start.column = 0;
    }
    editor.setSelectedScreenRange(range);
    var selection = editor.getSelectedText().split('\\').join('\\\\');

    var lang = editor.getGrammar().name;
    var scope = '.'+editor.getGrammar().scopeName;
    var storage = this.storage;
    const inputPrompt = Util.promptUser({
      placeholder: 'Enter snippet title  #and #add #tags',
      btnconfirm: 'Save snippet',
      btncancel: 'Cancel'
    },function(text,shared){
      if(Util.isset(text,'string')) {
        var tags = [];
        var ac_prefix = '';
        var title = text.split(' ').filter(function(element,index,array) {
          if(element.startsWith('#')) {
            tags.push(element.substring(1));
            return false;
          } else {
            return true;
          }
        }).join(' ').trim().replace(/\[[^\]]+\]/g,function(match) {
          ac_prefix = match.replace(/[\[\]]/g,'')
          return ac_prefix;
        });
        var result = storage.add(new Snippet({
          title: title,
          tags: tags,
          prefix: ac_prefix,
          content: selection,
          lang: lang,
          scope: scope,
          version: Util.getPackageVersion(),
          shared: true
        }));
        if(result) {
          atom.notifications.addSuccess('Snippet "'+title+'" was saved successfully.');
        } else {
          atom.notifications.addError('An Error occured while saving the snippet "'+title+'".');
        }
      }
    });
  },

  insert() {
    var storage = this.storage;
    var snippets = storage.data();
    if(snippets.length > 0) {
      var listitems = [];
      snippets.forEach(function(currentValue) {
        var elem = currentValue;
        listitems.push({
          title: elem.getTitle(),
          uid: elem.getUID(),
          tags: elem.getTags(),
          author: elem.getAuthor(),
          sort: elem.getStats().getCount(),
          icon: elem.getLang()
        });
      });

      const searchPrompt = Util.promptSearch({
        title: 'Choose a snippet to inject:',
        placeholder: 'Search snippets',
        listItems: listitems,
        btncancel: 'Cancel',
        nothingfound: 'No Snippets found that match you search.'
      },function(element) {
        if(Util.isset(element,'string')) {
          var snippet = storage.get(element);
          var parsed = snippet.getContent().replace(new RegExp(/(\${\d+:[^}]+}|\$\d+)/,'g'),function(match,p1,offset,string) {
            if(match.includes('{') && match.includes('}')) {
              return match.replace(/(\${\d+:)/,'').replace('}','');
            } else {
              return '';
            }
          });
          atom.workspace.getActiveTextEditor().insertText(parsed,{
            select: true,
            autoIndent: true,
            autoIndentNewline: true,
            autoDecreaseIndent: true,
            normalizeLineEndings: true
          });

          if(atom.workspace.getActiveTextEditor().getGrammar().name === 'Null Grammar') {
            var tmp = atom.workspace.getActiveTextEditor().setGrammar(Util.getGrammarByName(snippet.getLang()));
          }

          snippet.getStats().increaseUsageCount();
          storage.replace(snippet);

          atom.notifications.addSuccess('Snippet \''+snippet.getTitle()+'\' was successfully inserted.');
        }
      });
    } else {
      atom.notifications.addWarning('No snippets in storage. Aborting.');
    }
  },

  delete() {
    var storage = this.storage;
    var snippets = storage.data();
    if(snippets.length > 0) {
      var items = [];
      snippets.forEach(function(current) {
        var snippet = current;
        items.push({
          value: snippet.getUID(),
          title: snippet.getTitle()
        });
      });
      const deletePrompt = Util.promptDelete({
        title: 'Delete a snippet',
        placeholder: 'Please choose a snippet...',
        btnconfirm: 'Delete',
        btncancel: 'Cancel',
        suremsg: 'Are you sure? <i>This action cannot be undone!</i>',
        items: items
      },function(element) {
        if(Util.isset(element,'string')) {
          var snippet = storage.get(element);
          if(storage.remove(snippet.getUID()) !== false) {
            atom.notifications.addSuccess('Snippet \''+snippet.getTitle()+'\' was successfully deleted.');
          } else {
            atom.notifications.addWarning('Snippet \''+snippet.getTitle()+'\' could not be found in the local storage.');
          }
        }
      });
    } else {
      atom.notifications.addWarning('No snippets in storage. Aborting.');
    }
  },

  edit() {
    var editor = atom.workspace.getActiveTextEditor();

    var range = editor.getSelectedScreenRange();
    if(range.start.row != range.end.row) {
      range.start.column = 0;
    }
    editor.setSelectedScreenRange(range);
    var selection = editor.getSelectedText().split('\\').join('\\\\');

    var lang = atom.workspace.getActiveTextEditor().getGrammar().name;
    var scope = '.'+atom.workspace.getActiveTextEditor().getGrammar().scopeName;

    var storage = this.storage;
    var snippets = storage.data();
    if(snippets.length > 0) {
      var listitems = [];
      snippets.forEach(function(currentValue) {
        var elem = currentValue;
        listitems.push({
          title: elem.getTitle(),
          uid: elem.getUID(),
          tags: elem.getTags(),
          author: elem.getAuthor(),
          sort: elem.getStats().getCount(),
          icon: elem.getLang()
        });
      });

      const searchPrompt = Util.promptSearch({
        title: 'Choose a snippet to update:',
        placeholder: 'Search snippets',
        listItems: listitems,
        btncancel: 'Cancel',
        nothingfound: 'No Snippets found that match you search.'
      },function(element) {
        if(Util.isset(element,'string')) {
          var snippet = storage.get(element);

          if(os.userInfo().username !== snippet.getAuthor()) {
            atom.notifications.addWarning('You only can update your own snippets!', {detail: 'But you may copy and recreate snippets.'})
            return;
          }

          snippet.setContent(selection);
          snippet.setLang(lang);
          snippet.setScope(scope);

          if(snippet.getDbInfo().synchronized) {
            var tmp = snippet.getDbInfo();
            tmp.revision = CouchDB.increaseRevision(tmp.revision);
            snippet.setDbInfo(tmp);
          }

          if(storage.replace(snippet)) {
            atom.notifications.addSuccess('Snippet \''+snippet.getTitle()+'\' was successfully updated.');
          } else {
            atom.notifications.addError('An Error occured while updating the snippet "'+snippet.getTitle()+'".');
          }
        }
      });
    } else {
      atom.notifications.addWarning('No snippets in storage. Aborting.');
    }
  },

  exp() {
    var storage = this.storage;
    var snippets = storage.data();
    if(snippets.length > 0) {
      var listitems = [];
      snippets.forEach(function(currentValue) {
        var elem = currentValue;
        listitems.push({
          title: elem.getTitle(),
          uid: elem.getUID(),
          tags: elem.getTags(),
          author: elem.getAuthor(),
          sort: elem.getStats().getCount(),
          icon: elem.getLang()
        });
      });

      const multiSearchPrompt = Util.promptMultiSearch({
        title: 'Choose snippet(s) to export:',
        placeholder: 'Search snippets',
        listItems: listitems,
        btncancel: 'Cancel',
        btnconfirm: 'Export',
        nothingfound: 'No Snippets found that match you search.'
      },function(elements) {
        if(Util.isset(elements,'object') && elements.length) {
          var snippets = [];
          elements.forEach(function(elem) {
            snippets.push(storage.get(elem));
          });
          if(IMEX.export(snippets)) {
            atom.notifications.addSuccess('Snippet(s) has successfully been exported.');
          } else {
            atom.notifications.addWarning('Something went wrong while exporting the snippet(s).');
          }
        }
      });
    } else {
      atom.notifications.addWarning('No snippets in storage. Aborting.');
    }
  },

  expall() {
    if(IMEX.export(this.storage.data())) {
      atom.notifications.addSuccess('Storage has successfully been exported.');
    } else {
      atom.notifications.addWarning('Something went wrong while exporting the storage.');
    }
  },

  imp() {
    var storage = this.storage;
    var res = IMEX.import()

    if(Util.isset(res,'object')) {
      var count = 0;
      res.forEach(function(snippet) {
        if(Snippet.validate(snippet) && !storage.contains(snippet.uid)) {
          storage.add(snippet);
          count++;
        }
      });

      if(count > 0) {
        atom.notifications.addSuccess(count+' snippets have been imported.', {detail: 'Happy Coding :)'});
      } else {
        atom.notifications.addInfo('No snippets have been imported.');
      }
    } else {
      atom.notifications.addWarning('Something went wrong while importing.', {detail: 'Please make sure the chosen file is a valid snippet-injector export!'});
    }
  }
};
