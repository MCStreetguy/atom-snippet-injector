'use babel';

import { CompositeDisposable, Pane } from 'atom';
import Util from './util.js';
import Snippet from './snippet.js';
import StorageInterface from './storage.js';
import IconHelper from './icon-helper.js';
import IMEX from './imex.js';
import Config from './config.js';
const fs = require('fs');
const path = require('path');

export default {

  config: null,
  subscriptions: null,
  storage: null,
  imex_module: null,

  async activate(state) {
    var _debug = JSON.parse(fs.readFileSync(path.join(__dirname,'db','debug.json')));
    this.config = Config.retrieve();
    if(_debug.allowDebug) {
      if(window.localStorage.getItem('snippet-injector-debug') === null || window.localStorage.getItem('snippet-injector-debug') === undefined || window.localStorage.getItem('snippet-injector-debug') === 'null' || Util.compareVersions(window.localStorage.getItem('snippet-injector-debug-version'),Util.getPackageVersion()) === Util.getPackageVersion()) {
        window.localStorage.setItem('snippet-injector-debug',true.toString());
        window.localStorage.setItem('snippet-injector-debug-group',_debug.groupTitle.main);
        window.localStorage.setItem('snippet-injector-debug-version',Util.getPackageVersion());
      }

      if(Config.get('enableDebugging')) {
        console.warn(_debug.warn);
        console.groupCollapsed(_debug.groupTitle.main);
        console.group(_debug.groupTitle.timings);
        console.time("snippet-injector:activate duration");
      }
    }

    var _this = this;
    this.storage = new StorageInterface({
      directory: Config.get('storageDirectory'),
      autosave: Config.get('autosaveInterval'),
      onAfterInit: function(res) {
        if(Util.isset(res.warn,'string')) {
          atom.notifications.addWarning(res.warn, null);
          _this.deactivate();
        } else {
          atom.notifications.addSuccess('Snippet Injector was successfully initialized and is now ready to use.', {
            detail: 'Happy Coding :)'
          });

          _this.subscriptions = new CompositeDisposable();
          // Main commands
          _this.subscriptions.add(atom.commands.add('atom-text-editor', {
            'snippet-injector:create': () => _this.create(),
            'snippet-injector:insert': () => _this.insert(),
            'snippet-injector:delete': () => _this.delete(),
            'snippet-injector:update': () => _this.edit()
          }));
          // IMEX commmands
          // _this.subscriptions.add(atom.commands.add('atom-workspace', {
          //   'snippet-injector:export-to-csv': function() {_this.imex_module.storage_export('csv')},
          //   'snippet-injector:export-to-md': function() {_this.imex_module.storage_export('md')},
          //   'snippet-injector:import': function() {_this.imex_module.storage_import()}
          // }));
        }
      }
    });

    if(Config.get('enableDebugging')) {
      console.timeEnd("snippet-injector:activate duration");
      console.groupEnd();

      var snippets = [];
      var _this = this;
      console.group(_debug.groupTitle.objectLogging);
      console.log({
        subscriptions: _this.subscriptions,
        storage: _this.storage,
        imex: _this.imex_module,
        _snippets: _this.storage.data()
      });
      console.groupEnd();
      console.groupEnd();
    }
  },

  deactivate() {
    this.subscriptions.dispose();
    this.imex_module.dispose();
    this.storage.dispose();
    for(var key in this) this[key] = null;
  },

  serialize() {
    return {
      storage: this.storage.serialize()
      // imex: this.imex_module.serialize()
    }
  },

  create() {
    if(Config.get('enableDebugging')) {
      console.groupCollapsed(window.localStorage.getItem('snippet-injector-debug-group'));
      console.time("snippet-injector:create duration");
    }

    var selection = atom.workspace.getActiveTextEditor().getSelectedText();
    var grammar = atom.workspace.getActiveTextEditor().getGrammar().name;
    var storage = this.storage;
    const inputPrompt = Util.promptUser({
      placeholder: 'Enter snippet title  #and #add #tags',
      btnconfirm: 'Save snippet',
      btncancel: 'Cancel'
    },function(text){
      if(Util.isset(text,'string')) {
        var tags = [];
        var title = text.split(' ').filter(function(element,index,array) {
          if(element.startsWith('#')) {
            tags.push(element.substring(1));
            return false;
          } else {
            return true;
          }
        }).join(' ').trim();
        var result = storage.add(new Snippet({
          title: title,
          tags: tags,
          content: selection,
          lang: grammar,
          version: Util.getPackageVersion()
        }));
        if(result) {
          atom.notifications.addSuccess('Snippet "'+title+'" was saved successfully.', null);
        } else {
          atom.notifications.addError('An Error occured while saving the snippet "'+title+'".', null);
        }
      }
    });

    if(Config.get('enableDebugging')) {
      console.timeEnd("snippet-injector:create duration");
      console.groupEnd();
    }
  },

  insert() {
    if(Config.get('enableDebugging')) {
      console.groupCollapsed(window.localStorage.getItem('snippet-injector-debug-group'));
      console.time("snippet-injector:insert duration");
    }

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
          atom.workspace.getActiveTextEditor().insertText(snippet.getContent(),{
            select: true,
            autoIndent: true,
            autoIndentNewline: true,
            autoDecreaseIndent: true,
            normalizeLineEndings: true
          });

          if(atom.workspace.getActiveTextEditor().getGrammar().name === 'Null Grammar') {
            atom.workspace.getActiveTextEditor().setGrammar(atom.grammars.grammars.filter(function(e) {
              if(e.name === snippet.getLang()) {
                return true;
              } else {
                return false;
              }
            })[0]);
          }

          snippet.getStats().increaseUsageCount();
          storage.replace(snippet);

          atom.notifications.addSuccess('Snippet \''+snippet.getTitle()+'\' was successfully inserted.', null);
        }
      });
    } else {
      atom.notifications.addWarning('No loaded snippets in storage. Aborting.', null);
    }

    if(Config.get('enableDebugging')) {
      console.timeEnd("snippet-injector:insert duration");
      console.groupEnd();
    }
  },

  delete() {
    if(Config.get('enableDebugging')) {
      console.groupCollapsed(window.localStorage.getItem('snippet-injector-debug-group'));
      console.time("snippet-injector:delete duration");
    }

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
          if(storage.remove(storage.getIndexByProperty('uid',snippet.getUID())) !== false) {
            atom.notifications.addSuccess('Snippet \''+snippet.getTitle()+'\' was successfully deleted.', null);
          } else {
            atom.notifications.addWarning('Snippet \''+snippet.getTitle()+'\' could not be found in the local storage.', null);
          }
        }
      });
    } else {
      atom.notifications.addWarning('No loaded snippets in storage. Aborting.', null);
    }

    if(Config.get('enableDebugging')) {
      console.timeEnd("snippet-injector:delete duration");
      console.groupEnd();
    }
  },

  edit() {
    if(Config.get('enableDebugging')) {
      console.groupCollapsed(window.localStorage.getItem('snippet-injector-debug-group'));
      console.time("snippet-injector:update duration");
    }

    var selection = atom.workspace.getActiveTextEditor().getSelectedText();
    var grammar = atom.workspace.getActiveTextEditor().getGrammar().name;

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
          snippet.setContent(selection);
          snippet.setLang(grammar);

          if(storage.replace(snippet)) {
            atom.notifications.addSuccess('Snippet \''+snippet.getTitle()+'\' was successfully updated.', null);
          } else {
            atom.notifications.addError('An Error occured while updating the snippet "'+snippet.getTitle()+'".', null);
          }
        }
      });
    } else {
      atom.notifications.addWarning('No loaded snippets in storage. Aborting.', null);
    }

    if(Config.get('enableDebugging')) {
      console.timeEnd("snippet-injector:update duration");
      console.groupEnd();
    }
  }
};
