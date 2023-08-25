/**
 * Data about Flight Rising's dragon attributes and breeding mechanics, and functions to perform common comparisons of that data.
 * @module fr/data
 * @author egad13
 * @version 0.0.2
 */


///////////////////////////////////////////////////////////////////////////////
// PRIVATE DATA
//
// (As in not relevant to anyone using the module.)
///////////////////////////////////////////////////////////////////////////////

/** Lookup table for rarity comparisons. Letters mean Plentiful, Common, Uncommon,
 * Limited, Rare. [Data Source]{@link https://www1.flightrising.com/forums/gde/2866445#post_43461539}
 * @private */
const rarityTable = {
	P: {
		P: [0.5, 0.5], C: [0.7, 0.3], U: [0.85, 0.15], L: [0.97, 0.03], R: [0.99, 0.01]
	},
	C: {
		C: [0.5, 0.5], U: [0.75, 0.25], L: [0.9, 0.1], R: [0.99, 0.01]
	},
	U: {
		U: [0.5, 0.5], L: [0.85, 0.15], R: [0.98, 0.02]
	},
	L: {
		L: [0.5, 0.5], R: [0.97, 0.03]
	},
	R: {
		R: [0.5, 0.5]
	}
};

/** Possible nest sizes and their probabilities of happening when dragons are nested.
 * [Data Source]{@link https://flightrising.fandom.com/wiki/Nesting_Grounds#Number_of_Eggs}
 * @private */
const nestSizes = {
	sameBreeds: [
		{ eggs: 1, probability: 0.1 },
		{ eggs: 2, probability: 0.38 },
		{ eggs: 3, probability: 0.4 },
		{ eggs: 4, probability: 0.12 }
	],
	diffBreeds: [ // ...or ancients
		{ eggs: 1, probability: 0.1 },
		{ eggs: 2, probability: 0.3 },
		{ eggs: 3, probability: 0.45 },
		{ eggs: 4, probability: 0.1 },
		{ eggs: 5, probability: 0.05 }
	]
};

///////////////////////////////////////////////////////////////////////////////
// PUBLIC FUNCTIONS
///////////////////////////////////////////////////////////////////////////////

/** Looks up the probabilities of both possible outcomes when two rarities are compared. If invalid rarities are given, returns undefined.
 * @param {"P"|"C"|"U"|"L"|"R"} rarity1 The first rarity in the comparison.
 * @param {"P"|"C"|"U"|"L"|"R"} rarity2 The second rarity in the comparison.
 * @returns {number[]|undefined} The probability that each outcome will occur. */
export function rarityTableLookup(rarity1, rarity2) {
	const r1 = rarity1[0].toUpperCase(),
		r2 = rarity2[0].toUpperCase();
	return rarityTable[r1][r2]
		?? [...rarityTable[r2][r1]].reverse();
	// spread operator so it doesn't modify original
	// not toReversed() bc recent safari versions lack support
}

/** Given a pair of possible outcomes with rarities and a target outcome, returns the probability of the target outcome occurring. If the indexes aren't in the array or the array members don't have rarities, `undefined`.
 * @param {Array.<{rarity:("P"|"C"|"U"|"L"|"R")}>} arr An array of objects with rarities.
 * @param {number} one The index of the first possible outcome in `arr`.
 * @param {number} two The index of the second possible outcome in `arr`.
 * @param {number} target The index of the target outcome in `arr`. Should be identical to either `one` or `two`.
 * @returns {number|undefined} The probability of the target outcome occurring. */
export function calcRarityProb(arr, one, two, target) {
	if (!(arr instanceof Array) || !(one in arr && two in arr)
		|| !("rarity" in arr[one] && "rarity" in arr[two])) {
		return;
	}
	if (target !== one && target !== two) {
		return 0;
	}
	if (one === two && one === target) {
		return 1;
	}
	const lookup = rarityTableLookup(arr[one].rarity, arr[two].rarity);
	return lookup[(target === one) ? 0 : 1];
}

/** Calculates the length of the shortest range between two colours. If either parameter is not an index in {@link module:fr/data.colours fr/data.colours}, returns `undefined`.
 * @param {number} one The index (in {@link module:fr/data.colours fr/data.colours}) of the first colour in the range.
 * @param {number} two The index (in {@link module:fr/data.colours fr/data.colours}) of the last colour in the range.
 * @returns {number|undefined} The length of the shortest range between the two colours, `undefined` if either parameter is not an index in {@link module:fr/data.colours fr/data.colours}. */
