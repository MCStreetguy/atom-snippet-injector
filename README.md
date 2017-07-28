# Atom Snippet Injector
**An easy but powerful snippet management tool for Atom editor.**
This atom package provides a JSON based snippet management.

*But why use this package* you ask?

Because you can reach every feature in more or less three steps.

It's easy and fast so you don't have to struggle with difficult UI's or file syntaxes or even worse, writing the snippets manually.
Check out the [Quick Start Guide](HOWTO.md#examples) for more instructions on how to use this package.
Happy Coding :)

---

## Reference

#### Commands
There are basically three commands snippet-injector ships with:

##### **snippet-injector:create**
This command creates a new snippet from the current selection in the current editor.
You will be prompted for a snippet title.

*Name in menus:*
> "Create snippet from selection"

*Predefined Hotkey:*
> "Ctrl + Alt + O"


##### **snippet-injector:insert**
This command injects a snippet to the current marker position(s).
You will be prompted to choose a snippet from a list.

*Name in menus:*
> "Insert snippet"

*Predefined Hotkey:*
> "Ctrl + Alt + I"


##### **snippet-injector:delete**
This command deletes a snippet from the local storage.
You will be prompted for the snippet name to delete.

*Name in menus:*
> "Delete snippet"


##### **snippet-injector:toggledebug**
This command toggles all debugging options for the package.
Debug informations are logged in Atom's console.

*Please notice that this command is just available through command palette!*


---

### External Sources
```
All external sources used within this package are subject to their licenses and respective owners.
```
*(abtract taken from [LICENSE.md](LICENSE.md#external-sources))*

**This package uses the following libraries or contents:**

- DEVICON | *The list icons in the snippet selection prompt use SVG data from DEVICON*
  - [Icon Source](http://konpa.github.io/devicon/)
  - [Repository](https://github.com/konpa/devicon/)
- jQuery
  - [Webpage](https://jquery.com/)
  - [NPM](https://www.npmjs.com/package/jquery)
  - [Repository](https://github.com/jquery/jquery)
