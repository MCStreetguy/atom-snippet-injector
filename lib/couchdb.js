'use babel';

import Util from './util';
const Ajax = require('./externals/jquery-3.2.1.min').ajax;

export default class CouchDB {

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

  allDbs(callback) {
    var _this = this;

    if(Util.isset(callback,'function')) {
      Ajax({
        async: true,
        url: _this._build('dbs'),
        method: 'GET',
        complete: function(dbs,status) {
          if(dbs.status == 200) {
            callback({
              status: 'done',
              msg: '',
              response: (typeof dbs.responseJSON=='object'?dbs.responseJSON:dbs.responseText)
            });
          } else {
            callback({
              status: 'error',
              msg: 'Invalid response status: '+dbs.status
            });
          }
        }
      });
    } else {
      var dbs = Ajax({
        async: false,
        url: _this._build('dbs'),
        method: 'GET'
      });
      if(dbs.status == 200) {
        return (typeof dbs.responseJSON=='object'?dbs.responseJSON:dbs.responseText);
      } else {
        return undefined;
      }
    }
  }

  getDb(identifier,callback) {
    var _this = this;

    if(Util.isset(callback,'function')) {
      Ajax({
        async: true,
        url: _this._build()+identifier,
        method: 'GET',
        beforeSend: function(xhr) {
          xhr.setRequestHeader ("Authorization", "Basic " + btoa(_this.auth.name+":"+_this.auth.password));
        },
        complete: function(db,status) {
          if(db.status == 200) {
            callback({
              status: 'done',
              msg: '',
              response: (typeof db.responseJSON == 'object'?db.responseJSON:db.responseText)
            });
          } else {
            callback({
              status: 'error',
              msg: 'Invalid response status: '+db.status
            });
          }
        }
      });
    } else {
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
  }

  getDocs(identifier,callback) {
    var _this = this;

    if(Util.isset(callback,'function')) {
      Ajax({
        async: true,
        url: _this._build()+identifier+'/_all_docs',
        method: 'GET',
        beforeSend: function(xhr) {
          xhr.setRequestHeader ("Authorization", "Basic " + btoa(_this.auth.name+":"+_this.auth.password));
        },
        complete: function(docs,status) {
          if(docs.status == 200) {
            callback({
              status: 'done',
              msg: '',
              response: (typeof docs.responseJSON == 'object'?docs.responseJSON:docs.responseText)
            });
          } else {
            callback({
              status: 'error',
              msg: 'Invalid response status: '+docs.status
            });
          }
        }
      });
    } else {
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

  postJSON(dbIdentifier,data,callback) {
    var _this = this;

    if(Util.isset(callback,'function')) {
      Ajax({
        async: true,
        url: _this._build()+dbIdentifier,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        beforeSend: function(xhr) {
          xhr.setRequestHeader ("Authorization", "Basic " + btoa(_this.auth.name+":"+_this.auth.password));
        },
        complete: function(res,status) {
          switch (res.status) {
            case 201:
              // Document created and stored on disk
              callback({
                status: 'done',
                msg: 'Document created and stored on disk.',
                response: (typeof res.responseJSON == 'object'?res.responseJSON:res.responseText)
              });
              break;
            case 202:
              // Document data accepted, but not yet stored on disk
              callback({
                status: 'pending',
                msg: 'Document data recieved, but not yet stored.',
                response: (typeof res.responseJSON == 'object'?res.responseJSON:res.responseText)
              });
              break;
            case 400:
              // Invalid database name
              callback({
                status: 'error',
                msg: 'Invalid database name!'
              });
              // TODO: Autocreation of missing database as config option?
              break;
            case 401:
              // Write privileges required
              callback({
                status: 'error',
                msg: 'Write privileges required!'
              });
              break;
            case 404:
              // Database doesn’t exist
              callback({
                status: 'error',
                msg: 'Database doesn\'t exist!'
              });
              // TODO: Autocreation of missing database as config option?
              break;
            case 409:
              // A Conflicting Document with same ID already exists
              callback({
                status: 'error',
                msg: 'A conflicting document with same ID already exists!'
              });
              break;
            default:
              callback({
                status: 'error',
                msg: 'Invalid response status: '+req.status
              });
          }
        }
      });
    } else {
      var res = Ajax({
        async: false,
        url: _this._build()+dbIdentifier,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        beforeSend: function(xhr) {
          xhr.setRequestHeader ("Authorization", "Basic " + btoa(_this.auth.name+":"+_this.auth.password));
        }
      });

      switch (res.status) {
        case 201:
          // Document created and stored on disk
          return {
            status: 'done',
            msg: 'Document created and stored on disk.',
            response: (typeof res.responseJSON == 'object'?res.responseJSON:res.responseText)
          }
          break;
        case 202:
          // Document data accepted, but not yet stored on disk
          return {
            status: 'pending',
            msg: 'Document data recieved, but not yet stored.',
            response: (typeof res.responseJSON == 'object'?res.responseJSON:res.responseText)
          }
          break;
        case 400:
          // Invalid database name
          return {
            status: 'error',
            msg: 'Invalid database name!'
          }
          // TODO: Autocreation of missing database as config option?
          break;
        case 401:
          // Write privileges required
          return {
            status: 'error',
            msg: 'Write privileges required!'
          }
          break;
        case 404:
          // Database doesn’t exist
          return {
            status: 'error',
            msg: 'Database doesn\'t exist!'
          }
          // TODO: Autocreation of missing database as config option?
          break;
        case 409:
          // A Conflicting Document with same ID already exists
          return {
            status: 'error',
            msg: 'A conflicting document with same ID already exists!'
          }
          break;
        default:
          return {
            status: 'error',
            msg: 'Invalid response status: '+req.status
          }
      }
    }
  }
}
