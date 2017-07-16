'use babel';

export default class Snippet {

  content = '';
  title = '';
  tags = new Array();

  constructor(state) {
    if(state !== undefined && state !== null && typeof state === 'object') {
      this.title = state.title;
      this.tags = state.tags;
      this.content = state.content;
    } else {
      this.title = "";
      this.tags = new Array();
      this.content = "";
    }
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {
    return {
      'title':this.title,
      'tags':this.tags,
      'content':this.content
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

}
