'use babel';

export default class Snippet {

  content = '';
  title = '';
  tags = new Array();
  lang = '';
  uid = '';

  constructor(state) {
    if(state !== undefined && state !== null && typeof state === 'object') {
      this.title = state.title;
      this.tags = state.tags;
      this.content = state.content;
      this.lang = state.lang;
      this.uid = state.uid;
    } else {
      this.title = "";
      this.tags = new Array();
      this.content = "";
      this.lang = "";
      this.uid = Date.now().toString();
    }
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {
    return {
      'title':this.title,
      'tags':this.tags,
      'content':this.content,
      'lang':this.lang,
      'uid':this.uid
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
}
