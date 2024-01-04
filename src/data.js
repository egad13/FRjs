/**
 * Data about Flight Rising's dragon attributes and breeding mechanics, and utility functions to streamline working with that data.
 * @module FRjs/data
 * @version 0.0.2
 */


///////////////////////////////////////////////////////////////////////////////
// PRIVATE DATA
//
// (As in not relevant to anyone using the module.)
///////////////////////////////////////////////////////////////////////////////

function deepFreeze(obj) {
	const propNames = Reflect.ownKeys(obj);
	for (const name of propNames) {
		const value = obj[name];
		if ((value && typeof value === "object") || typeof value === "function") {
			deepFreeze(value);
		}
	}
	return Object.freeze(obj);
}


// Internal breed type "enum" whose usage minifies smaller than the exported one
const ANCIENT = "A", MODERN = "M";

// Internal rarity "enum" whose usage minifies smaller than the exported one
const PLENTIFUL = "P",
	COMMON = "C",
	UNCOMMON = "U",
	LIMITED = "L",
	RARE = "R";

/** Lookup table for rarity comparisons.
 * [Data Source]{@link https://www1.flightrising.com/forums/gde/2866445#post_43461539}
 * @private */
const RARITY_TABLE = deepFreeze({
	[PLENTIFUL]: {
		[PLENTIFUL]: [0.5, 0.5],
		[COMMON]: [0.7, 0.3],
		[UNCOMMON]: [0.85, 0.15],
		[LIMITED]: [0.97, 0.03],
		[RARE]: [0.99, 0.01]
	},
	[COMMON]: {
		[COMMON]: [0.5, 0.5],
		[UNCOMMON]: [0.75, 0.25],
		[LIMITED]: [0.9, 0.1],
		[RARE]: [0.99, 0.01]
	},
	[UNCOMMON]: {
		[UNCOMMON]: [0.5, 0.5],
		[LIMITED]: [0.85, 0.15],
		[RARE]: [0.98, 0.02]
	},
	[LIMITED]: {
		[LIMITED]: [0.5, 0.5],
		[RARE]: [0.97, 0.03]
	},
	[RARE]: {
		[RARE]: [0.5, 0.5]
	}
});

/** Possible nest sizes and their probabilities of happening.
 * [Data Source]{@link https://flightrising.fandom.com/wiki/Nesting_Grounds#Number_of_Eggs}
 * @private */
const NEST_SIZES = deepFreeze({
	sameBreeds: [
		nest(1, 0.1),
		nest(2, 0.38),
		nest(3, 0.4),
		nest(4, 0.12)
	],
	diffBreeds: [ // ...or ancients
		nest(1, 0.1),
		nest(2, 0.3),
		nest(3, 0.45),
		nest(4, 0.1),
		nest(5, 0.05)
	]
});

///////////////////////////////////////////////////////////////////////////////
// PUBLIC FUNCTIONS
///////////////////////////////////////////////////////////////////////////////

/** Given two rarities to compare, returns an array containing, in order, the probability that `rarity1` occurs and the probability that `rarity2` occurs. If invalid rarities are given, returns `undefined`.
 * @param {module:FRjs/data.Rarity} rarity1
 * @param {module:FRjs/data.Rarity} rarity2
 * @returns {number[]|undefined} */
export function rarityTableLookup(rarity1, rarity2) {
	return RARITY_TABLE[rarity1][rarity2]
		?? [...RARITY_TABLE[rarity2][rarity1]].reverse();
	// spread operator so it doesn't modify original
	// not toReversed() bc recent safari versions lack support
}

/** Compares two objects with rarities from the given array, and returns the probability of the given `target` outcome occurring. If the indexes aren't in the array, or the array members don't have rarities, returns`undefined`.
 * @param {Array<{rarity: module:FRjs/data.Rarity}>} arr An array of objects with a `rarity` property.
 * @param {number} one The index in `arr` of the first possible outcome.
 * @param {number} two The index in `arr` of the second possible outcome.
 * @param {number} target The index in `arr` of the target outcome. Should be identical to either `one` or `two`.
 * @returns {number|undefined} */
export function calcRarityProb(arr, one, two, target) {
	if (!(arr instanceof Array && one in arr && two in arr
		&& "rarity" in arr[one] && "rarity" in arr[two])) {
		return;
	} else if (target !== one && target !== two) {
		return 0;
	} else if (one === two && one === target) {
		return 1;
	}
	const lookup = rarityTableLookup(arr[one].rarity, arr[two].rarity);
	return lookup[(target === one) ? 0 : 1];
}

/** Calculates the length of the shortest range between two colours. If either parameter is not an index in {@link module:FRjs/data.COLOURS FRjs/data.COLOURS}, returns `undefined`.
 * @param {number} one The index of the first colour in the range.
 * @param {number} two The index of the last colour in the range.
 * @returns {number|undefined} */
export function colourRangeLength(one, two) {
	if (!(one in COLOURS && two in COLOURS)) {
		return;
	}
	const absDist = Math.abs(one - two);
	return 1 + Math.min(COLOURS.length - absDist, absDist);
}

/** Returns `true` if the target colour is in the shortest range between two given colours, and `false` if it isn't. If any parameter is not an index in {@link module:FRjs/data.COLOURS FRjs/data.COLOURS}, returns `undefined`. Range includes both end colours.
 * @param {number} one The index of the first colour in the range.
 * @param {number} two The index of the last colour in the range.
 * @param {number} target The index of the target colour.
 * @returns {boolean|undefined} */
export function isColourInRange(one, two, target) {
	if (!(one in COLOURS && two in COLOURS && target in COLOURS)) {
		return;
	}
	const absDist = Math.abs(one - two),
		first = Math.min(one, two),
		last = Math.max(one, two);

	// range does NOT cross array ends
	if (absDist <= COLOURS.length - absDist) {
		return target >= first && target <= last;
	}
	// range DOES cross array ends
	return target <= first || target >= last;
}

