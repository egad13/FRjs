
The {@link module:fr/forms fr/forms} module creates extensions of native HTML `<select>` elements that automatically populate themselves with Flight Rising data. Just add a few special attributes to your HTML markup, or a special option to your javascript, and you can quickly and easily create dropdowns of Flight Rising's breeds, eye types, colours, and genes!

Since these are *extenstions* of the native `<select>`, they look and function just like one. Any CSS styling that affects selects will also affect these custom elements. You also don't need to do anything extra to make the elements accessible; they inherit all the same accessibility features/properties a regular dropdown would.

## Available Dropdowns

There are four available dropdown extensions in this module. See their individual tutorials for more information on each one.

1. **Breeds** (`"fr-breeds"`): Auto-populates options for all of Flight Rising's breeds, separated into Modern and Ancient `<optgroup>`s and ordered alphabetically.
1. **Eye Types** (`"fr-eyes"`): Auto-populates options for all of Flight Rising's eye types, ordered by increasing rarity.
1. **Colours** (`"fr-colours"`): Auto-populates options for all of Flight Rising's colours, in on-site colour wheel order. Options will be styled with the same background colours they have on site!
1. **Genes** (`"fr-genes"`): Auto-populates options for all Flight Rising genes in a specific slot (primary/secondary/tertiary). Can be optionally restricted to show only genes available to a specific breed, or linked to a breed dropdown! See {@tutorial geneselect} or {@link geneselect this tutorial} for details.

## Usage

### 0. Set up your environment

This module requires the {@link module:fr/data fr/data} module. Make sure that module, `data.js`, is in the same directory as this module, `forms.js`.

`fr/forms` is an ES6 module. This means that it will work when the file is being delivered by a server, but NOT if you just open an html file in your browser with the `file:///` protocol.

So, if you're testing your project locally (which you probably should), you'll need to run an HTTP server. This is a lot easier than it sounds!

If you have python installed, open a command line terminal in the base folder of your project. You can either run the command `python -m http.server` to serve a basic HTTP server, or you can run [this python script I wrote that serves a non-caching HTTP server](https://gist.github.com/egad13/456511ef2cd80e2fa60baee6da41f8ce).

**Keep the terminal window open**. You can now go to the URL `http://localhost:8000/` in your browser, and you should see the contents of the `index.html` in the folder you started up the script.

If you want to try another method of running an HTTP server, [MDN has a guide about it](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Tools_and_setup/set_up_a_local_testing_server).

### 1. Import the module

You can do this at either the top of your HTML's `<head>` tag:
```html
<head>
    <script type="module" src="path/to/fr/forms.js"></script>

    <!-- ...etc... -->
```

...Or in an inline script in your HTML `<head>` tag:
```html
<head>
    <script type="module">
        import "path/to/fr/forms.js";
        // ...etc...
    </script>

    <!-- OR -->

    <script type="text/javascript">
        import("path/to/fr/forms.js");
        // ...etc...
    </script>

    <!-- ...etc... -->
```

...Or in the imports for your page's main script file:
```js
// ES6 module
import "path/to/fr/forms.js";

// Plain javascript file
import("path/to/fr/forms.js");
```

### 2. Create your `<select>`s

#### In HTML

You can use any of these extended `<select>`s directly in your HTML markup by adding the appropriate `is` attribute to any regular `<select>` tag.

For example, this markup will cause the `<select>` element to populate itself with options for all of Flight Rising's eye types:
```html
<select is="fr-eyes"></select>
```

#### In Javascript

You can also create any of these extended `<select>`s programmatically in javascript.

For example, this code will create a dropdown of Flight Rising's colours and append it to the bottom of the document body:
```js
const colourDropdown = document.createElement("select", { is: "fr-colours" });
// ...set attributes, add your own options, etc...

document.body.append(colourDropdown);
```
<p class="note">
When creating any of these <code>&lt;select&gt;</code> variants programmatically, they will only self-populate after they're added to the document. You can't access the self-populated options before adding the element.
</p>

## More Information

For details on how each of the custom `<select>`s work, check out the Sub-Tutorials.

This module uses Customized Built-in Elements to do its job. If you want to know more about how that works, check out [MDN's guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Components/Using_custom_elements).

CBIE's are not natively supported in Safari, but this module should work in Safari anyway, as it loads a polyfill if CBIE support is not detected.
