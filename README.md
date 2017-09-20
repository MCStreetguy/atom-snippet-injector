# Atom Snippet Injector
**An easy but powerful snippet management tool for Atom editor.**

This atom package provides a JSON based snippet management.

*But why use this package* you ask?

Because you can reach every feature in more or less three steps.

It's easy and fast so you don't have to struggle with difficult UI's or file syntaxes or even worse, writing the snippets manually.
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
- CSON package
  - [NPM Page](https://www.npmjs.com/package/cson)
  - [Repository](https://github.com/bevry/cson)
