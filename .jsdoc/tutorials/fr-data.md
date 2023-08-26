
The {@link module:fr/data fr/data} module is the core of the library. It contains detailed data about Flight Rising's breeding mechanics, and functions to perform some common comparisons and searches on that data.

## Usage

### 0. Set up your environment

`fr/data` is an ES6 module. This means that it will work when the file is being delivered by a server, but NOT if you just open an html file in your browser with the `file:///` protocol.

So, if you're testing your project locally (which you probably should), you'll need to run an HTTP server. This is a lot easier than it sounds!

If you have python installed, open a command line terminal in the base folder of your project. You can either run the command `python -m http.server` to serve a basic HTTP server, or you can run [this python script I wrote that serves a non-caching HTTP server](https://gist.github.com/egad13/456511ef2cd80e2fa60baee6da41f8ce).

**Keep the terminal window open**. You can now go to the URL `http://localhost:8000/` in your browser, and you should see the contents of the `index.html` in the folder you started up the script.

If you want to try another method of running an HTTP server, [MDN has a guide about it](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Tools_and_setup/set_up_a_local_testing_server).

### 1. Import the module

You can do this in whichever scripts need access to FR data and functions.
```js
// ES6 module
import * as FRdata from "path/to/fr/data.js";

// Plain javascript file
import("path/to/fr/data.js").then(FRdata => {
    // ...code...
});

// In an async function
const FRdata = await import("path/to/fr/data.js");
```

You should also consider preloading it in your HTML files, for a potential performance improvement in Firefox and chromium browsers.
```html
<head>
    <link rel="modulepreload" href="path/to/fr/data.js" />
    <!-- ...etc... -->
```

### 2. Start Coding!

You now have access to data about Flight Rising's breeds, genes, colours, eye types, and nest sizes at your disposal, along with a handful of functions to help you work with that data. See the {@link module:fr/data documentation for fr/data} for details.

## Remember: The Functions Need Indexes

Many functions in `fr/data` ask for you to input one or more genes, breeds, or colours as a parameter. Remember that these functions always expect these to be <em>indexes</em> in the appropriate array from `fr/data`.

For example, if you wanted to find the length of the range between the colours Peridot and Seafoam, you need to find the indexes of those colours first and then pass them to the right function:
```js
import * as FRdata from "path/to/fr/data.js";

const peridotIdx = FRdata.colours.findIndex(x => x.name === "Peridot");
const seafoamIdx = FRdata.colours.findIndex(x => x.name === "Seafoam");

const rangeLength = FRdata.colourRangeLength(peridotIdx, seafoamIdx);
// rangeLength is 23
```

## Using Data From `fr/forms`

The `fr/forms` module creates a handful of custom dropdown elements that automatically self-populate with genes, colours, and more. The values of the dropdown options are always the index of that element in its array in `fr/data`; that means you can use the dropdown values as paramaters for functions in `fr/data` without doing any extra work!

For example, if you wanted to get the range of colours between two colours that a user selects and output them as a list:
```html
<html>
<head>
    <script type="module" src="path/to/fr/forms.js"></script>
    <script type="module" src="example.js"></script>
</head>
<body>
    <label>
        Colour 1:
        <select is="fr-colours" id="colour-1"></select>
    </label>
    <label>
        Colour 2:
        <select is="fr-colours" id="colour-2"></select>
    </label>
    <button id="find-range">Find Range Length</button>
    <div id="output"></div>
</body>
</html>
```
```js
// example.js
import * as FRdata from "path/to/fr/data.js";

const colour1 = document.querySelector("#colour-1"),
    colour2 = document.querySelector("#colour-2"),
    button = document.querySelector("#find-range"),
    output = document.querySelector("#output");

button.addEventListener("click", () => {
    let results = `<p>The colours in the range are:</p><ul>`;

    for (const colour of FRdata.colourRange(colour1.value, colour2.value)) {
        results += `<li>${colour.name}</li>`;
    }

    output.innerHTML = results;
});
```

For more information on what custom dropdowns are available and how to use them, see {@tutorial fr-forms}.
