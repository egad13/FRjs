/**
 * Data about Flight Rising's dragon traits and breeding mechanics, and utility functions to streamline working with that data.
 * @module FRjs/data
 */

// Used to make all data objects immutable
const { keys, freeze } = Object;
function deepFreeze(obj) {
	const propNames = Reflect.ownKeys(obj);
	for (const name of propNames) {
		const value = obj[name];
		if ((value && typeof value === "object") || typeof value === "function") {
			deepFreeze(value);
		}
	}
	return freeze(obj);
}

///////////////////////////////////////////////////////////////////////////////
// TYPE DEFINITIONS
///////////////////////////////////////////////////////////////////////////////

// Creating trait objects by returning generic objects from functions performs
// well and saves a *lot* of file space.

/** @typedef {Object} Gene
 * @property {string} name
 * @property {Rarity} rarity
 * @property {Object} sids Map of all on-site IDs that this gene may have. The `BreedType.MODERN` (`M`) key, if present, corresponds to the site ID for the gene on modern breeds. All other keys, if present, are an index in `BREEDS` and correspond to the site ID for the gene on that ancient breed.
 * @property {boolean} isModern Whether or not this gene is available on modern breeds.
 * @property {number[]} ancients Array of indices in `BREEDS` for all ancient breeds this gene is available on.
 * @property {function(number): number|undefined} sidForBreed Given the index of a breed in `BREEDS`, returns the site ID for this gene on that breed, if it's available.
 *
 * **Parameters:**
 * | Name | Type | Description |
 * |---|-|-|
 * | `breed` | number | Index of a breed in `BREEDS` |
 *
 * **Returns:**
 * **Type:** number \| undefined
 * @see {@link module:FRjs/data.Rarity Rarity}
 * @see {@link module:FRjs/data.BreedType BreedType}
 * @see {@link module:FRjs/data.BREEDS BREEDS} */
function gene(name, rarity, ...sidPairs) {
	let sids = {};
	if (name === "Basic") {
		rarity = PLENTIFUL;
		sids[MODERN] = 0;
		BREEDS.forEach( (b, i) => {
			if (b.type === ANCIENT) {
				sids[i] = 0;
			}
		});
	}
	else {
		for (let i = 0; i < sidPairs.length; i += 2) {
			sids[sidPairs[i]] = sidPairs[i+1];
		}
	}
	return deepFreeze({
		name, rarity, sids,
		get isModern() { return keys(sids).includes(MODERN); },
		get ancients() { return keys(sids).filter(k => k !== MODERN).map(k => parseInt(k)); },
		sidForBreed: breed => BREEDS[breed]?.type === MODERN ? sids[MODERN] : sids[breed]
	});
}

/** @typedef {Object} Breed
 * @property {string} name
 * @property {number} sid The breed's on-site ID.
 * @property {BreedType} type
 * @property {Rarity} rarity
 * @see {@link module:FRjs/data.BreedType BreedType}
 * @see {@link module:FRjs/data.Rarity Rarity} */
function breed(name, sid, type, rarity) {
	return freeze({ name, sid, type, rarity });
}

/** @typedef {Object} EyeType
 * @property {string} name
 * @property {number} sid The eye type's on-site ID.
 * @property {number} probability The eye type's probability of showing up on a hatchling when breeding dragons. */
function eye(name, sid, probability) {
	return freeze({ name, sid, probability });
}

/** @typedef {Object} Colour
 * @property {string} name
 * @property {number} sid The colour's on-site ID.
 * @property {string} hex The colour's main hex code. NOT prefixed. */
function colour(name, sid, hex) {
	return freeze({ name, sid, hex });
}

/** @typedef {Object} BasicTrait
 * @property {string} name
 * @property {number} sid The trait's on-site ID. */
function basicTrait(name, sid) {
	return { name, sid };
}

/** @typedef {Object} Nest
 * @property {string} name
 * @property {number} probability The nest's probability of occurring when breeding dragons. */
function nest(size, probability) {
	return { size, probability };
}


///////////////////////////////////////////////////////////////////////////////
// PRIVATE DATA
//
// (As in not relevant to anyone using the module.)
///////////////////////////////////////////////////////////////////////////////

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
 * @type {{sameBreeds: Nest[], diffBreeds: Nest[]}}
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
 * @param {Rarity} rarity1
 * @param {Rarity} rarity2
 * @returns {number[]|undefined}
 * @see {@link module:FRjs/data.Rarity Rarity} */
export function rarityTableLookup(rarity1, rarity2) {
	return RARITY_TABLE[rarity1][rarity2]
		?? [...RARITY_TABLE[rarity2][rarity1]].reverse();
	// spread operator so it doesn't modify original
	// not toReversed() bc recent safari versions lack support
}

/** Compares two objects with rarities from the given array, and returns the probability of the given `target` outcome occurring. If the indexes aren't in the array, or the array members don't have rarities, returns `undefined`.
 * @param {Array.<{rarity: Rarity}>} arr Array of objects with a `rarity` property.
 * @param {number} one Index in `arr` of the first possible outcome.
 * @param {number} two Index in `arr` of the second possible outcome.
 * @param {number} target Index in `arr` of the target outcome. Should be identical to either `one` or `two`.
 * @returns {number|undefined}
 * @see {@link module:FRjs/data.Rarity Rarity} */
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

/** Calculates the length of the shortest range between two colours. If either parameter is not an index in {@link module:FRjs/data.COLOURS COLOURS}, returns `undefined`.
 * @param {number} one Index of the first colour in the range.
 * @param {number} two Index of the last colour in the range.
 * @returns {number|undefined} */
export function colourRangeLength(one, two) {
	if (!(one in COLOURS && two in COLOURS)) {
		return;
	}
	const absDist = Math.abs(one - two);
	return 1 + Math.min(COLOURS.length - absDist, absDist);
}

/** Returns `true` if the target colour is in the shortest range between two given colours, and `false` if it isn't. If any parameter is not an index in {@link module:FRjs/data.COLOURS COLOURS}, returns `undefined`. Range includes both end colours.
 * @param {number} one Index of the first colour in the range.
 * @param {number} two Index of the last colour in the range.
 * @param {number} target Index of the target colour.
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

/** Returns `true` if the colour range from `target1` to `target2` is a sub-range of the colour range from `range1` to `range2`, and `false` if not. If any parameter is not an index in {@link module:FRjs/data.COLOURS COLOURS}, returns `undefined`. Both ranges include both their end colours.
 * @param {number} range1 Index of the first colour in the parent range.
 * @param {number} range2 Index of the last colour in the parent range.
 * @param {number} target1 Index of the first colour in the target range.
 * @param {number} target2 Index of the last colour in the target range.
 * @returns {boolean|undefined} */
