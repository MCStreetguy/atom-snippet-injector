'use babel';

import { CompositeDisposable } from 'atom';
import { dirname } from 'path';
import Util from './util.js';
import Snippet from './snippet.js';
import Storage from './storage.js';
const fs = require('fs');

export default {

  util: null,
  modalPanel: null,
  subscriptions: null,
  storage: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
    this.storage = new Storage(state.storage);
    storage.init('/storage/snippet-injector/snippets/');

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'snippet-injector:create': () => this.create()
    }));
  },

  deactivate() {
    // this.modalPanel.destroy();
    this.subscriptions.dispose();
    // this.snippetInjectorView.destroy();
  },

  serialize() {
    // return {
    //   snippetInjectorViewState: this.snippetInjectorView.serialize()
    // };
  },

  create() {
    var selection = atom.workspace.getActiveTextEditor().getSelectedText();
    const inputPrompt = Util.promptUser({
      placeholder: 'Enter snippet title',
      btnconfirm: 'Save snippet',
      btncancel: 'Cancel'
    },function(text){
      var result = storage.store(new Snippet({
        title: text,
        tags: null,
        content: selection
      }));
      if(result) {
        atom.notifications.addSuccess('Snippet "'+text+'" was saved successfully.', null);
      } else {
        atom.notifications.addError('An Error occured while saving the snippet "'+text+'".', null);
      }
    });
  }

};
