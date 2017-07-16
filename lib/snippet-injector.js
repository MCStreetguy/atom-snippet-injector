'use babel';

import { CompositeDisposable } from 'atom';
import Util from './util.js';
import Snippet from './snippet.js';
import Storage from './storage.js';

export default {

  subscriptions: null,
  storage: null,

  activate(state) {
    this.storage = new Storage({dir: '/storage/snippet-injector/snippets/'});
    console.log(this.storage);

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'snippet-injector:create': () => this.create(),
      'snippet-injector:insert': () => this.insert()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {
    return {
      storage: this.storage.serialize()
    };
  },

  create() {
    var selection = atom.workspace.getActiveTextEditor().getSelectedText();
    var storage = this.storage;
    const inputPrompt = Util.promptUser({
      placeholder: 'Enter snippet title',
      btnconfirm: 'Save snippet',
      btncancel: 'Cancel'
    },function(text){
      var result = storage.store(new Snippet({
        title: text,
        tags: new Array(),
        content: selection
      }));
      if(result) {
        atom.notifications.addSuccess('Snippet "'+text+'" was saved successfully.', null);
      } else {
        atom.notifications.addError('An Error occured while saving the snippet "'+text+'".', null);
      }
    });
  },

  insert() {
    var storage = this.storage;
    var filenames = this.storage.retrieveFiles();
    if(filenames.length > 0) {
      var files = new Array();
      filenames.forEach(function(currentValue) {
        files.push(storage.retrieveFile(currentValue.replace('.snippet.json','')));
      });
      var snippets = new Array();
      files.forEach(function(currentValue) {
        snippets.push(JSON.parse(currentValue));
      });
      console.log(snippets);
    } else {
      atom.notifications.addWarning('No snippets found in the local storage directory.', null);
    }
  }

};
