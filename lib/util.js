'use babel';

import { TextEditor } from 'atom';
import IconHelper from './icon-helper';
const fs = require('fs');
const path = require('path');
const $ = require('./externals/jquery-3.2.1.min.js');

export default class Util {

  constructor(state) {
    if(new.target === Util) throw TypeError("Cannot instantiate abstract class Util.");
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {
    return undefined;
  }

  // Tear down any state and detach
  destroy() {}

  static promptUser(options,callback) {
    if(typeof options !== 'object') {
      throw TypeError('Param \'options\' has to be an object.');
    } else if(typeof callback !== 'function') {
      throw TypeError('Param \'callback\' has to be a function.');
    } else {
      const inputPrompt = document.createElement('div');
      inputPrompt.id = 'input-prompt';

      const modal = atom.workspace.addModalPanel({
        item: inputPrompt,
        visible: false
      });

      if(options.title !== undefined && options.title !== null) {
        $('#input-prompt').append('<h4 class="title">'+options.title+'</h4>');
      }
      var edit = atom.workspace.buildTextEditor({mini: true});
      edit.setPlaceholderText(''+options.placeholder);
      $('#input-prompt').append(atom.views.getView(edit));
      $('#input-prompt').find('atom-text-editor').attr('id','prompt-input');
      $('#input-prompt').append('<button class="btn btn-success disabled" id="prompt-confirm">'+options.btnconfirm+'</button>\
      <button class="btn btn-default" id="prompt-cancel">'+options.btncancel+'</button>');
      $('#input-prompt').append('<div class="more-options"><input type="checkbox" id="is-shared"> Synchronize with database</div>');
      if(!atom.config.get('snippet-injector.database.enable')) {
        $('.more-options').addClass('hidden');
        $('#input-prompt').css('height','30px');
      }
      edit.onDidChange(function() {
        if((edit.getText() === '' || edit.getText() === ' ' || edit.getText() === null || edit.getText() === undefined)) {
          if(!$('#prompt-confirm').hasClass('disabled')) {
            $('#prompt-confirm').addClass('disabled');
          }
        } else {
          if($('#prompt-confirm').hasClass('disabled')) {
            $('#prompt-confirm').removeClass('disabled');
          }
        }
      });
      var handleConfirm = function(e) {
        if(!$('#prompt-confirm').hasClass('disabled')) {
          window.removeEventListener('keyup', handleKey, true);
          var shared = document.getElementById('is-shared').checked;
          var text = edit.getText();
          modal.destroy();
          callback(text,shared);
        }
      }
      var handleCancel = function(e) {
        window.removeEventListener('keyup', handleKey, true);
        modal.destroy();
        callback(null);
      }
      var handleKey = function(e) {
        if(e.which === 13) {
          handleConfirm();
        } else if(e.which === 27) {
          handleCancel();
        }
      }
      $('#prompt-confirm').on('click',handleConfirm);
      $('#prompt-cancel').on('click',handleCancel);
      window.addEventListener('keyup', handleKey, true);

      modal.show();
    }
  }

  static promptMultiSearch(options,callback) {
    if(typeof options !== 'object') {
      throw TypeError('Param \'options\' has to be an object.');
    } else if(typeof callback !== 'function') {
      throw TypeError('Param \'callback\' has to be a function.');
    } else {
      const searchPrompt = document.createElement('div');
      searchPrompt.id = 'search-multi-prompt';

      const modal = atom.workspace.addModalPanel({
        item: searchPrompt,
        visible: false
      });

      if(options.title !== undefined && options.title !== null) {
        $('#search-multi-prompt').append('<h4 class="title">'+options.title+'</h4>');
      }
      var edit = atom.workspace.buildTextEditor({mini: true});
      edit.setPlaceholderText(''+options.placeholder);
      $('#search-multi-prompt').addClass('select-list');
      $('#search-multi-prompt').append(atom.views.getView(edit));
      $('#search-multi-prompt').find('atom-text-editor').attr('id','prompt-search');

      const temp_store = new Array();

      var listDOMstring = '<ol class="nav list-group" id="prompt-list">';
      options.listItems.sort(function(a,b) {
        return parseInt(b.sort) - parseInt(a.sort);
      }).forEach(function(currentValue,index,array) {
        listDOMstring += '<li class="list-item">';
        if(Util.isset(currentValue.icon,'string')) {
          listDOMstring += IconHelper.getIconTag(currentValue.icon);
        } else {
          listDOMstring += IconHelper.getIconTag('default');
        }
        listDOMstring += '<p class="value" data-id="'+currentValue.uid+'">';
        listDOMstring += currentValue.title;
        listDOMstring += '</p></li>';
      });
      listDOMstring += '</ol></div><button class="btn btn-success disabled" id="prompt-confirm">'+options.btnconfirm+'</button>\
      <button class="btn btn-default" id="prompt-cancel">'+options.btncancel+'</button>';
      $('#search-multi-prompt').append(listDOMstring);
      IconHelper.colorize('colored-svg');

      edit.onDidChange(function() {
        var text = edit.getText();
        $('#prompt-list').off('click');
        $('#prompt-list').find('.list-item, .notice').remove();
        var filteredItems = options.listItems.filter(function(element) {
          text = text.toLowerCase();
          if(text !== '' && text !== ' ' && text !== null && text !== undefined) {
            var title = element.title.toLowerCase();
            var tags = element.tags.join(' ').toLowerCase();
            var author = element.author.toLowerCase();
            if(text.startsWith('#')) {
              return (tags.indexOf(text.split('#').join('')) > -1 ? true : false);
            } else if(text.startsWith('@')) {
              return (author.indexOf(text.split('@').join('')) > -1 ? true : false);
            } else {
              return (title.indexOf(text) > -1 ? true : false);
            }
          } else {
            return true;
          }
        }).sort(function(a,b) {
          return parseInt(b.sort) - parseInt(a.sort);
        });
        var listDOMstring = '';
        if(filteredItems.length > 0) {
          filteredItems.forEach(function(currentValue,index) {
            listDOMstring += '<li class="list-item';
            if(temp_store.indexOf(currentValue.uid) > -1) {
              listDOMstring += ' selected';
            }
            listDOMstring += '">';
            if(Util.isset(currentValue.icon,'string')) {
              listDOMstring += IconHelper.getIconTag(currentValue.icon);
            } else {
              listDOMstring += IconHelper.getIconTag('default');
            }
            listDOMstring += '<p class="value" data-id="'+currentValue.uid+'">';
            listDOMstring += currentValue.title;
            listDOMstring += '</p></li>';
          });
        } else {
          listDOMstring += '<li class="notice"><i>'+options.nothingfound+'</i></li>';
        }
        $('#prompt-list').append(listDOMstring);
        IconHelper.colorize('colored-svg');

        $('#prompt-list').on('click','.list-item',function(e) {
          var listItem = $(e.target).hasClass('list-item') ? $(e.target) : $(e.target).parents('.list-item');
          listItem.toggleClass('selected');
          var id = listItem.find('.value').data('id');
          if(temp_store.indexOf(id) > -1) {
            temp_store.splice(temp_store.indexOf(id),1);
          } else {
            temp_store.push(id);
          }
          $('#prompt-confirm').toggleClass('disabled',(temp_store.length < 1));
        });
      });
      var handleConfirm = function(e) {
        if(!$('#prompt-confirm').hasClass('disabled')) {
          window.removeEventListener('keyup', handleKey, true);
          modal.destroy();
          callback(temp_store);
        }
      }
      var handleCancel = function(e) {
        window.removeEventListener('keyup',handleKey,true);
        modal.destroy();
        callback(null);
      }
      var handleKey = function(e) {
        if(e.which === 13) {
          handleConfirm();
        } else if(e.which === 27) {
          handleCancel();
        }
      }
      $('#prompt-list').on('click','.list-item',function(e) {
        var listItem = $(e.target).hasClass('list-item') ? $(e.target) : $(e.target).parents('.list-item');
        listItem.toggleClass('selected');
        var id = listItem.find('.value').data('id');
        if(temp_store.indexOf(id) > -1) {
          temp_store.splice(temp_store.indexOf(id),1);
        } else {
          temp_store.push(id);
        }
        $('#prompt-confirm').toggleClass('disabled',(temp_store.length < 1));
      });
      $('#prompt-cancel').on('click',handleCancel);
      $('#prompt-confirm').on('click',handleConfirm);
      window.addEventListener('keyup',handleKey,true);

      modal.show();
    }
  }

  static promptSearch(options,callback) {
    if(typeof options !== 'object') {
      throw TypeError('Param \'options\' has to be an object.');
    } else if(typeof callback !== 'function') {
      throw TypeError('Param \'callback\' has to be a function.');
    } else {
      const searchPrompt = document.createElement('div');
      searchPrompt.id = 'search-prompt';

      const modal = atom.workspace.addModalPanel({
        item: searchPrompt,
        visible: false
      });

      if(options.title !== undefined && options.title !== null) {
        $('#search-prompt').append('<h4 class="title">'+options.title+'</h4>');
      }
      var edit = atom.workspace.buildTextEditor({mini: true});
      edit.setPlaceholderText(''+options.placeholder);
      $('#search-prompt').addClass('select-list');
      $('#search-prompt').append(atom.views.getView(edit));
      $('#search-prompt').find('atom-text-editor').attr('id','prompt-search');

      var listDOMstring = '<ol class="nav list-group" id="prompt-list">';
      options.listItems.sort(function(a,b) {
        return parseInt(b.sort) - parseInt(a.sort);
      }).forEach(function(currentValue,index,array) {
        listDOMstring += '<li class="list-item">';
        if(Util.isset(currentValue.icon,'string')) {
          listDOMstring += IconHelper.getIconTag(currentValue.icon);
        } else {
          listDOMstring += IconHelper.getIconTag('default');
        }
        listDOMstring += '<p class="value" data-id="'+currentValue.uid+'">';
        listDOMstring += currentValue.title;
        listDOMstring += '</p></li>';
      });
      listDOMstring += '</ol><button class="btn btn-default" id="prompt-cancel">'+options.btncancel+'</button>';
      $('#search-prompt').append(listDOMstring);
      IconHelper.colorize('colored-svg');

      edit.onDidChange(function() {
        var text = edit.getText();
        $('#prompt-list').find('.list-item').off('click');
        $('#prompt-list').find('.list-item, .notice').remove();
        var filteredItems = options.listItems.filter(function(element) {
          text = text.toLowerCase();
          if(text !== '' && text !== ' ' && text !== null && text !== undefined) {
            var title = element.title.toLowerCase();
            var tags = element.tags.join(' ').toLowerCase();
            var author = element.author.toLowerCase();
            if(text.startsWith('#')) {
              return (tags.indexOf(text.split('#').join('')) > -1 ? true : false);
            } else if(text.startsWith('@')) {
              return (author.indexOf(text.split('@').join('')) > -1 ? true : false);
            } else {
              return (title.indexOf(text) > -1 ? true : false);
            }
          } else {
            return true;
          }
        }).sort(function(a,b) {
          return parseInt(b.sort) - parseInt(a.sort);
        });
        var listDOMstring = '';
        if(filteredItems.length > 0) {
          filteredItems.forEach(function(currentValue,index) {
            listDOMstring += '<li class="list-item">';
            if(Util.isset(currentValue.icon,'string')) {
              listDOMstring += IconHelper.getIconTag(currentValue.icon);
            } else {
              listDOMstring += IconHelper.getIconTag('default');
            }
            listDOMstring += '<p class="value" data-id="'+currentValue.uid+'">';
            listDOMstring += currentValue.title;
            listDOMstring += '</p></li>';
          });
        } else {
          listDOMstring += '<li class="notice"><i>'+options.nothingfound+'</i></li>';
        }
        $('#prompt-list').append(listDOMstring);
        IconHelper.colorize('colored-svg');

        $('#prompt-list').find('.list-item').on('click',function(e) {
          if($(e.target).hasClass('value')) {
            var value = $(e.target).data('id');
          } else {
            var value = $(e.target).find('.value').data('id');
          }
          modal.destroy();
          callback(value);
        });
      });
      var handleCancel = function(e) {
        window.removeEventListener('keyup',handleKey,true);
        modal.destroy();
        callback(null);
      }
      var handleKey = function(e) {
        if(e.which === 27) {
          handleCancel();
        }
      }
      $('#prompt-list').find('.list-item').on('click',function(e) {
        if($(e.target).hasClass('value')) {
          var value = $(e.target).data('id');
        } else {
          var value = $(e.target).find('.value').data('id');
        }
        modal.destroy();
        callback(value);
      });
      $('#prompt-cancel').on('click',handleCancel);
      window.addEventListener('keyup',handleKey,true)

      modal.show();
    }
  }

  static promptDelete(options,callback) {
    if(typeof options !== 'object') {
      throw TypeError('Param \'options\' has to be an object.');
    } else if(typeof callback !== 'function') {
      throw TypeError('Param \'callback\' has to be a function.');
    } else {
      const deletePrompt = document.createElement('div');
      deletePrompt.id = 'delete-prompt';
      $('#delete-prompt').addClass('control-group');

      const modal = atom.workspace.addModalPanel({
        item: deletePrompt,
        visible: false
      });

      if(options.title !== undefined && options.title !== null) {
        $('#delete-prompt').append('<h4 class="title">'+options.title+'</h4>');
      }
      var list = '<select class="form-control" id="delete-list">';
      if(options.placeholder !== undefined && options.placeholder !== null) {
        list += '<option disabled selected>'+options.placeholder+'</option>';
      } else {
        list += '<option disabled selected>Please choose...</option>';
      }
      list+= '<option disabled>----------------</option>';
      options.items.forEach(function(current) {
        list += '<option value="'+current.value+'">'+current.title+'</option>';
      });
      list += '</select>';
      $('#delete-prompt').append(list);
      $('#delete-prompt').append('<button class="btn btn-default" id="prompt-cancel">'+options.btncancel+'</button>');

      $('#delete-list').on('change',function(e) {
        var text = this.value;
        $('#delete-prompt').children().remove();
        $('#delete-prompt').append('<h4 class="title">'+options.suremsg+'</h4><br/>');
        $('#delete-prompt').append('<button class="btn btn-error" id="prompt-confirm">'+options.btnconfirm+'</button>\
        <button class="btn btn-default" id="prompt-cancel">'+options.btncancel+'</button>');

        $('#prompt-confirm').on('click',function(e) {4
          e.preventDefault();
          modal.destroy();
          callback(text);
        });
        $('#prompt-cancel').on('click',function(e) {
          modal.destroy();
          callback(null);
        });
      });
      $('#prompt-cancel').on('click',function(e) {
        modal.destroy();
        callback(null);
      });

      modal.show();
    }
  }

  static _gen(options) {
    var divider = '-';
    if(typeof options === 'object') {
      if(options.insertstring !== null && options.insertstring !== undefined) {
        var timestamp = options.insertstring;
      } else {
        var timestamp = Date.now();
      }
      if(options.numbers !== null && options.numbers !== undefined) {
        var numbers = options.numbers;
      } else {
        var numbers = [1,2,3,4,5,6,7,8,9,0];
      }
      if(options.chars !== null && options.chars !== undefined) {
        var chars = options.chars;
      } else {
        var chars = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
      }
      if(options.prefix !== null && options.prefix !== undefined) {
        var id = options.prefix+'-';
      } else {
        var id = '-_-';
      }
      if(options.length !== null && options.length !== undefined) {
        var length = options.length;
      } else {
        var length = 20;
      }
    } else {
      var timestamp = Date.now().toString();
      var numbers = [1,2,3,4,5,6,7,8,9,0];
      var chars = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
      var id = '-_-';
      var length = 20;
    }

    for (var i = 0; i < length; i++) {
      var r = this.getRandomInt(0,4);
      if(r === 0) {
        id += numbers[this.getRandomInt(0,numbers.length)];
      } else if(r === 1) {
        id += chars[this.getRandomInt(0,chars.length)]
      } else if(r === 2) {
        id += divider;
      } else {
        var rand = this.getRandomInt(0,timestamp.length);
        id += timestamp.substr(rand,this.getRandomInt(0,timestamp.length-rand));
      }
    }
    return id;
  }

  static generateUID(options) {
    var uid = '';
    if(typeof options === 'object') {
      if(this.isset(options.unique,'boolean') && options.unique && this.isset(options.tester,'function')) {
        var i = -1;
        if(this.isset(options.timeout,'number')) {
          var timeout = options.timeout;
        } else {
          var timeout = 25;
        }
        do {
          i++;
          uid = this._gen(options);
        } while(!options.tester(uid) && i<timeout);
      } else {
        uid = this._gen(options);
      }
    } else {
      uid = this._gen();
    }
    return uid;
  }

  static getRandomInt(min, max) {
    var min = Math.ceil(min);
    var max = Math.floor(max);
    var temp = Math.floor(Math.random() * (max - min)) + min;
    return temp;
  }

  static getPackageVersion() {
    var pack = JSON.parse(fs.readFileSync(path.join(__dirname,'..','package.json')));
    return pack.version;
  }

  static compareVersions(vers1, vers2) {
    if(this.isset(vers1,'string') && this.isset(vers2,'string')) {
      var versionA = {
        major: parseInt(vers1.split('.')[0]),
        minor: parseInt(vers1.split('.')[1]),
        patch: parseInt(vers1.split('.')[2])
      };
      var versionB = {
        major: parseInt(vers2.split('.')[0]),
        minor: parseInt(vers2.split('.')[1]),
        patch: parseInt(vers2.split('.')[2])
      };

      if(versionA.major > versionB.major) {
        return vers1;
      } else if(versionB.major > versionA.major) {
        return vers2;
      } else {
        if(versionA.minor > versionB.minor) {
          return vers1;
        } else if(versionB.minor > versionA.minor) {
          return vers2;
        } else {
          if(versionA.patch > versionB.patch) {
            return vers1;
          } else if(versionB.patch > versionA.patch) {
            return vers2;
          } else {
            return false;
          }
        }
      }
    } else {
      return undefined;
    }
  }

  static isset(attr,type) {
    try {
      var temp = attr instanceof type;
    } catch (e) {
      var temp = false;
    }
    return (attr !== null && attr !== undefined && (typeof attr === type || temp));
  }

  static getGrammarByName(name) {
    return atom.grammars.getGrammars().filter(function(e) {
      return e.name === name;
    })[0];
  }

  static stripIndent(data) {
    var indentation = '', length = 0, ret = [];
    if(!data.match(/^[\s]/)) return data;

    data.split(/[\n]/g).forEach(function(line,index,array) {
      if(index == 0) {
        ret.push(line.replace(/^[^\S]+/,function(match) {
          indentation = match;
          return '';
        }));
      } else if(line.startsWith(indentation)) {
        ret.push(line.replace(indentation,''));
      } else {
        ret.push(line);
      }
    });
    return ret.join('\n');
  }
}
