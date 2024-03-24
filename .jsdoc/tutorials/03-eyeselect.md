
The {@link module:FRjs/forms FRjs/forms} module creates several extensions to the `<select>` tag/`HTMLSelectElement` class which let you place self-populating dropdowns in your HTML markup, or easily create them in Javascript.

For basic setup of the module, see {@tutorial 02-fr-forms}.

This tutorial covers how to use the Automatic Eye Type Dropdowns. A dropdown of this type automatically populates itself with options representing Flight Rising's eye types, in order of increasing rarity.

## Basic Usage

After loading the FRjs/forms module, there are two methods for creating a eye type dropdown.

### In HTML

To create a `<select>` that uses this functionality in your HTML files, just add the attribute `is="fr-eyes"` to the element:
```html
<select is="fr-eyes"></select>
```

### In Javascript

To create a `<select>` that uses this functionality in a script:
1. Create a select element with `document.createElement()` and set the `is` option to `fr-eyes`.
2. Use `.setAttribute()` to set any of the standard attributes you need. Add any options you want to have in addition to the eye types.
3. Attach it to the document.

```js
const eyeDropdown = document.createElement("select", { is: "fr-eyes" });
document.body.append(eyeDropdown);
```
<div class="note">
<p>When working with any of these custom dropdowns in javascript, be aware that they'll only self-populate after two things have happened:</p>
<ol>
    <li>The element is attached to the document.</li>
    <li>The <code>FRjs/forms</code> module has run.</li>
</ol>
<p>If you need to access the self-populated options in your code, you must either wait until the <code>DOMContentLoaded</code> event has fired, or do so in a script which imports <code>FRjs/forms</code>.</p>
</div>

## Custom Attributes

In addition to all standard attributes available for `<select>` elements, colour dropdowns support the following custom attributes:

| Attribute          | Type    | Value If Unset | Description     |
|--------------------|---------|----------------|-----------------|
| **`only-natural`** | boolean | n/a            | If this attribute is present, there will only be options for *natural eye types;* i.e., eye types that can be obtained through breeding. If this attribute is omitted, there will be options for all natural and non-natural eye types. |

## Examples

### HTML

Create an eye type dropdown with a default value of "Pick an eye":
```html
<select is="fr-eyes">
	<option>Pick an eye</option>
</select>
```

Create two eye type dropdowns with ONLY natural eye types included:
```html
<select is="fr-eyes" only-natural></select>
<select is="fr-eyes" only-natural="only-natural"></select>
```

### Javascript

Create an eye type dropdown with ONLY natural eye types included:
```js
const eyeDropdown = document.createElement("select", { is: "fr-eyes" });
eyeDropdown.setAttribute("only-natural", "");
document.body.append(eyeDropdown);
```
