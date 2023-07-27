
/** A number of important pieces of data about Flight Rising's breeding mechanics.*/
var FRdata = FRdata || (function(){
	
	/////////////////////////////////////////////////////
	/////////////////// PRIVATE STUFF ///////////////////
	/////////////////////////////////////////////////////
	
	// Source:https://www1.flightrising.com/forums/gde/2866445#post_43461539
	// Letters mean Plentiful, Common, Uncommon, Limited, Rare
	const rarity_table =
		{
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
	
	// Source: https://flightrising.fandom.com/wiki/Nesting_Grounds#Number_of_Eggs
	const num_eggs_in_nest = {
		same_breeds: [
			{eggs: 1, probability: "0.1"},
			{eggs: 2, probability: "0.38"},
			{eggs: 3, probability: "0.4"},
			{eggs: 4, probability: "0.12"}
		],
		diff_breeds: [ // ...or ancients
			{eggs: 1, probability: "0.1"},
			{eggs: 2, probability: "0.3"},
			{eggs: 3, probability: "0.45"},
			{eggs: 4, probability: "0.1"},
			{eggs: 5, probability: "0.05"}
		]
	};
	
	// Source: https://flightrising.fandom.com/wiki/Eye_Types#Odds
	const eyes = [
		{name: "Common", probability: "0.458"},
		{name: "Uncommon", probability: "0.242"},
		{name: "Unusual", probability: "0.139"},
		{name: "Rare", probability: "0.091"},
		{name: "Bright", probability: "0.022"},
		{name: "Pastel", probability: "0.021"},
		{name: "Goat", probability: "0.011"},
		{name: "Faceted", probability: "0.007"},
		{name: "Primal", probability: "0.005"},
		{name: "Multi-Gaze", probability: "0.004"}
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
	
	// The game's colour wheel - treat as a circular array.
	const colours = [
		{ name: "Maize", hex: "fffdea" },
		{ name: "Cream", hex: "ffefdc" },
		{ name: "Antique", hex: "d8d6cd" },
		{ name: "White", hex: "ffffff" },
		{ name: "Moon", hex: "d8d7d8" },
		{ name: "Ice", hex: "ebefff" },
		{ name: "Orca", hex: "e0dfff" },
		{ name: "Platinum", hex: "c8bece" },
		{ name: "Silver", hex: "bbbabf" },
		{ name: "Dust", hex: "9c9c9e" },
		{ name: "Grey", hex: "808080" },
		{ name: "Smoke", hex: "9494a9" },
		{ name: "Gloom", hex: "535264" },
		{ name: "Lead", hex: "413c3f" },
		{ name: "Shale", hex: "4d4850" },
		{ name: "Flint", hex: "626268" },
		{ name: "Charcoal", hex: "545454" },
		{ name: "Coal", hex: "4b4946" },
		{ name: "Oilslick", hex: "342b25" },
		{ name: "Black", hex: "333333" },
		{ name: "Obsidian", hex: "1d2224" },
		{ name: "Eldritch", hex: "252a25" },
		{ name: "Midnight", hex: "252735" },
		{ name: "Shadow", hex: "3a2e44" },
		{ name: "Blackberry", hex: "4b294f" },
		{ name: "Mulberry", hex: "6e235d" },
		{ name: "Plum", hex: "853390" },
		{ name: "Wisteria", hex: "724e7b" },
		{ name: "Thistle", hex: "8f7c8b" },
		{ name: "Fog", hex: "a593b0" },
		{ name: "Mist", hex: "e1ceff" },
		{ name: "Lavender", hex: "cca4e0" },
		{ name: "Heather", hex: "9777bd" },
		{ name: "Purple", hex: "a261cf" },
		{ name: "Orchid", hex: "d950ff" },
		{ name: "Amethyst", hex: "993bd0" },
		{ name: "Nightshade", hex: "782eb2" },
		{ name: "Violet", hex: "643f9c" },
		{ name: "Grape", hex: "570fc0" },
		{ name: "Royal", hex: "4d2c89" },
		{ name: "Eggplant", hex: "332b65" },
		{ name: "Iris", hex: "535195" },
		{ name: "Storm", hex: "757adb" },
		{ name: "Twilight", hex: "474aa0" },
		{ name: "Indigo", hex: "2d237a" },
		{ name: "Sapphire", hex: "0d095b" },
		{ name: "Navy", hex: "212b5f" },
		{ name: "Cobalt", hex: "003484" },
		{ name: "Ultramarine", hex: "1c51e7" },
		{ name: "Blue", hex: "324ba9" },
		{ name: "Periwinkle", hex: "4866d5" },
		{ name: "Lapis", hex: "2b84ff" },
		{ name: "Splash", hex: "6392df" },
		{ name: "Cornflower", hex: "75a8ff" },
		{ name: "Sky", hex: "aec8ff" },
		{ name: "Stonewash", hex: "7895c1" },
		{ name: "Overcast", hex: "444f69" },
		{ name: "Steel", hex: "556979" },
		{ name: "Denim", hex: "2f4557" },
		{ name: "Abyss", hex: "0d1e24" },
		{ name: "Phthalo", hex: "0b2d46" },
		{ name: "Azure", hex: "0a3d67" },
		{ name: "Caribbean", hex: "0086ce" },
		{ name: "Teal", hex: "2b768f" },
		{ name: "Cerulean", hex: "00b4d6" },
		{ name: "Cyan", hex: "00fff0" },
		{ name: "Robin", hex: "9aeaef" },
		{ name: "Aqua", hex: "72c4c4" },
		{ name: "Turquoise", hex: "3aa0a1" },
		{ name: "Spruce", hex: "8bbbb2" },
		{ name: "Pistachio", hex: "e2ffe6" },
		{ name: "Seafoam", hex: "b2e2bd" },
		{ name: "Mint", hex: "9affc7" },
		{ name: "Jade", hex: "61ab89" },
		{ name: "Spearmint", hex: "148e67" },
		{ name: "Thicket", hex: "005e48" },
		{ name: "Peacock", hex: "1f4739" },
		{ name: "Emerald", hex: "20603f" },
		{ name: "Shamrock", hex: "236925" },
		{ name: "Jungle", hex: "1e361a" },
		{ name: "Hunter", hex: "1d2715" },
		{ name: "Forest", hex: "425035" },
		{ name: "Camo", hex: "51684c" },
		{ name: "Algae", hex: "97af8b" },
		{ name: "Swamp", hex: "687f67" },
		{ name: "Avocado", hex: "567c34" },
		{ name: "Green", hex: "629c3f" },
		{ name: "Fern", hex: "7ece73" },
		{ name: "Mantis", hex: "99ff9c" },
		{ name: "Pear", hex: "8ecd55" },
		{ name: "Leaf", hex: "a5e32d" },
		{ name: "Radioactive", hex: "c6ff00" },
		{ name: "Honeydew", hex: "d0e672" },
		{ name: "Peridot", hex: "e8ffb5" },
		{ name: "Chartreuse", hex: "b4cd3c" },
		{ name: "Spring", hex: "a9a832" },
		{ name: "Crocodile", hex: "828335" },
		{ name: "Olive", hex: "697135" },
		{ name: "Murk", hex: "4b4420" },
		{ name: "Moss", hex: "7e7745" },
		{ name: "Goldenrod", hex: "bea55d" },
		{ name: "Amber", hex: "c18e1b" },
		{ name: "Honey", hex: "d1b300" },
		{ name: "Lemon", hex: "ffe63b" },
		{ name: "Yellow", hex: "f9e255" },
		{ name: "Grapefruit", hex: "f7ff6f" },
		{ name: "Banana", hex: "ffec80" },
		{ name: "Sanddollar", hex: "ebe7ae" },
		{ name: "Flaxen", hex: "fde9ae" },
		{ name: "Ivory", hex: "ffd297" },
		{ name: "Buttercup", hex: "f6bf6b" },
		{ name: "Gold", hex: "e8af49" },
		{ name: "Metals", hex: "d1b046" },
		{ name: "Marigold", hex: "ffb43b" },
		{ name: "Sunshine", hex: "fa912b" },
		{ name: "Saffron", hex: "ff8400" },
		{ name: "Sunset", hex: "ffa248" },
		{ name: "Peach", hex: "ffb576" },
		{ name: "Cantaloupe", hex: "ff984f" },
		{ name: "Orange", hex: "d5602b" },
		{ name: "Bronze", hex: "b2560d" },
		{ name: "Terracotta", hex: "b23b07" },
		{ name: "Carrot", hex: "ff5500" },
		{ name: "Fire", hex: "ef5c23" },
		{ name: "Pumpkin", hex: "ff6840" },
		{ name: "Tangerine", hex: "ff7360" },
		{ name: "Cinnamon", hex: "c05a39" },
		{ name: "Caramel", hex: "c67047" },
		{ name: "Sand", hex: "b27749" },
		{ name: "Tan", hex: "c49a70" },
		{ name: "Beige", hex: "cabba2" },
		{ name: "Stone", hex: "827a64" },
		{ name: "Taupe", hex: "6d665a" },
		{ name: "Slate", hex: "564d48" },
		{ name: "Driftwood", hex: "766359" },
		{ name: "Latte", hex: "977b6c" },
		{ name: "Dirt", hex: "76483f" },
		{ name: "Clay", hex: "603f3d" },
		{ name: "Sable", hex: "57372c" },
		{ name: "Umber", hex: "2f1e1a" },
		{ name: "Soil", hex: "5a4534" },
		{ name: "Hickory", hex: "725639" },
		{ name: "Tarnish", hex: "855c32" },
		{ name: "Ginger", hex: "90532b" },
		{ name: "Brown", hex: "8e5b3f" },
		{ name: "Chocolate", hex: "563012" },
		{ name: "Auburn", hex: "7b3c1d" },
		{ name: "Copper", hex: "a44b28" },
		{ name: "Rust", hex: "8b3220" },
		{ name: "Tomato", hex: "ba311c" },
		{ name: "Vermilion", hex: "e22d17" },
		{ name: "Ruby", hex: "cd000e" },
		{ name: "Cherry", hex: "aa0024" },
		{ name: "Crimson", hex: "850012" },
		{ name: "Garnet", hex: "5b0f14" },
		{ name: "Sanguine", hex: "2e0002" },
		{ name: "Blood", hex: "451717" },
		{ name: "Maroon", hex: "652127" },
		{ name: "Berry", hex: "8b272c" },
		{ name: "Red", hex: "c1272d" },
		{ name: "Strawberry", hex: "de3235" },
		{ name: "Cerise", hex: "a22929" },
		{ name: "Carmine", hex: "b13a3a" },
		{ name: "Brick", hex: "9a534d" },
		{ name: "Coral", hex: "cc6f6f" },
		{ name: "Blush", hex: "ffa2a2" },
		{ name: "Cottoncandy", hex: "eb7997" },
		{ name: "Watermelon", hex: "db518d" },
		{ name: "Magenta", hex: "e934aa" },
		{ name: "Fuchsia", hex: "ec0089" },
		{ name: "Raspberry", hex: "8a0249" },
		{ name: "Wine", hex: "4d0f28" },
		{ name: "Mauve", hex: "9c4875" },
		{ name: "Pink", hex: "e77fbf" },
		{ name: "Bubblegum", hex: "eaa9ff" },
		{ name: "Rose", hex: "ffd6f6" },
		{ name: "Pearl", hex: "fbe9f8" }
	];
	
	/////////////////////////////////////////////////////
	////////////// RETURN THE PUBLIC STUFF //////////////
	/////////////////////////////////////////////////////
	return {
		num_eggs_in_nest: num_eggs_in_nest,
		eyes: eyes,
		breeds: breeds,
		colours: colours
	};
	
}());
