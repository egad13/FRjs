/**
 * Contains a class for converting the relevant data in scrying workshop links and dragon profile pages into indices in the arrays of module:FRjs/data, and for converting those indices into a functioning scrying workshop link. See the `DragonTraits` class' documentation for more details. See the tutorial for usage examples.
 *
 * @module FRjs/convert
 * @tutorial 07-fr-convert
 * @requires module:FRjs/data
 */

import * as FR from "./data.js";


/**
 * A class representing the traits of a single dragon within the context of FRjs. The class is intended to convert between indices in FRjs/data arrays, dragon profile pages, and scrying workshop links; hence, the trait data is immutable after object construction and all objects should be short-lived.
 *
 * The constructor does checks to make sure the traits being defined are possible to have on one dragon; however it will not throw an error if an incompatible trait is found. It will just silently set that trait to a default index of 0.
 */
export class DragonTraits {
	#breed = 0;
	#eye = 0;
	#colour = {primary: 0, secondary: 0, tertiary: 0};
	#gene = {primary: 0, secondary: 0, tertiary: 0};

	/**
	 * @param {string} link A scrying workshop link. NOT a link to a saved morphology; a URL for exact morphology parameters.
	 * @returns {DragonTraits|undefined} Object containing all the traits defined in the given scrying link; OR, if the given link could not be parsed, returns undefined.
	 */
	static fromScrylink(link) {
		// UNUSED TRAITS:
		// gender, age, element

		const url = Object.fromEntries((new URL(link)).searchParams);
		for (const k in url) {
			url[k] = parseInt?.(url[k]);
		}

		const breed = FR.BREEDS.findIndex(x => url.breed === x.sid);

		return new DragonTraits({
			breed: breed,
			eye: FR.EYES.findIndex(x => url.eyetype === x.sid),
			colour: {
				primary: FR.COLOURS.findIndex(x => url.body === x.sid),
				secondary: FR.COLOURS.findIndex(x => url.wings === x.sid),
				tertiary: FR.COLOURS.findIndex(x => url.tert === x.sid)
			},
			gene: {
				primary: FR.GENES.primary.findIndex(x => url.bodygene === x.sidForBreed(breed)),
				secondary: FR.GENES.secondary.findIndex(x => url.winggene === x.sidForBreed(breed)),
				tertiary: FR.GENES.tertiary.findIndex(x => url.tertgene === x.sidForBreed(breed))
			}
		});
	}

	/**
	 * @param {string} profile The text contents of a dragon's profile page. NOT the page HTML; what you get by selecting all text on the page in the browser window and copying it.
	 * @returns {DragonTraits} Object containing all the traits defined in the given profile.
	 */
	static fromProfile(profile) {
		// UNUSED MATCHES:
		// 7 = age
		// 9 = element
		// cannot grab gender from this, because it's not present in a profile page copy-paste

		const profileRegex = /Primary Gene\n(\w+)\n(\w+)\nSecondary Gene\n(\w+)\n(\w+)\nTertiary Gene\n(\w+)\n(\w+).*(?:Breed\n){2}(\w+)\n(\w+)\n(?:Eye Type\n){2}(\w+)\n(\w+)/s;
		const matches = profileRegex.exec(profile.replace(/\r/g, ""));

		return new DragonTraits({
			breed: FR.BREEDS.findIndex(x => matches[8] === x.name),
			eye: FR.EYES.findIndex(x => matches[10] === x.name),
			colour: {
				primary: FR.COLOURS.findIndex(x => matches[1] === x.name),
				secondary: FR.COLOURS.findIndex(x => matches[3] === x.name),
				tertiary: FR.COLOURS.findIndex(x => matches[5] === x.name)
			},
			gene: {
				primary: FR.GENES.primary.findIndex(x => matches[2] === x.name),
				secondary: FR.GENES.secondary.findIndex(x => matches[4] === x.name),
				tertiary: FR.GENES.tertiary.findIndex(x => matches[6] === x.name)
			}
		});
	}

