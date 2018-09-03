# Atom Snippet Injector
**An easy but powerful snippet management tool for Atom editor.**

----------

**Please note** that this plugin has been discontinued and *does not work* with current versions of Atom.
I currently don't have enough time to maintain it properly, even if I may rework it at some point of time.
In that case you will be noticed here about it. Feel free to contribute on your own if you wish.

----------

This atom package provides a JSON based, local snippet management, [automated synchronization](#atom-sync) to Atom's integrated snippet-module and [database support](#database-support) for improved teamwork with consistent snippet access.
It's easy and fast so you don't have to struggle with difficult UI's or file syntaxes or even worse, define the snippets manually.

## Introduction
Snippet Injector basically provides four functions for snippet management.
[Create](#creation), [Insert](#insertion), [Update](#updating) and [Delete](#deletion). They all do exactly what they are called, depending on your configuration, with some extra magic.

### Creation
To create a snippet, just mark all the text that shall be stored as snippet and run the [`snippet-injector:create`](#snippet-injectorcreate) command through command palette, context or main menu or hotkey. You will be prompted for a title for the snippet.   
Within this input field you may use some additional markers:   
- All words starting with a hash (`#foo`) are treated as keywords and taken out of the actual title.   
- A part of the title, wrapped in square brackets, defines the prefix that triggers the snippet in autocompletion. Only the brackets will be removed from the actual title.

### Insertion
To insert a snippet, just place the cursor where you want it to appear and run the [`snippet-injector:insert`](#snippet-injectorinsert) command the way you prefer. You will be prompted to choose a snippet for insertion, also allowing you to search the list.

### Updating
To update a snippets content, just mark all the text that shall be used as new content and run the [`snippet-injector:update`](#snippet-injectorupdate) command the way you prefer. You will be prompted to choose a snippet that shall be updated. This list is also searchable with the above mentioned options.

### Deletion
To delete a snippet, just run the [`snippet-injector:delete`](#snippet-injectordelete) command the way you prefer. You will be prompted to choose a Snippet in a dropdown list. Before actually deleting a snippet you will be prompted a second time if you are sure.

---

## License information
This package is licensed under the [MIT License](LICENSE.md).

### External Sources
```
All external sources used within this package are subject to their licenses and respective owners.
```
*(abtract taken from [LICENSE.md](LICENSE.md#external-sources))*

**This package uses the following libraries or contents:**

- DEVICON
  - [Webpage](http://konpa.github.io/devicon/)
  - [Repository](https://github.com/konpa/devicon/)
- jQuery
  - [Webpage](https://jquery.com/)
  - [Repository](https://github.com/jquery/jquery)
- couchdb-wrapper
  - [Repository](https://github.com/MCStreetguy/couchdb-wrapper)
- CSON
  - [Repository](https://github.com/bevry/cson)
