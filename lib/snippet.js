'use babel';

export default class Snippet {

  const content = "";
  const title = "";
  const tags = new Array();

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
  destroy() {
    this = undefined;
  }

  // INTERNAL FUNCTIONS
  private setTitle(newTitle) {
    this.title = newTitle;
  }

  private setContent(newContent) {
    this.content = newContent;
  }

  // PUBLIC FUNCTIONS
  public getTitle() {
    return this.title;
  }

  public getContent() {
    return this.content
  }

  public getTags() {
    return this.tags;
  }

}
