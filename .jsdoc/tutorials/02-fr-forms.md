
The {@link module:fr/forms fr/forms} module creates custom dropdown elements that automatically populate themselves with Flight Rising data. Just add an attribute to a `<select>` element your HTML markup or pass a special option in javascript and you can quickly and easily create dropdowns for Flight Rising's breeds, eye types, colours, and genes!

Since these are *extensions* of the native `<select>` tag, they look and function just like a regular dropdown. Any CSS styling that affects `<select>`s will also affect these custom dropdowns. You also don't need to do anything extra to make them accessible; they inherit all the same accessibility features/properties a regular dropdown would.

## Available Dropdowns

There are four custom dropdowns available in this module:

1. **Eye Types** (`"fr-eyes"`): Auto-populates options for all of Flight Rising's eye types, ordered by increasing rarity.  See {@tutorial 03-eyeselect} for details.
1. **Colours** (`"fr-colours"`): Auto-populates options for all of Flight Rising's colours, in on-site colour wheel order. Options may optionally be styled with the same background colours they have on site. See {@tutorial 04-colourselect} for details.
1. **Breeds** (`"fr-breeds"`): Auto-populates options for all of Flight Rising's breeds, separated into Modern and Ancient `<optgroup>`s and ordered alphabetically. See {@tutorial 05-breedselect} for details.
1. **Genes** (`"fr-genes"`): Auto-populates options for all Flight Rising genes in a specific slot (primary/secondary/tertiary). Can be optionally restricted to show only genes available to a specific breed, or linked to a breed dropdown! See {@tutorial 06-geneselect} for details.

## Usage

### 0. Set up your environment

This module requires the {@link module:fr/data fr/data} module. Make sure that module, ie `data.js`, is in the same directory as this module, `forms.js`.

`fr/forms` is an ES6 module. This means that it will work when the file is being delivered by a server, but NOT if you just open an html file in your browser with the `file:///` protocol.

So, if you're testing your project locally (which you probably should), you'll need to run an HTTP server. This is a lot easier than it sounds!

If you have python installed, open a command line terminal in the base folder of your project. You can either run the command `python -m http.server` to serve a basic HTTP server, or you can run [this python script I wrote that serves a non-caching HTTP server](https://gist.github.com/egad13/456511ef2cd80e2fa60baee6da41f8ce).

**Keep the terminal window open**. You can now go to the URL `http://localhost:8000/` in your browser, and you should see the contents of the `index.html` in the folder you started up the script.

If you want to try another method of running an HTTP server, [MDN has a guide about it](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Tools_and_setup/set_up_a_local_testing_server).

### 1. Load the module

The best way to do this is at the top of your HTML's `<head>` tag:
```html
<head>
    <script type="module" src="path/to/fr/forms.js"></script>
    <!-- ...etc... -->
```

For potential performance improvement in Firefox and chromium-based browsers, consider preloading `fr/forms` and it's dependencies:
```html
<head>
    <link rel="modulepreload" href="path/to/fr/data.js" />
    <link rel="modulepreload" href="path/to/fr/forms.js" />

    <script type="module" src="path/to/fr/forms.js"></script>
    <!-- ...etc... -->
```

Alternatively, you can use the `import` statement or the `import()` function in a script to load it, but in most cases this is not recommended.

### 2. Create your Dropdowns

#### In HTML

You can create any of these custom dropdowns directly in your HTML markup by adding the appropriate `is` attribute to any regular `<select>` tag.

For example, to create a dropdown with options for all of Flight Rising's eye types:
```html
<select is="fr-eyes"></select>
```

#### In Javascript

You can also create any of these dropdowns with javascript by passing `document.createElement` the `is` option.

For example, this code will create a dropdown with options for all of Flight Rising's colours:
```js
const colourDropdown = document.createElement("select", { is: "fr-colours" });
document.body.append(colourDropdown);
```
<div class="note">
<p>When working with any of these custom dropdowns in javascript, be aware that they'll only self-populate after two things have happened:</p>
<ol>
    <li>The element is attached to the document.</li>
    <li>The <code>fr/forms</code> module has run.</li>
</ol>
<p>If you need to access the self-populated options in your code, you must either wait until the <code>DOMContentLoaded</code> event has fired, or do so in a script which imports <code>fr/forms</code>.</p>
</div>

## Passing Data to `fr/data`

These custom dropdowns are made to work directly with the `fr/data` module. You can use the value of any of these custom dropdowns as an index in an appropriate `fr/data` array, or pass them to any `fr/data` function parameter that asks for the index of a breed, gene, eye type, or colour, and it'll just work.

For an example, here's a small web page that outputs the range of colours between two colours that a user selects:
```html
<html>
<head>
    <script type="module" src="path/to/fr/forms.js"></script>
    <script type="module" src="example.js"></script>
</head>
<body>
    <label>
        Colour 1:
        <select is="fr-colours" id="colour-1"></select>
    </label>
    <label>
        Colour 2:
        <select is="fr-colours" id="colour-2"></select>
    </label>
    <button id="find-range">Find Range Length</button>
    <div id="output"></div>
</body>
</html>
```
```js
// example.js
import * as FRdata from "path/to/fr/data.js";

const colour1 = document.querySelector("#colour-1"),
    colour2 = document.querySelector("#colour-2"),
    button = document.querySelector("#find-range"),
    output = document.querySelector("#output");

button.addEventListener("click", () => {
    let results = `<p>The colours in the range are:</p><ul>`;

    for (const colour of FRdata.colourRange(colour1.value, colour2.value)) {
        results += `<li>${colour.name}</li>`;
    }

    output.innerHTML = results;
});
```

## A Note on `querySelector` (and Styling)

These custom `<select>`s will use whatever styles you set on regular `<select>` elements too, since they have the same HTML tag.

If you want to do special styles for these custom dropdowns, or search the DOM for them in javascript, there's one extra detail to consider: whether you're adding the dropdowns directly to your HTML, or creating them with Javascript.

Any of these dropdowns created direct in HTML will have an `is` attribute, which you can use in CSS selectors to target them with CSS rules or `document.querySelector()`. For example, the selector `select[is=fr-colours]` will target any/all colour dropdowns which were in the original HTML markup; `select[is|=fr]` will target any/all of these custom dropdowns.

However, if you're creating them with scripts, *they do not have an `is` attribute.* You'll have to add ids, class names, or otherwise differentiate them from normal `<select>`s if you want to target specifically one/all of the custom dropdowns with a CSS selector.

## More Information

For details on how each of the custom dropdowns work, check out the Sub-Tutorials.

This module uses Customized Built-in Elements to do its job. If you want to know more about how that works, check out [MDN's guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Components/Using_custom_elements).

CBIE's are not natively supported in Safari, but the custom dropdowns should work in Safari anyway because the module loads a polyfill if CBIE support is not detected.
