/**
 * Defines extensions of the native HTML `<select>` element which self-populate with different kinds of Flight Rising data. Available elements are registered as `fr-eyes`, `fr-colours`, `fr-breeds`, and `fr-genes`. See the tutorials for usage.
 *
 * Customized Built-in Elements are not natively supported in Safari, but the custom dropdowns should work in Safari anyway because the module loads a polyfill if CBIE support is not detected.
 * @module fr/forms
 * @version 0.0.2
 * @tutorial 02-fr-forms
 * @requires module:fr/data
 */

// Polyfill customized built-in elements for safari
let supportsCBI = false;
try {
	document.createElement("div", {
		// eslint-disable-next-line getter-return
		get is() { supportsCBI = true; }
	});
} catch (e) { console.error(e); }
if (!supportsCBI) {
	await import("https://unpkg.com/@ungap/custom-elements/es.js");
}

import * as FR from "./data.js";

/** The message bus in a publisher-subscriber system.
 * @private */
class PubSub {
	/** A map containing channel keys, and lists of callback functions subscribed to those channels.
	 * @type {Map<string,Array<function(any)>>} */
	#subscribers = new Map();
	/** A map containing channel keys, and the last message sent to that channel.
	 * @type {Map<string,any>} */
	#messages = new Map();

	/** Send a message to everyone subscribed to the given channel.
	 * @param {string} channel The channel to send the message to.
	 * @param {any} message The message to send.
	 * @returns {function} A function which can be used to delete the last message sent to the given channel. */
	sendMessage(channel, message) {
		this.#messages.set(channel, message);
		if (!this.#subscribers.has(channel)) {
			this.#subscribers.set(channel, []);
		}
		for (const callback of this.#subscribers.get(channel)) {
			callback(message);
		}
		return () => {
			this.#messages.delete(channel);
		};
	}

	/** Check the last message sent to a given channel.
	 * @param {string} channel The channel to view the history of. */
	checkMessage(channel) {
		return this.#messages.get(channel);
	}

	/** Subscribe to messages sent to a specific channel, and also receive the last message sent to the channel if there is one.
	 * @param {string} channel The channel to subscribe to
	 * @param {function(any)} callback The function to call when a message is sent to this channel.
	 * @returns {function} A function that can be called to unsubscribe this callback from this channel. */
	subscribe(channel, callback) {
		if (channel && callback) {
			if (!this.#subscribers.has(channel)) {
				this.#subscribers.set(channel, []);
			}

			const subList = this.#subscribers.get(channel);
			if (subList.indexOf(callback) < 0) {
				subList.push(callback);
			}

			const message = this.#messages.get(channel);
			if (message) {
				callback(message);
			}

			return () => {
				const idx = subList.indexOf(callback);
				if (idx != null && idx > -1) {
					subList.splice(idx, 1);
				}
			};
		}
	}
}

/** The Pub/Sub message bus for the BreedSelect/GeneSelect link.
 * @private */
const bgPubSub = new PubSub();

/** A customized `<select>` element which self-populates with options representing all of Flight Rising's eye types, in order of increasing rarity. Registered as `fr-eyes`.
 * @tutorial 03-eyeselect */
class EyeSelect extends HTMLSelectElement {
	#isPopulated = false;

	connectedCallback() {
		if (this.#isPopulated) { return; }
		this.#isPopulated = true;

		for (const [i, elt] of FR.EYES.entries()) {
			const op = document.createElement("option");
			[op.value, op.text] = [i, elt.name];
			this.add(op);
		}
	}
}

/** A customized `<select>` element which self-populates with options representing all of Flight Rising's colours, in order of the on-site colour wheel. Registered as `fr-colours`.
 * @tutorial 04-colourselect */
class ColourSelect extends HTMLSelectElement {
	#isPopulated = false;
	/** Stores text colours for each possible colour option.
	 * @private
	 * @type {Map.<string, string>} */
	static #styleCache = new Map();

	static get observedAttributes() { return ["no-opt-colours"]; }

	attributeChangedCallback(name) {
		if (this.hasAttribute(name)) {
			for (const op of this) {
				op.removeAttribute("style");
			}
		} else if (!this.hasAttribute(name)) {
			for (const op of this) {
				op.style = ColourSelect.#styleCache.get(op.value);
			}
		}
	}

