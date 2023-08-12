
The {@link module:fr/forms fr/forms} module provides you with several extensions to the `<select>` tag/`HTMLSelectElement` class which let you place self-populating dropdowns in your HTML markup, or easily create them in Javascript.

For basic setup of the module, see {@tutorial fr-forms}.

This tutorial covers how to use the Automatic Breed Dropdowns. (In the source code, this is the {@link module:fr/forms~BreedSelect BreedSelect} class.)

A dropdown of this type automatically populates itself with options representing Flight Rising's breeds. The options will be separated into Modern and Ancient `<optgroup>`s, and ordered alphabetically.

Any {@link module:fr/forms~GeneSelect GeneSelect} can be set to watch a BreedSelect for changes, and update itself based on the currently selected breed. For more information on how to do that, see {@tutorial geneselect}.

## Basic Usage

After importing the `fr/forms` module, there are two methods for creating a BreedSelect.

### In HTML

To create a `<select>` that uses this functionality in your HTML files, just add the attribute `is="fr-breeds"` to the element:
```html
This dropdown will populate with all breeds when the page loads.
<select is="fr-breeds"></select>
```

### In Javascript

To create a `<select>` that uses this functionality in a script:
1. Create a select element with `document.createElement()` and set the `is` option to `fr-breeds`.
2. Use `.setAttribute()` to set any of the standard attributes you need. Add any options you want to have in addition to the breeds.
3. Attach it to the document.

```js
const geneDropdown = document.createElement("select", { is: "fr-breeds" });
document.body.append(geneDropdown);
// The document now has a <select> element with options for all breeds.
```
<p class="note">
When creating this element in a script, it will only self-populate <strong>after</strong> it's attached to the document. You can't access the self-populated options before attaching it.
</p>

## Population and Events

A BreedSelect will only populate itself when it's first attached to a document; ie when being created in HTML, or when being appended to the document with a script.

When being appended, it searches for any GeneSelects linked to it and notifies them to repopulate based on its current selection.

It also notifies linked GeneSelects when a user changes its value, or you use a script to fire its `change` event.

Because of how the connection to GeneSelects works, it's recommended you create BreedSelects directly in HTML if you intend to link any GeneSelects to them.

If you choose to create a BreedSelect with a script instead, for best performance you should attach it to the document *before* any of its linked GeneSelects are attached.

For more information, on how linking works, see {@tutorial geneselect}.

## Examples

### HTML

Create a breed dropdown whose default option is "Pick a gene":
```html
<select is="fr-breeds">
    <option>Pick a gene</option>
</select>
```

Create a breed dropdown and link a gene dropdown to it:
```html
<select is="fr-breeds" id="dragon-breed"></select>

<select is="fr-genes" breed="dragon-breed"></select>
```

### Javascript

Create a breed dropdown with three linked gene dropdowns, one for each slot:
```js
const breeds = document.createElement("select", { is: "fr-breeds" });
breeds.id = "breed-1";

const primary = document.createElement("select", { is: "fr-genes" });
primary.setAttribute("breed", breeds.id);

const secondary = document.createElement("select", { is: "fr-genes" });
secondary.setAttribute("breed", breeds.id);
secondary.setAttribute("slot", "secondary");

const tertiary = document.createElement("select", { is: "fr-genes" });
tertiary.setAttribute("breed", breeds.id);
tertiary.setAttribute("slot", "tertiary");

// When creating elements in scripts, you should attach breed dropdowns to the document
// BEFORE their linked gene dropdowns.
document.body.append(breeds, primary, secondary, tertiary);
```
