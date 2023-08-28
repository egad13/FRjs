
The {@link module:fr/forms fr/forms} module creates several extensions to the `<select>` tag/`HTMLSelectElement` class which let you place self-populating dropdowns in your HTML markup, or easily create them in Javascript.

For basic setup of the module, see {@tutorial 02-fr-forms}.

This tutorial covers how to use the Automatic Colour Dropdowns. (In the source code, this is the {@link module:fr/forms~ColourSelect ColourSelect} class.)

A dropdown of this type automatically populates itself with options representing Flight Rising's colours, in on-site colour wheel order. The options will be styled similarly to how they are on-site, with coloured backgrounds.

## Basic Usage

After importing the `fr/forms` module, there are two methods for creating a colour dropdown.

### In HTML

To create a `<select>` that uses this functionality in your HTML files, just add the attribute `is="fr-colours"` to the element:
```html
<select is="fr-colours"></select>
```

### In Javascript

To create a `<select>` that uses this functionality in a script:
1. Create a select element with `document.createElement()` and set the `is` option to `fr-colours`.
2. Use `.setAttribute()` to set any of the standard and custom attributes you need. Add any options you want to have in addition to the colours.
3. Attach it to the document.

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

## Custom Attributes

In addition to all standard attributes available for `<select>` elements, colour dropdowns support the following custom attributes:

| Attribute            | Type    | Value If Unset | Description     |
|----------------------|---------|----------------|-----------------|
| **`no-opt-colours`** | boolean | n/a            | If this attribute is present, options will be unstyled. If this attribute is omitted, options will be styled with background colours matching their colour name. |

## Examples

### HTML

Create a colour dropdown with coloured options, and a default value of "Pick a colour":
```html
<select is="fr-colours">
	<option>Pick a colour</option>
</select>
```

Create two colour dropdowns with NO option styling:
```html
<select is="fr-colours" no-opt-colours></select>
<select is="fr-colours" no-opt-colours="no-opt-colours"></select>
```

### Javascript

Create a colour dropdown with NO option styling:
```js
const colourDropdown = document.createElement("select", { is: "fr-colours" });
colourDropdown.setAttribute("no-opt-colours");
document.body.append(colourDropdown);
```
