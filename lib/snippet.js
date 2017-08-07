'use babel';

import Util from './util.js';
import Storage from './storage.js';
import Stats from './stats.js';
const os = require('os');

const lastUpdate = '1.3.0';

export default class Snippet {

  content = '';
  title = '';
  tags = new Array();
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
    if(Util.isset(attribute,'string')) {
      switch (attribute.toLowerCase()) {
        case 'content':
          return this.getContent();
          break;
        case 'title':
          return this.getTitle();
          break;
        case 'tags':
          return this.getTags();
          break;
        case 'lang':
          return this.getLang();
          break;
        case 'uid':
          return this.getUID();
          break;
        case 'version':
          return this.getVersion();
          break;
        case 'author':
          return this.getAuthor();
          break;
        case 'stats':
          return this.getStats();
          break;
        default:
          return undefined;
      }
    } else {
      return undefined;
    }
  }

  _set(attribute,value) {
    if(Util.isset(attribute,'string')) {
      switch (attribute.toLowerCase()) {
        case 'content':
          this.setContent(value);
          break;
        case 'title':
          this.setTitle(value);
          break;
        case 'tags':
          this.setTags(value);
          break;
        case 'lang':
          this.setLang(value);
          break;
        case 'uid':
          this.setUID(value);
          break;
        case 'version':
          this.setVersion(value);
          break;
        case 'author':
          this.setAuthor(value);
          break;
        case 'stats':
          this.setStats(value);
          break;
        default:
          return undefined;
      }
    } else {
      return undefined;
    }
  }

  static getLastUpdate() {
    return lastUpdate;
  }

  // An object is considered valid if it has the following properties set: title, content, uid, version
  static validate(object) {
    return (Util.isset(object,'object')
        && Util.isset(object.title,'string')
        && Util.isset(object.content,'string')
        && Util.isset(object.uid,'string')
        && Util.isset(object.version,'string')
    );
  }
}
