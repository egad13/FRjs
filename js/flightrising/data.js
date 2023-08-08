/**
 * Data about Flight Rising's dragon attributes and breeding mechanics, and functions to perform common comparisons of that data.
 * @module frdata
 * @author egad13
 * @version 0.0.2
 */


/////////////////////////////////////////////////////
// PRIVATE DATA
//
// (Technically not private, but not relevant to
// anyone using the module.)
/////////////////////////////////////////////////////

/** Lookup table for rarity comparisons. Letters mean Plentiful, Common, Uncommon,
 * Limited, Rare. [Data Source]{@link https://www1.flightrising.com/forums/gde/2866445#post_43461539}
 * @private */
const rarity_table = {
	P: {
		P: [0.5, 0.5], C: [0.7, 0.3], U: [0.85, 0.15],
		L: [0.97, 0.03], R: [0.99, 0.01]
	},
	C: {
		C: [0.5, 0.5], U: [0.75, 0.25], L: [0.9, 0.1],
		R: [0.99, 0.01]
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
const nest_sizes = {
	same_breeds: [
		{ eggs: 1, probability: 0.1 },
		{ eggs: 2, probability: 0.38 },
		{ eggs: 3, probability: 0.4 },
		{ eggs: 4, probability: 0.12 }
	],
	diff_breeds: [ // ...or ancients
		{ eggs: 1, probability: 0.1 },
		{ eggs: 2, probability: 0.3 },
		{ eggs: 3, probability: 0.45 },
		{ eggs: 4, probability: 0.1 },
		{ eggs: 5, probability: 0.05 }
	]
};

/////////////////////////////////////////////////////
// PUBLIC FUNCTIONS
/////////////////////////////////////////////////////

/** Looks up the probabilities of both possible outcomes when two rarities are compared. If invalid rarities are given, returns undefined.
 * @param {"P"|"C"|"U"|"L"|"R"} rarity1 The first rarity in the comparison.
 * @param {"P"|"C"|"U"|"L"|"R"} rarity2 The second rarity in the comparison.
 * @returns {number[]|undefined} The probability that each outcome will occur. */
export function rarityTableLookup(rarity1, rarity2) {
	const r1 = rarity1[0].toUpperCase();
	const r2 = rarity2[0].toUpperCase();
	return rarity_table[r1][r2]
		?? [...rarity_table[r2][r1]]?.reverse(); // spread so reverse() doesn't change original table
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

/** Calculates the length of the shortest range between two colours. If either parameter is not an index in {@link FRdata.colours}, returns `undefined`.
 * @param {number} one The index (in {@link FRdata.colours}) of the first colour in the range.
 * @param {number} two The index (in {@link FRdata.colours}) of the last colour in the range.
 * @returns {number|undefined} The length of the shortest range between the two colours, `undefined` if either parameter is not an index in {@link FRdata.colours}. */
export function colourRangeLength(one, two) {
	if (!(one in colours && two in colours)) {
		return;
	}
	const absDist = Math.abs(one - two);
	return 1 + Math.min(colours.length - absDist, absDist);
}

/** Checks if the target colour is in the shortest range between two given colours.
 * @param {number} one The index (in {@link FRdata.colours}) of the first colour in the range.
 * @param {number} two The index (in {@link FRdata.colours}) of the last colour in the range.
 * @param {number} target The index of the target colour in the range.
 * @returns {boolean|undefined} `true` if `target` is in the colour range `one`-`two`, `false` if not, `undefined` if any parameter is not an index in {@link FRdata.colours}. */
export function isColourInRange(one, two, target) {
	if (!(one in colours && two in colours && target in colours)) {
		return;
	}
	const absDist = Math.abs(one - two),
		first = Math.min(one, two),
		last = Math.max(one, two);

	// range does NOT cross array ends
	if (absDist <= colours.length - absDist) {
		return (target >= first && target <= last);
	}
	// range DOES cross array ends
	return (target <= first || target >= last);
}

/** Checks if the shortest range between two target colours is a sub-range of the shortest range between two other colours. Both ranges are inclusive.
 * @param {number} one The index (in {@link FRdata.colours}) of the first colour in the range.
 * @param {number} two The index (in {@link FRdata.colours}) of the last colour in the range.
 * @param {number} target1 The index (in {@link FRdata.colours}) of the first colour in the target range.
 * @param {number} target2 The index (in {@link FRdata.colours}) of the last colour in the target range.
 * @returns {boolean|undefined} `true` if the colour range `target1`-`target2` is a subrange of the colour range `one`-`two`, `false` if not, `undefined` if any parameter is not an index in {@link FRdata.colours}. */
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
	const rangeWraps = (absDist > colours.length - absDist),
		targWraps = (targAbsDist > colours.length - targAbsDist);

	if (rangeWraps && targWraps) {
		return (first >= targFirst) && (targLast >= last);
	}
	else if (rangeWraps && !targWraps) {
		return ((first <= targFirst) && (targLast < colours.length))
			|| ((0 <= targFirst) && (targLast <= last));
	}
	else if (!rangeWraps && targWraps) {
		return false;
	}
	else if (!rangeWraps && !targWraps) {
		return (first <= targFirst) && (targLast <= last);
	}
}

/** Checks if the two given breeds are compatible for breeding; meaning either they're both modern breeds, or they're the same ancient breed.
 * @param {number} one The index (in {@link FRdata.breeds}) of the first breed.
 * @param {number} two The index (in {@link FRdata.breeds}) of the second breed.
 * @returns {boolean|undefined} `true` if the given breeds are compatible, `false` if they aren't, `undefined` if either parameter is not an index in {@link FRdata.breeds}. */
export function areBreedsCompatible(one, two) {
	if (!(one in breeds && two in breeds)) {
		return;
	}
	const b1 = breeds[one],
		b2 = breeds[two];

	return (b1.type === "M" && b2.type === "M") || (b1 === b2);
}

/** Returns an array containing possible nest sizes and their probabilities if dragons of the two given breeds are nested.
 * @param {number} one The index (in {@link FRdata.breeds}) of the first breed.
 * @param {number} one The index (in {@link FRdata.breeds}) of the second breed.
 * @returns {Array.<{eggs:number,probability:number}>|undefined} An array of possible nest sizes and their probabilities, or `undefined` if either parameter is not an index in {@link FRdata.breeds}. */
export function nestSizesForBreeds(one, two) {
	if (!(one in breeds && two in breeds && areBreedsCompatible(one, two))) {
		return;
	}
	const type = breeds[one].type;
	return (type === "M" && one === two)
		? nest_sizes.same_breeds
		: nest_sizes.diff_breeds;
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
	for (var i = 0; i < genes[slot].length; i++) {
		const gene = genes[slot][i];
		if (anyBreed || (isModern && gene.modern) || gene.ancient.includes(name)) {
			yield { index: i, ...gene };
		}
	}
}

/** Yields all colours in the shortest range between the two given colours. If either parameter is not an index in {@link FRdata.colours}, yields nothing.
 * @param {number} one The index (in {@link FRdata.colours}) of the first colour in the range.
 * @param {number} two The index (in {@link FRdata.colours}) of the last colour in the range.
 * @yields {{name:string,hex:string,index:number}} Colours in the given range. Object structure is:
 *		`{ name: string, hex: string, index: number }` */
export function* colourRange(one, two) {
	if (!(one in colours && two in colours)) {
		return;
	}
	const absDist = Math.abs(one - two);
	const first = Math.min(one, two);
	const last = Math.max(one, two);
	var out = [];

	// range does NOT cross array ends
	if (absDist <= colours.length - absDist) {
		for (var i = first; i <= last; i++) {
			yield { index: i, ...colours[i] };
		}
	}
	// range DOES cross array ends
	else {
		for (var i = last; i < colours.length; i++) {
			yield { index: i, ...colours[i] };
		}
		for (var i = 0; i <= first; i++) {
			yield { index: i, ...colours[i] };
		}
	}
	return out;
}


/////////////////////////////////////////////////////
// PUBLIC DATA
/////////////////////////////////////////////////////

// Definitions //////////////////////////////////////

// NOTE: In benchmarks, creating objects repeatedly by returning literals from a function
// performs comparably to defining literals directly, and outperforms classes and
// constructor functions... and it also saves a *lot* of file space, which is why we're
// doing that here.

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

// Data /////////////////////////////////////////////

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
	breed("Aberration", "A", "C"),
	breed("Aether", "A", "C"),
	breed("Banescale", "A", "C"),
	breed("Bogsneak", "M", "U"),
	breed("Coatl", "M", "R"),
	breed("Fae", "M", "P"),
	breed("Gaoler", "A", "C"),
	breed("Guardian", "M", "P"),
	breed("Imperial", "M", "L"),
	breed("Mirror", "M", "P"),
	breed("Nocturne", "M", "L"),
	breed("Obelisk", "M", "U"),
	breed("Pearlcatcher", "M", "C"),
	breed("Ridgeback", "M", "U"),
	breed("Sandsurge", "A", "C"),
	breed("Skydancer", "M", "U"),
	breed("Snapper", "M", "C"),
	breed("Spiral", "M", "C"),
	breed("Tundra", "M", "P"),
	breed("Undertide", "A", "C"),
	breed("Veilspun", "A", "C"),
	breed("Wildclaw", "M", "R")
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
		gene("Arapaima", "C", false, ["Sandsurge"]),
		gene("Arc", "U", false, ["Veilspun"]),
		gene("Bar", "U", true, ["Aberration", "Aether", "Banescale", "Gaoler", "Undertide", "Veilspun"]),
		gene("Basic", "P", true, ["Aberration", "Aether", "Banescale", "Gaoler", "Sandsurge", "Undertide", "Veilspun"]),
		gene("Boa", "U", false, ["Gaoler", "Sandsurge", "Undertide"]),
		gene("Boulder", "L", true, ["Aether", "Sandsurge", "Undertide"]),
		gene("Bright", "U", false, ["Veilspun"]),
		gene("Candy", "L", false, ["Aether"]),
		gene("Candycane", "L", false, ["Banescale"]),
		gene("Checkers", "C", false, ["Undertide"]),
		gene("Cherub", "U", true, ["Banescale", "Sandsurge", "Undertide"]),
		gene("Chevron", "U", false, ["Banescale"]),
		gene("Cinder", "U", true, ["Aberration", "Aether", "Banescale", "Gaoler", "Sandsurge", "Undertide", "Veilspun"]),
		gene("Clown", "C", true, ["Aether", "Banescale", "Gaoler", "Sandsurge", "Veilspun"]),
		gene("Crystal", "R", true, ["Aberration", "Banescale", "Gaoler", "Undertide", "Veilspun"]),
		gene("Diamond", "L", false, ["Aberration"]),
		gene("Fade", "C", true, ["Aberration", "Aether", "Banescale", "Gaoler", "Sandsurge", "Undertide", "Veilspun"]),
		gene("Falcon", "C", true, ["Aberration", "Banescale", "Gaoler", "Undertide", "Veilspun"]),
		gene("Fern", "L", true, ["Banescale", "Veilspun"]),
		gene("Flaunt", "U", true, ["Aberration", "Aether", "Gaoler", "Sandsurge"]),
		gene("Giraffe", "U", true, ["Aberration", "Banescale", "Gaoler", "Undertide", "Veilspun"]),
		gene("Ground", "L", true, ["Aberration", "Sandsurge"]),
		gene("Harlequin", "R", true, ["Sandsurge"]),
		gene("Iridescent", "R", true, []),
		gene("Jaguar", "U", true, ["Aberration", "Aether", "Banescale", "Gaoler", "Sandsurge"]),
		gene("Jupiter", "U", true, ["Aether", "Sandsurge", "Veilspun"]),
		gene("Laced", "C", true, ["Aether", "Banescale", "Gaoler", "Veilspun"]),
		gene("Leopard", "C", true, ["Banescale", "Gaoler", "Veilspun"]),
		gene("Lionfish", "U", true, ["Aberration", "Aether", "Sandsurge", "Undertide"]),
		gene("Marble", "C", false, ["Banescale"]),
		gene("Metallic", "R", true, ["Aether", "Banescale"]),
		gene("Mosaic", "U", true, ["Aether", "Gaoler", "Sandsurge"]),
		gene("Octopus", "L", false, ["Undertide"]),
		gene("Orb", "L", false, ["Aberration"]),
		gene("Petals", "R", true, ["Aether", "Banescale", "Veilspun"]),
		gene("Phantom", "L", false, ["Gaoler"]),
		gene("Pharaoh", "R", true, ["Aberration", "Banescale", "Undertide"]),
		gene("Piebald", "C", true, ["Aether", "Gaoler", "Sandsurge"]),
		gene("Pinstripe", "L", true, ["Banescale", "Gaoler", "Sandsurge", "Undertide"]),
		gene("Poison", "L", true, ["Banescale", "Gaoler", "Undertide", "Veilspun"]),
		gene("Python", "U", true, ["Aether"]),
		gene("Ragged", "U", false, ["Banescale"]),
		gene("Rattlesnake", "U", false, ["Sandsurge"]),
		gene("Ribbon", "U", true, ["Aberration", "Banescale", "Gaoler", "Undertide"]),
		gene("Ripple", "U", true, ["Banescale", "Gaoler", "Undertide"]),
		gene("Sailfish", "L", false, ["Sandsurge"]),
		gene("Savannah", "C", true, ["Aberration", "Banescale", "Gaoler", "Sandsurge", "Undertide"]),
		gene("Shaggy", "C", false, ["Gaoler"]),
		gene("Shell", "U", false, ["Veilspun"]),
		gene("Skink", "L", true, ["Aether", "Banescale", "Gaoler", "Veilspun"]),
		gene("Slime", "L", true, ["Aberration", "Gaoler", "Sandsurge", "Veilspun"]),
		gene("Speckle", "C", true, ["Aberration", "Banescale", "Undertide", "Veilspun"]),
		gene("Sphinxmoth", "U", false, ["Veilspun"]),
		gene("Spool", "C", false, ["Aether"]),
		gene("Starmap", "R", true, ["Aether", "Veilspun"]),
		gene("Stitched", "L", true, ["Aberration", "Aether", "Gaoler", "Veilspun"]),
		gene("Swirl", "C", true, ["Aberration", "Gaoler", "Sandsurge", "Undertide"]),
		gene("Tapir", "C", true, ["Aberration", "Banescale", "Gaoler", "Sandsurge", "Veilspun"]),
		gene("Tide", "L", true, ["Aether", "Banescale", "Gaoler", "Undertide"]),
		gene("Tiger", "C", true, ["Banescale", "Gaoler", "Sandsurge"]),
		gene("Twinkle", "R", false, ["Aether"]),
		gene("Vipera", "U", true, ["Aberration", "Veilspun"]),
		gene("Wasp", "R", true, ["Aberration", "Gaoler", "Sandsurge", "Undertide", "Veilspun"]),
		gene("Wolf", "U", false, ["Undertide"]),
		gene("Wrought", "C", false, ["Sandsurge"])
	],
	secondary: [
		gene("Alloy", "R", true, ["Aether", "Banescale"]),
		gene("Arowana", "C", false, ["Sandsurge"]),
		gene("Arrow", "U", false, ["Banescale"]),
		gene("Basic", "P", true, ["Aberration", "Aether", "Banescale", "Gaoler", "Sandsurge", "Undertide", "Veilspun"]),
		gene("Bee", "R", true, ["Aberration", "Gaoler", "Sandsurge", "Undertide", "Veilspun"]),
		gene("Blaze", "U", false, ["Aberration", "Aether", "Banescale", "Gaoler", "Sandsurge", "Undertide", "Veilspun"]),
		gene("Blend", "C", true, ["Aberration", "Aether", "Banescale", "Gaoler", "Sandsurge", "Undertide", "Veilspun"]),
		gene("Breakup", "U", true, ["Aether", "Gaoler", "Sandsurge"]),
		gene("Butterfly", "R", true, ["Aether", "Banescale", "Veilspun"]),
		gene("Chess", "C", false, ["Undertide"]),
		gene("Clouded", "C", true, ["Banescale", "Gaoler", "Veilspun"]),
		gene("Constellation", "R", true, ["Aether", "Veilspun"]),
		gene("Current", "U", true, ["Banescale", "Gaoler", "Undertide"]),
		gene("Daub", "U", true, ["Aberration", "Aether", "Banescale", "Gaoler", "Undertide", "Veilspun"]),
		gene("Diamondback", "U", false, ["Sandsurge"]),
		gene("Edged", "C", true, ["Aether", "Banescale", "Gaoler", "Veilspun"]),
		gene("Eel", "U", true, ["Aberration", "Banescale", "Gaoler", "Undertide"]),
		gene("Eye Spots", "C", true, ["Aether", "Banescale", "Gaoler", "Sandsurge", "Veilspun"]),
		gene("Facet", "R", true, ["Aberration", "Banescale", "Gaoler", "Undertide", "Veilspun"]),
		gene("Fissure", "L", true, ["Aberration", "Sandsurge"]),
		gene("Flair", "U", true, ["Aberration", "Aether", "Gaoler", "Sandsurge"]),
		gene("Flicker", "R", false, ["Aether"]),
		gene("Foam", "L", true, ["Aether", "Banescale", "Gaoler", "Undertide"]),
		gene("Freckle", "C", true, ["Aberration", "Banescale", "Undertide", "Veilspun"]),
		gene("Hawkmoth", "U", false, ["Veilspun"]),
		gene("Hex", "U", true, ["Aberration", "Banescale", "Gaoler", "Undertide", "Veilspun"]),
		gene("Hypnotic", "U", true, ["Aberration", "Veilspun"]),
		gene("Icing", "L", false, ["Aether"]),
		gene("Jester", "R", true, ["Sandsurge"]),
		gene("Loop", "U", false, ["Veilspun"]),
		gene("Marbled", "C", true, ["Aberration", "Gaoler", "Sandsurge", "Undertide"]),
		gene("Marlin", "L", false, ["Sandsurge"]),
		gene("Morph", "U", true, ["Aether"]),
		gene("Mottle", "C", false, ["Banescale"]),
		gene("Myrid", "L", true, ["Aether", "Sandsurge", "Undertide"]),
		gene("Noxtide", "U", true, ["Aberration", "Aether", "Sandsurge", "Undertide"]),
		gene("Pack", "U", false, ["Undertide"]),
		gene("Paint", "C", true, ["Aether", "Gaoler", "Sandsurge"]),
		gene("Paisley", "L", true, ["Banescale", "Veilspun"]),
		gene("Patchwork", "L", true, ["Aberration", "Aether", "Gaoler", "Veilspun"]),
		gene("Peregrine", "C", true, ["Aberration", "Banescale", "Gaoler", "Undertide", "Veilspun"]),
		gene("Rings", "L", false, ["Undertide"]),
		gene("Rosette", "U", true, ["Aberration", "Aether", "Banescale", "Gaoler", "Sandsurge"]),
		gene("Saddle", "U", false, ["Gaoler", "Sandsurge", "Undertide"]),
		gene("Safari", "C", true, ["Aberration", "Banescale", "Gaoler", "Sandsurge", "Undertide"]),
		gene("Sarcophagus", "R", true, ["Aberration", "Banescale", "Undertide"]),
		gene("Saturn", "U", true, ["Aether", "Sandsurge", "Veilspun"]),
		gene("Seraph", "U", true, ["Banescale", "Sandsurge", "Undertide"]),
		gene("Shimmer", "R", true, []),
		gene("Sludge", "L", true, ["Aberration", "Gaoler", "Sandsurge", "Veilspun"]),
		gene("Spade", "L", false, ["Aberration"]),
		gene("Spinner", "L", true, ["Aether", "Banescale", "Gaoler", "Veilspun"]),
		gene("Spire", "C", false, ["Sandsurge"]),
		gene("Spirit", "L", false, ["Gaoler"]),
		gene("Streak", "C", false, ["Gaoler"]),
		gene("Striation", "C", true, ["Aberration", "Banescale", "Gaoler", "Sandsurge", "Veilspun"]),
		gene("Stripes", "C", true, ["Banescale", "Gaoler", "Sandsurge"]),
		gene("Sugarplum", "L", false, ["Banescale"]),
		gene("Tear", "U", false, ["Banescale"]),
		gene("Thread", "C", false, ["Aether"]),
		gene("Toxin", "L", true, ["Banescale", "Gaoler", "Undertide", "Veilspun"]),
		gene("Trail", "L", true, ["Banescale", "Gaoler", "Sandsurge", "Undertide"]),
		gene("Vivid", "U", false, ["Veilspun"]),
		gene("Weaver", "L", false, ["Aberration"]),
		gene("Web", "U", false, ["Veilspun"])
	],
	tertiary: [
		gene("Angler", "L", false, ["Gaoler", "Veilspun"]),
		gene("Augment", "R", false, ["Sandsurge"]),
		gene("Basic", "P", true, ["Aberration", "Aether", "Banescale", "Gaoler", "Sandsurge", "Undertide", "Veilspun"]),
		gene("Beard", "U", false, ["Sandsurge"]),
		gene("Beetle", "L", false, ["Veilspun"]),
		gene("Blossom", "L", false, ["Gaoler"]),
		gene("Braids", "U", false, ["Gaoler"]),
		gene("Branches", "L", false, ["Sandsurge", "Veilspun"]),
		gene("Brightshine", "L", false, ["Undertide", "Veilspun"]),
		gene("Capsule", "L", true, ["Aberration", "Banescale", "Gaoler", "Undertide", "Veilspun"]),
		gene("Carnivore", "L", false, ["Aberration", "Aether", "Banescale", "Gaoler", "Undertide", "Veilspun"]),
		gene("Chitin", "C", false, ["Sandsurge"]),
		gene("Circuit", "R", true, ["Aether", "Undertide"]),
		gene("Contour", "C", true, ["Aether", "Banescale", "Gaoler"]),
		gene("Crackle", "U", true, ["Banescale", "Undertide", "Veilspun"]),
		gene("Crest", "U", false, ["Sandsurge"]),
		gene("Darts", "C", false, ["Sandsurge"]),
		gene("Diaphanous", "R", false, ["Veilspun"]),
		gene("Fangs", "U", false, ["Aberration"]),
		gene("Fans", "R", false, ["Banescale", "Gaoler"]),
		gene("Featherbeard", "L", false, ["Undertide"]),
		gene("Filigree", "R", true, ["Banescale", "Undertide", "Veilspun"]),
		gene("Firebreather", "L", true, []),
		gene("Firefly", "L", true, ["Aberration", "Veilspun"]),
		gene("Fishbone", "U", false, ["Sandsurge"]),
		gene("Flecks", "U", true, ["Aberration", "Undertide", "Veilspun"]),
		gene("Flutter", "L", false, ["Aether"]),
		gene("Frills", "R", false, ["Aberration"]),
		gene("Gembond", "U", true, ["Aether", "Undertide"]),
		gene("Ghost", "U", true, ["Aberration", "Banescale", "Gaoler", "Undertide", "Veilspun"]),
		gene("Gliders", "L", false, ["Banescale"]),
		gene("Glimmer", "R", true, ["Aberration", "Banescale", "Gaoler", "Veilspun"]),
		gene("Glowtail", "R", true, ["Aberration", "Aether"]),
		gene("Gnarlhorns", "R", false, ["Gaoler"]),
		gene("Jewels", "R", false, ["Aberration"]),
		gene("Keel", "L", true, ["Aether", "Sandsurge"]),
		gene("Koi", "R", true, ["Veilspun"]),
		gene("Kumo", "C", false, ["Aberration", "Sandsurge"]),
		gene("Lace", "U", true, ["Aether", "Banescale", "Sandsurge"]),
		gene("Mandibles", "L", false, ["Aether"]),
		gene("Monarch", "R", false, ["Aether", "Banescale"]),
		gene("Mop", "R", false, ["Veilspun"]),
		gene("Mucous", "L", false, ["Aberration"]),
		gene("Nudibranch", "L", false, ["Undertide"]),
		gene("Okapi", "U", true, ["Sandsurge", "Undertide", "Veilspun"]),
		gene("Opal", "R", true, ["Gaoler", "Veilspun"]),
		gene("Peacock", "C", true, ["Aberration", "Banescale", "Sandsurge", "Veilspun"]),
		gene("Pinions", "R", false, ["Gaoler"]),
		gene("Plating", "U", false, ["Undertide"]),
		gene("Plumage", "R", false, ["Banescale"]),
		gene("Points", "C", true, ["Aether"]),
		gene("Polkadot", "L", true, ["Aberration"]),
		gene("Polypore", "L", false, ["Aberration"]),
		gene("Porcupine", "L", false, ["Banescale"]),
		gene("Pufferfish", "U", false, ["Undertide"]),
		gene("Remora", "R", false, ["Undertide"]),
		gene("Ringlets", "U", true, ["Banescale", "Gaoler", "Undertide"]),
		gene("Runes", "L", true, ["Gaoler", "Undertide", "Veilspun"]),
		gene("Sailfin", "R", false, ["Undertide"]),
		gene("Scales", "L", true, ["Aberration", "Aether"]),
		gene("Scorpion", "L", false, ["Gaoler"]),
		gene("Shardflank", "C", false, ["Gaoler"]),
		gene("Shark", "L", false, ["Sandsurge"]),
		gene("Skeletal", "L", false, ["Banescale"]),
		gene("Smirch", "L", true, ["Aether", "Sandsurge"]),
		gene("Smoke", "U", true, ["Aether", "Gaoler"]),
		gene("Soap", "R", true, ["Banescale", "Sandsurge", "Undertide"]),
		gene("Space", "R", false, ["Aether"]),
		gene("Sparkle", "U", true, ["Aberration", "Aether", "Banescale", "Gaoler", "Sandsurge", "Undertide", "Veilspun"]),
		gene("Spectre", "R", false, ["Sandsurge"]),
		gene("Spines", "U", true, ["Aether", "Banescale", "Sandsurge"]),
		gene("Squiggle", "L", false, ["Banescale"]),
		gene("Stained", "R", true, ["Aether", "Banescale", "Gaoler", "Sandsurge", "Undertide", "Veilspun"]),
		gene("Stinger", "U", false, ["Aether"]),
		gene("Tentacles", "R", false, ["Undertide"]),
		gene("Thorns", "U", false, ["Veilspun"]),
		gene("Thundercrack", "L", false, ["Gaoler"]),
		gene("Thylacine", "C", true, ["Aberration", "Gaoler", "Sandsurge"]),
		gene("Trimmings", "C", false, ["Banescale"]),
		gene("Underbelly", "C", true, ["Aberration", "Aether", "Banescale", "Gaoler", "Sandsurge", "Undertide", "Veilspun"]),
		gene("Veined", "L", true, ["Aberration", "Gaoler", "Undertide", "Veilspun"]),
		gene("Weathered", "L", false, ["Gaoler"]),
		gene("Whiskers", "U", false, ["Aether"]),
		gene("Wintercoat", "U", false, ["Gaoler"]),
		gene("Wish", "R", false, ["Aether"]),
		gene("Wraith", "R", false, ["Banescale"])
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
