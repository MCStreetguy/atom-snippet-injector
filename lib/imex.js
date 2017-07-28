'use babel';

import Storage from './storage.js';
import Snippet from './snippet.js';
import Util from './util.js';
const fs = require('fs');
const path = require('path');
const {dialog} = require('electron').remote;

export default class IMEX {

  data = JSON.parse(fs.readFileSync(path.join(__dirname,'db','imex.json')));
  store = undefined;

  constructor(storage) {
    if(Util.isset(storage,Storage)) {
      this.store = storage;
    } else {
      throw new TypeError('IMEX module needs a reference to initiated Storage object!');
    }
  }

  // Returns an object that represents the current object state
  serialize() {
    return undefined;
  }

  // Tear down any state and detach
  destroy() {}

  storage_export(format) {
    if(Util.isset(format,'string')) {
      switch (format.toLowerCase()) {
        case 'csv':
          return this._expcsv();
          break;
        default:
          return false;
      }
    }
  }

  storage_import() {
    var filters = new Array();
    this.data.forEach(function(e) {
      filters.push({
        name: e.dialogOptions.name,
        extensions: e.dialogOptions.extensions
      });
    });
    filters.push({name: 'Any File', extensions: ['*']});
    var _this = this;

    dialog.showOpenDialog({
      buttonLabel: 'Import',
      properties: ['openFile'],
      filters: filters
    },function(filenames) {
      var filename = filenames[0];
      if(Util.isset(filename,'string')) {
        console.log(filename);
        var temp = path.extname(filename).replace('.','').toLowerCase();
        switch(temp) {
          case 'csv':
            _this._impcsv(filename);
            return true;
            break;
          default:
            return false;
        }
      }
    });
  }

  // internal methods

  _expcsv() {
    var storage = this.store;
    var config = this.data.filter(function(e) {
      if(e.name === 'csv') {
        return true;
      } else {
        return false;
      }
    })[0];
    var files = storage.retrieveFiles();
    var csv_string = '';
    if(files.length > 0) {
      config.labels.forEach(function(element,index,array) {
        csv_string += element;
        if(index < array.length-1) {
          csv_string += config.divider.field;
        } else {
          csv_string += config.divider.line;
        }
      })
      files.forEach(function(element,index,array) {
        var snippet = new Snippet(JSON.parse(storage.retrieveFile(element.replace('.json',''))));
        config.order.forEach(function(e,i,a) {
          var insert = snippet._get(e);
          if(config.convert.length > 0) {
            config.convert.filter(function(item) {
              if(item.name === e) {
                return true;
              } else {
                return false;
              }
            }).forEach(function(conversion) {
              if(conversion.type === 'replace') {
                insert = insert.split(conversion.search).join(conversion.replace);
              } else if(conversion.type === 'json') {
                insert = JSON.stringify(insert);
              }
            });
          }
          csv_string += insert;

          if(i < a.length-1) {
            csv_string += config.divider.field;
          } else {
            csv_string += config.divider.line;
          }
        });
      });

      var filters = new Array();
      this.data.forEach(function(e) {
        filters.push({
          name: e.dialogOptions.name,
          extensions: e.dialogOptions.extensions
        });
      });
      filters.push({name: 'Any File', extensions: ['*']});

      dialog.showSaveDialog({
        buttonLabel: 'Export',
        filters: filters
      },function(filename) {
        if(Util.isset(filename,'string')) {
          fs.writeFileSync(filename,csv_string);
          if(fs.existsSync(filename)) {
            atom.notifications.addSuccess('Successfully exported the local storage to chosen location.', null);
            return true;
          } else {
            atom.notifications.addError('An Error occured while exporting the local storage.', null);
            return false;
          }
        }
      });
    } else {
      atom.notifications.addWarning('The local storage is empty, therefore it can\'t be exported.', options)
      return false;
    }
  }

  _impcsv(filename) {
    var storage = this.store;
    var config = this.data.filter(function(e) {
      if(e.name === 'csv') {
        return true;
      } else {
        return false;
      }
    })[0];

    var count = 0;
    var file = fs.readFileSync(filename).toString();
    console.log(file);
    file.split(config.divider.line).forEach(function(e,i,a) {
      if(i > 0) {
        var snippet = new Snippet();
        e.split(config.divider.field).forEach(function(field,index) {
          var type = config.order[index];
          var insert = field;
          if(config.convert.length > 0) {
            config.convert.filter(function(item) {
              if(item.name === type) {
                return true;
              } else {
                return false;
              }
            }).forEach(function(conversion) {
              if(conversion.type === 'replace') {
                insert = insert.split(conversion.replace).join(conversion.search);
              } else if(conversion.type === 'json') {
                insert = JSON.parse(insert);
              }
            });
          }
          snippet._set(type,insert);
        });
        storage.store(snippet);
        count++;
      }
    });
    if(count < 1) {
      atom.notifications.addWarning('No snippets have been imported.', null)
    } else if(count == 1) {
      atom.notifications.addSuccess('One snippet has been imported.', null);
    } else {
      atom.notifications.addSuccess(count+' snippets have been imported.', null);
    }
  }
}
