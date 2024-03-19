The {@link module:FRjs/convert FRjs/convert} module contains the `DragonTraits` class, which can be used to convert scrying workshop links and dragon profile pages into data that's compatible with {@link module:FRjs/data FRjs/data}; and for converting that data back into a scrying workshop link. This tutorial shows you the easiest way to go about making these conversions, and outlines a few other key things to know about the class.

## Basic Usage

In all below examples, assume the following module import is at the top of the script:
```js
import {DragonTraits} from "FRjs/convert.js";
```

### Convert scrying workshop link to FRjs data:
This module can convert a scrying workshop link (as in a link to an exact set of traits, NOT a saved morphology link) into FRjs data.
```js
const url = "https://www1.flightrising.com/scrying/predict?breed=7&gender=0&age=1&bodygene=40&body=125&winggene=2&wings=162&tertgene=5&tert=2&element=1&eyetype=0";

const traits = DragonTraits.fromScrylink(url);

console.log(traits.indices());
/* Expected output: all traits as indices on the arrays in FRjs/data
{
	breed: 18,
	eye: 0,
	colour: { primary: 70, secondary: 136, tertiary: 3 },
	gene: { primary: 29, secondary: 61, tertiary: 92 }
}
*/

console.log(traits.values());
/* Expected output: all traits as data objects from FRjs/data
{
	breed: { name: "Spiral", sid: 7, type: "M", rarity: "C" },
	eye: { name: "Common", sid: 0, probability: 0.458 },
	colour: {
		primary: { name: "Pistachio", sid: 125, hex: "e2ffe6" },
		secondary: { name: "Dirt", sid: 162, hex: "76483f" },
		tertiary: { name: "White", sid: 2, hex: "ffffff" }
	},
	gene: {
		primary: { name: "Leopard", rarity: "C", sids: { ... } },
		secondary: { name: "Stripes", rarity: "C", sids: { ... } },
		tertiary: { name: "Underbelly", rarity: "C", sids: { ... } }
	}
}
*/
```

### Convert dragon profile page contents to FRjs data:
This module can convert the text contents of a dragon's profile page (as in the text you get from going to a dragon's profile, selecting all text with Ctrl+A, and copying it) into FRjs data.
```js
// Full profile contents not shown because copying a profile creates a VERY long string.
const profileContents =
`[...]
Genetics
Primary Gene
White
Tiger
Secondary Gene
White
Shimmer
[...]`;

const traits = DragonTraits.fromProfile(profileContents);
```

### Convert a set of dragon traits into a scrying link

You can take any `DragonTraits` object and convert it back into a scrying workshop link.

```js
import * as FRdata from "FRjs/data.js";

const aetherIndex = FRdata.BREEDS.findIndex(b => b.name === "Aether");
const pistachioIndex = FRdata.COLOURS.findIndex(c => c.name === "Pistachio");

const traits = new DragonTraits({
	breed: aetherIndex,
	colour: { primary: pistachioIndex }
});

const link = traits.scrylink();

console.log(link);
// Expected output:
// https://www1.flightrising.com/scrying/predict?breed=22&gender=0&age=0&bodygene=0&body=125&winggene=0&wings=1&tertgene=0&tert=1&element=0&eyetype=0
```

## Advanced Examples

These are complete, working examples of some potential uses for the `FRjs/convert` module that you can save as an HTML file and run yourself.

