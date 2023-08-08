
import { createElt, triggerEvt } from "../domutils.js";
import * as FR from "./data.js";


/** Determines whether text placed on the given background colour should be black or
 * white for the best readability.
 * @param {string} bgHex Background colour. A non-prefixed 6-digit hex colour code.
 * @returns {string} Whichever of the hex colour codes "000" or "fff" is the easier to
 * read text colour when placed on the given background colour. */
function textColourForBg(bgHex) {
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

/** An "abstract" class, intended only to be extended to create wrapper classes for HTMLSelectElements which automatically populate them with various values from {@link module:frdata}. Child classes should, at *minimum*, create a method `populate()` which fills the wrapped <select> with the appropriate options, and create a constructor which calls the base FRSelect constructor and then calls `this.populate()`. */
class FRSelect {
	/** @type {HTMLSelectElement} */
	#element;
	/** @type {number} */
	#starterOps;

	constructor(element) {
		if (typeof element === "string") {
			this.#element = document.querySelector(element);
			if (!this.#element) {
				throw new Error(`Param 'element' query string '${element}' did not refer to any existing element on the document.`);
			}
		} else {
			this.#element = element;
		}
		if (!(this.#element instanceof HTMLSelectElement)) {
			throw new Error(`Param "element" must be either an HTMLSelectElement, or a query selector which leads to an existing HTMLSelectElement in the document.`);
		}
		this.#starterOps = this.#element.options.length;
	}

	/** The HTMLSelectElement that this object is a wrapper for. */
	get element() {
		return this.#element;
	}
	/** Removes all auto-populated options from the wrapped <select>. Note that any options present in the <select> prior to the creation of this object will NOT be removed.*/
	removeOps() {
		for (let i = this.#element.options.length - 1; i >= this.#starterOps; i--) {
			this.#element.remove(i);
		}
	}
}

/** A wrapper class for an HTMLSelectElement which automatically populates it with options for all eye types available on Flight Rising. */
export class EyeSelect extends FRSelect {
	constructor(element) {
		super(element);
		this.populate();
	}
	populate() {
		for (const [i, eye] of FR.eyes.entries()) {
			this.element.add(createElt("option", { value: i, text: eye.name }));
		}
	}
}

export class ColourSelect extends FRSelect {
	constructor(element) {
		super(element);
		this.populate();
	}
	populate() {
		for (const i in FR.colours) {
			this.element.add( createElt("option", {
				value: i, text: FR.colours[i].name,
				style: `background:#${FR.colours[i].hex};color:#${textColourForBg(FR.colours[i].hex)}`
			}) );
		}
	}
}

export class BreedSelect extends FRSelect {
	#associatedGenes = [];
	#prevBreed = "-1";

	constructor(element) {
		super(element);
		this.populate();
	}

	populate() {
		const modern = createElt("optgroup", { label: "Modern" }),
			ancient = createElt("optgroup", { label: "Ancient" });

		for (const i in FR.breeds) {
			const opt = createElt("option", { value: i, text: FR.breeds[i].name });
			if (FR.breeds[i].type === "M") {
				modern.append(opt);
			} else {
				ancient.append(opt);
			}
		}
		this.element.append(modern, ancient);
		this.#prevBreed = this.element.value;

		this.element.addEventListener("change", evt => {
			if (FR.areBreedsCompatible(this.element.value, this.#prevBreed)) {
				return;
			}
			this.#prevBreed = this.element.value;
			for (const subscriber of this.#associatedGenes) {
				subscriber.repopulate(this.#prevBreed);
			}
		});
	}

	/** Adds a GeneSelect to this object's list of associated genes; meaning that whenever a change event fires on this BreedSelect, the given GeneSelect will repopulate to contain only genes which are compatible with this BreedSelect's chosen breed.
	 * @param {GeneSelect} gene
	 */
	addGene(gene) {
		this.#associatedGenes.push(gene);
		gene.repopulate(this.#prevBreed);
	}
}

export class GeneSelect extends FRSelect {
	#slot;
	#defaultName;
	#breedSelect;
	constructor(element, slot, defaultName = "Basic", breedSelect) {
		super(element);
		this.#slot = slot;
		this.#defaultName = defaultName;
		if (breedSelect) {
			breedSelect.addGene(this);
			this.#breedSelect = breedSelect;
		} else {
			this.populate();
		}
	}

	populate() {
		if (!this.#breedSelect) {
			this.repopulate();
		} else {
			triggerEvt(this.#breedSelect.element, "change");
		}
	}

	repopulate(breed) {
		const oldGene = (this.element.options.length === 0 ? -1 : this.element.value);
		let oldVal, defVal;

		this.removeOps();

		// check if any pre-existing options contained the default
		for (const op of this.element.options) {
			if (op.text == this.#defaultName) {
				defVal = op.value;
				break;
			}
		}

		// add all genes for the given breed and slot
		for (const gene of FR.genesForBreed(this.#slot, breed)) {
			if (gene.index == oldGene) {
				oldVal = gene.index;
			} else if (gene.name === this.#defaultName) {
				defVal = gene.index;
			}
			this.element.add(createElt("option", { value: gene.index, text: gene.name }));
		}
		this.element.value = oldVal ?? defVal;
	}
}