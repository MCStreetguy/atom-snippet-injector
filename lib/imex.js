'use babel';

import Snippet from './snippet';
import Util from './util';
const {dialog} = require('electron').remote;
const os = require('os');
const path = require('path');

export default class IMEX {

  constructor() {
    if(new.target === IMEX) throw TypeError("Cannot instantiate abstract class IMEX.");
  }

  serialize() {
    return undefined;
  }

  static export(snippet_s) {
    if(Util.isset(snippet_s,Snippet)) {
      snippet_s.setStats(undefined);
      var data = JSON.stringify(snippet_s.serialize(),null,2);
      var title = snippet_s.getTitle();
    } else if(Util.isset(snippet_s,'object')) {
      snippet_s.forEach(function(e,i,a) {
        snippet_s[i].setStats(undefined);
      });
      var data = JSON.stringify(snippet_s,null,2);
      if(snippet_s.length == 1) {
        var title = snippet_s[0].getTitle();
      } else {
        var title = os.userInfo().username+'s Snippets';
      }
    } else {
      return false;
    }
    var defaultFile = title.toLowerCase().split(/\W+/).join('_');

    var filepath = dialog.showSaveDialog({
      title: 'Export Snippet(s)',
      defaultPath: path.join(os.homedir(),'Documents',defaultFile+'.json'),
      buttonLabel: 'Export',
      message: 'Choose the location, where to export the snippet(s).',
      filters: [
        {
          name: 'JavaScript Object Notation',
          extensions: 'json'
        },
        {
          name: 'Any File',
          extensions: '*'
        }
      ]
    });

    if(Util.isset(filepath,'string')) {
      fs.writeFileSync(filepath,data);
      return fs.existsSync(filepath);
    } else {
      return false;
    }
  }

  static import() {
    var files = dialog.showOpenDialog({
      title: 'Import Snippet(s)',
      defaultPath: path.join(os.homedir(),'Documents'),
      buttonLabel: 'Import',
      message: 'Choose the file containing the snippet(s) to import.',
      filters: [
        {
          name: 'JavaScript Object Notation',
          extensions: 'json'
        },
        {
          name: 'Any File',
          extensions: '*'
        }
      ],
      properties: [
        'openFile',
        'treatPackageAsDirectory'
      ]
    });

    return JSON.parse(fs.readFileSync(files[0]))
  }
}
