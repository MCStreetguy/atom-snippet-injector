'use babel';

import Util from './util.js';

export default class Snippet {

  content = '';
  title = '';
  tags = new Array();
  lang = '';
  uid = Date.now().toString();
  version = undefined;

  constructor(state) {
    if(typeof state === 'object') {
      if(Util.isset(state.title,'string')) {
        this.title = state.title;
      }
      if(Util.isset(state.tags,'object')) {
        this.tags = state.tags;
      }
      if(Util.isset(state.content,'string')) {
        this.content = state.content;
      }
      if(Util.isset(state.lang,'string')) {
        this.lang = state.lang;
      }
      if(Util.isset(state.uid,'string')) {
        this.uid = state.uid;
      }
      if(Util.isset(state.version,'string')) {
        this.version = state.version;
      }
    }
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {
    return {
      'title':this.getTitle(),
      'tags':this.getTags(),
      'content':this.getContent(),
      'lang':this.getLang(),
      'uid':this.getUID(),
      'version':this.getVersion()
    };
  }

  // Tear down any state and detach
  destroy() {}


  getTitle() {
    return this.title;
  }

  getContent() {
    return this.content
  }

  getTags() {
    return this.tags;
  }

  getLang() {
    return this.lang;
  }

  getUID() {
    return this.uid;
  }

  getVersion() {
    return this.version;
  }

  setTitle(newtitle) {
    this.title = newtitle;
  }

  setContent(newcontent) {
    this.content = newcontent;
  }

  setTags(newtags) {
    this.tags = newtags;
  }

  setLang(newlang) {
    this.lang = newlang;
  }

  setVersion(newversion) {
    this.version = newversion;
  }

  setUID(newuid) {
    this.uid = newuid;
  }
}
