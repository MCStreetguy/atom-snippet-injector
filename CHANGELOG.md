# Changelog

-----------

## v1.5.*

#### Features
- CouchDB Support

#### Improvements
- Configurable snippet autocomplete-keyword
- Autoindentation for snippet contents
- Better menu structure & selectors
- Repair functionality for auto-solving database problems
- Support for Atom's tabstop syntax in snippets

#### Patches
- Backslash treatment in snippet content
- Grammar setting on insertion
- Selection extension to beginning only on multiline

---

## v1.4.*

#### Features
- Atom snippets synchronization
- Renewed Storage module
- Renewed IMEX module
- Package config

#### Improvements
- Partially asynchroneous execution
- Configurable autosaving
- Snippet class methods enhanced
- Autosave notification can be disabled
- Added support for Atom's snippet placeholders
- Added Fusion (TypoScript 2) & XML icons

#### Patches
- Storage delete fix
- Cleaned up code corpses
- Temporarily removed IMEX module (due to fatal errors)
- Insert search bug
- Snippet placeholder relacement fix
- Export default filename generation

---

## v1.3.*

#### Features
- Snippet Stats

#### Improvements
- Sorting snippets by usage count
- major performance improvement
- more significant notifications

#### Patches
- smaller bugfixes
- coding conventions


---

## v1.2.*

#### Features
- Snippet tag functionalities
- Edit option for snippets
- IMEX module: *(Import & Export)*
  - .CSV ~ Spreadsheet file
  - .MD ~ Markdown file

#### Improvements
- Quick Start Guide enhanced
- `README.md` / `HOWTO.md`
- IMEX module configuration
- Auto-set Editor grammar when inserting into new file
- Filesystem error treatment

#### Patches
- Debug output
- Available debug commands reduced
- Search bug
- IMEX module cancel bug
- Search prompt event handling
- Backup directory bug


---

## v1.1.*

#### Features
- Debug functionalities *(for easier bug reporting)*
- Snippet class:
  - (+) Author

#### Improvements
- Path resolvement
- Debug options storing
- Debug grouping in console
- Performance

#### Patches
- Error while reading stored files
- Migration even if there were no changes made
- Debug snippet logging
- jQuery module bug
- Storage bug


---

## v1.0.*

#### Features
- Snippet class:
  - (+) UID
  - (+) Version
- Automated snippet migration to newer version

#### Improvements
- Performance
- `LICENSE.md` / `README.md`
- Icon styling
- Delete prompt with dropdown-list

#### Patches
- UID generation
- Storage fixes for new snippet conventions
- Version comparison
- Delete prompt styling

---

## < v0.7.9
**pre-releases**

#### Features
- Create option added
- Insert option added
- Delete option added
- Snippet class added with properties:
  - Title
  - Tags
  - Content
  - Language

#### Improvements
- Basic styling of prompts
- Commands added to:
  - Context Menu
  - Main Menu
  - Hotkeys
- Added icons to snippets for easier recognition in the prompt list
- Performance
- `LICENSE.md` / `README.md` / `HOWTO.md`

#### Patches
- Storage directory creation / reading
- Prompt's search didn't work
- JSON error on snippet saving
- Error with different path dividers on different OSs
- Icon update when searching prompt list

---
