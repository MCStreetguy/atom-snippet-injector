# Quick Start Guide

---

## Using the snippet-injector

### Create
(_[Reference](README.md#commands)_)

Select the text that you want to store as a snippet.
Open up the context menu and click on `Create Snippet from selection`.

[ ![](/wiki/create_step_1-small.png) (full screenshot)](http://prntscr.com/fzcy80)

Enter a useful title for the snippet and confirm.
*(Bare in mind that you need to recognize your snippet by this title)*

[ ![](/wiki/create_step_2-small.png) (full screenshot)](http://prntscr.com/fzcyes)

The snippet is now saved in you local Atom storage.
*A notification tells you about errors and success.*

[ ![](/wiki/create_step_3-small.png) (full screenshot)](http://prntscr.com/fzcyjx)

### Insert
(_[Reference](README.md#commands)_)

Place the marker(s) at the position you want your snippet to be inserted.
Open up the context menu and click on `Insert Snippet`.

[ ![](/wiki/insert_step_1-small.png) (full screenshot)](http://prntscr.com/fzcyrt)

Choose your snippet from the list by clicking it.
*(If you got a lot of snippets there is a search input box at the top of the prompt window)*

[ ![](/wiki/insert_step_2-small.png) (full screenshot)](http://prntscr.com/fzcz1q)

The snippet's content gets inserted.
*A notification tells you about errors and success.*

[ ![](/wiki/insert_step_3-small.png) (full screenshot)](http://prntscr.com/fzcz68)

### Update
(_[Reference](README.md#commands)_)
**Please notice** that this command overrides snippet contents, ignoring if there is any relation between the old and new content.
It may occur that you damage snippets so be careful with this option. I recommend inserting the snippet in a new EditorPane before editing.

Select the updated content of one snippet.
Open the context menu and click on `Update existing snippet`.
[ ![](/wiki/update_step_1-small.png) (full screenshot)](http://prntscr.com/g3yl1v)

Choose the snippet you want to update. *(This is the same prompt used for insertion)*
[ ![](/wiki/update_step_2-small.png) (full screenshot)](http://prntscr.com/g3ylan)

The snippet's content is now updated to whatever you selected.
*A notification tells you about errors and success.*
[ ![](/wiki/update_step_3-small.png) (full screenshot)](http://prntscr.com/g3ylm2)

### Delete
(_[Reference](README.md#commands)_)

Open up the context menu and click on `Delete Snippet`.

[ ![](/wiki/delete_step_1-small.png) (full screenshot)](http://prntscr.com/fzczas)

Choose the snippet you want to delete from the dropdown-list. Choosing one confirms the prompt automatically.
*(You will be prompted twice before actual deletion. Bare in mind that deleted snippets are gone forever!)*

[ ![](/wiki/delete_step_2-small.png) (full screenshot)](http://prntscr.com/fzczf4)

The snippet is now deleted from the local Atom storage.
*A notification tells you about errors and success.*

[ ![](/wiki/delete_step_3-small.png) (full screenshot)](http://prntscr.com/fzczjq)


---

## Using the IMEX module

The IMEX (shorthand for 'IMport and EXport') module provides import and export
functionalities. It ships with several format configurations and parsing methods.
To access it, open the `Packages` menu and navigate down to the submenu
`Snippet Injector`. There you should find the options `Import Snippets` and
`Export Snippets` (which is a submenu).

### Exporting
(_[Reference](README.md#commands)_)

To export your snippets, open the named submenu `Export Snippets` and
select a format of your choise. (All available formatting options can be found [here](README.md#snippet-injectorexport-to-)).
Afterwards you will be prompted for a saving location and the file will be stored there.

### Importing
(_[Reference](README.md#commands)_)

To import previously exported data, select the `Import Snippets` option in the menu.
You will be prompted for a file to import from. The format is recognized automatically,
the file contents get parsed accordingly and are stored as new snippets.


### Please notice!
If you want to import data back later on, make sure you choose a format
that is stated as "importable" and **_not for a moment_ touch the file contents!**
The IMEX module does not recognize invalid data and will parse everything within
the given file. This may result in Fatal Errors or broken snippets.
> *Don't complain later, I told you so...*
