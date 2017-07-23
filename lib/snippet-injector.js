'use babel';

import { CompositeDisposable } from 'atom';
import Util from './util.js';
import Snippet from './snippet.js';
import Storage from './storage.js';
import IconHelper from './icon-helper.js';
const fs = require('fs');
const path = require('path');

export default {

  subscriptions: null,
  storage: null,
  debug: null,

  activate(state) {
    this.debug = JSON.parse(fs.readFileSync(path.join(__dirname,'debug.json')));
    if(this.debug.allowDebug) {
      if(this.debug.usrPref === null) {
        this.debug.usrPref = this.debug.default;
      }

      // Make the debug config available for each submodule
      window.snippet_injector_debug = this.debug;

      if(this.debug.usrPref.timings || this.debug.usrPref.objectLogging) {
        console.warn(this.debug.warn);
        console.groupCollapsed(this.debug.groupTitle.main);

        if(this.debug.usrPref.timings) {
          console.group(this.debug.groupTitle.timings);
          console.time("snippet-injector:activate duration");
        }
      }
    }

    this.storage = new Storage({dir: '/storage/snippet-injector/snippets/'});
    this.storage.migrate();

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'snippet-injector:create': () => this.create(),
      'snippet-injector:insert': () => this.insert(),
      'snippet-injector:delete': () => this.delete()
    }));

    if(this.debug.allowDebug) {
      if(this.debug.usrPref.timings) {
        console.timeEnd("snippet-injector:activate duration");
        console.groupEnd();
      }

      if(this.debug.usrPref.objectLogging) {
        console.group(this.debug.groupTitle.objectLogging);
        console.log({
          subscriptions: this.subscriptions,
          storage: this.storage,
          debugConfig: this.debug
        });
        console.groupEnd();
      }

      if(this.debug.usrPref.timings || this.debug.usrPref.objectLogging) {
        console.groupEnd();
      }
    }
  },

  deactivate() {
    this.subscriptions.dispose();
    fs.writeFileSync(path.join(__dirname,'debug.json'),JSON.stringify(this.debug,null,2));
  },

  serialize() {
    return new Object();
  },

  create() {
    console.groupCollapsed("Snippet Injector - DEBUG");
    console.time("snippet-injector:create duration");

    var selection = atom.workspace.getActiveTextEditor().getSelectedText();
    var grammar = atom.workspace.getActiveTextEditor().getGrammar().name;
    var storage = this.storage;
    var uid = Util.generateUID({
      unique: true,
      tester: storage.testFile,
      timeout: 100,
      length: 20,
      prefix: 'sn',
      insertstring: 'SNIPPET'
    });
    const inputPrompt = Util.promptUser({
      placeholder: 'Enter snippet title',
      btnconfirm: 'Save snippet',
      btncancel: 'Cancel'
    },function(text){
      if(Util.isset(text,'string')) {
        var result = storage.store(new Snippet({
          title: text,
          tags: new Array(),
          content: selection,
          lang: grammar,
          uid: uid
        }));
        if(result) {
          atom.notifications.addSuccess('Snippet "'+text+'" was saved successfully.', null);
        } else {
          atom.notifications.addError('An Error occured while saving the snippet "'+text+'".', null);
        }
      }
    });

    console.timeEnd("snippet-injector:create duration");
    console.groupEnd();
  },

  insert() {
    console.groupCollapsed("Snippet Injector - DEBUG");
    console.time("snippet-injector:insert duration");

    var storage = this.storage;
    var filenames = storage.retrieveFiles();
    if(filenames.length > 0) {
      var listitems = new Array();
      var icons = new Array();
      filenames.forEach(function(currentValue) {
        var elem = new Snippet(JSON.parse(storage.retrieveFile(currentValue.replace('.json',''))));
        listitems.push({
          title: elem.getTitle(),
          uid: elem.getUID()
        });
        icons.push(elem.getLang());
      });

      const searchPrompt = Util.promptSearch({
        title: 'Choose a snippet to inject:',
        placeholder: 'Search snippets',
        listItems: listitems,
        btncancel: 'Cancel',
        nothingfound: 'No Snippets found that match you search.',
        icons: icons
      },function(element) {
        if(Util.isset(element,'string')) {
          var snippet = new Snippet(JSON.parse(storage.retrieveFile(element)));
          atom.workspace.getActiveTextEditor().insertText(snippet.getContent(),{
            select: true,
            autoIndent: true,
            autoIndentNewline: true,
            autoDecreaseIndent: true,
            normalizeLineEndings: true
          });
          atom.notifications.addSuccess('Snippet \''+snippet.getTitle()+'\' was successfully inserted.', null);
        }
      });
    } else {
      atom.notifications.addWarning('No snippets found in the local storage directory.', null);
    }

    console.timeEnd("snippet-injector:insert duration");
    console.groupEnd();
  },

  delete() {
    console.groupCollapsed("Snippet Injector - DEBUG");
    console.time("snippet-injector:delete duration");

    var storage = this.storage;
    var fileNames = storage.retrieveFiles();
    if(fileNames.length > 0) {
      var items = new Array();
      fileNames.forEach(function(current) {
        var snippet = new Snippet(JSON.parse(storage.retrieveFile(current.replace('.json',''))));
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
        suremsg: 'Are you sure?',
        items: items
      },function(element) {
        if(Util.isset(element,'string')) {
          var snippet = new Snippet(JSON.parse(storage.retrieveFile(element)));
          if(storage.deleteFile(snippet.getUID())) {
            atom.notifications.addSuccess('Snippet \''+snippet.getTitle()+'\' was successfully deleted.', null);
          } else {
            atom.notifications.addWarning('Snippet \''+snippet.getTitle()+'\' could not be found in the local storage.', null);
          }
        }
      });
    } else {
      atom.notifications.addWarning('No snippets found in the local storage directory.', null);
    }

    console.timeEnd("snippet-injector:delete duration");
    console.groupEnd();
  }
};
