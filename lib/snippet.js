'use babel';

import Util from './util.js';

export default class Snippet {

  content = '';
  title = '';
  tags = new Array();
  lang = '';
  uid = '';
  version = '';

  constructor(state) {
    if(typeof state === 'object') {
      if(state.title !== null && state.title !== undefined) {
        this.title = state.title;
      } else {
        this.title = "This snippet has no title.";
      }
      if(state.tags !== null && state.tags !== undefined) {
        this.tags = state.tags;
      } else {
        this.tags = new Array();
      }
      if(state.content !== null && state.content !== undefined) {
        this.content = state.content;
      } else {
        this.content = "This snippet has no content";
      }
      if(state.lang !== null && state.lang !== undefined) {
        this.lang = state.lang;
      } else {
        this.lang = "";
      }
      if(state.uid !== null && state.uid !== undefined) {
        this.uid = state.uid;
      } else {
        this.uid = "";
      }
      if(state.version !== null && state.uid !== undefined) {
        this.version = state.version;
      } else {
        this.version = '0.0.0';
      }
    } else {
      this.title = "";
      this.tags = new Array();
      this.content = "";
      this.lang = "";
      this.uid = Date.now().toString();
      this.version = Util.getPackageVersion();
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
}
