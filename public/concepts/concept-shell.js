(function () {
	const root = document.querySelector("[data-concept-shell]");

	if (!root) {
		return;
	}

	const stage = root.querySelector("[data-concept-stage]");
	const wrap = root.querySelector(".concept-canvas-wrap");
	const canvas = root.querySelector("[data-concept-canvas]");
	const iframe = root.querySelector("iframe");

	if (!stage || !wrap || !canvas || !iframe) {
		return;
	}

	const desktopSrc = root.dataset.desktop;
	const mobileSrc = root.dataset.mobile;
	const desktopWidth = Number(root.dataset.desktopWidth || 1440);
	const mobileWidth = Number(root.dataset.mobileWidth || 375);
	const mobileBreakpoint = Number(root.dataset.mobileBreakpoint || 767);
	const query = new URLSearchParams(window.location.search);
	const forcedViewParam = query.get("view");
	const forcedView = forcedViewParam === "desktop" || forcedViewParam === "mobile" ? forcedViewParam : "";
	const metaRight = root.querySelector(".concept-meta__right");

	let currentView = "";
	let currentWidth = desktopWidth;

	function getVisibleContentHeight(doc) {
		const frame = doc.querySelector(".frame");

		if (!frame) {
			return 0;
		}

		const visibleChildren = Array.from(frame.children).filter(function (el) {
			return doc.defaultView.getComputedStyle(el).display !== "none";
		});

		if (!visibleChildren.length) {
			return 0;
		}

		const bottoms = visibleChildren.map(function (el) {
			return el.offsetTop + el.getBoundingClientRect().height;
		});

		return Math.ceil(Math.max.apply(Math, bottoms));
	}

	function getPreferredView() {
		if (forcedView) {
			return forcedView;
		}

		return window.innerWidth <= mobileBreakpoint ? "mobile" : "desktop";
	}

	function getNaturalHeight() {
		try {
			const doc = iframe.contentWindow.document;
			const contentHeight = getVisibleContentHeight(doc);
			const docHeight = Math.max(
				doc.documentElement.scrollHeight,
				doc.body ? doc.body.scrollHeight : 0,
				doc.documentElement.offsetHeight,
				doc.body ? doc.body.offsetHeight : 0
			);

			if (contentHeight && docHeight - contentHeight > 120) {
				return contentHeight;
			}

			return Math.max(
				contentHeight,
				docHeight
			);
		} catch (error) {
			return 0;
		}
	}

	function applyScale() {
		const naturalHeight = getNaturalHeight();

		if (!naturalHeight) {
			return;
		}

		const availableWidth = wrap.clientWidth;
		const scale = Math.min(1, availableWidth / currentWidth);

		canvas.style.width = `${Math.round(currentWidth * scale)}px`;
		canvas.style.height = `${Math.ceil(naturalHeight * scale)}px`;
		iframe.style.width = `${currentWidth}px`;
		iframe.style.height = `${naturalHeight}px`;
		iframe.style.transform = `scale(${scale})`;
	}

	function stabilizeMeasure(framesLeft) {
		applyScale();

		if (framesLeft > 0) {
			window.requestAnimationFrame(function () {
				stabilizeMeasure(framesLeft - 1);
			});
		}
	}

	function setView(force) {
		const nextView = getPreferredView();

		if (!force && nextView === currentView) {
			applyScale();
			return;
		}

		currentView = nextView;
		currentWidth = nextView === "mobile" ? mobileWidth : desktopWidth;
		root.dataset.view = nextView;
		iframe.src = nextView === "mobile" ? mobileSrc : desktopSrc;
	}

	iframe.addEventListener("load", function () {
		stabilizeMeasure(18);
	});

	root.addEventListener("contextmenu", function (event) {
		event.preventDefault();
	});

	root.addEventListener("dragstart", function (event) {
		event.preventDefault();
	});

	window.addEventListener("resize", function () {
		if (forcedView) {
			applyScale();
			return;
		}

		const nextView = getPreferredView();

		if (nextView !== currentView) {
			setView(true);
			return;
		}

		applyScale();
	});

	if ("ResizeObserver" in window) {
		new ResizeObserver(function () {
			applyScale();
		}).observe(stage);
	}

	if (forcedView && metaRight) {
		metaRight.textContent = forcedView === "mobile" ? "Mobile preview only" : "Desktop preview only";
	}

	setView(true);
})();
