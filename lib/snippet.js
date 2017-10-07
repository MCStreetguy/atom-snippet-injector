'use babel';

import Util from './util';
import Storage from './storage';
import Stats from './stats';
const os = require('os');

export default class Snippet {

  _id = undefined;
  _rev = undefined;

  content = '';
  title = '';
  ac_prefix = '';
  tags = [];
  lang = '';
  scope = '*';
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
  db = {
    synchronized: false,
    revision: '',
    identifier: ''
  }

  constructor(state) {
    if(typeof state === 'object') {
      if(Util.isset(state.title,'string')) {
        this.setTitle(state.title);
      }
      if(Util.isset(state.tags,'object')) {
        this.setTags(state.tags);
      }
      if(Util.isset(state.content,'string')) {
        this.setContent(Util.stripIndent(state.content));
      }
      if(Util.isset(state.lang,'string')) {
        this.setLang(state.lang);
      }
      if(Util.isset(state.scope,'string')) {
        this.setScope(state.scope);
      } else {
        var lang = this.getLang();
        var temp = '.'+Util.getGrammarByName(this.getLang()).scopeName;
        this.setScope(temp);
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
      if(Util.isset(state.prefix,'string')) {
        this.setAcPrefix(state.prefix);
      } else {
        this.setAcPrefix(this.getTitle());
      }

      if(Util.isset(state.db,'object')) {
        this.setDbInfo(state.db);
      }
      if(Util.isset(state.shared,'boolean')) {
        this.setDbInfo({
          synchronized: state.shared,
          identifier: '',
          revision: ''
        })
      }

      if(Util.isset(state._id,'string')) {
        this._id = state._id;
      }
      if(Util.isset(state._rev,'string')) {
        this._rev = state._rev;
      }

      if(this._id === '') this._id = undefined;
      if(this._rev === '') this._rev = undefined;
    }
  }

  // Returns an object representing the current state
  serialize() {
    return {
      _id: this._id,
      _rev: this._rev,
      title: this.getTitle(),
      tags: this.getTags(),
      content: this.getContent(),
      lang: this.getLang(),
      scope: this.getScope(),
      uid: this.getUID(),
      version: this.getVersion(),
      author: this.getAuthor(),
      stats: this.getStats().serialize(),
      prefix: this.getAcPrefix(),
      db: this.getDbInfo()
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

  getScope() {
    return this.scope;
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

  getAcPrefix() {
    return this.ac_prefix;
  }

  getDbInfo() {
    return this.db;
  }

  setTitle(newtitle) {
    this.title = newtitle;
  }

  setContent(newcontent) {
    this.content = Util.stripIndent(newcontent);
  }

  setTags(newtags) {
    this.tags = newtags;
  }

  setLang(newlang) {
    this.lang = newlang;
  }

  setScope(newscope) {
    this.scope = newscope;
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

  setAcPrefix(newprefix) {
    this.ac_prefix = newprefix.toLowerCase().split(/[^\w\s]/g).join('').split(/\s\s+/g).join(' ');
  }

  setDbInfo(info) {
    this.db = info;

    if(!this._id && info.identifier !== '') {
      this._id = info.identifier;
    }
    if(!this._rev && info.revision !== '') {
      this._rev = info.revision;
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
