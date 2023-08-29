# FRjs

 A javascript library that makes developing external tools for [Flight Rising](https://www1.flightrising.com/) a breeze. Dragon attribute data, utility functions, and automatic form components.

Available modules include:

- **FRjs/data**: Comprehensive data about Flight Rising's dragon attributes, and a suite of utility functions to make working with that data easier. Includes data on breeds, genes, colours, eye types, and nest sizes. Includes functions for getting colour ranges, working with breeding mechanics like rarity and breed compatibility, and more.
- **FRjs/forms**: Custom form components to take the headache out of setting up user inputs for your tools. Just add an attribute or two to your HTML markup, and get dropdowns that self-populate with options for breeds, genes, colours, and eye types. Works effortlessly with FRjs/data arrays and functions.

## Where do I get it?

The most convenient way to get the library is to load it from the jsDeliver CDN. I recommend sticking to the latest major version, so that you get updates like gene expansions ASAP and avoid getting surprised by any breaking changes in major version releases.
```bash
# Specific major version - recommended
https://cdn.jsdelivr.net/gh/egad13/FRjs@1/dist/data.min.js
```

For easiest usage, and minimal headaches from long import statements and version numbers, I recommend adding FRjs to your import map. For example:
```html
<head>
	<!-- Recommended: polyfill for better import map support -->
	<script async src="https://unpkg.com/es-module-shims@1.8/dist/es-module-shims.js"></script>

	<script type="importmap">
	{
		"imports": {
			"FRjs/": "https://cdn.jsdelivr.net/gh/egad13/FRjs@1/dist/"
		}
	}
	</script>

	<script type="module">
		import * as FR from "FRjs/data.js";
		import("FRjs/forms.js");
		// ...
	</script>
```

If you want to self-host the library instead, you can [get the latest release from Github](https://github.com/egad13/FRjs/releases/latest). This is a convenient way to use the library in local development environments because it lets your IDE do code completion, among other things. However, this is not recommended for production environments, because you won't automatically receive the semi-frequent patches the data module gets to keep up with changes on Flight Rising.

## How do I use it?

You can use any module in FRjs by just importing it in the script file you want to use it in, using your standard `import` statement and/or `import()` function.

For example, to use FRjs/data:
```js
// In an ES6 module
import * as FRdata from "path/to/FRjs/data.js";

// In a plain javascript file
import("path/to/FRjs/data.js").then(FRdata => {
    // ...code...
});

// In an async function
const FRdata = await import("path/to/FRjs/data.js");
```

For detailed usage of a particular module, see that module's tutorial and/or documentation:

- **FRjs/data**:
  - [Tutorial](https://egad13.github.io/FRjs/tutorial-01-fr-data.html)
  - [Docs](https://egad13.github.io/FRjs/docs/module-FRjs_data.html)
- **FRjs/forms**:
  - [Tutorial](https://egad13.github.io/FRjs/tutorial-02-fr-forms.html)
  - [Docs](https://egad13.github.io/FRjs/docs/module-FRjs_forms.html)

## Browser Compatibility

FRjs is built to work on modern browsers. Based on [Can I Use](http://caniuse.com) support tables, it should work on recent versions of all major desktop browsers and most major mobile browsers; overall, it should work out of the box for about 90% of users globally.

At some point in the future I may start releasing a version of FRjs that's transpiled for older browsers, but given the state of the support tables, I currently don't see a need to.

## A Note on Local Testing

FRjs is made of ES6 modules. This means that it will work when the files are being delivered by a server, but ***won't*** work if you just open an html file in your browser with the `file:///` protocol. If you choose to host the library on your local machine for any reason, you'll need to run a local HTTP server.

You can do this easily with python by running `python -m http.server` in the root folder of your project. (Or alternatively: [python script for a non-caching server](https://gist.github.com/egad13/456511ef2cd80e2fa60baee6da41f8ce).) Your project should be reachable in-browser from `http://localhost:8000/`; provided your local copies of FRjs are in that folder somewhere, they'll also be available for import under that domain.

If you want to try another method of running an HTTP server, [MDN has a guide about it](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Tools_and_setup/set_up_a_local_testing_server).
