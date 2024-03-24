
The {@link module:FRjs/forms FRjs/forms} module creates custom dropdown elements that automatically populate themselves with Flight Rising data. Just add an attribute to a `<select>` element your HTML markup or pass a special option in javascript and you can quickly and easily create dropdowns for Flight Rising's breeds, eye types, colours, and genes!

Since these are *extensions* of the native `<select>` tag, they look and function just like a regular dropdown. Any CSS styling that affects `<select>`s will also affect these custom dropdowns. You also don't need to do anything extra to make them accessible; they inherit all the same accessibility features/properties a regular dropdown would.

## Available Dropdowns

There are seven custom dropdowns available in this module:

1. **Ages** (`"fr-ages"`): Auto-populates options for Flight Rising's dragon ages.
1. **Genders** (`"fr-genders"`): Auto-populates options for Flight Rising's dragon genders.
1. **Elements** (`"fr-elements"`): Auto-populates options for Flight Rising's elemental flights.
1. **Eye Types** (`"fr-eyes"`): Auto-populates options for all of Flight Rising's eye types, ordered by increasing rarity.  See {@tutorial 03-eyeselect} for details.
1. **Colours** (`"fr-colours"`): Auto-populates options for all of Flight Rising's colours, in on-site colour wheel order. Options may optionally be styled with the same background colours they have on site. See {@tutorial 04-colourselect} for details.
1. **Breeds** (`"fr-breeds"`): Auto-populates options for all of Flight Rising's breeds, separated into Modern and Ancient `<optgroup>`s and ordered alphabetically. See {@tutorial 05-breedselect} for details.
1. **Genes** (`"fr-genes"`): Auto-populates options for all Flight Rising genes in a specific slot (primary/secondary/tertiary). Can be optionally restricted to show only genes available to a specific breed, or linked to a breed dropdown! See {@tutorial 06-geneselect} for details.

## Basic Usage

### 1. Load the module

FRjs/forms has no exports; the module registers its custom elements just from being loaded on the page at all, and doesn't have to run at any particular time to upgrade the `<select>`s you mark.

The recommended way to load the module is to add it as either its own script tag at the top of your page's `<head>`, or as a dynamic import at the top of your main script file.

```html
<head>
    <script type="module" src="path/to/FRjs/forms.min.js"></script>

    <!-- OR -->

    <script type="module">
        //main page script
        import("FRjs/forms.min.js");
    </script>
    <!-- ...etc... -->
```

For a potential performance improvement in Firefox and chromium-based browsers, consider preloading FRjs/data and FRjs/forms:
```html
<head>
    <link rel="modulepreload" href="path/to/FRjs/data.min.js" />
    <link rel="modulepreload" href="path/to/FRjs/forms.min.js" />

    <!-- ...etc... -->
```

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
    <li>The FRjs/forms module has run.</li>
</ol>
<p>If you need to access the self-populated options in your code, you must either wait until after the <code>DOMContentLoaded</code> event has fired, or do so in a script which statically imports FRjs/forms.</p>
</div>

## Passing Data to `FRjs/data`

These custom dropdowns are made to work directly with the `FRjs/data` module. You can use the value of any of these custom dropdowns as an index in an appropriate `FRjs/data` array, or pass them to any `FRjs/data` function parameter that asks for the index of a breed, gene, eye type, or colour, and it'll just work.

For an example, here's a small web page that outputs the range of colours between two colours that a user selects:
```html
<html>
<head>
    <script type="module" src="path/to/FRjs/forms.min.js"></script>
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
import * as FRdata from "path/to/FRjs/data.js";

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

For details on how each of the custom dropdowns work, check out the individual tutorials for each of them linked in the first section of this tutorial.

This module uses Customized Built-in Elements to do its job. If you want to know more about how that works, check out [MDN's guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Components/Using_custom_elements).

CBIE's are not natively supported in Safari, but the custom dropdowns should work in Safari anyway because the module loads a polyfill if CBIE support is not detected.