export function colourRangeLength(one, two) {
	if (!(one in colours && two in colours)) {
		return;
	}
	const absDist = Math.abs(one - two);
	return 1 + Math.min(colours.length - absDist, absDist);
}

/** Checks if the target colour is in the shortest range between two given colours.
 * @param {number} one The index (in {@link module:fr/data.colours fr/data.colours}) of the first colour in the range.
 * @param {number} two The index (in {@link module:fr/data.colours fr/data.colours}) of the last colour in the range.
 * @param {number} target The index of the target colour in the range.
 * @returns {boolean|undefined} `true` if `target` is in the colour range `one`-`two`, `false` if not, `undefined` if any parameter is not an index in {@link module:fr/data.colours fr/data.colours}. */
export function isColourInRange(one, two, target) {
	if (!(one in colours && two in colours && target in colours)) {
		return;
	}
	const absDist = Math.abs(one - two),
		first = Math.min(one, two),
		last = Math.max(one, two);

	// range does NOT cross array ends
	if (absDist <= colours.length - absDist) {
		return target >= first && target <= last;
	}
	// range DOES cross array ends
	return target <= first || target >= last;
}

/** Checks if the shortest range between two target colours is a sub-range of the shortest range between two other colours. Both ranges are inclusive.
 * @param {number} one The index (in {@link module:fr/data.colours fr/data.colours}) of the first colour in the range.
 * @param {number} two The index (in {@link module:fr/data.colours fr/data.colours}) of the last colour in the range.
 * @param {number} target1 The index (in {@link module:fr/data.colours fr/data.colours}) of the first colour in the target range.
 * @param {number} target2 The index (in {@link module:fr/data.colours fr/data.colours}) of the last colour in the target range.
 * @returns {boolean|undefined} `true` if the colour range `target1`-`target2` is a subrange of the colour range `one`-`two`, `false` if not, `undefined` if any parameter is not an index in {@link module:fr/data.colours fr/data.colours}. */
export function isColourSubrangeInRange(one, two, target1, target2) {
	if (!(one in colours && two in colours && target1 in colours && target2 in colours)) {
		return;
	}
	const absDist = Math.abs(one - two),
		first = Math.min(one, two),
		last = Math.max(one, two),
		targAbsDist = Math.abs(target1 - target2),
		targFirst = Math.min(target1, target2),
		targLast = Math.max(target1, target2);

	// Whether or not the ranges wrap around the ends of the colour wheel array
	const rangeWraps = absDist > colours.length - absDist,
		targWraps = targAbsDist > colours.length - targAbsDist;

	if (rangeWraps && targWraps) {
		return first >= targFirst && targLast >= last;
	} else if (rangeWraps && !targWraps) {
		return (first <= targFirst && targLast < colours.length)
			|| (0 <= targFirst && targLast <= last);
	} else if (!rangeWraps && targWraps) {
		return false;
	} else if (!rangeWraps && !targWraps) {
		return (first <= targFirst) && (targLast <= last);
	}
}

/** Checks if the two given breeds are compatible for breeding; meaning either they're both modern breeds, or they're the same ancient breed.
 * @param {number} one The index (in {@link module:fr/data.breeds fr/data.breeds}) of the first breed.
 * @param {number} two The index (in {@link module:fr/data.breeds fr/data.breeds}) of the second breed.
 * @returns {boolean|undefined} `true` if the given breeds are compatible, `false` if they aren't, `undefined` if either parameter is not an index in {@link module:fr/data.breeds fr/data.breeds}. */
export function areBreedsCompatible(one, two) {
	if (!(one in breeds && two in breeds)) {
		return;
	}
	const b1 = breeds[one],
		b2 = breeds[two];

	return (b1.type === "M" && b2.type === "M") || (b1 === b2);
}

/** Returns an array containing possible nest sizes and their probabilities if dragons of the two given breeds are nested.
 * @param {number} one The index (in {@link module:fr/data.breeds fr/data.breeds}) of the first breed.
 * @param {number} one The index (in {@link module:fr/data.breeds fr/data.breeds}) of the second breed.
 * @returns {Array.<{eggs:number,probability:number}>|undefined} An array of possible nest sizes and their probabilities, or `undefined` if either parameter is not an index in {@link module:fr/data.breeds fr/data.breeds}. */
export function nestSizesForBreeds(one, two) {
	if (!(one in breeds && two in breeds && areBreedsCompatible(one, two))) {
		return;
	}
	const type = breeds[one].type;
	return (type === "M" && one === two)
		? nestSizes.sameBreeds
		: nestSizes.diffBreeds;
}

