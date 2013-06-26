Plugin for CKEditor
===============

http://ckeditor.com

Plugin Purpose
===============
Plugin ```webkit-span-fix``` been created to fix bug, which appears when merging paragraphs in CKEditor with delete/backspace.

Bug description
---------------
Original: [http://dev.ckeditor.com/ticket/9998](http://dev.ckeditor.com/ticket/9998?cversion=1&cnum_hist=45#comment:45)

> Occurs in Chrome v24.0.1312.56 / CKEditor 4.0.1 (revision d02739b) / CKEditor 4 DEV (Standard) (revision d02739b) (nightly build demo)
> Did not occur in Firefox v17.0.1
> When you have a paragraph with several lines of text, ie.:

```
<p>line1<br />
line2</p>
```

> and want to create 2 separate paragraphs, you could go with your cursor to the end of line1, press ENTER to create a new paragraph and press DELETE to remove the whiteline caused by the BR tag. Then CKEditor puts some HTML in a SPAN tag with a line-height styling.

```html
<p>line1</p>
<p><span style="line-height: 1.6em;">line2</span></p>
```

> Other examples: It also happens when trying to create a single line out of the next cases:

```html
<p><br />
line2</p>
```

> and

```html
<p>line1</p>
<p>line2</p>
```

Credits
===============
Author **pr0nbaer**, original code been taken from: [here](http://dev.ckeditor.com/ticket/9998?cversion=1&cnum_hist=45#comment:45) and http://pastebin.com/XUC7rCdn
