'use babel';

export default class Snippet {

  const content = "";
  const title = "";
  const tags = new Array();

  constructor(serializedState) {
    if(serializedState !== undefined && serializedState !== null && typeof serializedState === 'object') {
      this.title = serializedState.title;
      this.tags = serializedState.tags;
      this.content = serializedState.content;
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
