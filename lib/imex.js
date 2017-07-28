'use babel';

import Storage from './storage.js';
import Snippet from './snippet.js';
import Util from './util.js';
const fs = require('fs');
const path = require('path');
const dialog = require('electron');

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

  static storage_export(format) {
    if(Util.isset(format,'string')) {
      switch (format.toLowerCase()) {
        case 'csv':
          return _expcsv();
          break;
        default:
          return false;
      }
    }
  }

  static storage_import() {

  }

  // internal methods

  static _expcsv() {
    var storage = this.store;
    var proto = this.data.export.csv;
    var files = storage.retrieveFiles();
    var csv_string = '';
    if(files.length > 0) {
      proto.labels.forEach(function(element,index,array) {
        csv_string += element;
        if(index < array.length-1) {
          csv_string += proto.divider.field;
        } else {
          csv_string += proto.divider.line;
        }
      })
      files.forEach(function(element,index,array) {
        var snippet = new Snippet(JSON.parse(storage.retrieveFile(element.replace('.json',''))));
        proto.order.forEach(function(element,index,array) {
          csv_string += snippet._get(element);
          if(index < array.length-1) {
            csv_string += proto.divider.field;
          } else {
            csv_string += proto.divider.line;
          }
        });
      });

      dialog.showSaveDialog({
        title: 'Choose the location for your export',
        buttonLabel: 'Export',
        filters: [
          {name: 'CSV File', extensions: ['csv']},
          {name: 'Any File', extensions: ['*']}
        ]
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
}
