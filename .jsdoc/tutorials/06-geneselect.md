
The {@link module:fr/forms fr/forms} module creates several extensions to the `<select>` tag/`HTMLSelectElement` class which let you place self-populating dropdowns in your HTML markup, or easily create them in Javascript.

For basic setup of the module, see {@tutorial 02-fr-forms}.

This tutorial covers how to use the Automatic Gene Dropdowns. (In the source code, this is the {@link module:fr/forms~GeneSelect GeneSelect} class.)

A dropdown of this type automatically populates itself with options representing Flight Rising's genes. By setting a few attributes, you can add constraints on which slot (primary/secondary/tertiary) and breed to display genes for. You can also link it to a {@link module:fr/forms~BreedSelect BreedSelect} to cause it to dynamically repopulate to reflect the currently chosen breed.

## Basic Usage

After importing the `fr/forms` module, there are two methods for creating a gene dropdown.

### In HTML

To create a `<select>` that uses this functionality in your HTML files, just add the attribute `is="fr-genes"` to the element:
```html
<select is="fr-genes"></select>
```

### In Javascript

To create a `<select>` that uses this functionality in a script:
1. Create a select element with `document.createElement()` and set the `is` option to `fr-genes`.
2. Use `.setAttribute()` to set any of the standard and custom attributes you need. Add any options you want to have in addition to the genes.
3. Attach it to the document.

```js
const geneDropdown = document.createElement("select", { is: "fr-genes" });
document.body.append(geneDropdown);
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

In addition to all standard attributes available for `<select>` elements, gene dropdowns support the following custom attributes:

| Attribute     | Type     | Value If Unset     | Description     |
|---------------|----------|--------------------|-----------------|
| **`default`** | string   | "basic"            | Case insensitive. Specifies, by text content, which option should be the default selected option when creating the dropdown and when repopulating it. You can use the text content of any option here, including ones you add yourself. |
| **`slot`**    | "primary" or "secondary" or "tertiary" | "primary" | Puts a slot constraint on this element; ie, will only contain options for either of primary, secondary, or tertiary genes. |
| **`breed-name`** | string | null              | Case insensitive. Puts a breed constraint on this element; ie, it will only contain genes available on the given breed. |
| **`breed`**   | string   | null               | <p>Specifies, by ID, a breed dropdown whose value will be used as a breed constraint; ie, it will only contain genes available on that breed dropdown's currently selected breed.</p><p><strong>This attribute takes precedence over `breed-name`.</strong></p> |

## Linking to a Breed Dropdown

Like the Custom Attributes section mentioned, this element has the built-in ability to **automatically repopulate itself** based on what the currently selected option of a breed dropdown on the page is.

For example: If the linked breed dropdown has "Aether" as it's current selection, this element will only contain genes available on Aethers. If the user then selects "Nocturne" in the linked breed dropdown, this element will repopulate itself to only contain genes available on modern breeds.

To use this functionality, make sure the breed dropdown you wish to link to has a a unique `id` attribute, then set this gene dropdown's `breed` attribute to that `id`.

This works similarly to setting the `for` attribute on a `<label>` to the id of the form element it's labeling.

If you intend to create a gene dropdown that's linked to a breed dropdown, the easiest way is with HTML markup.

You can do it with a script instead, but you have to be more careful about the order of operations if you do. For best performance you should set the gene dropdown's attributes before attaching *either* element to the document, and attach the breed dropdown to the document *before* the linked gene dropdown.

## Repopulation Behaviour

Gene dropdowns have the ability to automatically repopulate themselves when the constraints placed on them via their custom attributes change.

The following events will cause a gene dropdown to repopulate itself:

- It gets attached to the document. *(when being created in HTML, or appended with a script)*
- The `slot` attribute changes while it's attached to the document.
- The `breed` attribute changes to indicate a breed dropdown which is attached to the document, while the gene dropdown is already attached to the document.
- The `breed-name` attribute changes while it's attached to the document, provided the `breed` attribute is NOT set.
- Its linked breed dropdown, which is currently attached to the document, fires a `change` event while the gene dropdown is already attached to the document.
- Its linked breed dropdown, which was not yet attached to the document, *gets* attached to the document while the gene dropdown is already attached to the document.

In short, if something about it changes while it's on the page, it will generate new options.

For this reason, the simplest and most performant way to place constraints on a gene dropdown, including linking it to a breed dropdown, is to set its attributes in the HTML markup upfront.

If you're creating a gene dropdown with a script, for best performance you should set all the custom attributes you need *before* attaching it to the document, to avoid triggering multiple repopulate events.

If you're also creating its linked breed dropdown with a script, for best performance you should attach the breed dropdown to the document *before* any gene dropdowns linked to it; that way you trigger one repopulation event (gene dropdown attached) instead of two (gene dropdown attached, then breed dropdown attached).

<p class="note">
This element marks its automatically generated options with the attribute <code>data-auto="true"</code>. When it repopulates, it ONLY removes options that have that attribute. Options you added yourself will be preserved, but will moved to the top of the option list if they weren't there already.
</p>

## Examples

### HTML

Create a gene dropdown containing secondary genes for the Aether breed, whose default option is "Basic":
```html
<select is="fr-genes" slot="secondary" breed-name="aether"></select>
```

Create a gene dropdown containing tertiary genes for all breeds, whose default option is "Pick a gene":
```html
<select is="fr-genes" slot="tertiary" default="pick a gene">
    <option>Pick a gene</option>
</select>
```

Create a gene dropdown containing primary genes, whose default option is "Basic", which will match its contents to the current selection of a nearby breed dropdown:
```html
<select is="fr-breeds" id="dragon-breed"></select>

<select is="fr-genes" slot="primary" breed="dragon-breed"></select>
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