/** Yields all genes available to a breed in a specific slot. If no breed or a non-existent breed is provided, ignores restrictions and yields all genes for this slot. If the slot is invalid, yields nothing.
 * @param {"primary"|"secondary"|"tertiary"} slot The slot to retrieve genes for.
 * @param {number} [breed] The index of the breed to retrieve genes for.
 * @yields {{name:string,rarity:string,modern:boolean,ancient:string[],index:number}}
 *		Genes available to the given breed in the given slot. Object structure is:
 *		`{ name: string, rarity: string, modern: boolean, ancient: string[], index: number }` */
export function* genesForBreed(slot, breed) {
	const anyBreed = !(breed in breeds);
	if (!["primary", "secondary", "tertiary"].includes(slot)) {
		return;
	}
	const isModern = breeds[breed]?.type === "M",
		name = breeds[breed]?.name;
	for (let i = 0; i < genes[slot].length; i++) {
		const gene = genes[slot][i];
		if (anyBreed || (isModern && gene.modern) || gene.ancient.includes(name)) {
			yield { index: i, ...gene };
		}
	}
}

/** Yields all colours in the shortest range between the two given colours. If either parameter is not an index in {@link module:fr/data.colours fr/data.colours}, yields nothing.
 * @param {number} one The index (in {@link module:fr/data.colours fr/data.colours}) of the first colour in the range.
 * @param {number} two The index (in {@link module:fr/data.colours fr/data.colours}) of the last colour in the range.
 * @yields {{name:string,hex:string,index:number}} Colours in the given range. Object structure is:
 *		`{ name: string, hex: string, index: number }` */
export function* colourRange(one, two) {
	if (!(one in colours && two in colours)) {
		return;
	}
	const absDist = Math.abs(one - two),
		first = Math.min(one, two),
		last = Math.max(one, two),
		out = [];

	// range does NOT cross array ends
	if (absDist <= colours.length - absDist) {
		for (let i = first; i <= last; i++) {
			yield { index: i, ...colours[i] };
		}
	} else { // range DOES cross array ends
		for (let i = last; i < colours.length; i++) {
			yield { index: i, ...colours[i] };
		}
		for (let i = 0; i <= first; i++) {
			yield { index: i, ...colours[i] };
		}
	}
	return out;
}


///////////////////////////////////////////////////////////////////////////////
// PUBLIC DATA
///////////////////////////////////////////////////////////////////////////////

/** Plentiful rarity. */
export const PLENTIFUL = "P",
	/** Common rarity. */
	COMMON = "C",
	/** Uncommon rarity. */
	UNCOMMON = "U",
	/** Limited rarity. */
	LIMITED = "L",
	/** Rare rarity. */
	RARE = "R";


// Definitions ////////////////////////////////////////////////////////////////

// Creating objects repeatedly by returning literals from a function performs
// well and saves a *lot* of file space. Everything gets frozen because this
// data is supposed to be completely immutable.

function eye(name, probability) {
	return Object.freeze({ name, probability });
}
function breed(name, type, rarity) {
	return Object.freeze({ name, type, rarity });
}
function gene(name, rarity, modern, ancient) {
	return Object.freeze({ name, rarity, modern, ancient: Object.freeze(ancient) });
}
function colour(name, hex) {
	return Object.freeze({ name, hex });
}

// Data ///////////////////////////////////////////////////////////////////////

/** All possible eye types and their probabilities of occurring. Sorted by probability (descending). [Data Source]{@link https://flightrising.fandom.com/wiki/Eye_Types#Odds}
 * @readonly
 * @type {Array.<{name:string,probability:number}>} */
export const eyes = [
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
];

/** All available breeds, their rarities, and a type specifying if they're ancient or modern. M = modern, A = ancient. Sorted by name (ascending). [Data Source]{@link https://www1.flightrising.com/wiki/wiki}
 * @readonly
 * @type {Array.<{name:string,type:("A"|"M"),rarity:("P"|"C"|"U"|"L"|"R")}>} */
