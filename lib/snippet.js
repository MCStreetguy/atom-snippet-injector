'use babel';

import Util from './util.js';
const os = require('os');

export default class Snippet {

  content = '';
  title = '';
  tags = new Array();
  lang = '';
  uid = Date.now().toString();
  version = undefined;
  author = os.userInfo().username;

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
      if(Util.isset(state.author,'string')) {
        this.author = state.author;
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
      'version':this.getVersion(),
      'author':this.getAuthor()
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

  getAuthor() {
    return this.author;
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

  setAuthor(newauthor) {
    this.author = newauthor;
  }
}
