# Atom Snippet Injector
**An easy but powerful snippet management tool for Atom editor.**

This atom package provides a JSON based, local snippet management, [automated synchronization](#atom-sync) to Atom's integrated snippet-module and [database support](#database-support) for improved teamwork with consistent snippet access.
It's easy and fast so you don't have to struggle with difficult UI's or file syntaxes or even worse, define the snippets manually.

## Introduction
Snippet Injector basically provides four functions for snippet management.
[Create](#creation), [Insert](#insertion), [Update](#updating) and [Delete](#deletion). They all do exactly what they are called, depending on your configuration, with some extra magic.

All commands are available through the main application menu below `Packages` > `Snippet Injector`.
The context menu provides the [Delete](#deletion) command in the whole workspace while [creation]((#creation)), [insertion](#insertion) and [updating](#updating) is only available within a TextEditor instance.

### Creation
To create a snippet, just mark all the text that shall be stored as snippet and run the `snippet-injector:create` command through command palette, context or main menu or hotkey. You will be prompted for a title for the snippet.   
Within this input field you may use some additional markers:   
- All words starting with a hash (`#foo`) are treated as keywords and taken out of the actual title.   
- A part of the title, wrapped in square brackets, defines the prefix that triggers the snippet in autocompletion. Only the brackets will be removed from the actual title.

### Insertion
To insert a snippet, just place the cursor where you want it to appear and run the `snippet-injector:insert` command the way you prefer. You will be prompted to choose a snippet for insertion, also allowing you to search the list. In the search field you may use the following syntax:   
- Plain text searches the title of the snippets
- A word starting with a hash (`#foo`) searches for keywords
- A word starting with an at-sign (`@bar`) searches for author
The options can be combined together. Snippets are filtered by full-text-search, meaning the order of the search keywords needs to be the same as in the title otherwise the Snippets won't match your search. (This will be improved soon.)

### Updating
To update a snippets content, just mark all the text that shall be used as new content and run the `snippet-injector:update` command the way you prefer. You will be prompted to choose a snippet that shall be updated. This list is also searchable with the above mentioned options.

### Deletion
To delete a snippet, just run the `snippet-injector:delete` command the way you prefer. You will be prompted to choose a Snippet in a dropdown list. Before actually deleting a snippet you will be prompted a second time if you are sure.

## Features

### Atom-Sync
You can enable synchronization with Atom's snippet module in the package config.

![atom sync config option](https://image.prntscr.com/image/NlQPlp6fQGmLvA8FLkuilQ.png)

When activated, all of your snippets will be synchronized with the `snippets.cson` file. Within this file you can define snippets for fast insertion in Atom. This feature is provided by the core-package `snippets`.  
Writing a CSON file manually is laborious but Snippet Injector automatically generates the needed structure including language scopes and configurable keywords.

When you get prompted for a snippet title you can wrap a part of it in square brackets. This will be used as keyword in autocompletion so you can give your snippets significant names without having to type all of it when inserting it.

You can use [Atom's snippet tabstop syntax](http://flight-manual.atom.io/using-atom/sections/snippets/#snippet-format) in snippets. This functionality is only available when inserting through autocompletion. When inserting with the insert command the tabstop markers are stripped from the snippets content, leaving possible default values.

### Database Support
Snippet Injector supports [Apache CouchDB v2.1](http://couchdb.apache.org/) as additional storage.

![couchdb config option](https://image.prntscr.com/image/WLz8O4VdTDCG4zLdAYQFIQ.png)

When enabled, you can mark snippets as shared, meaning they will be stored and synchronized with the CouchDB Server. A database called `snippet-injector-data` will be created, if not already done. The options for authentication can be left empty if you don't need authentication for your server. (Snippet Injector currently only supports [Basic Authentication](http://docs.couchdb.org/en/2.1.0/api/server/authn.html#basic-authentication))

All snippets stored in the database can be used by everyone you give access to the server. That's why this is just an additional storage method, because you possibly don't want to share every snippet with others.

/******************************************   
/*   Hier bitte mehr Anleitung einfügen   *   
/******************************************   


For security reasons, editing of snippets is only permitted to the respective owner, stored in the snippet. The author field is set to the current user account name when creating a snippet. This is no secure protection but prevents snippets from being overwritten or deleted by other users. You may insert a snippet, modify it to your needs and create a new one if needed.

Whenever an error occurs you will be notified through Atom. If possible, there is an option for performing automated repair methods.

![example error notification](https://image.prntscr.com/image/xHqFsydzSw6R0byBhbWPaQ.png)

**Use the `Fix Sync Problems` button on your own risk!**  The repair algorithm checks each local snippet for errors with database meta information and synchronization process and resets it's meta if needed. This results in the snippet being treated as unsynchronized and uploaded to the database as a whole new document, what fixes the most common errors.
It may occur that snippet data gets duplicated.

---

## Reference

### Commands
The following commands are registered by Snippet Injector and can be accessed via the command palette.

#### **snippet-injector:create**
This command creates a new snippet from the current selection in the current editor.  
You will be prompted for a snippet title.

---

#### **snippet-injector:update**
This command updates an existing snippet's content to the current selection in the current editor.  
You will be prompted for choosing an existing snippet.

---

#### **snippet-injector:insert**
This command injects a snippet to the current marker position(s).  
You will be prompted to choose a snippet from a list.

---

#### **snippet-injector:delete**
This command deletes a snippet from the local storage.  
You will be prompted for the snippet name to delete.

---

#### **snippet-injector:export**
This command exports one or more snippets to a readable JSON.  
*(intended to share snippets with others)*  
You will be prompted for the snippets to export and the destination.

---

#### **snippet-injector:export-all**
This command exports the whole storage to a readable JSON.  
*(intended to use as backup)*  
You will be prompted for the export destination.

---

#### **snippet-injector:import**
This command imports snippets from a JSON-file into the storage.  
You will be prompted for one or more files to import.


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