/** Returns `true` if the colour range from `target1` to `target2` is a sub-range of the colour range from `one` to `two`, and `false` if not. If any parameter is not an index in {@link module:FRjs/data.COLOURS FRjs/data.COLOURS}, returns `undefined`. Both ranges include both their end colours.
 * @param {number} one The index of the first colour in the parent range.
 * @param {number} two The index of the last colour in the parent range.
 * @param {number} target1 The index of the first colour in the target range.
 * @param {number} target2 The index of the last colour in the target range.
 * @returns {boolean|undefined} */
export function isColourSubrangeInRange(one, two, target1, target2) {
	if (!(one in COLOURS && two in COLOURS && target1 in COLOURS && target2 in COLOURS)) {
		return;
	}
	const absDist = Math.abs(one - two),
		first = Math.min(one, two),
		last = Math.max(one, two),
		targAbsDist = Math.abs(target1 - target2),
		targFirst = Math.min(target1, target2),
		targLast = Math.max(target1, target2);

	// Whether or not the ranges wrap around the ends of the colour wheel array
	const rangeWraps = absDist > COLOURS.length - absDist,
		targWraps = targAbsDist > COLOURS.length - targAbsDist;

	if (rangeWraps && targWraps) {
		return first >= targFirst && targLast >= last;
	} else if (rangeWraps && !targWraps) {
		return (first <= targFirst && targLast < COLOURS.length)
			// eslint-disable-next-line yoda
			|| (0 <= targFirst && targLast <= last);
	} else if (!rangeWraps && targWraps) {
		return false;
	} else if (!rangeWraps && !targWraps) {
		return (first <= targFirst) && (targLast <= last);
	}
}

/** Returns `true` if the two given breeds are compatible for breeding -- meaning either they're both modern breeds, or they're the same ancient breed -- and `false` if they aren't. If either parameter is not an index in {@link module:FRjs/data.BREEDS FRjs/data.BREEDS}, returns `undefined`.
 * @param {number} one The index of the first breed.
 * @param {number} two The index of the second breed.
 * @returns {boolean|undefined} */
export function areBreedsCompatible(one, two) {
	if (!(one in BREEDS && two in BREEDS)) {
		return;
	}
	const b1 = BREEDS[one],
		b2 = BREEDS[two];

	return (b1.type === MODERN && b2.type === MODERN)
		|| (b1 === b2);
}

/** Returns an array containing possible nest sizes and their probabilities if dragons of the two given breeds are nested. If the given breeds are incompatible, or if either parameter is not an index in {@link module:FRjs/data.BREEDS FRjs/data.BREEDS}, returns `undefined`.
 * @param {number} one The index of the first breed.
 * @param {number} two The index of the second breed.
 * @returns {Array<{size: number, probability: number}>|undefined} */
export function nestSizesForBreeds(one, two) {
	if (!(one in BREEDS && two in BREEDS && areBreedsCompatible(one, two))) {
		return;
	}
	const type = BREEDS[one].type;
	return (type === MODERN && one === two)
		? NEST_SIZES.sameBreeds
		: NEST_SIZES.diffBreeds;
}

/** Yields all genes available to a breed in a specific slot. If no breed id or an invalid breed id is provided, ignores restrictions and yields all genes for this slot. If the slot is invalid, yields nothing.
 * @param {"primary"|"secondary"|"tertiary"} slot The slot to retrieve genes for.
 * @param {number} [breed] The index of the breed to retrieve genes for.
 * @yields {{index: number, name: string, rarity: string, modern: boolean, ancient: string[]}}
 * Genes available to the given breed in the given slot. Object structure is:
 * | Property | Type | Description |
 * |---|-|-|
 * | `index` | number | The index of the gene in {@link module:FRjs/data.GENES FRjs/data.GENES} |
 * | `name` | string | Name of the gene |
 * | `rarity` | {@link module:FRjs/data.Rarity} | Rarity of the gene |
 * | `modern` | boolean | Whether or not the gene is available on modern breeds |
 * | `ancient` | number[] | List of ancient breeds (by index) gene is available on | */
export function* genesForBreed(slot, breed) {
	const anyBreed = !(breed in BREEDS);
	if (!["primary", "secondary", "tertiary"].includes(slot)) {
		return;
	}
	const isModern = BREEDS[breed]?.type === MODERN;
	for (let i = 0; i < GENES[slot].length; i++) {
		const gene = GENES[slot][i];
		if (anyBreed || (isModern && gene.modern) || gene.ancient.includes(parseInt(breed))) {
			yield { index: i, ...gene };
		}
	}
}

/** Yields all colours in the shortest range between the two given colours. If either parameter is not an index in {@link module:FRjs/data.COLOURS FRjs/data.COLOURS}, yields nothing.
 * @param {number} one The index of the first colour in the range.
 * @param {number} two The index of the last colour in the range.
 * @yields {{index: number, name: string, hex: string}}
 * Colours in the given range. Object structure is:
 * | Property | Type | Description |
 * |---|-|-|
 * | `index` | number | The index of the colour in {@link module:FRjs/data.COLOURS FRjs/data.COLOURS} |
 * | `name` | string | Name of the colour |
 * | `hex` | string | The hex code for this colour. NOT hash-prefixed. | */
export function* colourRange(one, two) {
	if (!(one in COLOURS && two in COLOURS)) {
		return;
	}
	const absDist = Math.abs(one - two),
		first = Math.min(one, two),
		last = Math.max(one, two),
		out = [];

	// range does NOT cross array ends
	if (absDist <= COLOURS.length - absDist) {
		for (let i = first; i <= last; i++) {
			yield { index: i, ...COLOURS[i] };
		}
	} else { // range DOES cross array ends
		for (let i = last; i < COLOURS.length; i++) {
			yield { index: i, ...COLOURS[i] };
		}
		for (let i = 0; i <= first; i++) {
			yield { index: i, ...COLOURS[i] };
		}
	}
	return out;
}


///////////////////////////////////////////////////////////////////////////////
// PUBLIC DATA
///////////////////////////////////////////////////////////////////////////////

/** Enum for breed types; ie Ancient and Modern.
 * @enum {string}
 * @prop {string} ANCIENT
 * @prop {string} MODERN
 */
