/*
 * Personal tweaks for clean-jsdoc-theme. On all pages except the home page and source
 * code pages, Makes the table of contents move between the sidebar and the mobile menu as
 * the layout changes according to screen size.
 * 
 * author: egad13
*/

// IIFE so we don't clutter the global namespace
(function () {
	const currentUrl = window.location.origin + window.location.pathname;
	let relatedTutsHeader;

	document.addEventListener("readystatechange", e => {
		if (document.readyState !== "loading") {
			setupTutorialMenu();
			setupToC();
		}
		if (document.readyState === "complete") {
			relatedTutsHeader.className = "";
			relatedTutsHeader.removeChild(relatedTutsHeader.querySelector("a"));
		}
	});

	function setupTutorialMenu() {
		if (!currentUrl.includes("tutorial")) {
			return;
		}

		const header = document.querySelector(".main-content header"),
			article = document.querySelector(".main-content article");

		// Change tutorial title from h2 to h1
		const title = header.querySelector("h2"),
			newTitle = document.createElement("h1");

		newTitle.id = "article-title";
		newTitle.classList = title.classList;
		newTitle.append(...title.childNodes);
		header.replaceChild(newTitle, title);

		// Move sub-tutorial directory to top of <article>
		const tutorialChildren = header.querySelector("ul");
		if (!tutorialChildren) {
			setupTutorialMenu = () => { };
			return;
		}

		const tutorialChildrenHeader = document.createElement("h2");
		tutorialChildrenHeader.innerText = "Sub-Tutorials";
		tutorialChildrenHeader.id = "sub-tutorials";
		const container = document.createElement("nav");
		container.append(tutorialChildrenHeader, tutorialChildren);

		article.prepend(container);

		relatedTutsHeader = tutorialChildrenHeader;

		// Overwrite ourselves with a blank function so that we can only do this setup
		// one time
		setupTutorialMenu = ()=>{};
	}

	function setupToC() {
		// if source code page, abort
		if (isSourcePage()) {
			return;
		}

		// Create screen size watchers
		const mediaMobile = window.matchMedia("screen and (max-width:65em)");
		const mediaSidebar = window.matchMedia("screen and (max-width:100em)");

		// Change tocbot onClick method to also hide the mobile menu if we're
		// on mobile screen size. Also makes it properly link to the page top on tutorials.
		function closeMobileMenu(ev) {
			if (mediaMobile.matches) {
				hideMobileMenu();
			}
		}
		const orig = tocbotInstance.options.onClick;
		tocbotInstance.refresh({
			...tocbotInstance.options,
			onClick: e => {
				orig(e);
				closeMobileMenu();
			}
		});

		// Find table of contents
		const tocDiv = document.querySelector(tocbotInstance.options.tocSelector);
		const tocOrigParent = tocDiv.parentElement;

		// Find current page section in menus
		const sideSections = document.querySelectorAll("#sidebar .sidebar-section-children");
		const mobileSections = document.querySelectorAll("#mobile-sidebar .sidebar-section-children");
		
		let sidebarDiv;
		for (const s of sideSections) {
			if (s.firstChild.href === currentUrl) {
				sidebarDiv = s;
				break;
			}
		}

		let mobileDiv;
		for (const s of mobileSections) {
			if (s.firstChild.href === currentUrl) {
				mobileDiv = s;
				break;
			}
		}

		// Change behaviour of current page sidebar links - just bring us back to the top
		// of the page, rather than reloading it
		const pageTopHref = tocDiv.querySelector("a.node-name--H1")?.href
			?? tocDiv.querySelector("a.node-name--H2")?.href
			?? tocDiv.querySelector("a.node-name--H3")?.href;
		mobileDiv.firstChild.href = pageTopHref;
		mobileDiv.firstChild.addEventListener("click", ev => closeMobileMenu);
		sidebarDiv.firstChild.href = pageTopHref;
		sidebarDiv.firstChild.addEventListener("click", ev => closeMobileMenu);

		// Attach event listeners that will shift the table of contents between its
		// original location, the sidebar, and the mobile menu as the screen changes size
		function moveToc(ev) {
			if (mediaMobile.matches && mobileDiv) {
				mobileDiv.append(tocDiv);
			} else if (mediaSidebar.matches && sidebarDiv) {
				sidebarDiv.append(tocDiv);
			} else {
				tocOrigParent.append(tocDiv);
			}
		}
		mediaMobile.addEventListener("change", moveToc);
		mediaSidebar.addEventListener("change", moveToc);
		moveToc(); // to move it premptively if the page starts with a thinner width

		// Overwrite ourselves with a blank function so that we can only do this setup
		// one time
		setupToC = ()=>{};
	}
})();
