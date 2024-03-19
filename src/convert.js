/**
 * Contains a class for converting the relevant data in scrying workshop links and dragon profile pages into indices in the arrays of module:FRjs/data, and for converting those indices into a functioning scrying workshop link. See the `DragonTraits` class' documentation for more details. See the tutorial for usage examples.
 *
 * @module FRjs/convert
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
	}

	/**
	 * @param {string} profile The text contents of a dragon's profile page. NOT the page HTML; what you get by selecting all text on the page in the browser window and copying it.
	 * @returns {DragonTraits} Object containing all the traits defined in the given profile.
	 */
	static fromProfile(profile) {
	}

	constructor(indices) {
	}

	/** @returns {Object} An object containing all dragon traits as **indices** in the applicable array from {@link module:FRjs/data FRjs/data}.
	 */
	indices() {
	}

	/** @returns {Object} An object containing all dragon traits as **data objects** from {@link module:FRjs/data FRjs/data}. For the exact structure of each data object, see the documentation of the arrays in {@link module:FRjs/data FRjs/data}.
	 */
	values() {
	}

	/** @returns {string} A link to the scrying workshop for a dragon with all defined traits. */
	scrylink() {
	}
}
