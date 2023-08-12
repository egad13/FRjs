
The {@link module:fr/forms fr/forms} module provides you with several extensions to the `<select>` tag/`HTMLSelectElement` class which let you place self-populating dropdowns in your HTML markup, or easily create them in Javascript.

For basic setup of the module, see {@tutorial fr-forms}.

This tutorial covers how to use the Automatic Eye Type Dropdowns. (In the source code, this is the {@link module:fr/forms~EyeSelect EyeSelect} class.)

A dropdown of this type automatically populates itself with options representing Flight Rising's eye types, in order of increasing rarity.

## Basic Usage

After importing the `fr/forms` module, there are two methods for creating a EyeSelect.

### In HTML

To create a `<select>` that uses this functionality in your HTML files, just add the attribute `is="fr-eyes"` to the element:
```html
This dropdown will populate with all eye types when the page loads.
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
// The document now has a <select> element with options for all eye types.
```
<p class="note">
When creating this element in a script, it will only self-populate <strong>after</strong> it's attached to the document. You can't access the self-populated options before attaching it.
</p>
