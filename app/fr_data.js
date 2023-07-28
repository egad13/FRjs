
/** Data about Flight Rising's breeding mechanics, and helpful functions to perform common comparisons of the data.*/
var FRdata = FRdata || (function(){
	
	/////////////////////////////////////////////////////
	/////////////////// PRIVATE STUFF ///////////////////
	/////////////////////////////////////////////////////
	
	// Source: https://www1.flightrising.com/forums/gde/2866445#post_43461539
	// Letters mean Plentiful, Common, Uncommon, Limited, Rare
	const rarity_table = {
		P: {
			P: [0.5,0.5], C: [0.7,0.3], U: [0.85,0.15],
			L: [0.97,0.03], R: [0.99,0.01]
		},
		C: {
			C: [0.5,0.5], U: [0.75,0.25], L: [0.9,0.1],
			R: [0.99,0.01]
		},
		U: {
			U: [0.5,0.5], L: [0.85,0.15], R: [0.98,0.02]
		},
		L: {
			L: [0.5,0.5], R: [0.97,0.03]
		},
		R: {
			R: [0.5, 0.5]
		}
	};
	
	
	/////////////////////////////////////////////////////
	/////////////////// PUBLIC THINGS ///////////////////
	/////////////////////////////////////////////////////
	
	///////////////////// Functions /////////////////////
	
	/** Looks up the probabilities of both possible outcomes when two rarities are compared.
	 * If invalid rarities are given, returns undefined.
	 * @param {string} rarity1 The first rarity in the comparison. One of "P", "C", "U", "L", "R".
	 * @param {string} rarity2 The first rarity in the comparison. One of "P", "C", "U", "L", "R".*/
	function rarityTableLookup(rarity1, rarity2) {
		const r1 = rarity1[0].toUpperCase();
		const r2 = rarity2[0].toUpperCase();
		return rarity_table[r1][r2]
			?? [...rarity_table[r2][r1]]?.reverse(); // spread operator so reverse() doesn't change original table
	}
	
	/** Calculates the probability of a target outcome occuring when two outcomes with rarities are being considered.
	 * If the outcome indexes are invalid or the objects don't have rarities, returns null.
	 * @param {array} arr An array of objects with rarities.
	 * @param {number} one The index of the first possible outcome in the given array.
	 * @param {number} two The index of the second possible outcome in the given array.
	 * @param {number} target The index of the target outcome in the given array. Should equal one of the possible outcome indexes.*/
	function calcRarityProb(arr, one, two, target) {
		if (!(arr instanceof Array) || !(one in arr && two in arr)
			|| !("rarity" in arr[one] && "rarity" in arr[two])) {
			return null;
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
	
	/** Calculates the length of the shortest range between (and including) two colours.
	 * If either of the parameters are not indexes in FRdata.colours, returns null.
	 * @param {number} one The index of the first colour in the range.
	 * @param {number} two The index of the last colour in the range.*/
	function colourRangeLength(one, two) {
		if (!(one in colours && two in colours)){
			return null;
		}
		const absDist = Math.abs(one - two);
		return 1 + Math.min(colours.length - absDist, absDist);
	}
	
	/** Returns true if the target colour is in the shortest range between two given colours.
	 * If any of the parameters are not indexes in FRdata.colours, returns null.
	 * @param {number} one The index of the first colour in the range.
	 * @param {number} two The index of the last colour in the range.
	 * @param {number} target The index of the target colour.*/
	function isColourInRange(one, two, target) {
		if (!(one in colours && two in colours && target in colours)){
			return null;
		}
		const absDist = Math.abs(one - two),
			first = Math.min(one, two),
			last = Math.max(one, two);
		
		// range does NOT cross array ends
		if (absDist <= colours.length - absDist){
			return (target >= first && target <= last);
		}
		// range DOES cross array ends
		return (target <= first || target >= last);
	}
	
	/** Returns true if the shortest range between two target colours is a sub-range of the shortest range between two other colours.
	 * If any of the parameters are not indexes in FRdata.colours, returns null.
	 * @param {number} one The index of the first colour in the range.
	 * @param {number} two The index of the last colour in the range.
	 * @param {number} target1 The index of the first colour in the target range.
	 * @param {number} target2 The index of the last colour in the target range.*/
	function isColourSubrangeInRange(one, two, target1, target2){
		if (!(one in colours && two in colours && target1 in colours && target2 in colours)){
			return null;
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
	
	/** Returns true if the two given breeds are compatible for breeding. Ie, true if they're two modern breeds or are the same ancient breed.
	 * If any of the parameters are not indexes in FRdata.breeds, returns null.
	 * @param {number} one The index of the first breed to compare.
	 * @param {number} two The index of the second breed to compare.*/
	function areBreedsCompatible(one, two) {
		if (!(one in breeds && two in breeds)){
			return null;
		}
		const b1 = breeds[one],
			b2 = breeds[two];
		
		return (b1.type === "M" && b2.type == "M") || (b1 === b2);
	}
	
	/** Returns an array containing all possible nest sizes and their probabilities if dragons of the two given breeds are nested.
	 * If either parameter is not an index in FRdata.breeds or the given breeds are incompatible, returns null.
	 * @param {number} one The index of the first breed.
	 * @param {number} one The index of the second breed.*/
	function nestSizesForBreeds(one, two) {
		if (!(one in breeds && two in breeds && areBreedsCompatible(one, two))){
			return null;
		}
		const type = breeds[one].type;
		
		return (type === "M" && one === two)
				? nest_sizes.same_breeds
				: nest_sizes.diff_breeds;
	}
	
	/////////////////////// Data ///////////////////////
	
	// Source: https://flightrising.fandom.com/wiki/Nesting_Grounds#Number_of_Eggs
	const nest_sizes = {
		same_breeds: [
			{eggs: 1, probability: 0.1},
			{eggs: 2, probability: 0.38},
			{eggs: 3, probability: 0.4},
			{eggs: 4, probability: 0.12}
		],
		diff_breeds: [ // ...or ancients
			{eggs: 1, probability: 0.1},
			{eggs: 2, probability: 0.3},
			{eggs: 3, probability: 0.45},
			{eggs: 4, probability: 0.1},
			{eggs: 5, probability: 0.05}
		]
	};
	
	// Source: https://flightrising.fandom.com/wiki/Eye_Types#Odds
	const eyes = [
		{name: "Common", probability: 0.458},
		{name: "Uncommon", probability: 0.242},
		{name: "Unusual", probability: 0.139},
		{name: "Rare", probability: 0.091},
		{name: "Bright", probability: 0.022},
		{name: "Pastel", probability: 0.021},
		{name: "Goat", probability: 0.011},
		{name: "Faceted", probability: 0.007},
		{name: "Primal", probability: 0.005},
		{name: "Multi-Gaze", probability: 0.004}
	];
	
	// Source: https://www1.flightrising.com/wiki/wiki
	// Types: A = ancient, M = modern
	const breeds = [
		{name: "Bogsneak", type: "M", rarity: "U"},
		{name: "Coatl", type: "M", rarity: "R"},
		{name: "Fae", type: "M", rarity: "P"},
		{name: "Guardian", type: "M", rarity: "P"},
		{name: "Imperial", type: "M", rarity: "L"},
		{name: "Mirror", type: "M", rarity: "P"},
		{name: "Nocturne", type: "M", rarity: "L"},
		{name: "Obelisk", type: "M", rarity: "U"},
		{name: "Pearlcatcher", type: "M", rarity: "C"},
		{name: "Ridgeback", type: "M", rarity: "U"},
		{name: "Skydancer", type: "M", rarity: "U"},
		{name: "Snapper", type: "M", rarity: "C"},
		{name: "Spiral", type: "M", rarity: "C"},
		{name: "Tundra", type: "M", rarity: "P"},
		{name: "Wildclaw", type: "M", rarity: "R"},
		
		{name: "Aberration", type: "A", rarity: "C"},
		{name: "Aether", type: "A", rarity: "C"},
		{name: "Banescale", type: "A", rarity: "C"},
		{name: "Gaoler", type: "A", rarity: "C"},
		{name: "Sandsurge", type: "A", rarity: "C"},
		{name: "Undertide", type: "A", rarity: "C"},
		{name: "Veilspun", type: "A", rarity: "C"}
	];
	
	// TODO: add breed restrictions? + a compatibility checker func?
	// Source:
	//	https://www1.flightrising.com/forums/gde/3231610/1
	//	https://docs.google.com/spreadsheets/d/1AxRC3OLrlqHyqL0_a5Qpa5wdks-SqWtxFxTNrraljak
	const genes = {
		primary: [
			{name: "Arapaima", rarity: "C"},
			{name: "Arc", rarity: "U"},
			{name: "Bar", rarity: "U"},
			{name: "Basic", rarity: "P"},
			{name: "Boa", rarity: "U"},
			{name: "Boulder", rarity: "L"},
			{name: "Bright", rarity: "U"},
			{name: "Candy", rarity: "L"},
			{name: "Candycane", rarity: "L"},
			{name: "Checkers", rarity: "C"},
			{name: "Cherub", rarity: "U"},
			{name: "Chevron", rarity: "U"},
			{name: "Cinder", rarity: "U"},
			{name: "Clown", rarity: "C"},
			{name: "Crystal", rarity: "R"},
			{name: "Diamond", rarity: "L"},
			{name: "Fade", rarity: "C"},
			{name: "Falcon", rarity: "C"},
			{name: "Fern", rarity: "L"},
			{name: "Flaunt", rarity: "U"},
			{name: "Giraffe", rarity: "U"},
			{name: "Ground", rarity: "L"},
			{name: "Harlequin", rarity: "R"},
			{name: "Iridescent", rarity: "R"},
			{name: "Jaguar", rarity: "U"},
			{name: "Jupiter", rarity: "U"},
			{name: "Laced", rarity: "C"},
			{name: "Leopard", rarity: "C"},
			{name: "Lionfish", rarity: "U"},
			{name: "Marble", rarity: "C"},
			{name: "Metallic", rarity: "R"},
			{name: "Mosaic", rarity: "U"},
			{name: "Octopus", rarity: "L"},
			{name: "Orb", rarity: "L"},
			{name: "Petals", rarity: "R"},
			{name: "Phantom", rarity: "L"},
			{name: "Pharaoh", rarity: "R"},
			{name: "Piebald", rarity: "C"},
			{name: "Pinstripe", rarity: "L"},
			{name: "Poison", rarity: "L"},
			{name: "Python", rarity: "U"},
			{name: "Ragged", rarity: "U"},
			{name: "Rattlesnake", rarity: "U"},
			{name: "Ribbon", rarity: "U"},
			{name: "Ripple", rarity: "U"},
			{name: "Sailfish", rarity: "L"},
			{name: "Savannah", rarity: "C"},
			{name: "Shaggy", rarity: "C"},
			{name: "Shell", rarity: "U"},
			{name: "Skink", rarity: "L"},
			{name: "Slime", rarity: "L"},
			{name: "Speckle", rarity: "C"},
			{name: "Sphinxmoth", rarity: "U"},
			{name: "Spool", rarity: "C"},
			{name: "Starmap", rarity: "R"},
			{name: "Stitched", rarity: "L"},
			{name: "Swirl", rarity: "C"},
			{name: "Tapir", rarity: "C"},
			{name: "Tide", rarity: "L"},
			{name: "Tiger", rarity: "C"},
			{name: "Twinkle", rarity: "R"},
			{name: "Vipera", rarity: "U"},
			{name: "Wasp", rarity: "R"},
			{name: "Wolf", rarity: "U"},
			{name: "Wrought", rarity: "C"}
		],
		secondary: [
			{name: "Alloy", rarity: "R"},
			{name: "Arowana", rarity: "C"},
			{name: "Arrow", rarity: "U"},
			{name: "Basic", rarity: "P"},
			{name: "Bee", rarity: "R"},
			{name: "Blaze", rarity: "U"},
			{name: "Blend", rarity: "C"},
			{name: "Breakup", rarity: "U"},
			{name: "Butterfly", rarity: "R"},
			{name: "Chess", rarity: "C"},
			{name: "Clouded", rarity: "C"},
			{name: "Constellation", rarity: "R"},
			{name: "Current", rarity: "U"},
			{name: "Daub", rarity: "U"},
			{name: "Diamondback", rarity: "U"},
			{name: "Edged", rarity: "C"},
			{name: "Eel", rarity: "U"},
			{name: "Eye Spots", rarity: "C"},
			{name: "Facet", rarity: "R"},
			{name: "Fissure", rarity: "L"},
			{name: "Flair", rarity: "U"},
			{name: "Flicker", rarity: "R"},
			{name: "Foam", rarity: "L"},
			{name: "Freckle", rarity: "C"},
			{name: "Hawkmoth", rarity: "U"},
			{name: "Hex", rarity: "U"},
			{name: "Hypnotic", rarity: "U"},
			{name: "Icing", rarity: "L"},
			{name: "Jester", rarity: "R"},
			{name: "Loop", rarity: "U"},
			{name: "Marbled", rarity: "C"},
			{name: "Marlin", rarity: "L"},
			{name: "Morph", rarity: "U"},
			{name: "Mottle", rarity: "C"},
			{name: "Myrid", rarity: "L"},
			{name: "Noxtide", rarity: "U"},
			{name: "Pack", rarity: "U"},
			{name: "Paint", rarity: "C"},
			{name: "Paisley", rarity: "L"},
			{name: "Patchwork", rarity: "L"},
			{name: "Peregrine", rarity: "C"},
			{name: "Rings", rarity: "L"},
			{name: "Rosette", rarity: "U"},
			{name: "Saddle", rarity: "U"},
			{name: "Safari", rarity: "C"},
			{name: "Sarcophagus", rarity: "R"},
			{name: "Saturn", rarity: "U"},
			{name: "Seraph", rarity: "U"},
			{name: "Shimmer", rarity: "R"},
			{name: "Sludge", rarity: "L"},
			{name: "Spade", rarity: "L"},
			{name: "Spinner", rarity: "L"},
			{name: "Spire", rarity: "C"},
			{name: "Spirit", rarity: "L"},
			{name: "Streak", rarity: "C"},
			{name: "Striation", rarity: "C"},
			{name: "Stripes", rarity: "C"},
			{name: "Sugarplum", rarity: "L"},
			{name: "Tear", rarity: "U"},
			{name: "Thread", rarity: "C"},
			{name: "Toxin", rarity: "L"},
			{name: "Trail", rarity: "L"},
			{name: "Vivid", rarity: "U"},
			{name: "Weaver", rarity: "L"},
			{name: "Web", rarity: "U"}
		],
		tertiary: [
			{name: "Angler", rarity: "L"},
			{name: "Augment", rarity: "R"},
			{name: "Basic", rarity: "P"},
			{name: "Beard", rarity: "U"},
			{name: "Beetle", rarity: "L"},
			{name: "Blossom", rarity: "L"},
			{name: "Braids", rarity: "U"},
			{name: "Branches", rarity: "L"},
			{name: "Brightshine", rarity: "L"},
			{name: "Capsule", rarity: "L"},
			{name: "Carnivore", rarity: "L"},
			{name: "Chitin", rarity: "C"},
			{name: "Circuit", rarity: "R"},
			{name: "Contour", rarity: "C"},
			{name: "Crackle", rarity: "U"},
			{name: "Crest", rarity: "U"},
			{name: "Darts", rarity: "C"},
			{name: "Diaphanous", rarity: "R"},
			{name: "Fangs", rarity: "U"},
			{name: "Fans", rarity: "R"},
			{name: "Featherbeard", rarity: "L"},
			{name: "Filigree", rarity: "R"},
			{name: "Firebreather", rarity: "L"},
			{name: "Firefly", rarity: "L"},
			{name: "Fishbone", rarity: "U"},
			{name: "Flecks", rarity: "U"},
			{name: "Flutter", rarity: "L"},
			{name: "Frills", rarity: "R"},
			{name: "Gembond", rarity: "U"},
			{name: "Ghost", rarity: "U"},
			{name: "Gliders", rarity: "L"},
			{name: "Glimmer", rarity: "R"},
			{name: "Glowtail", rarity: "R"},
			{name: "Gnarlhorns", rarity: "R"},
			{name: "Jewels", rarity: "R"},
			{name: "Keel", rarity: "L"},
			{name: "Koi", rarity: "R"},
			{name: "Kumo", rarity: "C"},
			{name: "Lace", rarity: "U"},
			{name: "Mandibles", rarity: "L"},
			{name: "Monarch", rarity: "R"},
			{name: "Mop", rarity: "R"},
			{name: "Mucous", rarity: "L"},
			{name: "Nudibranch", rarity: "L"},
			{name: "Okapi", rarity: "U"},
			{name: "Opal", rarity: "R"},
			{name: "Peacock", rarity: "C"},
			{name: "Pinions", rarity: "R"},
			{name: "Plating", rarity: "U"},
			{name: "Plumage", rarity: "R"},
			{name: "Points", rarity: "C"},
			{name: "Polkadot", rarity: "L"},
			{name: "Polypore", rarity: "L"},
			{name: "Porcupine", rarity: "L"},
			{name: "Pufferfish", rarity: "U"},
			{name: "Remora", rarity: "R"},
			{name: "Ringlets", rarity: "U"},
			{name: "Runes", rarity: "L"},
			{name: "Sailfin", rarity: "R"},
			{name: "Scales", rarity: "L"},
			{name: "Scorpion", rarity: "L"},
			{name: "Shardflank", rarity: "C"},
			{name: "Shark", rarity: "L"},
			{name: "Skeletal", rarity: "L"},
			{name: "Smirch", rarity: "L"},
			{name: "Smoke", rarity: "U"},
			{name: "Soap", rarity: "R"},
			{name: "Space", rarity: "R"},
			{name: "Sparkle", rarity: "U"},
			{name: "Spectre", rarity: "R"},
			{name: "Spines", rarity: "U"},
			{name: "Squiggle", rarity: "L"},
			{name: "Stained", rarity: "R"},
			{name: "Stinger", rarity: "U"},
			{name: "Tentacles", rarity: "R"},
			{name: "Thorns", rarity: "U"},
			{name: "Thundercrack", rarity: "L"},
			{name: "Thylacine", rarity: "C"},
			{name: "Trimmings", rarity: "C"},
			{name: "Underbelly", rarity: "C"},
			{name: "Veined", rarity: "L"},
			{name: "Weathered", rarity: "L"},
			{name: "Whiskers", rarity: "U"},
			{name: "Wintercoat", rarity: "U"},
			{name: "Wish", rarity: "R"},
			{name: "Wraith", rarity: "R"}
		]
	};
	
	// The game's colour wheel - treat as a circular array.
	const colours = [
		{name: "Maize", hex: "fffdea"},
		{name: "Cream", hex: "ffefdc"},
		{name: "Antique", hex: "d8d6cd"},
		{name: "White", hex: "ffffff"},
		{name: "Moon", hex: "d8d7d8"},
		{name: "Ice", hex: "ebefff"},
		{name: "Orca", hex: "e0dfff"},
		{name: "Platinum", hex: "c8bece"},
		{name: "Silver", hex: "bbbabf"},
		{name: "Dust", hex: "9c9c9e"},
		{name: "Grey", hex: "808080"},
		{name: "Smoke", hex: "9494a9"},
		{name: "Gloom", hex: "535264"},
		{name: "Lead", hex: "413c3f"},
		{name: "Shale", hex: "4d4850"},
		{name: "Flint", hex: "626268"},
		{name: "Charcoal", hex: "545454"},
		{name: "Coal", hex: "4b4946"},
		{name: "Oilslick", hex: "342b25"},
		{name: "Black", hex: "333333"},
		{name: "Obsidian", hex: "1d2224"},
		{name: "Eldritch", hex: "252a25"},
		{name: "Midnight", hex: "252735"},
		{name: "Shadow", hex: "3a2e44"},
		{name: "Blackberry", hex: "4b294f"},
		{name: "Mulberry", hex: "6e235d"},
		{name: "Plum", hex: "853390"},
		{name: "Wisteria", hex: "724e7b"},
		{name: "Thistle", hex: "8f7c8b"},
		{name: "Fog", hex: "a593b0"},
		{name: "Mist", hex: "e1ceff"},
		{name: "Lavender", hex: "cca4e0"},
		{name: "Heather", hex: "9777bd"},
		{name: "Purple", hex: "a261cf"},
		{name: "Orchid", hex: "d950ff"},
		{name: "Amethyst", hex: "993bd0"},
		{name: "Nightshade", hex: "782eb2"},
		{name: "Violet", hex: "643f9c"},
		{name: "Grape", hex: "570fc0"},
		{name: "Royal", hex: "4d2c89"},
		{name: "Eggplant", hex: "332b65"},
		{name: "Iris", hex: "535195"},
		{name: "Storm", hex: "757adb"},
		{name: "Twilight", hex: "474aa0"},
		{name: "Indigo", hex: "2d237a"},
		{name: "Sapphire", hex: "0d095b"},
		{name: "Navy", hex: "212b5f"},
		{name: "Cobalt", hex: "003484"},
		{name: "Ultramarine", hex: "1c51e7"},
		{name: "Blue", hex: "324ba9"},
		{name: "Periwinkle", hex: "4866d5"},
		{name: "Lapis", hex: "2b84ff"},
		{name: "Splash", hex: "6392df"},
		{name: "Cornflower", hex: "75a8ff"},
		{name: "Sky", hex: "aec8ff"},
		{name: "Stonewash", hex: "7895c1"},
		{name: "Overcast", hex: "444f69"},
		{name: "Steel", hex: "556979"},
		{name: "Denim", hex: "2f4557"},
		{name: "Abyss", hex: "0d1e24"},
		{name: "Phthalo", hex: "0b2d46"},
		{name: "Azure", hex: "0a3d67"},
		{name: "Caribbean", hex: "0086ce"},
		{name: "Teal", hex: "2b768f"},
		{name: "Cerulean", hex: "00b4d6"},
		{name: "Cyan", hex: "00fff0"},
		{name: "Robin", hex: "9aeaef"},
		{name: "Aqua", hex: "72c4c4"},
		{name: "Turquoise", hex: "3aa0a1"},
		{name: "Spruce", hex: "8bbbb2"},
		{name: "Pistachio", hex: "e2ffe6"},
		{name: "Seafoam", hex: "b2e2bd"},
		{name: "Mint", hex: "9affc7"},
		{name: "Jade", hex: "61ab89"},
		{name: "Spearmint", hex: "148e67"},
		{name: "Thicket", hex: "005e48"},
		{name: "Peacock", hex: "1f4739"},
		{name: "Emerald", hex: "20603f"},
		{name: "Shamrock", hex: "236925"},
		{name: "Jungle", hex: "1e361a"},
		{name: "Hunter", hex: "1d2715"},
		{name: "Forest", hex: "425035"},
		{name: "Camo", hex: "51684c"},
		{name: "Algae", hex: "97af8b"},
		{name: "Swamp", hex: "687f67"},
		{name: "Avocado", hex: "567c34"},
		{name: "Green", hex: "629c3f"},
		{name: "Fern", hex: "7ece73"},
		{name: "Mantis", hex: "99ff9c"},
		{name: "Pear", hex: "8ecd55"},
		{name: "Leaf", hex: "a5e32d"},
		{name: "Radioactive", hex: "c6ff00"},
		{name: "Honeydew", hex: "d0e672"},
		{name: "Peridot", hex: "e8ffb5"},
		{name: "Chartreuse", hex: "b4cd3c"},
		{name: "Spring", hex: "a9a832"},
		{name: "Crocodile", hex: "828335"},
		{name: "Olive", hex: "697135"},
		{name: "Murk", hex: "4b4420"},
		{name: "Moss", hex: "7e7745"},
		{name: "Goldenrod", hex: "bea55d"},
		{name: "Amber", hex: "c18e1b"},
		{name: "Honey", hex: "d1b300"},
		{name: "Lemon", hex: "ffe63b"},
		{name: "Yellow", hex: "f9e255"},
		{name: "Grapefruit", hex: "f7ff6f"},
		{name: "Banana", hex: "ffec80"},
		{name: "Sanddollar", hex: "ebe7ae"},
		{name: "Flaxen", hex: "fde9ae"},
		{name: "Ivory", hex: "ffd297"},
		{name: "Buttercup", hex: "f6bf6b"},
		{name: "Gold", hex: "e8af49"},
		{name: "Metals", hex: "d1b046"},
		{name: "Marigold", hex: "ffb43b"},
		{name: "Sunshine", hex: "fa912b"},
		{name: "Saffron", hex: "ff8400"},
		{name: "Sunset", hex: "ffa248"},
		{name: "Peach", hex: "ffb576"},
		{name: "Cantaloupe", hex: "ff984f"},
		{name: "Orange", hex: "d5602b"},
		{name: "Bronze", hex: "b2560d"},
		{name: "Terracotta", hex: "b23b07"},
		{name: "Carrot", hex: "ff5500"},
		{name: "Fire", hex: "ef5c23"},
		{name: "Pumpkin", hex: "ff6840"},
		{name: "Tangerine", hex: "ff7360"},
		{name: "Cinnamon", hex: "c05a39"},
		{name: "Caramel", hex: "c67047"},
		{name: "Sand", hex: "b27749"},
		{name: "Tan", hex: "c49a70"},
		{name: "Beige", hex: "cabba2"},
		{name: "Stone", hex: "827a64"},
		{name: "Taupe", hex: "6d665a"},
		{name: "Slate", hex: "564d48"},
		{name: "Driftwood", hex: "766359"},
		{name: "Latte", hex: "977b6c"},
		{name: "Dirt", hex: "76483f"},
		{name: "Clay", hex: "603f3d"},
		{name: "Sable", hex: "57372c"},
		{name: "Umber", hex: "2f1e1a"},
		{name: "Soil", hex: "5a4534"},
		{name: "Hickory", hex: "725639"},
		{name: "Tarnish", hex: "855c32"},
		{name: "Ginger", hex: "90532b"},
		{name: "Brown", hex: "8e5b3f"},
		{name: "Chocolate", hex: "563012"},
		{name: "Auburn", hex: "7b3c1d"},
		{name: "Copper", hex: "a44b28"},
		{name: "Rust", hex: "8b3220"},
		{name: "Tomato", hex: "ba311c"},
		{name: "Vermilion", hex: "e22d17"},
		{name: "Ruby", hex: "cd000e"},
		{name: "Cherry", hex: "aa0024"},
		{name: "Crimson", hex: "850012"},
		{name: "Garnet", hex: "5b0f14"},
		{name: "Sanguine", hex: "2e0002"},
		{name: "Blood", hex: "451717"},
		{name: "Maroon", hex: "652127"},
		{name: "Berry", hex: "8b272c"},
		{name: "Red", hex: "c1272d"},
		{name: "Strawberry", hex: "de3235"},
		{name: "Cerise", hex: "a22929"},
		{name: "Carmine", hex: "b13a3a"},
		{name: "Brick", hex: "9a534d"},
		{name: "Coral", hex: "cc6f6f"},
		{name: "Blush", hex: "ffa2a2"},
		{name: "Cottoncandy", hex: "eb7997"},
		{name: "Watermelon", hex: "db518d"},
		{name: "Magenta", hex: "e934aa"},
		{name: "Fuchsia", hex: "ec0089"},
		{name: "Raspberry", hex: "8a0249"},
		{name: "Wine", hex: "4d0f28"},
		{name: "Mauve", hex: "9c4875"},
		{name: "Pink", hex: "e77fbf"},
		{name: "Bubblegum", hex: "eaa9ff"},
		{name: "Rose", hex: "ffd6f6"},
		{name: "Pearl", hex: "fbe9f8"}
	];
	
	/////////////////////////////////////////////////////
	////////////// RETURN THE PUBLIC STUFF //////////////
	/////////////////////////////////////////////////////
	return {
		/////////////////// Functions ///////////////////
		
		rarityTableLookup: rarityTableLookup,
		calcRarityProb: calcRarityProb,
		colourRangeLength: colourRangeLength,
		isColourInRange: isColourInRange,
		isColourSubrangeInRange: isColourSubrangeInRange,
		areBreedsCompatible: areBreedsCompatible,
		nestSizesForBreeds: nestSizesForBreeds,
		
		///////////////////// Data /////////////////////
		
		nest_sizes: nest_sizes,
		eyes: eyes,
		breeds: breeds,
		genes: genes,
		colours: colours
	};
	
}());
