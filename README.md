# Atom Snippet Injector
**An easy but powerful snippet management tool for Atom editor.**
This atom package provides a JSON based snippet management.

*But why use this package* you ask?

Because you can reach every feature in more or less three steps.

It's easy and fast so you don't have to struggle with difficult UI's or file syntaxes or even worse, writing the snippets manually.
Check out the [Examples](#examples) below for more instructions on how to use this package.
Happy Coding :)

---

### Please notice!
This package is currently under developement. There may be major bugs and functionality is not granted!
Please report all bugs to the issues page of the official Git Repository and provide as much information as possible.
I'll take care of all bugs as soon as possible. Ideas are also appreciated, I'll add a possibility for that soon.


---

## Examples

### Create
(_[Reference](#commands)_)

Select the text that you want to store as a snippet.
Open up the context menu and click on `Create snippet from selection`.

![](/screenshots/create_step_1-small.png)
[(full screenshot)](https://prntscr.com/fxabhj)

Enter a useful title for the snippet and confirm.
*(Bare in mind that you need to recognize your snippet by this title)*

![](/screenshots/create_step_2-small.png)
[(full screenshot)](https://prntscr.com/fxabn6)

The snippet is now saved in you local Atom storage.
*A notification tells you about errors and success.*

![](/screenshots/create_step_3-small.png)
[(full screenshot)](https://prntscr.com/fxabsv)

### Insert
(_[Reference](#commands)_)

Place the marker(s) at the position you want you snippet to be inserted.
Open up the context menu and click on `Insert snippet`.

![](/screenshots/insert_step_1-small.png)
[(full screenshot)](https://prntscr.com/fxacde)

Choose your snippet from the list by clicking it.
*(If you got a lot of snippets there is a search input box at the top of the prompt window)*

![](/screenshots/insert_step_2-small.png)
[(full screenshot)](https://prntscr.com/fxacj8)

The snippet's content gets inserted.
*A notification tells you about errors and success.*

![](/screenshots/insert_step_3-small.png)
[(full screenshot)](https://prntscr.com/fxacrn)

### Delete
(_[Reference](#commands)_)

Open up the context menu and click on `Delete snippet`.

![](/screenshots/delete_step_1-small.png)
[(full screenshot)](https://prntscr.com/fxabyh)

Enter the title of the snippet you want to delete and confirm.
*(You will be prompted twice before actual deletion. Bare in mind that deleted snippets are gone forever!)*

![](/screenshots/delete_step_2-small.png)
[(full screenshot)](https://prntscr.com/fxac6s)

The snippet is now deleted from the local Atom storage.
*A notification tells you about errors and success.*

![](/screenshots/delete_step_3-small.png)
[(full screenshot)](https://prntscr.com/fxac96)


---

## Reference

#### Commands
There are basically three commands snippet-injector ships with:

##### **snippet-injector:create**
This command creates a new snippet from the current selection in the current editor.
You will be prompted for a snippet title.

*Name in menus:*
> "Create snippet from selection"


##### **snippet-injector:insert**
This command injects a snippet to the current marker position(s).
You will be prompted to choose a snippet from a list.

*Name in menus:*
> "Insert snippet"


##### **snippet-injector:delete**
This command deletes a snippet from the local storage.
You will be prompted for the snippet name to delete.

*Name in menus:*
> "Delete snippet"
