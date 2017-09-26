'use babel';

import Util from './util';
const Ajax = require('./externals/jquery-3.2.1.min').ajax;

export default class CouchDB {

  ready = false;

  constructor(opts) {
    if(Util.isset(opts,'object') && Util.isset(opts.host,'string') && Util.isset(opts.port,'number') && Util.isset(opts.username,'string') && Util.isset(opts.password,'string')) {
      Object.defineProperties(this,{
        host: {
          value: opts.host
        },
        port: {
          value: opts.port
        },
        auth: {
          value: {
            name: opts.username,
            password: opts.password
          }
        }
      });
      console.log(this.getDocs('snippet-injector-data'));
    }
  }

  // Returns an object that represents the current object state
  serialize() {
    return {};
  }

  // Tear down any state and detach
  destroy() {}

  _build(type) {
    var base = 'http://'+this.host+':'+this.port+'/';
    switch (type) {
      // case 'login':
      //   return base+'_session';
      //   break;
      case 'dbs':
        return base+'_all_dbs';
        break;
      default:
        return base;
    }
  }

  // beforeSend: function(xhr) {
  //   xhr.setRequestHeader ("Authorization", "Basic " + btoa(_this.auth.name+":"+_this.auth.password));
  // }

  allDbs() {
    var _this = this;
    var dbs = Ajax({
      async: false,
      url: _this._build('dbs'),
      method: 'GET'
    });
    return (typeof dbs.responseJSON=='object'?dbs.responseJSON:dbs.responseText);
  }

  getDb(identifier) {
    var _this = this;
    var db = Ajax({
      async: false,
      url: _this._build()+identifier,
      method: 'GET',
      beforeSend: function(xhr) {
        xhr.setRequestHeader ("Authorization", "Basic " + btoa(_this.auth.name+":"+_this.auth.password));
      }
    });
    if(db.status == 200) {
      return (typeof db.responseJSON == 'object'?db.responseJSON:db.responseText);
    } else {
      return undefined;
    }
  }

  getDocs(identifier) {
    var _this = this;
    var docs = Ajax({
      async: false,
      url: _this._build()+identifier+'/_all_docs',
      method: 'GET',
      beforeSend: function(xhr) {
        xhr.setRequestHeader ("Authorization", "Basic " + btoa(_this.auth.name+":"+_this.auth.password));
      }
    });
    if(docs.status == 200) {
      return (typeof docs.responseJSON == 'object'?docs.responseJSON:docs.responseText);
    } else {
      return undefined;
    }
  }
}
