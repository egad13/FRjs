
The {@link module:fr/forms fr/forms} module provides you with several extensions to the `<select>` tag/`HTMLSelectElement` class which let you place self-populating dropdowns in your HTML markup, or easily create them in Javascript.

For basic setup of the module, see {@tutorial fr-forms}.

This tutorial covers how to use the Automatic Gene Dropdowns. (In the source code, this is the {@link module:fr/forms~GeneSelect GeneSelect} class.)

A dropdown of this type automatically populates itself with options representing Flight Rising's genes. By setting a few attributes, you can add constraints on which slot (primary/secondary/tertiary) and breed to display genes for. You can also link it to a {@link module:fr/forms~BreedSelect BreedSelect} to cause it to dynamically repopulate to reflect the currently chosen breed.

## Basic Usage

After importing the `fr/forms` module, there are two methods for creating a GeneSelect.

### In HTML

To create a `<select>` that uses this functionality in your HTML files, just add the attribute `is="fr-genes"` to the element:
```html
This dropdown will populate with all existing primary genes when the page loads.
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
// The document now has a <select> element with options for all primary genes.
```
<p class="note">
When creating this element in a script, it will only self-populate <strong>after</strong> it's attached to the document. You can't access the self-populated options before attaching it.
</p>

## Custom Attributes

In addition to all standard attributes available for `<select>` elements, `GeneSelect`s support the following custom attributes:

| Attribute     | Type     | Value If Unset     | Description     |
|---------------|----------|--------------------|-----------------|
| **`default`** | string   | "basic"            | Case insensitive. Specifies, by text content, which option should be the default selected option when creating the dropdown and when repopulating it. You can use the text content of any option here, including ones you add yourself. |
| **`slot`**    | "primary" or "secondary" or "tertiary" | "primary" | Puts a slot constraint on this element; ie, will only contain options for either of primary, secondary, or tertiary genes. |
| **`breed-name`** | string | null              | Case insensitive. Puts a breed constraint on this element; ie, it will only contain genes available on the given breed. |
| **`breed`**   | string   | null               | <p>Specifies, by ID, a `BreedSelect` whose value will be used as a breed constraint; ie, it will only contain genes available on that BreedSelect's currently selected breed.</p><p><strong>This attribute takes precedence over `breed-name`.</strong></p> |

## Linking to a Breed Dropdown

Like the Custom Attributes section mentioned, this element has the built-in ability to **automatically repopulate itself** based on what the currently selected option of a {@link module:fr/forms~BreedSelect BreedSelect} is.

For example: If the linked BreedSelect has "Aether" as it's current selection, this element will only contain genes (in the chosen slot) available on Aethers. If the user then selects "Nocturne" in the linked BreedSelect, this element will repopulate itself to only contain genes available on modern breeds.

To use this functionality, make sure the BreedSelect you wish to link to has a a unique `id` attribute, then set this GeneSelect's `breed` attribute to that `id`.

This works similarly to setting the `for` attribute on a `<label>` to the id of the form element it's labeling.

If you intend to create a GeneSelect that's linked to a BreedSelect, the easiest way is with HTML markup.

You can do it with a script instead, but you have to be more careful about the order of operations if you do. For best performance you should set the GeneSelect's attributes before attaching *either* element to the document, and attach the BreedSelect to the document *before* the linked GeneSelect.

## Repopulation Behaviour

The GeneSelect has the unique functionality to automatically repopulate itself when the constraints placed on it change.

The following events will cause a GeneSelect to populate or repopulate itself:

- It gets attached to the document. *(when being created in HTML, or appended with a script)*
- Its attached to the document and the `slot` attribute changes.
- Its attached to the document and the `breed` attribute changes to indicate a BreedSelect which is attached to the document.
- Its attached to the document and the `breed-name` attribute changes, provided there's no *linked* BreedSelect which is attached to the document.
- Its attached to the document and its linked BreedSelect, which is attached to the document, fires a `change` event.
- Its attached to the document and its linked BreedSelect, which was not yet attached to the document, *gets* attached to the document.

In short, if something about it changes while it's on the page, it will generate new options.

For this reason, the simplest and most performant way to place constraints on a GeneSelect, including linking it to a BreedSelect, is to set its attributes in the HTML markup upfront.

If you're creating a GeneSelect with a script, for best performance you should set all the custom attributes you need *before* attaching it to the document, to avoid triggering multiple repopulate events.

If you're also creating its linked BreedSelect with a script, for best performance you should attach the BreedSelect to the document *before* any GeneSelects linked to it; that way you trigger one repopulation event (GeneSelect attached) instead of two (GeneSelect attached, then BreedSelect attached).

<p class="note">
This element marks its automatically generated options with the attribute `data-auto="true"`. When it repopulates, it ONLY removes options that have that attribute. Options you added yourself will be preserved, but will moved to the top of the option list if they weren't there already.
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
