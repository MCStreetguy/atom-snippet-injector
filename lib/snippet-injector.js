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
    var filenames = storage.retrieveFiles();
    if(filenames.length > 0) {
      var snippets = new Array();
      filenames.forEach(function(currentValue) {
        snippets.push(new Snippet(JSON.parse(storage.retrieveFile(currentValue.replace('.snippet.json','')))));
      });
      var listitems = new Array();
      snippets.forEach(function(currentValue) {
        listitems.push(currentValue.getTitle());
      });

      const searchPrompt = Util.promptSearch({
        title: 'Choose a snippet to inject:',
        placeholder: 'Search snippets',
        listItems: listitems,
        btncancel: 'Cancel'
      },function(element) {
        var snippet = new Snippet(JSON.parse(storage.retrieveFile(element)));
        atom.workspace.getActiveTextEditor().insertText(snippet.getContent(),{
          select: true,
          autoIndent: true,
          autoIndentNewline: true,
          autoDecreaseIndent: true,
          normalizeLineEndings: true
        });
        atom.notifications.addInfo('Snippet \''+element+'\' was successfully inserted.', null);
      });
    } else {
      atom.notifications.addWarning('No snippets found in the local storage directory.', null);
    }
  }
};