Make sure to run these through a local testing server, as per the [note on the docs homepage](/#a-note-on-local-testing).

If your browser doesn't support import maps, you'll have to change the import statements in the code to use the full URL of each file for it to work. (Or, you can add a link to a polyfill for import maps just before the import map script: `<script type="text/javascript" async="" src="https://unpkg.com/es-module-shims@1.8/dist/es-module-shims.js"></script>`)

### Convert `FRjs/forms` dropdowns into a scrying link

This example creates a set of trait dropdowns similar to the ones in the scrying workshop on-site, and generates a working scry link from your chosen options with the click of a button.

```html
<html>
<head>
	<script type="importmap">
		{
			"imports":{
				"FRjs/": "https://cdn.jsdelivr.net/gh/egad13/FRjs@1/dist/"
			}
		}
	</script>
</head>
<body>
	<h2>Input</h2>
	<form>
		<label>Breed: <select is="fr-breeds" id="b"></select></label><br>
		<label>Eye Type: <select is="fr-eyes"></select></label><br>

		<label>Primary Colour: <select is="fr-colours" class="pri"></select></label><br>
		<label>Primary Gene: <select is="fr-genes" slot="primary" breed="b"></select></label><br>

		<label>Secondary Colour: <select is="fr-colours" class="sec"></select></label><br>
		<label>Secondary Gene: <select is="fr-genes" slot="secondary" breed="b"></select></label><br>

		<label>Tertiary Colour: <select is="fr-colours" class="ter"></select></label><br>
		<label>Tertiary Gene: <select is="fr-genes" slot="tertiary" breed="b"></select></label><br>

		<button type="button">Generate Link</button>
	</form>

	<h2>Output</h2>
	<span id="out"></span>

	<script type="module">
		import("FRjs/forms.min.js");
		import * as FR from "FRjs/data.min.js";
		import {DragonTraits} from "FRjs/convert.min.js";

		// Find all the dropdowns
		const breed = document.querySelector("[is=fr-breeds]"),
			eye = document.querySelector("[is=fr-eyes]"),
			priCol = document.querySelector(".pri[is=fr-colours]"),
			priGene = document.querySelector("[is=fr-genes][slot=primary]"),
			secCol = document.querySelector(".sec[is=fr-colours]"),
			secGene = document.querySelector("[is=fr-genes][slot=secondary]"),
			terCol = document.querySelector(".ter[is=fr-colours]"),
			terGene = document.querySelector("[is=fr-genes][slot=tertiary]");

		// Find the button & the output area
		const button = document.querySelector("button"),
			output = document.querySelector("#out");

		// Make the button generate a scrying link
		button.addEventListener("click", () => {
			const traits = new DragonTraits({
				breed: breed.value,
				eye: eye.value,
				colour: {
					primary: priCol.value,
					secondary: secCol.value,
					tertiary: terCol.value
				},
				gene: {
					primary: priGene.value,
					secondary: secGene.value,
					tertiary: terGene.value
				}
			});

			output.innerHTML = traits.scrylink();
		});
	</script>
</body>
</html>
```

### Set `FRjs/forms` dropdown values using a scrying link

This example creates a set of trait dropdowns similar to the ones in the scrying workshop on-site, as well as a field to paste a scrying workshop link. If you paste a scry link into the text field and click the button, it will set all the dropdown values to the traits defined by the scrying link.

```html
<html>
<head>
	<script type="importmap">
		{
			"imports":{
				"FRjs/": "https://cdn.jsdelivr.net/gh/egad13/FRjs@1/dist/"
			}
		}
	</script>
</head>
<body>
	<h2>Input</h2>
	<form>
		<label>Scrying Link: <input type="url"></label><br>
		<button type="button">Set Dropdown Values</button>
	</form>

	<h2>Output</h2>
	<form>
		<label>Breed: <select is="fr-breeds" id="b"></select></label><br>
		<label>Eye Type: <select is="fr-eyes"></select></label><br>

		<label>Primary Colour: <select is="fr-colours" class="pri"></select></label><br>
		<label>Primary Gene: <select is="fr-genes" slot="primary" breed="b"></select></label><br>

		<label>Secondary Colour: <select is="fr-colours" class="sec"></select></label><br>
		<label>Secondary Gene: <select is="fr-genes" slot="secondary" breed="b"></select></label><br>

		<label>Tertiary Colour: <select is="fr-colours" class="ter"></select></label><br>
		<label>Tertiary Gene: <select is="fr-genes" slot="tertiary" breed="b"></select></label><br>
	</form>

	<script type="module">
		import("FRjs/forms.min.js");
		import * as FR from "FRjs/data.min.js";
		import {DragonTraits} from "FRjs/convert.min.js";

		// Find the button & the text input
		const button = document.querySelector("button"),
			input = document.querySelector("input");

		// Find all the dropdowns
		const breed = document.querySelector("[is=fr-breeds]"),
			eye = document.querySelector("[is=fr-eyes]"),
			priCol = document.querySelector(".pri[is=fr-colours]"),
			priGene = document.querySelector("[is=fr-genes][slot=primary]"),
			secCol = document.querySelector(".sec[is=fr-colours]"),
			secGene = document.querySelector("[is=fr-genes][slot=secondary]"),
			terCol = document.querySelector(".ter[is=fr-colours]"),
			terGene = document.querySelector("[is=fr-genes][slot=tertiary]");

		// Make the button set the values of the dropdowns
		button.addEventListener("click", () => {
			const indices = DragonTraits.fromScrylink(input.value)?.indices();

			breed.value = indices.breed;
			eye.value = indices.eye;
			priCol.value = indices.colour.primary;
			priGene.value = indices.gene.primary;
			secCol.value = indices.colour.secondary;
			secGene.value = indices.gene.secondary;
			terCol.value = indices.colour.tertiary;
			terGene.value = indices.gene.tertiary;
		});
	</script>
</body>
</html>
```

