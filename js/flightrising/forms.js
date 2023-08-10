/** This module creates variants of the native HTML `<select>` element which self-populate with different kinds of Flight Rising data. Available variants are `fr-eyes`, `fr-colours`, `fr-breeds`, and `fr-genes`. See the Classes for more detail on each variant.
 *
 * Customized Built-in Elements are not natively supported in Safari, but this module should work in Safari anyway, as it loads a polyfill if CBIE support is not detected.
 *
 * @module fr/forms
 * @requires module:fr/data
 * @author egad13
 * @version 0.0.2
*/

// Polyfill customized built-in elements for safari
let supportsCBI = false;
try {
	document.createElement('div', {
		get is() { supportsCBI = true; }
	});
} catch (e) { console.error(e); }
if (!supportsCBI) {
	await import("https://unpkg.com/@webcomponents/custom-elements");
}

import { createElt } from "../domutils.js";
import * as FR from "./data.js";

/** A customized variant of the `<select>` element which self-populates with options representing all of Flight Rising's eye types, in order of increasing rarity.
 */
class EyeSelect extends HTMLSelectElement {
	#connectedOnce = false;
	connectedCallback() {
		if (this.#connectedOnce) {
			return;
		}
		for (const [i, elt] of FR.eyes.entries()) {
			this.add(createElt("option", { value: i, text: elt.name }));
		}
		this.#connectedOnce = true;
	}
}

/** A customized variant of the `<select>` element which self-populates with options representing all of Flight Rising's colours, in order of the on-site colour wheel.
 */
class ColourSelect extends HTMLSelectElement {
	#connectedOnce = false;
	connectedCallback() {
		if (this.#connectedOnce) {
			return;
		}
		for (const [i, elt] of FR.colours.entries()) {
			this.add(createElt("option", {
				value: i, text: elt.name,
				style: `background:#${elt.hex};color:#${ColourSelect.#textColourForBg(elt.hex)}`
			}));
		}
		this.#connectedOnce = true;
	}

	/** Determines whether text placed on the given background colour should be black or
	 * white for the best readability.
	 * @private
	 * @param {string} bgHex Background colour. A non-prefixed 6-digit hex colour code.
	 * @returns {string} Whichever of the hex colour codes "000" or "fff" is the easier to
	 * read text colour when placed on the given background colour. */
	static #textColourForBg(bgHex) {
		// Convert to RGB
		bgHex = +("0x" + bgHex);
		const r = bgHex >> 16,
			g = bgHex >> 8 & 255,
			b = bgHex & 255;

		// Perceived brightness equation from http://alienryderflex.com/hsp.html
		const perceivedBrightness = Math.sqrt(
			0.299 * (r * r) +
			0.587 * (g * g) +
			0.114 * (b * b)
		);

		if (perceivedBrightness > 110) {
			return "000";
		}
		return "fff";
	}
}

/** A customized variant of the `<select>` element which self-populates with options representing all of Flight Rising's breeds, separated into Modern and Ancient `<optgroup>`s, which are ordered alphabetically.
 */
class BreedSelect extends HTMLSelectElement {
	#associatedGenes = [];
	#prevValue;
	#connectedOnce = false;
	connectedCallback() {
		if (this.#connectedOnce) {
			return;
		}
		const modern = createElt("optgroup", { label: "Modern" }),
			ancient = createElt("optgroup", { label: "Ancient" });
		for (const [i, elt] of FR.breeds.entries()) {
			const opt = createElt("option", { value: i, text: elt.name });
			if (elt.type === "M") {
				modern.append(opt);
			} else {
				ancient.append(opt);
			}
		}
		this.append(modern, ancient);
		this.#prevValue = this.value;

		this.addEventListener("change", evt => {
			if (FR.areBreedsCompatible(this.value, this.#prevValue)) {
				return;
			}
			this.#prevValue = this.value;
			for (const gene of this.#associatedGenes) {
				gene.repopulate();
			}
		});
		this.#connectedOnce = true;
	}

	addGene(gene) {
		if (gene && gene instanceof GeneSelect) {
			this.#associatedGenes.push(gene);
			if (gene.connectedOnce) {
				gene.repopulate();
			}
		}
	}

	removeGene(gene) {
		let idx = this.#associatedGenes.indexOf(gene);
		if (idx > -1) {
			this.#associatedGenes.splice(idx, 1);
		}
	}
}

/** A customized variant of the `<select>` element which self-populates with options representing Flight Rising's genes, ordered alphabetically.
 *  */
class GeneSelect extends HTMLSelectElement {
	#connectedOnce = false;
	#defaultName = "basic";
	#slot = "primary";
	/** @type {BreedSelect?} */
	#breedSelect = null;
	/** @type {string?} */
	#breedName = null;
	get connectedOnce() { return this.#connectedOnce; }
	/** Defines the custom attributes this element supports; `slot`, `breed`, and `default`.
	 * @returns {string[]} */
	static get observedAttributes() { return ["slot", "breed", "default"] }


	attributeChangedCallback(name, oldValue, newValue) {
		if (name === "default") {
			this.#defaultName = newValue ?? "basic";
		}
		else if (name === "breed" && oldValue !== newValue) {
			this.#breedSelect?.removeGene(this);
			this.#breedName = newValue?.toLowerCase();
			this.#breedSelect = document.querySelector(`#${newValue}`);
			this.#breedSelect?.addGene(this);
			if (!this.#breedSelect) {
				this.repopulate();
			}
		}
		else if (name === "slot" && oldValue !== newValue) {
			this.#slot = newValue ?? "primary";
			if (this.#connectedOnce) {
				this.repopulate();
			}
		}
	}

	connectedCallback() {
		if (this.#connectedOnce) {
			return;
		}
		this.repopulate();
		this.#connectedOnce = true;
	}

	repopulate() {
		const oldSelectedVal = (this.length === 0 ? null : this.value);
		let oldVal, defVal;
		let breedVal =
			this.#breedSelect?.value
			??
			FR.breeds.findIndex(x => x.name.toLowerCase() === this.#breedName);

		for (let i = this.length - 1; i >= 0; i--) {
			if (this[i].dataset.auto) { this.remove(i); }
		}

		// Check if any non-auto-generated options are the default
		for (const op of this.options) {
			if (op.text == this.#defaultName) {
				defVal = op.value;
				break;
			}
		}

		// Add all genes for the current slot and breed
		for (const { index, name } of FR.genesForBreed(this.#slot, breedVal)) {
			if (index == oldSelectedVal) { // DON'T do === , select val is a string
				oldVal = index;
			}
			if (name === this.#defaultName) {
				defVal = index;
			}
			const op = createElt("option", { value: index, text: name });
			op.dataset.auto = true;
			this.add(op);
		}
		this.value = oldVal ?? defVal ?? this[0].value;
	}
}

customElements.define("fr-eyes", EyeSelect, { extends: "select" });
customElements.define("fr-colours", ColourSelect, { extends: "select" });
customElements.define("fr-breeds", BreedSelect, { extends: "select" });
customElements.define("fr-genes", GeneSelect, { extends: "select" });
