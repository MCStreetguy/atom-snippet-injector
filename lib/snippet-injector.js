'use babel';

import { CompositeDisposable } from 'atom';
import { dirname } from 'path';
import Util from './util.js';
import Snippet from './snippet.js';
const fs = require('fs');

const storageDir = dirname(atom.config.getUserConfigPath())+'/storage/snippet-injector/snippets/';

export default {

  util: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

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

  checkStorage() {
    try {
      fs.statSync(storageDir);
    } catch(e) {
      fs.mkdirSync(storageDir);
    }
  },

  store(snippet) {
    if(snippet !== null && snippet !== undefined && snippet instanceof Snippet) {
      fs.writeFileSync(storageDir+snippet.getTitle()+'.snippet',JSON.stringify(snippet));
      return fs.existsSync(storageDir+snippet.getTitle()+'.snippet');
    } else {
      return false;
    }
  },

  create() {
    this.checkStorage();

    var selection = atom.workspace.getActiveTextEditor().getSelectedText();
    const inputPrompt = Util.promptUser({
      placeholder: 'Enter snippet title',
      btnconfirm: 'Save snippet',
      btncancel: 'Cancel'
    },function(text){
      var result = this.store(new Snippet({
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
