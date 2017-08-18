'use babel';

import Util from './util.js';
import Storage from './storage.js';
import Stats from './stats.js';
const os = require('os');

export default class Snippet {

  content = '';
  title = '';
  tags = [];
  lang = '';
  uid = Util.generateUID({
    unique: true,
    tester: Storage.testFile,
    timeout: 100,
    length: 20,
    prefix: 'sn',
    insertstring: 'SNIPPET'
  });
  version = undefined;
  author = os.userInfo().username;
  stats = new Stats();

  constructor(state) {
    if(typeof state === 'object') {
      if(Util.isset(state.title,'string')) {
        this.setTitle(state.title);
      }
      if(Util.isset(state.tags,'object')) {
        this.setTags(state.tags);
      }
      if(Util.isset(state.content,'string')) {
        this.setContent(state.content);
      }
      if(Util.isset(state.lang,'string')) {
        this.setLang(state.lang);
      }
      if(Util.isset(state.uid,'string')) {
        this.setUID(state.uid);
      }
      if(Util.isset(state.version,'string')) {
        this.setVersion(state.version);
      }
      if(Util.isset(state.author,'string')) {
        this.setAuthor(state.author);
      }
      if(Util.isset(state.stats,'object')) {
        this.setStats(state.stats);
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
      'author':this.getAuthor(),
      'stats':this.getStats().serialize()
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

  getStats() {
    return this.stats;
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

  setStats(newstats) {
    if(newstats instanceof Stats) {
      this.stats = newstats;
    } else {
      this.stats = new Stats(newstats);
    }
  }

  _get(attribute) {
    if(Util.isset(attribute,'string') && this.hasOwnProperty(attribute)) {
      return this[attribute];
    } else {
      return undefined;
    }
  }

  _set(attribute,value) {
    if(Util.isset(attribute,'string') && this.hasOwnProperty(attribute)) {
      this[attribute] = value;
    } else {
      return undefined;
    }
  }

  // An object is considered valid if it has the following properties set: title, content, uid
  static validate(object) {
    return (Util.isset(object,'object')
        && Util.isset(object.title,'string')
        && Util.isset(object.content,'string')
        && Util.isset(object.uid,'string')
    );
  }
}