export const breeds = [
	breed("Aberration", "A", COMMON),
	breed("Aether", "A", COMMON),
	breed("Banescale", "A", COMMON),
	breed("Bogsneak", "M", UNCOMMON),
	breed("Coatl", "M", RARE),
	breed("Fae", "M", PLENTIFUL),
	breed("Gaoler", "A", COMMON),
	breed("Guardian", "M", PLENTIFUL),
	breed("Imperial", "M", LIMITED),
	breed("Mirror", "M", PLENTIFUL),
	breed("Nocturne", "M", LIMITED),
	breed("Obelisk", "M", UNCOMMON),
	breed("Pearlcatcher", "M", COMMON),
	breed("Ridgeback", "M", UNCOMMON),
	breed("Sandsurge", "A", COMMON),
	breed("Skydancer", "M", UNCOMMON),
	breed("Snapper", "M", COMMON),
	breed("Spiral", "M", COMMON),
	breed("Tundra", "M", PLENTIFUL),
	breed("Undertide", "A", COMMON),
	breed("Veilspun", "A", COMMON),
	breed("Wildclaw", "M", RARE)
];

/** All available genes, organized into primary, secondary, and tertiary slots. Each gene has a name, rarity, boolean indicating if it's available on modern breeds, and list of ancient breeds it's available on (if any). Each slot is sorted by name (ascending). [Data Source]{@link https://www1.flightrising.com/forums/gde/3231610}
 *
 * The structure of this object is:
 * ```{
 *     primary: { name: string, rarity: ("P"|"C"|"U"|"L"|"R"), modern: boolean, ancient: string[] }[],
 *     secondary: { name: string, rarity: ("P"|"C"|"U"|"L"|"R"), modern: boolean, ancient: string[] }[],
 *     tertiary: { name: string, rarity: ("P"|"C"|"U"|"L"|"R"), modern: boolean, ancient: string[] }[]
 * }```
 * @readonly
 * @type {{primary:Array.<{name:string,rarity:("P"|"C"|"U"|"L"|"R"),modern:boolean,ancient:string[]}>,secondary:Array.<{name:string,rarity:("P"|"C"|"U"|"L"|"R"),modern:boolean,ancient:string[]}>,tertiary:Array.<{name:string,rarity:("P"|"C"|"U"|"L"|"R"),modern:boolean,ancient:string[]}>}} */
