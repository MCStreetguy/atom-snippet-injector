# Atom Snippet Injector
**An easy but powerful snippet management tool for Atom editor.**

This atom package provides a JSON based snippet management and synchronization to Atoms integrated `snippets` package.
It's easy and fast so you don't have to struggle with difficult UI's or file syntaxes or even worse, define the snippets manually.
Check out the [Quick Start Guide](HOWTO.md#using-the-snippet-injector) for short instructions on how to use this package.
Happy Coding :)

---

## Reference

### Commands
The following commands are registered by Snippet Injector and can be accessed via the command palette.
If stated, the commands can also be called through menus or via hotkey.

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