	connectedCallback() {
		if (this.#isPopulated) { return; }
		this.#isPopulated = true;

		const doStyle = !this.hasAttribute("no-opt-colours");

		for (const [i, elt] of FR.COLOURS.entries()) {
			const op = document.createElement("option");
			[op.value, op.text] = [i, elt.name];
			if (!ColourSelect.#styleCache.has(op.value)) {
				ColourSelect.#styleCache.set(op.value, `background:#${elt.hex};color:#${ColourSelect.#textColourForBg(elt.hex)}`);
			}
			if (doStyle) {
				op.style = ColourSelect.#styleCache.get(op.value);
			}
			this.add(op);
		}
	}

	/** Determines whether text placed on the given background colour should be black or white for the best readability.
	 * @private
	 * @param {string} bgHex A non-prefixed 6-digit hex colour code.
	 * @returns {string} Whichever of "000" or "fff" is easier to read when placed on the given background colour. */
	static #textColourForBg(bgHex) {
		// Convert to RGB
		bgHex = +(`0x${bgHex}`);
		const r = bgHex >> 16,
			g = bgHex >> 8 & 255,
			b = bgHex & 255;

		// Perceived brightness equation from http://alienryderflex.com/hsp.html
		const perceivedBrightness = Math.sqrt(
			0.299 * (r * r)
			+ 0.587 * (g * g)
			+ 0.114 * (b * b)
		);

		if (perceivedBrightness > 110) {
			return "000";
		}
		return "fff";
	}
}

/** A customized `<select>` element which self-populates with options representing all of Flight Rising's breeds, separated into Modern and Ancient `<optgroup>`s which are each ordered alphabetically. Registered as `fr-breeds`.
 *
 * These elements are the publishers of a Pub/Sub relationship with {@link module:fr/forms~GeneSelect GeneSelect}s.
 *
 * @tutorial 05-breedselect */
class BreedSelect extends HTMLSelectElement {
	#prevValue;
	#isPopulated = false;
	#deleteMsg = () => { };

	connectedCallback() {
		if (!this.isConnected) { return; }

		// Initial population + event listener
		if (!this.#isPopulated) {
			this.#isPopulated = true;

			const modern = document.createElement("optgroup"),
				ancient = document.createElement("optgroup");
			modern.label = "Modern";
			ancient.label = "Ancient";

			for (const [i, elt] of FR.BREEDS.entries()) {
				const opt = document.createElement("option");
				opt.value = i;
				opt.text = elt.name;
				if (elt.type === "M") {
					modern.append(opt);
				} else {
					ancient.append(opt);
				}
			}
			this.append(modern, ancient);

			this.addEventListener("change", () => {
				if (!FR.areBreedsCompatible(this.value, this.#prevValue)) {
					this.#prevValue = this.value;
					bgPubSub.sendMessage(this.id, this.value);
				}
			});
		}

		// Send message every time we're reattached
		this.#prevValue = this.value;
		this.#deleteMsg = bgPubSub.sendMessage(this.id, this.value);
	}

	disconnectedCallback() {
		this.#deleteMsg();
	}
}

/** A customized `<select>` element which self-populates with options representing Flight Rising's genes, ordered alphabetically. Registered as `fr-genes`.
 *
 * These elements can optionally be the subscribers in a Pub/Sub relationship with {@link module:fr/forms~BreedSelect BreedSelect}s.
 *
 * @tutorial 06-geneselect */
class GeneSelect extends HTMLSelectElement {
	#isPopulated = false;
	#defaultName = "basic";
	#slot = "primary";
	/** @type {string?} */
	#breedName;
	/** @type {string?} */
	#breedSelectID;
	#unsubscribe = () => { };

	#resubscribe(newChannel) {
		this.#unsubscribe?.();
		this.#unsubscribe = bgPubSub.subscribe(newChannel, this.#repopulate.bind(this));
	}

	static get observedAttributes() { return ["slot", "breed", "breed-name", "default"]; }

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === "default") {
			this.#defaultName = newValue?.toLowerCase() ?? "basic";
		} else if (name === "breed") {
			this.#breedSelectID = newValue;
			this.#resubscribe(newValue);
		} else if (name === "breed-name") {
			this.#breedName = newValue?.toLowerCase();
			if (!this.#breedSelectID) { this.#repopulate(); }
		} else if (name === "slot") {
			this.#slot = newValue ?? "primary";
			this.#repopulate();
		}
	}

	connectedCallback() {
		this.#isPopulated = true;
		this.#resubscribe(this.#breedSelectID);
	}

	disconnectedCallback() {
		if (this.#unsubscribe) {
			this.#unsubscribe();
		}
	}

	#repopulate(breedVal) {
		if (!this.isConnected || !this.#isPopulated) {
			return;
		}

		const oldSelectedVal = this.value;
		let oldVal, defVal;

		if (!breedVal) {
			breedVal = bgPubSub.checkMessage(this.#breedSelectID)
				?? (
					this.#breedName
						? FR.BREEDS.findIndex(x => x.name.toLowerCase() === this.#breedName)
						: null
				);
		}

		for (let i = this.length - 1; i >= 0; i--) {
			if (this[i].dataset.auto) { this.remove(i); }
		}

		for (const op of this.options) {
			if (op.text.toLowerCase() === this.#defaultName) {
				defVal = op.value;
				break;
			}
		}

		for (const { index, name } of FR.genesForBreed(this.#slot, breedVal)) {
			if (!oldVal && index.toString() === oldSelectedVal) {
				oldVal = index;
			}
			if (!defVal && name.toLowerCase() === this.#defaultName) {
				defVal = index;
			}
			const op = document.createElement("option");
			[op.value, op.text] = [index, name];
			op.dataset.auto = true;
			this.add(op);
		}
		this.value = oldVal ?? defVal ?? this[0].value;
	}
}

customElements.define("fr-eyes", EyeSelect, { extends: "select" });
customElements.define("fr-colours", ColourSelect, { extends: "select" });
customElements.define("fr-breeds", BreedSelect, { extends: "select" });
customElements.define("fr-genes", GeneSelect, { extends: "select" });
