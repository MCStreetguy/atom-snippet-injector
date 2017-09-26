'use babel';

import Util from './util';
import Storage from './storage';
import Stats from './stats';
const os = require('os');
const strip = require('strip-indent'); 

export default class Snippet {

  content = '';
  title = '';
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

  constructor(state) {
    if(typeof state === 'object') {
      if(Util.isset(state.title,'string')) {
        this.setTitle(state.title);
      }
      if(Util.isset(state.tags,'object')) {
        this.setTags(state.tags);
      }
      if(Util.isset(state.content,'string')) {
        this.setContent(strip(state.content));
      }
      if(Util.isset(state.lang,'string')) {
        this.setLang(state.lang);
      }
      if(Util.isset(state.scope,'string')) {
        this.setScope(state.scope);
      } else {
        var lang = this.getLang();
        var temp = '.'+atom.grammars.getGrammars().filter(function(e) {
          return (e.name === lang);
        })[0].scopeName;
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
    }
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {
    return {
      title: this.getTitle(),
      tags: this.getTags(),
      content: this.getContent(),
      lang: this.getLang(),
      scope: this.getScope(),
      uid: this.getUID(),
      version: this.getVersion(),
      author: this.getAuthor(),
      stats: this.getStats().serialize()
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

  setTitle(newtitle) {
    this.title = newtitle;
  }

  setContent(newcontent) {
    this.content = strip(newcontent);
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

  // An object is considered valid if it has the following properties set: title, content, uid
  static validate(object) {
    return (Util.isset(object,'object')
        && Util.isset(object.title,'string')
        //&& Util.isset(object.content,'string')
        && Util.isset(object.uid,'string')
    );
  }
}
