'use babel';

const storageDir = dirname(atom.config.getUserConfigPath());

export default class Storage {

  const dir = '';

  constructor(state) {
    if(state !== undefined && state !== null && typeof state === 'object') {
      init(state.dir);
    }
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {
    return {
      dir: this.dir
    };
  }

  // Tear down any state and detach
  destroy() {}

  public init(dir) {
    this.dir = dir;
    try {
      fs.statSync(storageDir+dir);
    } catch(e) {
      fs.mkdirSync(storageDir+dir);
    }
  }

  public store(snippet) {
    if(snippet !== null && snippet !== undefined && snippet instanceof Snippet) {
      fs.writeFileSync(storageDir+dir+snippet.getTitle()+'.snippet',JSON.stringify(snippet));
      return fs.existsSync(storageDir+dir+snippet.getTitle()+'.snippet');
    } else {
      return false;
    }
  }

  public retrieveFiles() {
    if(this.dir === '') {
      throw new TypeError('Storage directory has not been initialized.');
    } else {
      return fs.readDirSync(storageDir+dir);
    }
  }

  public retrieveFile(fileName) {
    if(this.dir === '') {
      throw new TypeError('Storage directory has not been initialized.');
    } else {
      return fs.readFileSync(storageDir+dir+fileName);
    }
  }
}