export function isColourSubrangeInRange(range1, range2, target1, target2) {
	if (!(range1 in COLOURS && range2 in COLOURS && target1 in COLOURS && target2 in COLOURS)) {
		return;
	}
	const absDist = Math.abs(range1 - range2),
		first = Math.min(range1, range2),
		last = Math.max(range1, range2),
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

/** Returns `true` if the two given breeds are compatible for breeding -- meaning either they're both modern breeds, or they're the same ancient breed -- and `false` if they aren't. If either parameter is not an index in {@link module:FRjs/data.BREEDS BREEDS}, returns `undefined`.
 * @param {number} one Index of the first breed.
 * @param {number} two Index of the second breed.
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

/** Returns an array containing possible nest sizes and their probabilities if dragons of the two given breeds are nested. If the given breeds are incompatible, or if either parameter is not an index in {@link module:FRjs/data.BREEDS BREEDS}, returns `undefined`.
 * @param {number} one Index of the first breed.
 * @param {number} two Index of the second breed.
 * @returns {Nest[]|undefined}
 * @see {@link module:FRjs/data~Nest Nest} */
export function nestSizesForBreeds(one, two) {
	if (!(one in BREEDS && two in BREEDS && areBreedsCompatible(one, two))) {
		return;
	}
	const type = BREEDS[one].type;
	return (type === MODERN && one === two)
		? NEST_SIZES.sameBreeds
		: NEST_SIZES.diffBreeds;
}

/** Yields indices on {@link module:FRjs/data.GENES GENES} of all genes available to a breed in a specific slot. If no breed id or an invalid breed id is provided, ignores restrictions and yields all genes for this slot. If the slot is invalid, yields nothing.
 * @param {"primary"|"secondary"|"tertiary"} slot The slot to retrieve genes for.
 * @param {number} [breed] Index of the breed to retrieve genes for.
 * @yields {number} */
export function* genesForBreed(slot, breed) {
	const anyBreed = !(breed in BREEDS);
	if (!(slot in GENES)) {
		return;
	}
	let i = 0;
	for (const gene of GENES[slot]) {
		if (anyBreed || gene.sidForBreed(breed) !== undefined) {
			yield i;
		}
		i++;
	}
}

/** Yields indices on {@link module:FRjs/data.COLOURS COLOURS} of all colours in the shortest range between the two given colours. If either parameter is not an index in `COLOURS`, yields nothing.
 * @param {number} one Index of the first colour in the range.
 * @param {number} two Index of the last colour in the range.
 * @yields {number} */
export function* colourRange(one, two) {
	if (!(one in COLOURS && two in COLOURS)) {
		return;
	}
	const absDist = Math.abs(one - two),
		first = Math.min(one, two),
		last = Math.max(one, two);

	// range does NOT cross array ends
	if (absDist <= COLOURS.length - absDist) {
		for (let i = first; i <= last; i++) {
			yield i;
		}
	} else { // range DOES cross array ends
		for (let i = last; i < COLOURS.length; i++) {
			yield i;
		}
		for (let i = 0; i <= first; i++) {
			yield i;
		}
	}
}


///////////////////////////////////////////////////////////////////////////////
// PUBLIC DATA
///////////////////////////////////////////////////////////////////////////////

/** Enum for breed types. This effects which genes are available on a breed, and which breed(s) it can be paired with.
 * @enum {string}
 * @prop {string} ANCIENT
 * @prop {string} MODERN
 */
export const BreedType = freeze({ ANCIENT, MODERN });

/** Enum for rarities. Every breed and gene has a rarity which affects it's probability of occurring through breeding.
 * @enum {string}
 * @prop {string} PLENTIFUL
 * @prop {string} COMMON
 * @prop {string} UNCOMMON
 * @prop {string} LIMITED
 * @prop {string} RARE
 */
export const Rarity = freeze({ PLENTIFUL, COMMON, UNCOMMON, LIMITED, RARE });

/** The two possible dragon ages in Flight Rising. Ordered as they are in-game.
 * @type {BasicTrait[]}
 * @see {@link module:FRjs/data~BasicTrait BasicTrait} */
export const AGES = deepFreeze([
	basicTrait("Dragon", 1),
	basicTrait("Hatchling", 0)
]);

/** The two possible dragon genders in Flight Rising. Ordered as they are in-game.
 * @type {BasicTrait[]}
 * @see {@link module:FRjs/data~BasicTrait BasicTrait} */
export const GENDERS = deepFreeze([
	basicTrait("Male", 0),
	basicTrait("Female", 1)
]);

/** All possible elements (flights) in Flight Rising. Ordered as they are in-game.
 * @type {BasicTrait[]}
 * @see {@link module:FRjs/data~BasicTrait BasicTrait} */
export const ELEMENTS = deepFreeze([
	basicTrait("Earth", 1),
	basicTrait("Plague", 2),
	basicTrait("Wind", 3),
	basicTrait("Water", 4),
	basicTrait("Lightning", 5),
	basicTrait("Ice", 6),
	basicTrait("Shadow", 7),
	basicTrait("Light", 8),
	basicTrait("Arcane", 9),
	basicTrait("Nature", 10),
	basicTrait("Fire", 11)
]);

/** All possible eye types in Flight Rising. Sorted by probability (descending). [Data Source (retrieved 2024-04-09 at 12:07 PM EST)]{@link https://docs.google.com/spreadsheets/d/1VOh1gwr-cCNMltfIFG8XHM-kEsBJLgVRg19HgiJ89ZA/edit#gid=0}
 * @type {EyeType[]}
 * @see {@link module:FRjs/data~EyeType EyeType} */
export const EYES = freeze([
	eye("Common", 0, 0.409123),
	eye("Uncommon", 1, 0.252662),
	eye("Unusual", 2, 0.144391),
	eye("Rare", 3, 0.088392),
	eye("Dark", 16, 0.021299),
	eye("Faded", 15, 0.019436),
	eye("Pastel", 12, 0.018814),
	eye("Bright", 13, 0.016596),
	eye("Goat", 9, 0.010295),
	eye("Faceted", 4, 0.00994),
	eye("Multi-Gaze", 5, 0.004615),
	eye("Primal", 6, 0.004437),
	eye("Glowing", 7, 0),
	eye("Dark Sclera", 8, 0),
	eye("Swirl", 10, 0),
	eye("Innocent", 11, 0),
	eye("Button", 14, 0)
]);

/** All available colours in Flight Rising. Ordered as they are in-game. This should be treated as a circular array.
 * @type {Colour[]}
 * @see {@link module:FRjs/data~Colour Colour} */
export const COLOURS = freeze([
	colour("Maize", 1, "fffdea"),
	colour("Cream", 163, "ffefdc"),
	colour("Antique", 97, "d8d6cd"),
	colour("White", 2, "ffffff"),
	colour("Moon", 74, "d8d7d8"),
	colour("Ice", 3, "ebefff"),
	colour("Orca", 131, "e0dfff"),
	colour("Platinum", 4, "c8bece"),
	colour("Silver", 5, "bbbabf"),
	colour("Dust", 146, "9c9c9e"),
	colour("Grey", 6, "808080"),
	colour("Smoke", 91, "9494a9"),
	colour("Gloom", 98, "535264"),
	colour("Lead", 118, "413c3f"),
	colour("Shale", 177, "4d4850"),
	colour("Flint", 129, "626268"),
	colour("Charcoal", 7, "545454"),
	colour("Coal", 8, "4b4946"),
	colour("Oilslick", 70, "342b25"),
	colour("Black", 9, "333333"),
	colour("Obsidian", 10, "1d2224"),
	colour("Eldritch", 176, "252a25"),
	colour("Midnight", 11, "252735"),
	colour("Shadow", 12, "3a2e44"),
	colour("Blackberry", 127, "4b294f"),
	colour("Mulberry", 13, "6e235d"),
	colour("Plum", 92, "853390"),
	colour("Wisteria", 119, "724e7b"),
	colour("Thistle", 14, "8f7c8b"),
	colour("Fog", 137, "a593b0"),
	colour("Mist", 150, "e1ceff"),
	colour("Lavender", 15, "cca4e0"),
	colour("Heather", 68, "9777bd"),
	colour("Purple", 16, "a261cf"),
	colour("Orchid", 69, "d950ff"),
	colour("Amethyst", 114, "993bd0"),
	colour("Nightshade", 175, "782eb2"),
	colour("Violet", 17, "643f9c"),
	colour("Grape", 147, "570fc0"),
	colour("Royal", 18, "4d2c89"),
	colour("Eggplant", 111, "332b65"),
	colour("Iris", 82, "535195"),
	colour("Storm", 19, "757adb"),
	colour("Twilight", 174, "474aa0"),
	colour("Indigo", 112, "2d237a"),
	colour("Sapphire", 71, "0d095b"),
	colour("Navy", 20, "212b5f"),
	colour("Cobalt", 136, "003484"),
	colour("Ultramarine", 90, "1c51e7"),
	colour("Blue", 21, "324ba9"),
	colour("Periwinkle", 135, "4866d5"),
	colour("Lapis", 148, "2b84ff"),
	colour("Splash", 22, "6392df"),
	colour("Cornflower", 145, "75a8ff"),
	colour("Sky", 23, "aec8ff"),
	colour("Stonewash", 24, "7895c1"),
	colour("Overcast", 126, "444f69"),
	colour("Steel", 25, "556979"),
	colour("Denim", 26, "2f4557"),
	colour("Abyss", 96, "0d1e24"),
	colour("Phthalo", 151, "0b2d46"),
	colour("Azure", 27, "0a3d67"),
	colour("Caribbean", 28, "0086ce"),
	colour("Teal", 29, "2b768f"),
	colour("Cerulean", 117, "00b4d6"),
	colour("Cyan", 89, "00fff0"),
	colour("Robin", 99, "9aeaef"),
	colour("Aqua", 30, "72c4c4"),
	colour("Turquoise", 149, "3aa0a1"),
	colour("Spruce", 100, "8bbbb2"),
	colour("Pistachio", 125, "e2ffe6"),
	colour("Seafoam", 31, "b2e2bd"),
	colour("Mint", 152, "9affc7"),
	colour("Jade", 32, "61ab89"),
	colour("Spearmint", 78, "148e67"),
	colour("Thicket", 141, "005e48"),
	colour("Peacock", 134, "1f4739"),
	colour("Emerald", 33, "20603f"),
	colour("Shamrock", 80, "236925"),
	colour("Jungle", 34, "1e361a"),
	colour("Hunter", 81, "1d2715"),
	colour("Forest", 35, "425035"),
	colour("Camo", 154, "51684c"),
	colour("Algae", 153, "97af8b"),
	colour("Swamp", 36, "687f67"),
	colour("Avocado", 37, "567c34"),
	colour("Green", 38, "629c3f"),
	colour("Fern", 113, "7ece73"),
	colour("Mantis", 79, "99ff9c"),
	colour("Pear", 101, "8ecd55"),
	colour("Leaf", 39, "a5e32d"),
	colour("Radioactive", 130, "c6ff00"),
	colour("Honeydew", 102, "d0e672"),
	colour("Peridot", 144, "e8ffb5"),
	colour("Chartreuse", 155, "b4cd3c"),
	colour("Spring", 40, "a9a832"),
	colour("Crocodile", 173, "828335"),
	colour("Olive", 123, "697135"),
	colour("Murk", 142, "4b4420"),
	colour("Moss", 115, "7e7745"),
	colour("Goldenrod", 41, "bea55d"),
	colour("Amber", 103, "c18e1b"),
	colour("Honey", 93, "d1b300"),
	colour("Lemon", 42, "ffe63b"),
	colour("Yellow", 104, "f9e255"),
	colour("Grapefruit", 128, "f7ff6f"),
	colour("Banana", 43, "ffec80"),
	colour("Sanddollar", 110, "ebe7ae"),
	colour("Flaxen", 139, "fde9ae"),
	colour("Ivory", 44, "ffd297"),
	colour("Buttercup", 167, "f6bf6b"),
	colour("Gold", 45, "e8af49"),
	colour("Metals", 140, "d1b046"),
	colour("Marigold", 75, "ffb43b"),
	colour("Sunshine", 46, "fa912b"),
	colour("Saffron", 84, "ff8400"),
	colour("Sunset", 172, "ffa248"),
	colour("Peach", 105, "ffb576"),
	colour("Cantaloupe", 171, "ff984f"),
	colour("Orange", 47, "d5602b"),
	colour("Bronze", 83, "b2560d"),
	colour("Terracotta", 108, "b23b07"),
	colour("Carrot", 133, "ff5500"),
	colour("Fire", 48, "ef5c23"),
	colour("Pumpkin", 158, "ff6840"),
	colour("Tangerine", 49, "ff7360"),
	colour("Cinnamon", 77, "c05a39"),
	colour("Caramel", 156, "c67047"),
	colour("Sand", 50, "b27749"),
	colour("Tan", 76, "c49a70"),
	colour("Beige", 51, "cabba2"),
	colour("Stone", 52, "827a64"),
	colour("Taupe", 95, "6d665a"),
	colour("Slate", 53, "564d48"),
	colour("Driftwood", 165, "766359"),
	colour("Latte", 143, "977b6c"),
	colour("Dirt", 162, "76483f"),
	colour("Clay", 106, "603f3d"),
	colour("Sable", 138, "57372c"),
	colour("Umber", 157, "2f1e1a"),
	colour("Soil", 54, "5a4534"),
	colour("Hickory", 88, "725639"),
	colour("Tarnish", 124, "855c32"),
	colour("Ginger", 122, "90532b"),
	colour("Brown", 55, "8e5b3f"),
	colour("Chocolate", 56, "563012"),
	colour("Auburn", 166, "7b3c1d"),
	colour("Copper", 94, "a44b28"),
	colour("Rust", 57, "8b3220"),
	colour("Tomato", 58, "ba311c"),
	colour("Vermilion", 169, "e22d17"),
	colour("Ruby", 86, "cd000e"),
	colour("Cherry", 116, "aa0024"),
	colour("Crimson", 59, "850012"),
	colour("Garnet", 161, "5b0f14"),
	colour("Sanguine", 121, "2e0002"),
	colour("Blood", 60, "451717"),
	colour("Maroon", 61, "652127"),
	colour("Berry", 87, "8b272c"),
	colour("Red", 62, "c1272d"),
	colour("Strawberry", 168, "de3235"),
	colour("Cerise", 132, "a22929"),
	colour("Carmine", 63, "b13a3a"),
	colour("Brick", 107, "9a534d"),
	colour("Coral", 64, "cc6f6f"),
	colour("Blush", 159, "ffa2a2"),
	colour("Cottoncandy", 164, "eb7997"),
	colour("Watermelon", 120, "db518d"),
	colour("Magenta", 65, "e934aa"),
	colour("Fuchsia", 170, "ec0089"),
	colour("Raspberry", 160, "8a0249"),
	colour("Wine", 72, "4d0f28"),
	colour("Mauve", 73, "9c4875"),
	colour("Pink", 66, "e77fbf"),
	colour("Bubblegum", 109, "eaa9ff"),
	colour("Rose", 67, "ffd6f6"),
	colour("Pearl", 85, "fbe9f8")
]);

/** All available breeds in Flight Rising. Sorted by name (ascending). [Data Source]{@link https://www1.flightrising.com/wiki/wiki}
 * @type {Breed[]}
 * @see {@link module:FRjs/data~Breed Breed} */
export const BREEDS = freeze([
	breed("Aberration", 20, ANCIENT, COMMON),
	breed("Aether", 22, ANCIENT, COMMON),
	breed("Auraboa", 24, ANCIENT, COMMON),
	breed("Banescale", 18, ANCIENT, COMMON),
	breed("Bogsneak", 14, MODERN, UNCOMMON),
	breed("Coatl", 12, MODERN, RARE),
	breed("Fae", 1, MODERN, PLENTIFUL),
	breed("Gaoler", 17, ANCIENT, COMMON),
	breed("Guardian", 2, MODERN, PLENTIFUL),
	breed("Imperial", 8, MODERN, LIMITED),
	breed("Mirror", 3, MODERN, PLENTIFUL),
	breed("Nocturne", 11, MODERN, LIMITED),
	breed("Obelisk", 15, MODERN, UNCOMMON),
	breed("Pearlcatcher", 4, MODERN, COMMON),
	breed("Ridgeback", 5, MODERN, UNCOMMON),
	breed("Sandsurge", 23, ANCIENT, COMMON),
	breed("Skydancer", 13, MODERN, UNCOMMON),
	breed("Snapper", 9, MODERN, COMMON),
	breed("Spiral", 7, MODERN, COMMON),
	breed("Tundra", 6, MODERN, PLENTIFUL),
	breed("Undertide", 21, ANCIENT, COMMON),
	breed("Veilspun", 19, ANCIENT, COMMON),
	breed("Wildclaw", 10, MODERN, RARE)
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

/** All available genes, organized into primary, secondary, and tertiary slots. Each slot is sorted by name (ascending). [Data Source]{@link https://www1.flightrising.com/forums/gde/3109561}
 *
 * This object has the following structure:
 * ```js
 * {
 * 	primary: Gene[],
 * 	secondary: Gene[],
 * 	tertiary: Gene[]
 * }
 * ```
 * @type {{primary: Gene[], secondary: Gene[], tertiary: Gene[]}}
 * @see {@link module:FRjs/data~Gene Gene} */
export const GENES = freeze({
	primary: freeze([
		gene("Arapaima", COMMON, SANDSURGE, 194),
		gene("Arc", UNCOMMON, VEILSPUN, 70),
		gene("Bar", UNCOMMON, MODERN, 6, ABERRATION, 89, AETHER, 150, AURABOA, 238, BANESCALE, 181, GAOLER, 34, UNDERTIDE, 117, VEILSPUN, 145),
		gene("Basic"),
		gene("Boa", UNCOMMON, MODERN, 232, ABERRATION, 233, AETHER, 234, AURABOA, 239, BANESCALE, 235, GAOLER, 171, SANDSURGE, 189, UNDERTIDE, 128, VEILSPUN, 236),
		gene("Boulder", LIMITED, MODERN, 110, ABERRATION, 220, AETHER, 151, AURABOA, 240, BANESCALE, 291, GAOLER, 289, SANDSURGE, 188, UNDERTIDE, 135, VEILSPUN, 290),
		gene("Bright", UNCOMMON, VEILSPUN, 69),
		gene("Candy", LIMITED, AETHER, 167),
		gene("Candycane", LIMITED, BANESCALE, 55),
		gene("Caterpillar", COMMON, AURABOA, 241),
		gene("Checkers", COMMON, UNDERTIDE, 127),
		gene("Cherub", UNCOMMON, MODERN, 10, ABERRATION, 221, BANESCALE, 43, SANDSURGE, 190, UNDERTIDE, 119),
		gene("Chevron", UNCOMMON, BANESCALE, 54),
		gene("Chrysocolla", LIMITED, MODERN, 237, SANDSURGE, 195, UNDERTIDE, 264),
		gene("Cinder", UNCOMMON, MODERN, 213, ABERRATION, 214, AETHER, 163, BANESCALE, 215, GAOLER, 216, SANDSURGE, 217, UNDERTIDE, 218, VEILSPUN, 219),
		gene("Clown", COMMON, MODERN, 3, ABERRATION, 222, AETHER, 169, BANESCALE, 75, GAOLER, 77, SANDSURGE, 196, UNDERTIDE, 265, VEILSPUN, 76),
		gene("Crystal", RARE, MODERN, 7, ABERRATION, 91, BANESCALE, 182, GAOLER, 37, UNDERTIDE, 118, VEILSPUN, 146),
		gene("Diamond", LIMITED, ABERRATION, 93),
		gene("Fade", COMMON, MODERN, 42, ABERRATION, 90, AETHER, 148, AURABOA, 242, BANESCALE, 85, GAOLER, 86, SANDSURGE, 191, UNDERTIDE, 115, VEILSPUN, 60),
		gene("Falcon", COMMON, MODERN, 16, ABERRATION, 92, AURABOA, 243, BANESCALE, 80, GAOLER, 30, UNDERTIDE, 122, VEILSPUN, 139),
		gene("Fern", LIMITED, MODERN, 136, ABERRATION, 223, AURABOA, 244, BANESCALE, 137, UNDERTIDE, 266, VEILSPUN, 138),
		gene("Flaunt", UNCOMMON, MODERN, 82, ABERRATION, 112, AETHER, 149, AURABOA, 245, GAOLER, 111, SANDSURGE, 193, UNDERTIDE, 267),
		gene("Giraffe", UNCOMMON, MODERN, 12, ABERRATION, 94, AURABOA, 246, BANESCALE, 81, GAOLER, 27, UNDERTIDE, 123, VEILSPUN, 83),
		gene("Ground", LIMITED, MODERN, 88, ABERRATION, 97, SANDSURGE, 186, UNDERTIDE, 268),
		gene("Harlequin", RARE, MODERN, 170, ABERRATION, 224, AURABOA, 247, SANDSURGE, 192, UNDERTIDE, 280),
		gene("Iridescent", RARE, MODERN, 1),
		gene("Jaguar", UNCOMMON, MODERN, 19, ABERRATION, 99, AETHER, 152, AURABOA, 248, BANESCALE, 44, GAOLER, 33, SANDSURGE, 198, UNDERTIDE, 269),
		gene("Jupiter", UNCOMMON, MODERN, 14, AETHER, 153, SANDSURGE, 197, UNDERTIDE, 270, VEILSPUN, 64),
		gene("Laced", COMMON, MODERN, 26, AETHER, 156, AURABOA, 249, BANESCALE, 48, GAOLER, 73, VEILSPUN, 61),
		gene("Leopard", COMMON, MODERN, 40, ABERRATION, 225, BANESCALE, 109, GAOLER, 173, VEILSPUN, 142),
		gene("Lionfish", UNCOMMON, MODERN, 25, ABERRATION, 100, AETHER, 158, SANDSURGE, 199, UNDERTIDE, 126),
		gene("Love", LIMITED, AURABOA, 279),
		gene("Marble", COMMON, BANESCALE, 47),
		gene("Metallic", RARE, MODERN, 17, AETHER, 157, AURABOA, 250, BANESCALE, 49, UNDERTIDE, 278),
		gene("Mochlus", UNCOMMON, AURABOA, 251),
		gene("Mosaic", UNCOMMON, MODERN, 58, AETHER, 155, AURABOA, 252, GAOLER, 38, SANDSURGE, 200),
		gene("Octopus", LIMITED, UNDERTIDE, 133),
		gene("Orb", LIMITED, MODERN, 283, ABERRATION, 102, AETHER, 288, AURABOA, 253, BANESCALE, 287, GAOLER, 286, SANDSURGE, 284, UNDERTIDE, 271, VEILSPUN, 285),
		gene("Petals", RARE, MODERN, 13, AETHER, 154, BANESCALE, 51, UNDERTIDE, 281, VEILSPUN, 143),
		gene("Phantom", LIMITED, GAOLER, 39),
		gene("Pharaoh", RARE, MODERN, 87, ABERRATION, 101, BANESCALE, 185, UNDERTIDE, 120),
		gene("Piebald", COMMON, MODERN, 9, AETHER, 159, AURABOA, 254, GAOLER, 31, SANDSURGE, 201, UNDERTIDE, 272),
		gene("Pinstripe", LIMITED, MODERN, 22, ABERRATION, 226, BANESCALE, 45, GAOLER, 32, SANDSURGE, 202, UNDERTIDE, 121),
		gene("Poison", LIMITED, MODERN, 11, ABERRATION, 227, BANESCALE, 53, GAOLER, 174, UNDERTIDE, 131, VEILSPUN, 140),
		gene("Python", LIMITED, MODERN, 23, AETHER, 160, AURABOA, 255, SANDSURGE, 203),
		gene("Ragged", UNCOMMON, BANESCALE, 56),
		gene("Rattlesnake", UNCOMMON, AURABOA, 256, SANDSURGE, 206),
		gene("Ribbon", UNCOMMON, MODERN, 84, ABERRATION, 105, BANESCALE, 183, GAOLER, 175, UNDERTIDE, 124),
		gene("Ripple", UNCOMMON, MODERN, 5, ABERRATION, 228, AURABOA, 257, BANESCALE, 79, GAOLER, 78, UNDERTIDE, 130),
		gene("Sailfish", LIMITED, SANDSURGE, 212),
		gene("Savannah", COMMON, MODERN, 18, ABERRATION, 103, BANESCALE, 50, GAOLER, 176, SANDSURGE, 204, UNDERTIDE, 129),
		gene("Shaggy", COMMON, GAOLER, 29),
		gene("Shell", UNCOMMON, VEILSPUN, 71),
		gene("Skink", LIMITED, MODERN, 15, ABERRATION, 229, AETHER, 161, BANESCALE, 52, GAOLER, 177, VEILSPUN, 67),
		gene("Slime", LIMITED, MODERN, 41, ABERRATION, 106, GAOLER, 178, SANDSURGE, 208, VEILSPUN, 141),
		gene("Speckle", COMMON, MODERN, 4, ABERRATION, 98, BANESCALE, 147, UNDERTIDE, 132, VEILSPUN, 144),
		gene("Sphinxmoth", UNCOMMON, VEILSPUN, 72),
		gene("Spool", COMMON, AETHER, 162),
		gene("Starmap", RARE, MODERN, 24, ABERRATION, 230, AETHER, 168, AURABOA, 263, UNDERTIDE, 273, VEILSPUN, 65),
		gene("Stitched", LIMITED, MODERN, 59, ABERRATION, 107, AETHER, 165, GAOLER, 180, UNDERTIDE, 282, VEILSPUN, 66),
		gene("Swirl", COMMON, MODERN, 57, ABERRATION, 104, GAOLER, 179, SANDSURGE, 209, UNDERTIDE, 134),
		gene("Tapir", COMMON, MODERN, 21, ABERRATION, 95, AURABOA, 258, BANESCALE, 74, GAOLER, 35, SANDSURGE, 210, UNDERTIDE, 274, VEILSPUN, 62),
		gene("Tide", LIMITED, MODERN, 114, ABERRATION, 231, AETHER, 164, BANESCALE, 184, GAOLER, 172, UNDERTIDE, 113),
		gene("Tiger", COMMON, MODERN, 2, AURABOA, 259, BANESCALE, 46, GAOLER, 36, SANDSURGE, 211, UNDERTIDE, 275),
		gene("Twinkle", RARE, AETHER, 166),
		gene("Varnish", COMMON, AURABOA, 261, UNDERTIDE, 276),
		gene("Vipera", UNCOMMON, MODERN, 8, ABERRATION, 96, AURABOA, 260, VEILSPUN, 63),
		gene("Wasp", RARE, MODERN, 20, ABERRATION, 108, GAOLER, 28, SANDSURGE, 207, UNDERTIDE, 125, VEILSPUN, 68),
		gene("Wicker", RARE, AURABOA, 262),
		gene("Wolf", UNCOMMON, UNDERTIDE, 116),
		gene("Wrought", COMMON, SANDSURGE, 187, UNDERTIDE, 277)
	]),
	secondary: freeze([
		gene("Affection", LIMITED, AURABOA, 279),
		gene("Alloy", RARE, MODERN, 17, AETHER, 157, AURABOA, 250, BANESCALE, 49, UNDERTIDE, 278),
		gene("Arowana", COMMON, SANDSURGE, 194),
		gene("Arrow", UNCOMMON, BANESCALE, 54),
		gene("Basic"),
		gene("Bee", RARE, MODERN, 20, ABERRATION, 108, GAOLER, 28, SANDSURGE, 207, UNDERTIDE, 125, VEILSPUN, 60),
		gene("Blaze", UNCOMMON, MODERN, 213, ABERRATION, 214, AETHER, 163, BANESCALE, 215, GAOLER, 216, SANDSURGE, 217, UNDERTIDE, 218, VEILSPUN, 219),
		gene("Blend", COMMON, MODERN, 42, ABERRATION, 91, AETHER, 148, AURABOA, 242, BANESCALE, 85, GAOLER, 86, SANDSURGE, 191, UNDERTIDE, 115, VEILSPUN, 61),
		gene("Breakup", UNCOMMON, MODERN, 58, AETHER, 155, AURABOA, 252, GAOLER, 38, SANDSURGE, 200),
		gene("Butterfly", RARE, MODERN, 13, AETHER, 154, BANESCALE, 51, UNDERTIDE, 281, VEILSPUN, 144),
		gene("Chess", COMMON, UNDERTIDE, 127),
		gene("Clouded", COMMON, MODERN, 40, ABERRATION, 220, BANESCALE, 109, GAOLER, 180, VEILSPUN, 142),
		gene("Constellation", RARE, MODERN, 25, ABERRATION, 221, AETHER, 168, AURABOA, 263, UNDERTIDE, 273, VEILSPUN, 66),
		gene("Current", UNCOMMON, MODERN, 6, ABERRATION, 222, AURABOA, 257, BANESCALE, 79, GAOLER, 78, UNDERTIDE, 130),
		gene("Daub", UNCOMMON, MODERN, 7, ABERRATION, 89, AETHER, 150, AURABOA, 238, BANESCALE, 181, GAOLER, 34, UNDERTIDE, 117, VEILSPUN, 145),
		gene("Diamondback", UNCOMMON, AURABOA, 256, SANDSURGE, 206),
		gene("Edged", COMMON, MODERN, 26, AETHER, 156, AURABOA, 249, BANESCALE, 48, GAOLER, 73, VEILSPUN, 62),
		gene("Eel", UNCOMMON, MODERN, 84, ABERRATION, 105, BANESCALE, 183, GAOLER, 174, UNDERTIDE, 124),
		gene("Eye Spots", COMMON, MODERN, 3, ABERRATION, 223, AETHER, 169, BANESCALE, 75, GAOLER, 77, SANDSURGE, 196, UNDERTIDE, 265, VEILSPUN, 76),
		gene("Facet", RARE, MODERN, 8, ABERRATION, 90, BANESCALE, 182, GAOLER, 37, UNDERTIDE, 118, VEILSPUN, 146),
		gene("Fissure", LIMITED, MODERN, 88, ABERRATION, 97, SANDSURGE, 186, UNDERTIDE, 268),
		gene("Flair", UNCOMMON, MODERN, 82, ABERRATION, 112, AETHER, 149, AURABOA, 245, GAOLER, 111, SANDSURGE, 193, UNDERTIDE, 267),
		gene("Flicker", RARE, AETHER, 166),
		gene("Foam", LIMITED, MODERN, 113, ABERRATION, 224, AETHER, 164, BANESCALE, 184, GAOLER, 172, UNDERTIDE, 114),
		gene("Freckle", COMMON, MODERN, 4, ABERRATION, 98, BANESCALE, 147, UNDERTIDE, 132, VEILSPUN, 143),
		gene("Hawkmoth", UNCOMMON, VEILSPUN, 72),
		gene("Hex", UNCOMMON, MODERN, 14, ABERRATION, 94, AURABOA, 246, BANESCALE, 81, GAOLER, 27, UNDERTIDE, 123, VEILSPUN, 83),
		gene("Hypnotic", UNCOMMON, MODERN, 9, ABERRATION, 96, AURABOA, 260, VEILSPUN, 64),
		gene("Icing", LIMITED, AETHER, 167),
		gene("Jester", RARE, MODERN, 170, ABERRATION, 225, AURABOA, 247, SANDSURGE, 192, UNDERTIDE, 282),
		gene("Larvae", COMMON, AURABOA, 261, UNDERTIDE, 276),
		gene("Lacquer", COMMON, AURABOA, 241),
		gene("Loop", UNCOMMON, VEILSPUN, 70),
		gene("Malachite", LIMITED, MODERN, 237, SANDSURGE, 195, UNDERTIDE, 264),
		gene("Marbled", COMMON, MODERN, 57, ABERRATION, 103, GAOLER, 178, SANDSURGE, 209, UNDERTIDE, 134),
		gene("Marlin", LIMITED, SANDSURGE, 212),
		gene("Morph", LIMITED, MODERN, 23, AETHER, 160, AURABOA, 255, SANDSURGE, 203),
		gene("Mottle", COMMON, BANESCALE, 47),
		gene("Myrid", LIMITED, MODERN, 110, ABERRATION, 226, AETHER, 151, AURABOA, 240, BANESCALE, 289, GAOLER, 290, SANDSURGE, 188, UNDERTIDE, 135, VEILSPUN, 291),
		gene("Noxtide", UNCOMMON, MODERN, 24, ABERRATION, 100, AETHER, 158, SANDSURGE, 199, UNDERTIDE, 126),
		gene("Pack", UNCOMMON, UNDERTIDE, 116),
		gene("Paint", COMMON, MODERN, 10, AETHER, 159, AURABOA, 254, GAOLER, 31, SANDSURGE, 201, UNDERTIDE, 272),
		gene("Paisley", LIMITED, MODERN, 136, ABERRATION, 227, AURABOA, 244, BANESCALE, 137, UNDERTIDE, 266, VEILSPUN, 138),
		gene("Patchwork", LIMITED, MODERN, 59, ABERRATION, 107, AETHER, 165, GAOLER, 179, UNDERTIDE, 280, VEILSPUN, 67),
		gene("Peregrine", COMMON, MODERN, 11, ABERRATION, 92, AURABOA, 243, BANESCALE, 80, GAOLER, 30, UNDERTIDE, 122, VEILSPUN, 139),
		gene("Rings", LIMITED, UNDERTIDE, 133),
		gene("Riopa", UNCOMMON, AURABOA, 251),
		gene("Rosette", UNCOMMON, MODERN, 19, ABERRATION, 99, AETHER, 152, AURABOA, 248, BANESCALE, 44, GAOLER, 33, SANDSURGE, 198, UNDERTIDE, 269),
		gene("Saddle", UNCOMMON, MODERN, 232, ABERRATION, 233, AETHER, 234, AURABOA, 239, BANESCALE, 235, GAOLER, 171, SANDSURGE, 189, UNDERTIDE, 128, VEILSPUN, 236),
		gene("Safari", COMMON, MODERN, 18, ABERRATION, 104, BANESCALE, 50, GAOLER, 175, SANDSURGE, 204, UNDERTIDE, 129),
		gene("Sarcophagus", RARE, MODERN, 87, ABERRATION, 101, BANESCALE, 185, UNDERTIDE, 120),
		gene("Saturn", UNCOMMON, MODERN, 15, AETHER, 153, SANDSURGE, 197, UNDERTIDE, 270, VEILSPUN, 65),
		gene("Seraph", UNCOMMON, MODERN, 5, ABERRATION, 228, BANESCALE, 43, SANDSURGE, 190, UNDERTIDE, 119),
		gene("Shimmer", RARE, MODERN, 1),
		gene("Sludge", LIMITED, MODERN, 41, ABERRATION, 106, GAOLER, 177, SANDSURGE, 208, VEILSPUN, 141),
		gene("Spade", LIMITED, ABERRATION, 93),
		gene("Spinner", LIMITED, MODERN, 16, ABERRATION, 229, AETHER, 161, BANESCALE, 52, GAOLER, 176, VEILSPUN, 68),
		gene("Spire", COMMON, SANDSURGE, 187, UNDERTIDE, 277),
		gene("Spirit", LIMITED, GAOLER, 39),
		gene("Streak", COMMON, GAOLER, 29),
		gene("Striation", COMMON, MODERN, 21, ABERRATION, 95, AURABOA, 258, BANESCALE, 74, GAOLER, 35, SANDSURGE, 210, UNDERTIDE, 274, VEILSPUN, 63),
		gene("Stripes", COMMON, MODERN, 2, AURABOA, 259, BANESCALE, 46, GAOLER, 36, SANDSURGE, 211, UNDERTIDE, 275),
		gene("Sugarplum", LIMITED, BANESCALE, 55),
		gene("Tear", UNCOMMON, BANESCALE, 56),
		gene("Thread", COMMON, AETHER, 162),
		gene("Toxin", LIMITED, MODERN, 12, ABERRATION, 230, BANESCALE, 53, GAOLER, 173, UNDERTIDE, 131, VEILSPUN, 140),
		gene("Trail", LIMITED, MODERN, 22, ABERRATION, 231, BANESCALE, 45, GAOLER, 32, SANDSURGE, 202, UNDERTIDE, 121),
		gene("Vivid", UNCOMMON, VEILSPUN, 69),
		gene("Weaver", LIMITED, MODERN, 283, ABERRATION, 102, AETHER, 284, AURABOA, 253, BANESCALE, 285, GAOLER, 286, SANDSURGE, 287, UNDERTIDE, 271, VEILSPUN, 288),
		gene("Web", UNCOMMON, VEILSPUN, 71),
		gene("Woven", RARE, AURABOA, 262)
	]),
	tertiary: freeze([
		gene("Angler", LIMITED, GAOLER, 156, UNDERTIDE, 246, VEILSPUN, 78),
		gene("Augment", RARE, ABERRATION, 198, SANDSURGE, 173),
		gene("Basic"),
		gene("Batty", LIMITED, AURABOA, 214),
		gene("Beard", UNCOMMON, SANDSURGE, 174),
		gene("Beetle", LIMITED, VEILSPUN, 65),
		gene("Blossom", LIMITED, GAOLER, 36, UNDERTIDE, 267),
		gene("Braids", UNCOMMON, ABERRATION, 199, GAOLER, 55),
		gene("Branches", LIMITED, AURABOA, 217, SANDSURGE, 189, UNDERTIDE, 248, VEILSPUN, 63),
		gene("Brightshine", LIMITED, UNDERTIDE, 170, VEILSPUN, 169),
		gene("Capsule", LIMITED, MODERN, 18, ABERRATION, 83, AURABOA, 229, BANESCALE, 74, GAOLER, 75, UNDERTIDE, 111, VEILSPUN, 56),
		gene("Carnivore", LIMITED, ABERRATION, 162, AETHER, 163, BANESCALE, 164, GAOLER, 166, UNDERTIDE, 165, VEILSPUN, 167),
		gene("Chitin", COMMON, SANDSURGE, 183),
		gene("Circuit", RARE, MODERN, 1, AETHER, 135, UNDERTIDE, 117),
		gene("Contour", COMMON, MODERN, 13, ABERRATION, 200, AETHER, 136, AURABOA, 230, BANESCALE, 46, GAOLER, 157, UNDERTIDE, 249),
		gene("Crackle", UNCOMMON, MODERN, 6, AURABOA, 231, BANESCALE, 50, UNDERTIDE, 115, VEILSPUN, 58),
		gene("Crest", UNCOMMON, AURABOA, 215, SANDSURGE, 184, UNDERTIDE, 250),
		gene("Crystalline", LIMITED, AURABOA, 266, GAOLER, 265),
		gene("Darts", COMMON, SANDSURGE, 177),
		gene("Diaphanous", RARE, VEILSPUN, 66),
		gene("Fangs", UNCOMMON, ABERRATION, 84),
		gene("Fans", RARE, ABERRATION, 201, BANESCALE, 41, GAOLER, 3, UNDERTIDE, 251),
		gene("Featherbeard", LIMITED, UNDERTIDE, 118),
		gene("Filigree", RARE, MODERN, 21, BANESCALE, 43, UNDERTIDE, 116, VEILSPUN, 133),
		gene("Firebreather", LIMITED, MODERN, 161, ABERRATION, 202, AURABOA, 233, UNDERTIDE, 252),
		gene("Firefly", LIMITED, MODERN, 22, ABERRATION, 85, AURABOA, 232, UNDERTIDE, 253, VEILSPUN, 61),
		gene("Fishbone", UNCOMMON, AURABOA, 216, SANDSURGE, 185),
		gene("Flameforger", LIMITED, ABERRATION, 197, BANESCALE, 196),
		gene("Flecks", LIMITED, MODERN, 103, ABERRATION, 104, UNDERTIDE, 112, VEILSPUN, 64),
		gene("Flutter", LIMITED, AETHER, 141),
		gene("Frills", RARE, ABERRATION, 86),
		gene("Gembond", UNCOMMON, MODERN, 4, AETHER, 137, SANDSURGE, 176, UNDERTIDE, 123),
		gene("Ghost", UNCOMMON, MODERN, 20, ABERRATION, 88, BANESCALE, 47, GAOLER, 25, UNDERTIDE, 121, VEILSPUN, 131),
		gene("Gliders", LIMITED, BANESCALE, 76),
		gene("Glimmer", RARE, MODERN, 10, ABERRATION, 94, BANESCALE, 95, GAOLER, 101, VEILSPUN, 102),
		gene("Glowtail", RARE, MODERN, 54, ABERRATION, 89, AETHER, 138),
		gene("Gnarlhorns", RARE, GAOLER, 27),
		gene("Jellyfish", UNCOMMON, UNDERTIDE, 269),
		gene("Jewels", RARE, ABERRATION, 87),
		gene("Keel", LIMITED, MODERN, 53, AETHER, 139, AURABOA, 234, SANDSURGE, 186, UNDERTIDE, 268),
		gene("Koi", RARE, MODERN, 73, ABERRATION, 203, AURABOA, 235, UNDERTIDE, 254, VEILSPUN, 108),
		gene("Kumo", COMMON, ABERRATION, 80, SANDSURGE, 175),
		gene("Lace", UNCOMMON, MODERN, 16, AETHER, 142, BANESCALE, 44, SANDSURGE, 187),
		gene("Mandibles", LIMITED, AETHER, 143),
		gene("Medusa", RARE, AURABOA, 218, UNDERTIDE, 255),
		gene("Mistral", LIMITED, BANESCALE, 273, UNDERTIDE, 272),
		gene("Monarch", RARE, AETHER, 140, BANESCALE, 158),
		gene("Mop", RARE, VEILSPUN, 67),
		gene("Mucous", LIMITED, ABERRATION, 81),
		gene("Nudibranch", LIMITED, UNDERTIDE, 126),
		gene("Okapi", UNCOMMON, MODERN, 9, SANDSURGE, 182, UNDERTIDE, 129, VEILSPUN, 59),
		gene("Opal", RARE, MODERN, 17, AURABOA, 236, GAOLER, 37, UNDERTIDE, 247, VEILSPUN, 62),
		gene("Paradise", UNCOMMON, AURABOA, 219),
		gene("Peacock", COMMON, MODERN, 24, ABERRATION, 90, AURABOA, 237, BANESCALE, 106, SANDSURGE, 191, VEILSPUN, 60),
		gene("Pinions", RARE, GAOLER, 77),
		gene("Plating", UNCOMMON, UNDERTIDE, 128),
		gene("Plumage", RARE, AURABOA, 220, BANESCALE, 51),
		gene("Points", COMMON, MODERN, 107, AETHER, 146),
		gene("Polkadot", LIMITED, MODERN, 168, ABERRATION, 79, AURABOA, 238),
		gene("Polypore", LIMITED, ABERRATION, 82),
		gene("Porcupine", LIMITED, AURABOA, 221, BANESCALE, 49, UNDERTIDE, 256),
		gene("Pufferfish", UNCOMMON, UNDERTIDE, 127),
		gene("Remora", RARE, UNDERTIDE, 119),
		gene("Ringlets", UNCOMMON, MODERN, 23, BANESCALE, 40, GAOLER, 30, UNDERTIDE, 120),
		gene("Riot", LIMITED, ABERRATION, 211, GAOLER, 212),
		gene("Rockbreaker", LIMITED, AURABOA, 244, SANDSURGE, 245),
		gene("Runes", UNCOMMON, MODERN, 14, GAOLER, 32, SANDSURGE, 178, UNDERTIDE, 114, VEILSPUN, 57),
		gene("Sailfin", RARE, AURABOA, 222, UNDERTIDE, 130),
		gene("Scales", LIMITED, MODERN, 15, ABERRATION, 92, AETHER, 147, AURABOA, 239, UNDERTIDE, 257),
		gene("Scorpion", LIMITED, GAOLER, 33),
		gene("Scuttle", LIMITED, AURABOA, 223),
		gene("Shardflank", COMMON, GAOLER, 26),
		gene("Shark", LIMITED, SANDSURGE, 190, UNDERTIDE, 258),
		gene("Skeletal", LIMITED, ABERRATION, 204, BANESCALE, 45),
		gene("Smirch", LIMITED, MODERN, 19, ABERRATION, 205, AETHER, 150, SANDSURGE, 192, UNDERTIDE, 259),
		gene("Smoke", UNCOMMON, MODERN, 7, AETHER, 151, AURABOA, 240, GAOLER, 28, UNDERTIDE, 260),
		gene("Soap", RARE, MODERN, 105, BANESCALE, 159, SANDSURGE, 180, UNDERTIDE, 124),
		gene("Space", RARE, AETHER, 149),
		gene("Sparkle", UNCOMMON, MODERN, 97, ABERRATION, 96, AETHER, 152, BANESCALE, 98, GAOLER, 99, SANDSURGE, 193, UNDERTIDE, 122, VEILSPUN, 100),
		gene("Spectre", RARE, SANDSURGE, 188),
		gene("Spines", UNCOMMON, MODERN, 8, ABERRATION, 206, AETHER, 153, AURABOA, 241, BANESCALE, 160, SANDSURGE, 181, UNDERTIDE, 261),
		gene("Squiggle", LIMITED, BANESCALE, 42),
		gene("Stained", RARE, MODERN, 12, ABERRATION, 207, AETHER, 145, AURABOA, 242, BANESCALE, 69, GAOLER, 71, SANDSURGE, 172, UNDERTIDE, 110, VEILSPUN, 72),
		gene("Starfall", LIMITED, AETHER, 209, SANDSURGE, 210),
		gene("Stinger", UNCOMMON, AETHER, 148, AURABOA, 224, UNDERTIDE, 262),
		gene("Tentacles", RARE, UNDERTIDE, 125),
		gene("Terracotta", COMMON, AURABOA, 225),
		gene("Thorns", UNCOMMON, ABERRATION, 208, AURABOA, 226, UNDERTIDE, 263, VEILSPUN, 68),
		gene("Thundercrack", LIMITED, GAOLER, 195, SANDSURGE, 194),
		gene("Thylacine", COMMON, MODERN, 11, ABERRATION, 93, GAOLER, 29, SANDSURGE, 179),
		gene("Topcoat", COMMON, AURABOA, 243, UNDERTIDE, 264),
		gene("Trickmurk", LIMITED, AETHER, 271, VEILSPUN, 270),
		gene("Trimmings", COMMON, BANESCALE, 39),
		gene("Underbelly", COMMON, MODERN, 5, ABERRATION, 132, AETHER, 144, AURABOA, 228, BANESCALE, 52, GAOLER, 31, SANDSURGE, 171, UNDERTIDE, 109, VEILSPUN, 70),
		gene("Veined", LIMITED, MODERN, 38, ABERRATION, 91, GAOLER, 2, UNDERTIDE, 113, VEILSPUN, 134),
		gene("Weathered", LIMITED, GAOLER, 35),
		gene("Whiskers", UNCOMMON, AETHER, 154),
		gene("Willow", UNCOMMON, AURABOA, 227),
		gene("Wintercoat", UNCOMMON, GAOLER, 34),
		gene("Wish", RARE, MODERN, 213, AETHER, 155),
		gene("Wraith", RARE, BANESCALE, 48)
	])
});
