'use babel';

export default class Snippet {

  content = '';
  title = '';
  tags = new Array();
  lang = '';
  uid = '';

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