export const genes = {
	primary: [
		gene("Arapaima", COMMON, false, ["Sandsurge"]),
		gene("Arc", UNCOMMON, false, ["Veilspun"]),
		gene("Bar", UNCOMMON, true, ["Aberration", "Aether", "Banescale", "Gaoler", "Undertide", "Veilspun"]),
		gene("Basic", PLENTIFUL, true, ["Aberration", "Aether", "Banescale", "Gaoler", "Sandsurge", "Undertide", "Veilspun"]),
		gene("Boa", UNCOMMON, false, ["Gaoler", "Sandsurge", "Undertide"]),
		gene("Boulder", LIMITED, true, ["Aberration", "Aether", "Sandsurge", "Undertide"]),
		gene("Bright", UNCOMMON, false, ["Veilspun"]),
		gene("Candy", LIMITED, false, ["Aether"]),
		gene("Candycane", LIMITED, false, ["Banescale"]),
		gene("Checkers", COMMON, false, ["Undertide"]),
		gene("Cherub", UNCOMMON, true, ["Aberration", "Banescale", "Sandsurge", "Undertide"]),
		gene("Chevron", UNCOMMON, false, ["Banescale"]),
		gene("Cinder", UNCOMMON, true, ["Aberration", "Aether", "Banescale", "Gaoler", "Sandsurge", "Undertide", "Veilspun"]),
		gene("Clown", COMMON, true, ["Aberration", "Aether", "Banescale", "Gaoler", "Sandsurge", "Veilspun"]),
		gene("Crystal", RARE, true, ["Aberration", "Banescale", "Gaoler", "Undertide", "Veilspun"]),
		gene("Diamond", LIMITED, false, ["Aberration"]),
		gene("Fade", COMMON, true, ["Aberration", "Aether", "Banescale", "Gaoler", "Sandsurge", "Undertide", "Veilspun"]),
		gene("Falcon", COMMON, true, ["Aberration", "Banescale", "Gaoler", "Undertide", "Veilspun"]),
		gene("Fern", LIMITED, true, ["Aberration", "Banescale", "Veilspun"]),
		gene("Flaunt", UNCOMMON, true, ["Aberration", "Aether", "Gaoler", "Sandsurge"]),
		gene("Giraffe", UNCOMMON, true, ["Aberration", "Banescale", "Gaoler", "Undertide", "Veilspun"]),
		gene("Ground", LIMITED, true, ["Aberration", "Sandsurge"]),
		gene("Harlequin", RARE, true, ["Aberration", "Sandsurge"]),
		gene("Iridescent", RARE, true, []),
		gene("Jaguar", UNCOMMON, true, ["Aberration", "Aether", "Banescale", "Gaoler", "Sandsurge"]),
		gene("Jupiter", UNCOMMON, true, ["Aether", "Sandsurge", "Veilspun"]),
		gene("Laced", COMMON, true, ["Aether", "Banescale", "Gaoler", "Veilspun"]),
		gene("Leopard", COMMON, true, ["Aberration", "Banescale", "Gaoler", "Veilspun"]),
		gene("Lionfish", UNCOMMON, true, ["Aberration", "Aether", "Sandsurge", "Undertide"]),
		gene("Marble", COMMON, false, ["Banescale"]),
		gene("Metallic", RARE, true, ["Aether", "Banescale"]),
		gene("Mosaic", UNCOMMON, true, ["Aether", "Gaoler", "Sandsurge"]),
		gene("Octopus", LIMITED, false, ["Undertide"]),
		gene("Orb", LIMITED, false, ["Aberration"]),
		gene("Petals", RARE, true, ["Aether", "Banescale", "Veilspun"]),
		gene("Phantom", LIMITED, false, ["Gaoler"]),
		gene("Pharaoh", RARE, true, ["Aberration", "Banescale", "Undertide"]),
		gene("Piebald", COMMON, true, ["Aether", "Gaoler", "Sandsurge"]),
		gene("Pinstripe", LIMITED, true, ["Aberration", "Banescale", "Gaoler", "Sandsurge", "Undertide"]),
		gene("Poison", LIMITED, true, ["Aberration", "Banescale", "Gaoler", "Undertide", "Veilspun"]),
		gene("Python", UNCOMMON, true, ["Aether"]),
		gene("Ragged", UNCOMMON, false, ["Banescale"]),
		gene("Rattlesnake", UNCOMMON, false, ["Sandsurge"]),
		gene("Ribbon", UNCOMMON, true, ["Aberration", "Banescale", "Gaoler", "Undertide"]),
		gene("Ripple", UNCOMMON, true, ["Aberration", "Banescale", "Gaoler", "Undertide"]),
		gene("Sailfish", LIMITED, false, ["Sandsurge"]),
		gene("Savannah", COMMON, true, ["Aberration", "Banescale", "Gaoler", "Sandsurge", "Undertide"]),
		gene("Shaggy", COMMON, false, ["Gaoler"]),
		gene("Shell", UNCOMMON, false, ["Veilspun"]),
		gene("Skink", LIMITED, true, ["Aberration", "Aether", "Banescale", "Gaoler", "Veilspun"]),
		gene("Slime", LIMITED, true, ["Aberration", "Gaoler", "Sandsurge", "Veilspun"]),
		gene("Speckle", COMMON, true, ["Aberration", "Banescale", "Undertide", "Veilspun"]),
		gene("Sphinxmoth", UNCOMMON, false, ["Veilspun"]),
		gene("Spool", COMMON, false, ["Aether"]),
		gene("Starmap", RARE, true, ["Aberration", "Aether", "Veilspun"]),
		gene("Stitched", LIMITED, true, ["Aberration", "Aether", "Gaoler", "Veilspun"]),
		gene("Swirl", COMMON, true, ["Aberration", "Gaoler", "Sandsurge", "Undertide"]),
		gene("Tapir", COMMON, true, ["Aberration", "Banescale", "Gaoler", "Sandsurge", "Veilspun"]),
		gene("Tide", LIMITED, true, ["Aberration", "Aether", "Banescale", "Gaoler", "Undertide"]),
		gene("Tiger", COMMON, true, ["Banescale", "Gaoler", "Sandsurge"]),
		gene("Twinkle", RARE, false, ["Aether"]),
		gene("Vipera", UNCOMMON, true, ["Aberration", "Veilspun"]),
		gene("Wasp", RARE, true, ["Aberration", "Gaoler", "Sandsurge", "Undertide", "Veilspun"]),
		gene("Wolf", UNCOMMON, false, ["Undertide"]),
		gene("Wrought", COMMON, false, ["Sandsurge"])
	],
	secondary: [
		gene("Alloy", RARE, true, ["Aether", "Banescale"]),
		gene("Arowana", COMMON, false, ["Sandsurge"]),
		gene("Arrow", UNCOMMON, false, ["Banescale"]),
		gene("Basic", PLENTIFUL, true, ["Aberration", "Aether", "Banescale", "Gaoler", "Sandsurge", "Undertide", "Veilspun"]),
		gene("Bee", RARE, true, ["Aberration", "Gaoler", "Sandsurge", "Undertide", "Veilspun"]),
		gene("Blaze", UNCOMMON, false, ["Aberration", "Aether", "Banescale", "Gaoler", "Sandsurge", "Undertide", "Veilspun"]),
		gene("Blend", COMMON, true, ["Aberration", "Aether", "Banescale", "Gaoler", "Sandsurge", "Undertide", "Veilspun"]),
		gene("Breakup", UNCOMMON, true, ["Aether", "Gaoler", "Sandsurge"]),
		gene("Butterfly", RARE, true, ["Aether", "Banescale", "Veilspun"]),
		gene("Chess", COMMON, false, ["Undertide"]),
		gene("Clouded", COMMON, true, ["Aberration", "Banescale", "Gaoler", "Veilspun"]),
		gene("Constellation", RARE, true, ["Aberration", "Aether", "Veilspun"]),
		gene("Current", UNCOMMON, true, ["Aberration", "Banescale", "Gaoler", "Undertide"]),
		gene("Daub", UNCOMMON, true, ["Aberration", "Aether", "Banescale", "Gaoler", "Undertide", "Veilspun"]),
		gene("Diamondback", UNCOMMON, false, ["Sandsurge"]),
		gene("Edged", COMMON, true, ["Aether", "Banescale", "Gaoler", "Veilspun"]),
		gene("Eel", UNCOMMON, true, ["Aberration", "Banescale", "Gaoler", "Undertide"]),
		gene("Eye Spots", "C", true, ["Aberration", "Aether", "Banescale", "Gaoler", "Sandsurge", "Veilspun"]),
		gene("Facet", RARE, true, ["Aberration", "Banescale", "Gaoler", "Undertide", "Veilspun"]),
		gene("Fissure", LIMITED, true, ["Aberration", "Sandsurge"]),
		gene("Flair", UNCOMMON, true, ["Aberration", "Aether", "Gaoler", "Sandsurge"]),
		gene("Flicker", RARE, false, ["Aether"]),
		gene("Foam", LIMITED, true, ["Aberration", "Aether", "Banescale", "Gaoler", "Undertide"]),
		gene("Freckle", COMMON, true, ["Aberration", "Banescale", "Undertide", "Veilspun"]),
		gene("Hawkmoth", UNCOMMON, false, ["Veilspun"]),
		gene("Hex", UNCOMMON, true, ["Aberration", "Banescale", "Gaoler", "Undertide", "Veilspun"]),
		gene("Hypnotic", UNCOMMON, true, ["Aberration", "Veilspun"]),
		gene("Icing", LIMITED, false, ["Aether"]),
		gene("Jester", RARE, true, ["Aberration", "Sandsurge"]),
		gene("Loop", UNCOMMON, false, ["Veilspun"]),
		gene("Marbled", COMMON, true, ["Aberration", "Gaoler", "Sandsurge", "Undertide"]),
		gene("Marlin", LIMITED, false, ["Sandsurge"]),
		gene("Morph", UNCOMMON, true, ["Aether"]),
		gene("Mottle", COMMON, false, ["Banescale"]),
		gene("Myrid", LIMITED, true, ["Aberration", "Aether", "Sandsurge", "Undertide"]),
		gene("Noxtide", UNCOMMON, true, ["Aberration", "Aether", "Sandsurge", "Undertide"]),
		gene("Pack", UNCOMMON, false, ["Undertide"]),
		gene("Paint", COMMON, true, ["Aether", "Gaoler", "Sandsurge"]),
		gene("Paisley", LIMITED, true, ["Aberration", "Banescale", "Veilspun"]),
		gene("Patchwork", LIMITED, true, ["Aberration", "Aether", "Gaoler", "Veilspun"]),
		gene("Peregrine", COMMON, true, ["Aberration", "Banescale", "Gaoler", "Undertide", "Veilspun"]),
		gene("Rings", LIMITED, false, ["Undertide"]),
		gene("Rosette", UNCOMMON, true, ["Aberration", "Aether", "Banescale", "Gaoler", "Sandsurge"]),
		gene("Saddle", UNCOMMON, false, ["Gaoler", "Sandsurge", "Undertide"]),
		gene("Safari", COMMON, true, ["Aberration", "Banescale", "Gaoler", "Sandsurge", "Undertide"]),
		gene("Sarcophagus", RARE, true, ["Aberration", "Banescale", "Undertide"]),
		gene("Saturn", UNCOMMON, true, ["Aether", "Sandsurge", "Veilspun"]),
		gene("Seraph", UNCOMMON, true, ["Aberration", "Banescale", "Sandsurge", "Undertide"]),
		gene("Shimmer", RARE, true, []),
		gene("Sludge", LIMITED, true, ["Aberration", "Gaoler", "Sandsurge", "Veilspun"]),
		gene("Spade", LIMITED, false, ["Aberration"]),
		gene("Spinner", LIMITED, true, ["Aberration", "Aether", "Banescale", "Gaoler", "Veilspun"]),
		gene("Spire", COMMON, false, ["Sandsurge"]),
		gene("Spirit", LIMITED, false, ["Gaoler"]),
		gene("Streak", COMMON, false, ["Gaoler"]),
		gene("Striation", COMMON, true, ["Aberration", "Banescale", "Gaoler", "Sandsurge", "Veilspun"]),
		gene("Stripes", COMMON, true, ["Banescale", "Gaoler", "Sandsurge"]),
		gene("Sugarplum", LIMITED, false, ["Banescale"]),
		gene("Tear", UNCOMMON, false, ["Banescale"]),
		gene("Thread", COMMON, false, ["Aether"]),
		gene("Toxin", LIMITED, true, ["Aberration", "Banescale", "Gaoler", "Undertide", "Veilspun"]),
		gene("Trail", LIMITED, true, ["Aberration", "Banescale", "Gaoler", "Sandsurge", "Undertide"]),
		gene("Vivid", UNCOMMON, false, ["Veilspun"]),
		gene("Weaver", LIMITED, false, ["Aberration"]),
		gene("Web", UNCOMMON, false, ["Veilspun"])
	],
	tertiary: [
		gene("Angler", LIMITED, false, ["Gaoler", "Veilspun"]),
		gene("Augment", RARE, false, ["Aberration", "Sandsurge"]),
		gene("Basic", PLENTIFUL, true, ["Aberration", "Aether", "Banescale", "Gaoler", "Sandsurge", "Undertide", "Veilspun"]),
		gene("Beard", UNCOMMON, false, ["Sandsurge"]),
		gene("Beetle", LIMITED, false, ["Veilspun"]),
		gene("Blossom", LIMITED, false, ["Gaoler"]),
		gene("Braids", UNCOMMON, false, ["Aberration", "Gaoler"]),
		gene("Branches", LIMITED, false, ["Sandsurge", "Veilspun"]),
		gene("Brightshine", LIMITED, false, ["Undertide", "Veilspun"]),
		gene("Capsule", LIMITED, true, ["Aberration", "Banescale", "Gaoler", "Undertide", "Veilspun"]),
		gene("Carnivore", LIMITED, false, ["Aberration", "Aether", "Banescale", "Gaoler", "Undertide", "Veilspun"]),
		gene("Chitin", COMMON, false, ["Sandsurge"]),
		gene("Circuit", RARE, true, ["Aether", "Undertide"]),
		gene("Contour", COMMON, true, ["Aberration", "Aether", "Banescale", "Gaoler"]),
		gene("Crackle", UNCOMMON, true, ["Banescale", "Undertide", "Veilspun"]),
		gene("Crest", UNCOMMON, false, ["Sandsurge"]),
		gene("Darts", COMMON, false, ["Sandsurge"]),
		gene("Diaphanous", RARE, false, ["Veilspun"]),
		gene("Fangs", UNCOMMON, false, ["Aberration"]),
		gene("Fans", RARE, false, ["Aberration", "Banescale", "Gaoler"]),
		gene("Featherbeard", LIMITED, false, ["Undertide"]),
		gene("Filigree", RARE, true, ["Banescale", "Undertide", "Veilspun"]),
		gene("Firebreather", LIMITED, true, ["Aberration"]),
		gene("Firefly", LIMITED, true, ["Aberration", "Veilspun"]),
		gene("Fishbone", UNCOMMON, false, ["Sandsurge"]),
		gene("Flecks", UNCOMMON, true, ["Aberration", "Undertide", "Veilspun"]),
		gene("Flutter", LIMITED, false, ["Aether"]),
		gene("Frills", RARE, false, ["Aberration"]),
		gene("Gembond", UNCOMMON, true, ["Aether", "Undertide"]),
		gene("Ghost", UNCOMMON, true, ["Aberration", "Banescale", "Gaoler", "Undertide", "Veilspun"]),
		gene("Gliders", LIMITED, false, ["Banescale"]),
		gene("Glimmer", RARE, true, ["Aberration", "Banescale", "Gaoler", "Veilspun"]),
		gene("Glowtail", RARE, true, ["Aberration", "Aether"]),
		gene("Gnarlhorns", RARE, false, ["Gaoler"]),
		gene("Jewels", RARE, false, ["Aberration"]),
		gene("Keel", LIMITED, true, ["Aether", "Sandsurge"]),
		gene("Koi", RARE, true, ["Aberration", "Veilspun"]),
		gene("Kumo", COMMON, false, ["Aberration", "Sandsurge"]),
		gene("Lace", UNCOMMON, true, ["Aether", "Banescale", "Sandsurge"]),
		gene("Mandibles", LIMITED, false, ["Aether"]),
		gene("Monarch", RARE, false, ["Aether", "Banescale"]),
		gene("Mop", RARE, false, ["Veilspun"]),
		gene("Mucous", LIMITED, false, ["Aberration"]),
		gene("Nudibranch", LIMITED, false, ["Undertide"]),
		gene("Okapi", UNCOMMON, true, ["Sandsurge", "Undertide", "Veilspun"]),
		gene("Opal", RARE, true, ["Gaoler", "Veilspun"]),
		gene("Peacock", COMMON, true, ["Aberration", "Banescale", "Sandsurge", "Veilspun"]),
		gene("Pinions", RARE, false, ["Gaoler"]),
		gene("Plating", UNCOMMON, false, ["Undertide"]),
		gene("Plumage", RARE, false, ["Banescale"]),
		gene("Points", COMMON, true, ["Aether"]),
		gene("Polkadot", LIMITED, true, ["Aberration"]),
		gene("Polypore", LIMITED, false, ["Aberration"]),
		gene("Porcupine", LIMITED, false, ["Banescale"]),
		gene("Pufferfish", UNCOMMON, false, ["Undertide"]),
		gene("Remora", RARE, false, ["Undertide"]),
		gene("Ringlets", UNCOMMON, true, ["Banescale", "Gaoler", "Undertide"]),
		gene("Runes", UNCOMMON, true, ["Gaoler", "Undertide", "Veilspun"]),
		gene("Sailfin", RARE, false, ["Undertide"]),
		gene("Scales", LIMITED, true, ["Aberration", "Aether"]),
		gene("Scorpion", LIMITED, false, ["Gaoler"]),
		gene("Shardflank", COMMON, false, ["Gaoler"]),
		gene("Shark", LIMITED, false, ["Sandsurge"]),
		gene("Skeletal", LIMITED, false, ["Aberration", "Banescale"]),
		gene("Smirch", LIMITED, true, ["Aberration", "Aether", "Sandsurge"]),
		gene("Smoke", UNCOMMON, true, ["Aether", "Gaoler"]),
		gene("Soap", RARE, true, ["Banescale", "Sandsurge", "Undertide"]),
		gene("Space", RARE, false, ["Aether"]),
		gene("Sparkle", UNCOMMON, true, ["Aberration", "Aether", "Banescale", "Gaoler", "Sandsurge", "Undertide", "Veilspun"]),
		gene("Spectre", RARE, false, ["Sandsurge"]),
		gene("Spines", UNCOMMON, true, ["Aberration", "Aether", "Banescale", "Sandsurge"]),
		gene("Squiggle", LIMITED, false, ["Banescale"]),
		gene("Stained", RARE, true, ["Aberration", "Aether", "Banescale", "Gaoler", "Sandsurge", "Undertide", "Veilspun"]),
		gene("Stinger", UNCOMMON, false, ["Aether"]),
		gene("Tentacles", RARE, false, ["Undertide"]),
		gene("Thorns", UNCOMMON, false, ["Aberration", "Veilspun"]),
		gene("Thundercrack", LIMITED, false, ["Gaoler"]),
		gene("Thylacine", COMMON, true, ["Aberration", "Gaoler", "Sandsurge"]),
		gene("Trimmings", COMMON, false, ["Banescale"]),
		gene("Underbelly", COMMON, true, ["Aberration", "Aether", "Banescale", "Gaoler", "Sandsurge", "Undertide", "Veilspun"]),
		gene("Veined", LIMITED, true, ["Aberration", "Gaoler", "Undertide", "Veilspun"]),
		gene("Weathered", LIMITED, false, ["Gaoler"]),
		gene("Whiskers", UNCOMMON, false, ["Aether"]),
		gene("Wintercoat", UNCOMMON, false, ["Gaoler"]),
		gene("Wish", RARE, false, ["Aether"]),
		gene("Wraith", RARE, false, ["Banescale"])
	]
};

/** All available colours and their hex codes. Treat as a circular array. Hex codes are NOT prefixed. Ordered as they are in-game.
 * @readonly
 * @type {Array.<{name:string,hex:string}>} */
export const colours = [
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
];