export const BreedType = Object.freeze({ ANCIENT, MODERN });

/** Enum for rarities. Every breed and gene has a rarity.
 * @enum {string}
 * @prop {string} PLENTIFUL
 * @prop {string} COMMON
 * @prop {string} UNCOMMON
 * @prop {string} LIMITED
 * @prop {string} RARE
 */
export const Rarity = Object.freeze({ PLENTIFUL, COMMON, UNCOMMON, LIMITED, RARE });

// Definitions ////////////////////////////////////////////////////////////////

// Creating objects repeatedly by returning literals from a function performs
// well and saves a *lot* of file space.

function eye(name, probability) {
	return { name, probability };
}
function breed(name, type, rarity) {
	return { name, type, rarity };
}
function gene(name, rarity, modern, ancient) {
	return { name, rarity, modern, ancient };
}
function colour(name, hex) {
	return { name, hex };
}
function nest(size, probability) {
	return { size, probability };
}

// Data ///////////////////////////////////////////////////////////////////////

/** All possible eye types and their probabilities of occurring. Sorted by probability (descending). [Data Source]{@link https://flightrising.fandom.com/wiki/Eye_Types#Odds}
 * @readonly
 * @type {Array<{name:string,probability:number}>} */
export const EYES = deepFreeze([
	eye("Common", 0.458),
	eye("Uncommon", 0.242),
	eye("Unusual", 0.139),
	eye("Rare", 0.091),
	eye("Bright", 0.022),
	eye("Pastel", 0.021),
	eye("Goat", 0.011),
	eye("Faceted", 0.007),
	eye("Primal", 0.005),
	eye("Multi-Gaze", 0.004)
]);

/** All available breeds, their rarities, and a type specifying if they're ancient or modern. Sorted by name (ascending). [Data Source]{@link https://www1.flightrising.com/wiki/wiki}
 * @readonly
 * @type {Array<{name: string, type: module:FRjs/data.BreedType, rarity: module:FRjs/data.Rarity}>} */
export const BREEDS = deepFreeze([
	breed("Aberration", ANCIENT, COMMON),
	breed("Aether", ANCIENT, COMMON),
	breed("Auraboa", ANCIENT, COMMON),
	breed("Banescale", ANCIENT, COMMON),
	breed("Bogsneak", MODERN, UNCOMMON),
	breed("Coatl", MODERN, RARE),
	breed("Fae", MODERN, PLENTIFUL),
	breed("Gaoler", ANCIENT, COMMON),
	breed("Guardian", MODERN, PLENTIFUL),
	breed("Imperial", MODERN, LIMITED),
	breed("Mirror", MODERN, PLENTIFUL),
	breed("Nocturne", MODERN, LIMITED),
	breed("Obelisk", MODERN, UNCOMMON),
	breed("Pearlcatcher", MODERN, COMMON),
	breed("Ridgeback", MODERN, UNCOMMON),
	breed("Sandsurge", ANCIENT, COMMON),
	breed("Skydancer", MODERN, UNCOMMON),
	breed("Snapper", MODERN, COMMON),
	breed("Spiral", MODERN, COMMON),
	breed("Tundra", MODERN, PLENTIFUL),
	breed("Undertide", ANCIENT, COMMON),
	breed("Veilspun", ANCIENT, COMMON),
	breed("Wildclaw", MODERN, RARE)
]);

// Destructuring ancient breed names offers readability and typo prevention when I have
// to edit genes, and a much smaller file size when aggressively minified.
const [
	ABERRATION,
	AETHER,
	AURABOA,
	BANESCALE,
	GAOLER,
	SANDSURGE,
	UNDERTIDE,
	VEILSPUN
] = BREEDS.map((x, i) => i).filter(i => BREEDS[i].type === ANCIENT);

/** All available genes, organized into primary, secondary, and tertiary slots. Each gene has a name, rarity, boolean indicating if it's available on modern breeds, and list of indices of ancient breeds it's available on (if any). Each slot is sorted by name (ascending). [Data Source]{@link https://www1.flightrising.com/forums/gde/3231610}
 *
 * This object has three properties: `primary`, `secondary`, and `tertiary`. All three of these properties are arrays containing gene objects which have the following structure:
 *
 * | Property | Type | Description |
 * |---|-|-|
 * | `name` | string | Name of the gene |
 * | `rarity` | {@link module:FRjs/data.Rarity} | Rarity of the gene |
 * | `modern` | boolean | Whether or not the gene is available on modern breeds |
 * | `ancient` | number[] | List of ancient breeds (by index) gene is available on |
 * @readonly
 * @type {{primary:Array<{name:string,rarity:module:FRjs/data.Rarity,modern:boolean,ancient:number[]}>,secondary:Array<{name:string,rarity:module:FRjs/data.Rarity,modern:boolean,ancient:number[]}>,tertiary:Array<{name:string,rarity:module:FRjs/data.Rarity,modern:boolean,ancient:number[]}>}} */
