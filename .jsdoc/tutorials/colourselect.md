
The {@link module:fr/forms fr/forms} module provides you with several extensions to the `<select>` tag/`HTMLSelectElement` class which let you place self-populating dropdowns in your HTML markup, or easily create them in Javascript.

For basic setup of the module, see {@tutorial fr-forms}.

This tutorial covers how to use the Automatic Colour Dropdowns. (In the source code, this is the {@link module:fr/forms~ColourSelect ColourSelect} class.)

A dropdown of this type automatically populates itself with options representing Flight Rising's colours, in on-site colour wheel order. The options will be styled similarly to how they are on-site, with coloured backgrounds.

## Basic Usage

After importing the `fr/forms` module, there are two methods for creating a ColourSelect.

### In HTML

To create a `<select>` that uses this functionality in your HTML files, just add the attribute `is="fr-colours"` to the element:
```html
This dropdown will populate with all colours when the page loads.
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
// The document now has a <select> element with options for all colours.
```
<p class="note">
When creating this element in a script, it will only self-populate <strong>after</strong> it's attached to the document. You can't access the self-populated options before attaching it.
</p>

## Custom Attributes

In addition to all standard attributes available for `<select>` elements, `ColourSelect`s support the following custom attributes:

| Attribute            | Type    | Value If Unset | Description     |
|----------------------|---------|----------------|-----------------|
| **`option-styling`** | boolean | true           | If true, options will be styled with background colours matching their colour name. If false, options will be unstyled. |

## Examples

### HTML

Create three colour dropdowns, all of which have their options styled:
```html
<select is="fr-colours"></select>
<select is="fr-colours" option-styling></select>
<select is="fr-colours" option-styling="true"></select>
```

Create a colour dropdown with NO option styling:
```html
<select is="fr-colours" option-styling="false"></select>
```

### Javascript

Create a colour dropdown with NO option styling:
```js
const colourDropdown = document.createElement("select", { is: "fr-colours" });
colourDropdown.setAttribute("option-styling", false);
document.body.append(colourDropdown);
```
