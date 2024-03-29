/**
 * A class for converting the relevant data in scrying workshop links and dragon profile pages into indices in the arrays of module:FRjs/data, and for converting those indices into a functioning scrying workshop link. See the `DragonTraits` class' documentation for more details. See the tutorial for usage examples.
 *
 * @module FRjs/convert
 * @tutorial 07-fr-convert
 * @requires module:FRjs/data
 */

import * as FR from "./data.js";


/** A class representing the traits of a single dragon within the context of FRjs. The class is intended to convert between indices in FRjs/data arrays, dragon profile pages, and scrying workshop links; hence, the trait data is immutable after object construction and all objects should be short-lived.
 *
 * | Tutorials | {@tutorial 07-fr-convert} |
 * |---|-| */
export class DragonTraits {
	#breed = 0;
	#eye = 0;
	#element = 0;
	#gender = 0;
	#age = 0;
	#colour = {primary: 0, secondary: 0, tertiary: 0};
	#gene = {primary: 0, secondary: 0, tertiary: 0};

	/** Returns a {@link module:FRjs/convert.DragonTraits DragonTraits} object containing all the traits defined in the given scrying workshop link.
	 * @param {string} link A scrying workshop link. NOT a link to a saved morphology; a URL for exact morphology parameters.
	 * @returns {DragonTraits} */
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
			element: FR.ELEMENTS.findIndex(x => url.element === x.sid),
			age: FR.AGES.findIndex(x => url.age === x.sid),
			gender: FR.GENDERS.findIndex(x => url.gender === x.sid),
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