export const GENES = deepFreeze({
	primary: [
		gene("Arapaima", COMMON, false, [SANDSURGE]),
		gene("Arc", UNCOMMON, false, [VEILSPUN]),
		gene("Bar", UNCOMMON, true, [ABERRATION, AETHER, AURABOA, BANESCALE, GAOLER, UNDERTIDE, VEILSPUN]),
		gene("Basic", PLENTIFUL, true, [ABERRATION, AETHER, BANESCALE, GAOLER, SANDSURGE, UNDERTIDE, VEILSPUN]),
		gene("Boa", UNCOMMON, true, [ABERRATION, AETHER, AURABOA, BANESCALE, GAOLER, SANDSURGE, UNDERTIDE, VEILSPUN]),
		gene("Boulder", LIMITED, true, [ABERRATION, AETHER, AURABOA, SANDSURGE, UNDERTIDE]),
		gene("Bright", UNCOMMON, false, [VEILSPUN]),
		gene("Candy", LIMITED, false, [AETHER]),
		gene("Candycane", LIMITED, false, [BANESCALE]),
		gene("Caterpillar", COMMON, false, [AURABOA]),
		gene("Checkers", COMMON, false, [UNDERTIDE]),
		gene("Cherub", UNCOMMON, true, [ABERRATION, BANESCALE, SANDSURGE, UNDERTIDE]),
		gene("Chevron", UNCOMMON, false, [BANESCALE]),
		gene("Chrysocolla", LIMITED, true, [SANDSURGE]),
		gene("Cinder", UNCOMMON, true, [ABERRATION, AETHER, BANESCALE, GAOLER, SANDSURGE, UNDERTIDE, VEILSPUN]),
		gene("Clown", COMMON, true, [ABERRATION, AETHER, BANESCALE, GAOLER, SANDSURGE, VEILSPUN]),
		gene("Crystal", RARE, true, [ABERRATION, BANESCALE, GAOLER, UNDERTIDE, VEILSPUN]),
		gene("Diamond", LIMITED, false, [ABERRATION]),
		gene("Fade", COMMON, true, [ABERRATION, AETHER, AURABOA, BANESCALE, GAOLER, SANDSURGE, UNDERTIDE, VEILSPUN]),
		gene("Falcon", COMMON, true, [ABERRATION, AURABOA, BANESCALE, GAOLER, UNDERTIDE, VEILSPUN]),
		gene("Fern", LIMITED, true, [ABERRATION, AURABOA, BANESCALE, VEILSPUN]),
		gene("Flaunt", UNCOMMON, true, [ABERRATION, AETHER, AURABOA, GAOLER, SANDSURGE]),
		gene("Giraffe", UNCOMMON, true, [ABERRATION, AURABOA, BANESCALE, GAOLER, UNDERTIDE, VEILSPUN]),
		gene("Ground", LIMITED, true, [ABERRATION, SANDSURGE]),
		gene("Harlequin", RARE, true, [ABERRATION, AURABOA, SANDSURGE]),
		gene("Iridescent", RARE, true, []),
		gene("Jaguar", UNCOMMON, true, [ABERRATION, AETHER, AURABOA, BANESCALE, GAOLER, SANDSURGE]),
		gene("Jupiter", UNCOMMON, true, [AETHER, SANDSURGE, VEILSPUN]),
		gene("Laced", COMMON, true, [AETHER, AURABOA, BANESCALE, GAOLER, VEILSPUN]),
		gene("Leopard", COMMON, true, [ABERRATION, BANESCALE, GAOLER, VEILSPUN]),
		gene("Lionfish", UNCOMMON, true, [ABERRATION, AETHER, SANDSURGE, UNDERTIDE]),
		gene("Marble", COMMON, false, [BANESCALE]),
		gene("Metallic", RARE, true, [AETHER, AURABOA, BANESCALE]),
		gene("Mochlus", UNCOMMON, false, [AURABOA]),
		gene("Mosaic", UNCOMMON, true, [AETHER, AURABOA, GAOLER, SANDSURGE]),
		gene("Octopus", LIMITED, false, [UNDERTIDE]),
		gene("Orb", LIMITED, false, [ABERRATION, AURABOA]),
		gene("Petals", RARE, true, [AETHER, BANESCALE, VEILSPUN]),
		gene("Phantom", LIMITED, false, [GAOLER]),
		gene("Pharaoh", RARE, true, [ABERRATION, BANESCALE, UNDERTIDE]),
		gene("Piebald", COMMON, true, [AETHER, AURABOA, GAOLER, SANDSURGE]),
		gene("Pinstripe", LIMITED, true, [ABERRATION, BANESCALE, GAOLER, SANDSURGE, UNDERTIDE]),
		gene("Poison", LIMITED, true, [ABERRATION, BANESCALE, GAOLER, UNDERTIDE, VEILSPUN]),
		gene("Python", LIMITED, true, [AETHER, AURABOA]),
		gene("Ragged", UNCOMMON, false, [BANESCALE]),
		gene("Rattlesnake", UNCOMMON, false, [AURABOA, SANDSURGE]),
		gene("Ribbon", UNCOMMON, true, [ABERRATION, BANESCALE, GAOLER, UNDERTIDE]),
		gene("Ripple", UNCOMMON, true, [ABERRATION, AURABOA, BANESCALE, GAOLER, UNDERTIDE]),
		gene("Sailfish", LIMITED, false, [SANDSURGE]),
		gene("Savannah", COMMON, true, [ABERRATION, BANESCALE, GAOLER, SANDSURGE, UNDERTIDE]),
		gene("Shaggy", COMMON, false, [GAOLER]),
		gene("Shell", UNCOMMON, false, [VEILSPUN]),
		gene("Skink", LIMITED, true, [ABERRATION, AETHER, BANESCALE, GAOLER, VEILSPUN]),
		gene("Slime", LIMITED, true, [ABERRATION, GAOLER, SANDSURGE, VEILSPUN]),
		gene("Speckle", COMMON, true, [ABERRATION, BANESCALE, UNDERTIDE, VEILSPUN]),
		gene("Sphinxmoth", UNCOMMON, false, [VEILSPUN]),
		gene("Spool", COMMON, false, [AETHER]),
		gene("Starmap", RARE, true, [ABERRATION, AETHER, AURABOA, VEILSPUN]),
		gene("Stitched", LIMITED, true, [ABERRATION, AETHER, GAOLER, VEILSPUN]),
		gene("Swirl", COMMON, true, [ABERRATION, GAOLER, SANDSURGE, UNDERTIDE]),
		gene("Tapir", COMMON, true, [ABERRATION, AURABOA, BANESCALE, GAOLER, SANDSURGE, VEILSPUN]),
		gene("Tide", LIMITED, true, [ABERRATION, AETHER, BANESCALE, GAOLER, UNDERTIDE]),
		gene("Tiger", COMMON, true, [AURABOA, BANESCALE, GAOLER, SANDSURGE]),
		gene("Twinkle", RARE, false, [AETHER]),
		gene("Varnish", COMMON, false, [AURABOA]),
		gene("Vipera", UNCOMMON, true, [ABERRATION, AURABOA, VEILSPUN]),
		gene("Wasp", RARE, true, [ABERRATION, GAOLER, SANDSURGE, UNDERTIDE, VEILSPUN]),
		gene("Wicker", RARE, false, [AURABOA]),
		gene("Wolf", UNCOMMON, false, [UNDERTIDE]),
		gene("Wrought", COMMON, false, [SANDSURGE])
	],
	secondary: [
		gene("Alloy", RARE, true, [AETHER, AURABOA, BANESCALE]),
		gene("Arowana", COMMON, false, [SANDSURGE]),
		gene("Arrow", UNCOMMON, false, [BANESCALE]),
		gene("Basic", PLENTIFUL, true, [ABERRATION, AETHER, BANESCALE, GAOLER, SANDSURGE, UNDERTIDE, VEILSPUN]),
		gene("Bee", RARE, true, [ABERRATION, GAOLER, SANDSURGE, UNDERTIDE, VEILSPUN]),
		gene("Blaze", UNCOMMON, false, [ABERRATION, AETHER, BANESCALE, GAOLER, SANDSURGE, UNDERTIDE, VEILSPUN]),
		gene("Blend", COMMON, true, [ABERRATION, AETHER, AURABOA, BANESCALE, GAOLER, SANDSURGE, UNDERTIDE, VEILSPUN]),
		gene("Breakup", UNCOMMON, true, [AETHER, AURABOA, GAOLER, SANDSURGE]),
		gene("Butterfly", RARE, true, [AETHER, BANESCALE, VEILSPUN]),
		gene("Chess", COMMON, false, [UNDERTIDE]),
		gene("Clouded", COMMON, true, [ABERRATION, BANESCALE, GAOLER, VEILSPUN]),
		gene("Constellation", RARE, true, [ABERRATION, AETHER, AURABOA, VEILSPUN]),
		gene("Current", UNCOMMON, true, [ABERRATION, AURABOA, BANESCALE, GAOLER, UNDERTIDE]),
		gene("Daub", UNCOMMON, true, [ABERRATION, AETHER, AURABOA, BANESCALE, GAOLER, UNDERTIDE, VEILSPUN]),
		gene("Diamondback", UNCOMMON, false, [AURABOA, SANDSURGE]),
		gene("Edged", COMMON, true, [AETHER, AURABOA, BANESCALE, GAOLER, VEILSPUN]),
		gene("Eel", UNCOMMON, true, [ABERRATION, BANESCALE, GAOLER, UNDERTIDE]),
		gene("Eye Spots", "C", true, [ABERRATION, AETHER, BANESCALE, GAOLER, SANDSURGE, VEILSPUN]),
		gene("Facet", RARE, true, [ABERRATION, BANESCALE, GAOLER, UNDERTIDE, VEILSPUN]),
		gene("Fissure", LIMITED, true, [ABERRATION, SANDSURGE]),
		gene("Flair", UNCOMMON, true, [ABERRATION, AETHER, AURABOA, GAOLER, SANDSURGE]),
		gene("Flicker", RARE, false, [AETHER]),
		gene("Foam", LIMITED, true, [ABERRATION, AETHER, BANESCALE, GAOLER, UNDERTIDE]),
		gene("Freckle", COMMON, true, [ABERRATION, BANESCALE, UNDERTIDE, VEILSPUN]),
		gene("Hawkmoth", UNCOMMON, false, [VEILSPUN]),
		gene("Hex", UNCOMMON, true, [ABERRATION, AURABOA, BANESCALE, GAOLER, UNDERTIDE, VEILSPUN]),
		gene("Hypnotic", UNCOMMON, true, [ABERRATION, AURABOA, VEILSPUN]),
		gene("Icing", LIMITED, false, [AETHER]),
		gene("Jester", RARE, true, [ABERRATION, AURABOA, SANDSURGE]),
		gene("Larvae", COMMON, false, [AURABOA]),
		gene("Lacquer", COMMON, false, [AURABOA]),
		gene("Loop", UNCOMMON, false, [VEILSPUN]),
		gene("Malachite", LIMITED, true, [SANDSURGE]),
		gene("Marbled", COMMON, true, [ABERRATION, GAOLER, SANDSURGE, UNDERTIDE]),
		gene("Marlin", LIMITED, false, [SANDSURGE]),
		gene("Morph", LIMITED, true, [AETHER, AURABOA]),
		gene("Mottle", COMMON, false, [BANESCALE]),
		gene("Myrid", LIMITED, true, [ABERRATION, AETHER, AURABOA, SANDSURGE, UNDERTIDE]),
		gene("Noxtide", UNCOMMON, true, [ABERRATION, AETHER, SANDSURGE, UNDERTIDE]),
		gene("Pack", UNCOMMON, false, [UNDERTIDE]),
		gene("Paint", COMMON, true, [AETHER, AURABOA, GAOLER, SANDSURGE]),
		gene("Paisley", LIMITED, true, [ABERRATION, AURABOA, BANESCALE, VEILSPUN]),
		gene("Patchwork", LIMITED, true, [ABERRATION, AETHER, GAOLER, VEILSPUN]),
		gene("Peregrine", COMMON, true, [ABERRATION, AURABOA, BANESCALE, GAOLER, UNDERTIDE, VEILSPUN]),
		gene("Rings", LIMITED, false, [UNDERTIDE]),
		gene("Riopa", UNCOMMON, false, [AURABOA]),
		gene("Rosette", UNCOMMON, true, [ABERRATION, AETHER, AURABOA, BANESCALE, GAOLER, SANDSURGE]),
		gene("Saddle", UNCOMMON, true, [ABERRATION, AETHER, AURABOA, BANESCALE, GAOLER, SANDSURGE, UNDERTIDE, VEILSPUN]),
		gene("Safari", COMMON, true, [ABERRATION, BANESCALE, GAOLER, SANDSURGE, UNDERTIDE]),
		gene("Sarcophagus", RARE, true, [ABERRATION, BANESCALE, UNDERTIDE]),
		gene("Saturn", UNCOMMON, true, [AETHER, SANDSURGE, VEILSPUN]),
		gene("Seraph", UNCOMMON, true, [ABERRATION, BANESCALE, SANDSURGE, UNDERTIDE]),
		gene("Shimmer", RARE, true, []),
		gene("Sludge", LIMITED, true, [ABERRATION, GAOLER, SANDSURGE, VEILSPUN]),
		gene("Spade", LIMITED, false, [ABERRATION]),
		gene("Spinner", LIMITED, true, [ABERRATION, AETHER, BANESCALE, GAOLER, VEILSPUN]),
		gene("Spire", COMMON, false, [SANDSURGE]),
		gene("Spirit", LIMITED, false, [GAOLER]),
		gene("Streak", COMMON, false, [GAOLER]),
		gene("Striation", COMMON, true, [ABERRATION, AURABOA, BANESCALE, GAOLER, SANDSURGE, VEILSPUN]),
		gene("Stripes", COMMON, true, [AURABOA, BANESCALE, GAOLER, SANDSURGE]),
		gene("Sugarplum", LIMITED, false, [BANESCALE]),
		gene("Tear", UNCOMMON, false, [BANESCALE]),
		gene("Thread", COMMON, false, [AETHER]),
		gene("Toxin", LIMITED, true, [ABERRATION, BANESCALE, GAOLER, UNDERTIDE, VEILSPUN]),
		gene("Trail", LIMITED, true, [ABERRATION, BANESCALE, GAOLER, SANDSURGE, UNDERTIDE]),
		gene("Vivid", UNCOMMON, false, [VEILSPUN]),
		gene("Weaver", LIMITED, false, [ABERRATION, AURABOA]),
		gene("Web", UNCOMMON, false, [VEILSPUN]),
		gene("Woven", RARE, false, [AURABOA])
	],
	tertiary: [
		gene("Angler", LIMITED, false, [GAOLER, VEILSPUN]),
		gene("Augment", RARE, false, [ABERRATION, SANDSURGE]),
		gene("Basic", PLENTIFUL, true, [ABERRATION, AETHER, BANESCALE, GAOLER, SANDSURGE, UNDERTIDE, VEILSPUN]),
		gene("Batty", LIMITED, false, [AURABOA]),
		gene("Beard", UNCOMMON, false, [SANDSURGE]),
		gene("Beetle", LIMITED, false, [VEILSPUN]),
		gene("Blossom", LIMITED, false, [GAOLER]),
		gene("Braids", UNCOMMON, false, [ABERRATION, GAOLER]),
		gene("Branches", LIMITED, false, [AURABOA, SANDSURGE, VEILSPUN]),
		gene("Brightshine", LIMITED, false, [UNDERTIDE, VEILSPUN]),
		gene("Capsule", LIMITED, true, [ABERRATION, AURABOA, BANESCALE, GAOLER, UNDERTIDE, VEILSPUN]),
		gene("Carnivore", LIMITED, false, [ABERRATION, AETHER, BANESCALE, GAOLER, UNDERTIDE, VEILSPUN]),
		gene("Chitin", COMMON, false, [SANDSURGE]),
		gene("Circuit", RARE, true, [AETHER, UNDERTIDE]),
		gene("Contour", COMMON, true, [ABERRATION, AETHER, AURABOA, BANESCALE, GAOLER]),
		gene("Crackle", UNCOMMON, true, [AURABOA, BANESCALE, UNDERTIDE, VEILSPUN]),
		gene("Crest", UNCOMMON, false, [AURABOA, SANDSURGE]),
		gene("Darts", COMMON, false, [SANDSURGE]),
		gene("Diaphanous", RARE, false, [VEILSPUN]),
		gene("Fangs", UNCOMMON, false, [ABERRATION]),
		gene("Fans", RARE, false, [ABERRATION, BANESCALE, GAOLER]),
		gene("Featherbeard", LIMITED, false, [UNDERTIDE]),
		gene("Filigree", RARE, true, [BANESCALE, UNDERTIDE, VEILSPUN]),
		gene("Firebreather", LIMITED, true, [ABERRATION, AURABOA]),
		gene("Firefly", LIMITED, true, [ABERRATION, AURABOA, VEILSPUN]),
		gene("Fishbone", UNCOMMON, false, [AURABOA, SANDSURGE]),
		gene("Flameforger", LIMITED, false, [ABERRATION, BANESCALE]),
		gene("Flecks", LIMITED, true, [ABERRATION, UNDERTIDE, VEILSPUN]),
		gene("Flutter", LIMITED, false, [AETHER]),
		gene("Frills", RARE, false, [ABERRATION]),
		gene("Gembond", UNCOMMON, true, [AETHER, UNDERTIDE]),
		gene("Ghost", UNCOMMON, true, [ABERRATION, BANESCALE, GAOLER, UNDERTIDE, VEILSPUN]),
		gene("Gliders", LIMITED, false, [BANESCALE]),
		gene("Glimmer", RARE, true, [ABERRATION, BANESCALE, GAOLER, VEILSPUN]),
		gene("Glowtail", RARE, true, [ABERRATION, AETHER]),
		gene("Gnarlhorns", RARE, false, [GAOLER]),
		gene("Jewels", RARE, false, [ABERRATION]),
		gene("Keel", LIMITED, true, [AETHER, AURABOA, SANDSURGE]),
		gene("Koi", RARE, true, [ABERRATION, AURABOA, VEILSPUN]),
		gene("Kumo", COMMON, false, [ABERRATION, SANDSURGE]),
		gene("Lace", UNCOMMON, true, [AETHER, BANESCALE, SANDSURGE]),
		gene("Mandibles", LIMITED, false, [AETHER]),
		gene("Medusa", RARE, false, [AURABOA]),
		gene("Monarch", RARE, false, [AETHER, BANESCALE]),
		gene("Mop", RARE, false, [VEILSPUN]),
		gene("Mucous", LIMITED, false, [ABERRATION]),
		gene("Nudibranch", LIMITED, false, [UNDERTIDE]),
		gene("Okapi", UNCOMMON, true, [SANDSURGE, UNDERTIDE, VEILSPUN]),
		gene("Opal", RARE, true, [AURABOA, GAOLER, VEILSPUN]),
		gene("Paradise", UNCOMMON, false, [AURABOA]),
		gene("Peacock", COMMON, true, [ABERRATION, AURABOA, BANESCALE, SANDSURGE, VEILSPUN]),
		gene("Pinions", RARE, false, [GAOLER]),
		gene("Plating", UNCOMMON, false, [UNDERTIDE]),
		gene("Plumage", RARE, false, [AURABOA, BANESCALE]),
		gene("Points", COMMON, true, [AETHER]),
		gene("Polkadot", LIMITED, true, [ABERRATION, AURABOA]),
		gene("Polypore", LIMITED, false, [ABERRATION]),
		gene("Porcupine", LIMITED, false, [AURABOA, BANESCALE]),
		gene("Pufferfish", UNCOMMON, false, [UNDERTIDE]),
		gene("Remora", RARE, false, [UNDERTIDE]),
		gene("Ringlets", UNCOMMON, true, [BANESCALE, GAOLER, UNDERTIDE]),
		gene("Riot", LIMITED, false, [ABERRATION, GAOLER]),
		gene("Rockbreaker", LIMITED, false, [AURABOA, SANDSURGE]),
		gene("Runes", UNCOMMON, true, [GAOLER, UNDERTIDE, VEILSPUN]),
		gene("Sailfin", RARE, false, [AURABOA, UNDERTIDE]),
		gene("Scales", LIMITED, true, [ABERRATION, AETHER, AURABOA]),
		gene("Scorpion", LIMITED, false, [GAOLER]),
		gene("Scuttle", LIMITED, false, [AURABOA]),
		gene("Shardflank", COMMON, false, [GAOLER]),
		gene("Shark", LIMITED, false, [SANDSURGE]),
		gene("Skeletal", LIMITED, false, [ABERRATION, BANESCALE]),
		gene("Smirch", LIMITED, true, [ABERRATION, AETHER, SANDSURGE]),
		gene("Smoke", UNCOMMON, true, [AETHER, AURABOA, GAOLER]),
		gene("Soap", RARE, true, [BANESCALE, SANDSURGE, UNDERTIDE]),
		gene("Space", RARE, false, [AETHER]),
		gene("Sparkle", UNCOMMON, true, [ABERRATION, AETHER, BANESCALE, GAOLER, SANDSURGE, UNDERTIDE, VEILSPUN]),
		gene("Spectre", RARE, false, [SANDSURGE]),
		gene("Spines", UNCOMMON, true, [ABERRATION, AETHER, AURABOA, BANESCALE, SANDSURGE]),
		gene("Squiggle", LIMITED, false, [BANESCALE]),
		gene("Stained", RARE, true, [ABERRATION, AETHER, AURABOA, BANESCALE, GAOLER, SANDSURGE, UNDERTIDE, VEILSPUN]),
		gene("Starfall", LIMITED, false, [AETHER, SANDSURGE]),
		gene("Stinger", UNCOMMON, false, [AETHER, AURABOA]),
		gene("Tentacles", RARE, false, [UNDERTIDE]),
		gene("Terracotta", COMMON, false, [AURABOA]),
		gene("Thorns", UNCOMMON, false, [ABERRATION, AURABOA, VEILSPUN]),
		gene("Thundercrack", LIMITED, false, [GAOLER, SANDSURGE]),
		gene("Thylacine", COMMON, true, [ABERRATION, GAOLER, SANDSURGE]),
		gene("Topcoat", COMMON, false, [AURABOA]),
		gene("Trimmings", COMMON, false, [BANESCALE]),
		gene("Underbelly", COMMON, true, [ABERRATION, AETHER, AURABOA, BANESCALE, GAOLER, SANDSURGE, UNDERTIDE, VEILSPUN]),
		gene("Veined", LIMITED, true, [ABERRATION, GAOLER, UNDERTIDE, VEILSPUN]),
		gene("Weathered", LIMITED, false, [GAOLER]),
		gene("Whiskers", UNCOMMON, false, [AETHER]),
		gene("Willow", UNCOMMON, false, [AURABOA]),
		gene("Wintercoat", UNCOMMON, false, [GAOLER]),
		gene("Wish", RARE, true, [AETHER]),
		gene("Wraith", RARE, false, [BANESCALE])
	]
});

