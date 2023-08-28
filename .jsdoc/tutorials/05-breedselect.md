
The {@link module:fr/forms fr/forms} module creates several extensions to the `<select>` tag/`HTMLSelectElement` class which let you place self-populating dropdowns in your HTML markup, or easily create them in Javascript.

For basic setup of the module, see {@tutorial 02-fr-forms}.

This tutorial covers how to use the Automatic Breed Dropdowns. (In the source code, this is the {@link module:fr/forms~BreedSelect BreedSelect} class.)

A dropdown of this type automatically populates itself with options representing Flight Rising's breeds. The options will be separated into Modern and Ancient `<optgroup>`s, and ordered alphabetically.

Any {@link module:fr/forms~GeneSelect GeneSelect} can be set to watch a breed dropdown for changes, and update itself based on the currently selected breed. For more information on how to do that, see {@tutorial 06-geneselect}.

## Basic Usage

After importing the `fr/forms` module, there are two methods for creating a breed dropdown.

### In HTML

To create a `<select>` that uses this functionality in your HTML files, just add the attribute `is="fr-breeds"` to the element:
```html
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
```

## Population and Events

A breed dropdown will only self-populate after two things have happened:
1. The element is attached to the document.
1. The `fr/forms` module has run.

<p class="note">
If you need to access the self-populated options in javascript, you must either wait until the <code>DOMContentLoaded</code> event has fired, or do so in a script which imports <code>fr/forms</code>.
</p>

When being attached to the document, when its selected value is changed, and when its `change` event is fired via javascript, a breed dropdown sends a message which will notify any gene dropdowns linked to it of its new value and tell them to repopulate themselves.

Because of how the connection to gene dropdowns works, it's recommended you create breed dropdowns directly in HTML if you intend to link any gene dropdowns to them.

If you choose to create a breed dropdown with a script instead, for best performance you should attach it to the document *before* any of its linked gene dropdowns are attached.

For more information on how linking works, see {@tutorial 06-geneselect}.

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
<select is="fr-breeds" id="my-dragon-breed"></select>

<select is="fr-genes" breed="my-dragon-breed"></select>
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

// When creating elements in scripts, you should attach breed dropdowns to the
// document BEFORE their linked gene dropdowns.
document.body.append(breeds, primary, secondary, tertiary);
```