	/** Returns a {@link module:FRjs/convert.DragonTraits DragonTraits} object containing all traits defined in the contents of the given dragon profile. Note: gender is not present in text on dragon profiles, and will be the default of Male.
	 * @param {string} profile The text contents of a dragon's profile page. NOT the page HTML; what you get by selecting all text on the page in the browser window and copying it.
	 * @returns {DragonTraits} */
	static fromProfile(profile) {
		const profileRegex = /Primary Gene\n(\w+)\n(\w+)(?: \(\w+\))*\nSecondary Gene\n(\w+)\n(\w+)(?: \(\w+\))*\nTertiary Gene\n(\w+)\n(\w+).*(?:Breed\n){2}(\w+)\n(\w+)\nEye Type\n(?:Special )*Eye Type\n(\w+)\n(\w+)/s;
		const matches = profileRegex.exec(profile.replace(/\r/g, ""));
		// For some reason this age is "Dragon" in the scryshop, and "Adult" on profiles.
		matches[7] = matches[7] === "Adult" ? "Dragon" : matches[7];

		return new DragonTraits({
			breed: FR.BREEDS.findIndex(x => matches[8] === x.name),
			eye: FR.EYES.findIndex(x => matches[10] === x.name),
			element: FR.ELEMENTS.findIndex(x => matches[9] === x.name),
			age: FR.AGES.findIndex(x => matches[7] === x.name),
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

	/** Constructs a formal DragonTraits object from a generic object containing indices in FRjs/data arrays for any/all of a single dragon's traits. Calling the constructor directly is useful for converting traits into scrying workshop links, and for quickly getting the actual data objects for all traits.
	 *
	 * Any traits that are left undefined, or which are invalid, will be set to a default value; index 0 for most traits, and for genes the index of Basic.
	 * @param {{breed: number, eye: number, element: number, gender: number, age: number, colour: {primary: number, secondary: number, tertiary: number}, gene: {primary: number, secondary: number, tertiary: number}}} indices An object defining any/all of a single dragon's traits. It may contain any of the following keys, with values being indices in the appropriate array from {@link module:FRjs/data FRjs/data}:
	 * ```js
	 * {
	 * 	breed: number,
	 * 	eye: number,
	 * 	element: number,
	 * 	gender: number,
	 * 	age: number,
	 * 	colour: {
	 * 		primary: number,
	 * 		secondary: number,
	 * 		tertiary: number
	 * 	},
	 * 	gene: {
	 * 		primary: number,
	 * 		secondary: number,
	 * 		tertiary: number
	 * 	}
	 * } */
	constructor(indices) {
		if (indices.breed in FR.BREEDS) {
			this.#breed = indices.breed;
		}
		if (indices.eye in FR.EYES) {
			this.#eye = indices.eye;
		}
		if (indices.element in FR.ELEMENTS) {
			this.#element = indices.element;
		}
		if (indices.gender in FR.GENDERS) {
			this.#gender = indices.gender;
		}
		if (indices.age in FR.AGES) {
			this.#age = indices.age;
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

	/** Object containing all traits as **indices** in the applicable array from {@link module:FRjs/data FRjs/data}.
	 *
	 * The structure of the object is:
	 * ```js
	 * {
	 * 	breed: number,
	 * 	eye: number,
	 * 	element: number,
	 * 	gender: number,
	 * 	age: number,
	 * 	colour: {
	 * 		primary: number,
	 * 		secondary: number,
	 * 		tertiary: number
	 * 	},
	 * 	gene: {
	 * 		primary: number,
	 * 		secondary: number,
	 * 		tertiary: number
	 * 	}
	 * }
	 * ```
	 * @type {{breed: number, eye: number, element: number, gender: number, age: number, colour: {primary: number, secondary: number, tertiary: number}, gene: {primary: number, secondary: number, tertiary: number}}} */
	get indices() {
		return {
			breed: this.#breed,
			eye: this.#eye,
			element: this.#element,
			gender: this.#gender,
			age: this.#age,
			colour: {...this.#colour},
			gene: {...this.#gene}
		};
	}

	/** An object containing all traits as **data objects** from {@link module:FRjs/data FRjs/data}.
	 *
	 * The structure of the object is:
	 * ```js
	 * {
	 * 	breed: FR.Breed,
	 * 	eye: FR.EyeType,
	 * 	element: FR.BasicTrait,
	 * 	gender: FR.BasicTrait,
	 * 	age: FR.BasicTrait,
	 * 	colour: {
	 * 		primary: FR.Colour,
	 * 		secondary: FR.Colour,
	 * 		tertiary: FR.Colour
	 * 	},
	 * 	gene: {
	 * 		primary: FR.Gene,
	 * 		secondary: FR.Gene,
	 * 		tertiary: FR.Gene
	 * 	}
	 * }
	 * ```
	 * @type {{breed: FR.Breed, eye: FR.EyeType, element: FR.BasicTrait, gender: FR.BasicTrait, age: FR.BasicTrait, colour: {primary: FR.Colour, secondary: FR.Colour, tertiary: FR.Colour}, gene: {primary: FR.Gene, secondary: FR.Gene, tertiary: FR.Gene}}} */
	get values() {
		const idxs = this.indices;
		return {
			breed: FR.BREEDS[idxs.breed],
			eye: FR.EYES[idxs.eye],
			element: FR.ELEMENTS[idxs.element],
			gender: FR.GENDERS[idxs.gender],
			age: FR.AGES[idxs.age],
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

	/** A link to the scrying workshop for a dragon with all defined traits.
	 * @type {string} */
	get scrylink() {
		const bi = this.indices.breed;
		const {breed, eye, element, gender, age, colour, gene} = this.values;
		const params = new URLSearchParams({
			breed: breed.sid,
			gender: gender.sid,
			age: age.sid,
			bodygene: gene.primary.sidForBreed(bi),
			body: colour.primary.sid,
			winggene: gene.secondary.sidForBreed(bi),
			wings: colour.secondary.sid,
			tertgene: gene.tertiary.sidForBreed(bi),
			tert: colour.tertiary.sid,
			element: element.sid,
			eyetype: eye.sid
		});
		return `https://www1.flightrising.com/scrying/predict?${params}`;
	}
}