/** All available colours and their hex codes. Hex codes are NOT prefixed. Ordered as they are in-game. Should be treated as a circular array.
 * @readonly
 * @type {Array<{name: string, hex: string}>} */
export const COLOURS = deepFreeze([
	colour("Maize", "fffdea"),
	colour("Cream", "ffefdc"),
	colour("Antique", "d8d6cd"),
	colour("White", "ffffff"),
	colour("Moon", "d8d7d8"),
	colour("Ice", "ebefff"),
	colour("Orca", "e0dfff"),
	colour("Platinum", "c8bece"),
	colour("Silver", "bbbabf"),
	colour("Dust", "9c9c9e"),
	colour("Grey", "808080"),
	colour("Smoke", "9494a9"),
	colour("Gloom", "535264"),
	colour("Lead", "413c3f"),
	colour("Shale", "4d4850"),
	colour("Flint", "626268"),
	colour("Charcoal", "545454"),
	colour("Coal", "4b4946"),
	colour("Oilslick", "342b25"),
	colour("Black", "333333"),
	colour("Obsidian", "1d2224"),
	colour("Eldritch", "252a25"),
	colour("Midnight", "252735"),
	colour("Shadow", "3a2e44"),
	colour("Blackberry", "4b294f"),
	colour("Mulberry", "6e235d"),
	colour("Plum", "853390"),
	colour("Wisteria", "724e7b"),
	colour("Thistle", "8f7c8b"),
	colour("Fog", "a593b0"),
	colour("Mist", "e1ceff"),
	colour("Lavender", "cca4e0"),
	colour("Heather", "9777bd"),
	colour("Purple", "a261cf"),
	colour("Orchid", "d950ff"),
	colour("Amethyst", "993bd0"),
	colour("Nightshade", "782eb2"),
	colour("Violet", "643f9c"),
	colour("Grape", "570fc0"),
	colour("Royal", "4d2c89"),
	colour("Eggplant", "332b65"),
	colour("Iris", "535195"),
	colour("Storm", "757adb"),
	colour("Twilight", "474aa0"),
	colour("Indigo", "2d237a"),
	colour("Sapphire", "0d095b"),
	colour("Navy", "212b5f"),
	colour("Cobalt", "003484"),
	colour("Ultramarine", "1c51e7"),
	colour("Blue", "324ba9"),
	colour("Periwinkle", "4866d5"),
	colour("Lapis", "2b84ff"),
	colour("Splash", "6392df"),
	colour("Cornflower", "75a8ff"),
	colour("Sky", "aec8ff"),
	colour("Stonewash", "7895c1"),
	colour("Overcast", "444f69"),
	colour("Steel", "556979"),
	colour("Denim", "2f4557"),
	colour("Abyss", "0d1e24"),
	colour("Phthalo", "0b2d46"),
	colour("Azure", "0a3d67"),
	colour("Caribbean", "0086ce"),
	colour("Teal", "2b768f"),
	colour("Cerulean", "00b4d6"),
	colour("Cyan", "00fff0"),
	colour("Robin", "9aeaef"),
	colour("Aqua", "72c4c4"),
	colour("Turquoise", "3aa0a1"),
	colour("Spruce", "8bbbb2"),
	colour("Pistachio", "e2ffe6"),
	colour("Seafoam", "b2e2bd"),
	colour("Mint", "9affc7"),
	colour("Jade", "61ab89"),
	colour("Spearmint", "148e67"),
	colour("Thicket", "005e48"),
	colour("Peacock", "1f4739"),
	colour("Emerald", "20603f"),
	colour("Shamrock", "236925"),
	colour("Jungle", "1e361a"),
	colour("Hunter", "1d2715"),
	colour("Forest", "425035"),
	colour("Camo", "51684c"),
	colour("Algae", "97af8b"),
	colour("Swamp", "687f67"),
	colour("Avocado", "567c34"),
	colour("Green", "629c3f"),
	colour("Fern", "7ece73"),
	colour("Mantis", "99ff9c"),
	colour("Pear", "8ecd55"),
	colour("Leaf", "a5e32d"),
	colour("Radioactive", "c6ff00"),
	colour("Honeydew", "d0e672"),
	colour("Peridot", "e8ffb5"),
	colour("Chartreuse", "b4cd3c"),
	colour("Spring", "a9a832"),
	colour("Crocodile", "828335"),
	colour("Olive", "697135"),
	colour("Murk", "4b4420"),
	colour("Moss", "7e7745"),
	colour("Goldenrod", "bea55d"),
	colour("Amber", "c18e1b"),
	colour("Honey", "d1b300"),
	colour("Lemon", "ffe63b"),
	colour("Yellow", "f9e255"),
	colour("Grapefruit", "f7ff6f"),
	colour("Banana", "ffec80"),
	colour("Sanddollar", "ebe7ae"),
	colour("Flaxen", "fde9ae"),
	colour("Ivory", "ffd297"),
	colour("Buttercup", "f6bf6b"),
	colour("Gold", "e8af49"),
	colour("Metals", "d1b046"),
	colour("Marigold", "ffb43b"),
	colour("Sunshine", "fa912b"),
	colour("Saffron", "ff8400"),
	colour("Sunset", "ffa248"),
	colour("Peach", "ffb576"),
	colour("Cantaloupe", "ff984f"),
	colour("Orange", "d5602b"),
	colour("Bronze", "b2560d"),
	colour("Terracotta", "b23b07"),
	colour("Carrot", "ff5500"),
	colour("Fire", "ef5c23"),
	colour("Pumpkin", "ff6840"),
	colour("Tangerine", "ff7360"),
	colour("Cinnamon", "c05a39"),
	colour("Caramel", "c67047"),
	colour("Sand", "b27749"),
	colour("Tan", "c49a70"),
	colour("Beige", "cabba2"),
	colour("Stone", "827a64"),
	colour("Taupe", "6d665a"),
	colour("Slate", "564d48"),
	colour("Driftwood", "766359"),
	colour("Latte", "977b6c"),
	colour("Dirt", "76483f"),
	colour("Clay", "603f3d"),
	colour("Sable", "57372c"),
	colour("Umber", "2f1e1a"),
	colour("Soil", "5a4534"),
	colour("Hickory", "725639"),
	colour("Tarnish", "855c32"),
	colour("Ginger", "90532b"),
	colour("Brown", "8e5b3f"),
	colour("Chocolate", "563012"),
	colour("Auburn", "7b3c1d"),
	colour("Copper", "a44b28"),
	colour("Rust", "8b3220"),
	colour("Tomato", "ba311c"),
	colour("Vermilion", "e22d17"),
	colour("Ruby", "cd000e"),
	colour("Cherry", "aa0024"),
	colour("Crimson", "850012"),
	colour("Garnet", "5b0f14"),
	colour("Sanguine", "2e0002"),
	colour("Blood", "451717"),
	colour("Maroon", "652127"),
	colour("Berry", "8b272c"),
	colour("Red", "c1272d"),
	colour("Strawberry", "de3235"),
	colour("Cerise", "a22929"),
	colour("Carmine", "b13a3a"),
	colour("Brick", "9a534d"),
	colour("Coral", "cc6f6f"),
	colour("Blush", "ffa2a2"),
	colour("Cottoncandy", "eb7997"),
	colour("Watermelon", "db518d"),
	colour("Magenta", "e934aa"),
	colour("Fuchsia", "ec0089"),
	colour("Raspberry", "8a0249"),
	colour("Wine", "4d0f28"),
	colour("Mauve", "9c4875"),
	colour("Pink", "e77fbf"),
	colour("Bubblegum", "eaa9ff"),
	colour("Rose", "ffd6f6"),
	colour("Pearl", "fbe9f8")
]);
