'use babel';

import { TextEditor } from 'atom';
const $ = require('jquery');

export default class Util {

  constructor(state) {
    if(new.target === Node) throw TypeError("Cannot instantiate abstract class Util.");
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
      })
      $('#prompt-confirm').on('click',function(e) {
        if(!$(this).hasClass('disabled')) {
          modal.destroy();
          callback(edit.getText());
        }
      });
      $('#prompt-cancel').on('click',function(e) {
        modal.destroy();
      });

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
      $('#search-prompt').append(atom.views.getView(edit));
      $('#search-prompt').find('atom-text-editor').attr('id','prompt-search');

      var listDOMstring = '<ul class="nav" id="prompt-list">';
      options.listItems.forEach(function(currentValue) {
        listDOMstring += '<li class="list-item"><p class="value">';
        listDOMstring += currentValue;
        listDOMstring += '</p></li>';
      });
      listDOMstring += '</ul><button class="btn btn-default" id="prompt-cancel">'+options.btncancel+'</button>';
      $('#search-prompt').append(listDOMstring);

      edit.onDidChange(function() {
        var text = edit.getText();
        $('#prompt-list').find('.list-item, .notice').remove();
        var filteredItems = options.listItems.filter(function(element) {
          element = element.toLowerCase();
          text = text.toLowerCase();
          if(text !== '' && text !== ' ' && text !== null && text !== undefined) {
            return (element.indexOf(text) > -1 ? true : false);
          } else {
            return true;
          }
        });
        var listDOMstring = '';
        if(filteredItems.length > 0) {
          filteredItems.forEach(function(currentValue) {
            listDOMstring += '<li class="list-item"><p class="value">';
            listDOMstring += currentValue;
            listDOMstring += '</p></li>';
          });
        } else {
          listDOMstring += '<p class="notice"><i>'+options.nothingfound+'</i></p>';
        }
        $('#prompt-list').append(listDOMstring);
      })
      $('#search-prompt').find('.list-item').on('click',function(e) {
        if($(e.target).hasClass('value')) {
          var value = $(e.target).text();
        } else {
          var value = $(e.target).find('.value').text();
        }
        modal.destroy();
        callback(value);
      });
      $('#prompt-cancel').on('click',function(e) {
        modal.destroy();
      });

      modal.show();
    }
  }
}