	/** Constructs a formal DragonTraits object from a generic object containing indices in FRjs/data arrays for any/all of a single dragon's traits. Calling the constructor directly is useful for ensuring all traits are possible to have on one dragon, converting traits into scrying workshop links, or for quickly getting the actual data objects for all traits.
	 *
	 * Any traits that are left undefined, or which are invalid, will be set to a default value; index 0 for most traits, and for genes the index of Basic.
	 * @param {Object} indices An object defining any/all of a single dragon's traits. The structure is the same as the objects returned by {@link module:FRjs/convert.DragonTraits#indices .indices() method}
	 */
	constructor(indices) {
		if (indices.breed in FR.BREEDS) {
			this.#breed = indices.breed;
		}
		if (indices.eye in FR.EYES) {
			this.#eye = indices.eye;
		}

		// set colours and genes, ignoring any keys in the input that we can't actually use
		for (const slot in FR.GENES) {
			if (indices?.colour?.[slot] in FR.COLOURS) {
				this.#colour[slot] = indices.colour[slot];
			}
		}
		for (const slot in FR.GENES) {
			if (FR.GENES[slot][indices?.gene?.[slot]]?.sidForBreed(this.#breed) !== undefined) {
				this.#gene[slot] = indices.gene[slot];
			}
			else { // default gene is Basic
				this.#gene[slot] = FR.GENES[slot].findIndex(x => x.sids.M === 0);
			}
		}
	}

	/** @returns {Object} An object containing all dragon traits as **indices** in the applicable array from {@link module:FRjs/data FRjs/data}.
	 *
	 * The structure of the returned object is:
	 * ```js
	 * {
	 * 	breed: number
	 * 	eye: number
	 * 	colour: {
	 * 		primary: number
	 * 		secondary: number
	 * 		tertiary: number
	 * 	}
	 * 	gene: {
	 * 		primary: number
	 * 		secondary: number
	 * 		tertiary: number
	 * 	}
	 * }
	 * ```
	 */
	indices() {
		return {
			breed: this.#breed,
			eye: this.#eye,
			colour: {...this.#colour},
			gene: {...this.#gene}
		};
	}

	/** @returns {Object} An object containing all dragon traits as **data objects** from {@link module:FRjs/data FRjs/data}. For the exact structure of each data object, see the documentation of the arrays in {@link module:FRjs/data FRjs/data}.
	 *
	 * The structure of the returned object is:
	 * ```js
	 * {
	 * 	breed: Object
	 * 	eye: Object
	 * 	colour: {
	 * 		primary: Object
	 * 		secondary: Object
	 * 		tertiary: Object
	 * 	}
	 * 	gene: {
	 * 		primary: Object
	 * 		secondary: Object
	 * 		tertiary: Object
	 * 	}
	 * }
	 * ```
	 */
	values() {
		const idxs = this.indices();
		return {
			breed: FR.BREEDS[idxs.breed],
			eye: FR.EYES[idxs.eye],
			colour: {
				primary: FR.COLOURS[idxs.colour.primary],
				secondary: FR.COLOURS[idxs.colour.secondary],
				tertiary: FR.COLOURS[idxs.colour.tertiary]
			},
			gene: {
				primary: FR.GENES.primary[idxs.gene.primary],
				secondary: FR.GENES.secondary[idxs.gene.secondary],
				tertiary: FR.GENES.tertiary[idxs.gene.tertiary]
			}
		};
	}

	/** @returns {string} A link to the scrying workshop for a dragon with all defined traits. */
	scrylink() {
		const bi = this.indices().breed;
		const {breed, eye, colour, gene} = this.values();
		const params = new URLSearchParams({
			breed: breed.sid,
			gender: 0,
			age: 0,
			bodygene: gene.primary.sidForBreed(bi),
			body: colour.primary.sid,
			winggene: gene.secondary.sidForBreed(bi),
			wings: colour.secondary.sid,
			tertgene: gene.tertiary.sidForBreed(bi),
			tert: colour.tertiary.sid,
			element: 0,
			eyetype: eye.sid
		});
		return `https://www1.flightrising.com/scrying/predict?${params}`;
	}
}
