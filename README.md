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

### Commands
The following commands are registered by Snippet Injector and can be accessed via the command palette.
If stated, the commands can also be called through menus or via hotkey.

#### **snippet-injector:create**
This command creates a new snippet from the current selection in the current editor.
You will be prompted for a snippet title.

*Name in menus:*
> "Create snippet from selection"

*Predefined Hotkey:*
> "Ctrl + Alt + O"

---

#### **snippet-injector:update**
This command updates an existing snippet's content to the current selection in the current editor.
You will be prompted for choosing an existing snippet.

*Name in menus:*
> "Update existing snippet"

---

#### **snippet-injector:insert**
This command injects a snippet to the current marker position(s).
You will be prompted to choose a snippet from a list.

*Name in menus:*
> "Insert snippet"

*Predefined Hotkey:*
> "Ctrl + Alt + I"

---

#### **snippet-injector:delete**
This command deletes a snippet from the local storage.
You will be prompted for the snippet name to delete.

*Name in menus:*
> "Delete snippet"

---

#### **snippet-injector:toggledebug**
This command toggles all debugging options for the package.
Debug informations are logged in Atom's console.

*Please notice that this command is just available through command palette!*

---

#### **snippet-injector:import**
This command imports previously exported data from an importable file format.
The format is recognized automatically, the contained data gets parsed
and the resulting snippets will be stored simultaneously.

Since this command is part of the IMEX module, I recommend usage via main menu.

*Name in menus:*
> "Import Snippets"

---

#### **snippet-injector:export-to-...**
This command exports the local storage in the given file format.
All snippets get parsed, based on the specific configuration and then are written into a user chosen file.

Since this command is part of the IMEX module, I recommend usage via main menu.

###### available formats:

| Format   | Extension | Command                        | Importable | additional Infos                           |
|---------:|-----------|--------------------------------|:----------:|--------------------------------------------|
| CSV      | .csv      | snippet-injector:export-to-csv | yes        | Files may look untidy, use it as recovery  |
| Markdown | .md       | snippet-injector:export-to-md  | no         | Human-readable, beautified                 |

*Name in menus:*
> "Export Snippets  ->  FORMAT"


---

---

### External Sources
```
All external sources used within this package are subject to their licenses and respective owners.
```
*(abtract taken from [LICENSE.md](LICENSE.md#external-sources))*

**This package uses the following libraries or contents:**

- DEVICON | *The list icons in the snippet selection prompt use SVG data from DEVICON*
  - [Webpage](http://konpa.github.io/devicon/)
  - [Repository](https://github.com/konpa/devicon/)
- jQuery
  - [Webpage](https://jquery.com/)
  - [Repository](https://github.com/jquery/jquery)
