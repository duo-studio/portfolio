let lenis;
let lenisTickerCallback;
var activeSplitInstances = [];
var splitResizeHandler = null;

function pushDataLayerEvent(eventName, params) {
	if (typeof window.duoPushEvent === "function") {
		window.duoPushEvent(eventName, params);
		return;
	}

	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push(
		Object.assign(
			{
				event: eventName,
			},
			params || {},
		),
	);
}

function normalizeAnalyticsText(value) {
	return (value || "").replace(/\s+/g, " ").trim();
}

function getAnalyticsHref(element) {
	if (!element || typeof element.getAttribute !== "function") {
		return "";
	}

	return normalizeAnalyticsText(element.getAttribute("href") || "");
}

function getCtaLocation(element) {
	var explicitLocation = element?.getAttribute("data-cta-location");
	if (explicitLocation) {
		return explicitLocation;
	}

	if (element?.closest(".roi-tool-results-cta")) {
		return "roi_results";
	}

	if (element?.closest(".roi-next")) {
		return "roi_next_step";
	}

	if (element?.closest("nav")) {
		return "header_nav";
	}

	if (element?.closest("footer")) {
		return "footer";
	}

	if (element?.closest("[data-contact-form]")) {
		return "contact_form";
	}

	var section = element?.closest("section[id]");
	if (section?.id) {
		return section.id;
	}

	return "unknown";
}

function getCtaPayload(element) {
	return {
		link_text: normalizeAnalyticsText(element?.textContent),
		href: getAnalyticsHref(element),
		page_path: window.location.pathname,
		cta_location: getCtaLocation(element),
	};
}

function isContactIntentCta(payload) {
	return (
		payload.href.indexOf("/contact/") === 0 ||
		payload.href.indexOf("mailto:") === 0 ||
		payload.href.indexOf("tel:") === 0 ||
		/contact|talk|call|email|get in touch|strategy call|start a project/i.test(
			payload.link_text,
		)
	);
}

function isStartProjectCta(payload) {
	return /start a project/i.test(payload.link_text);
}

function bindGlobalAnalyticsEvents() {
	if (document.documentElement.dataset.analyticsBound === "true") {
		return;
	}

	document.documentElement.dataset.analyticsBound = "true";

	document.addEventListener("click", function (event) {
		var target = event.target;
		if (!target || typeof target.closest !== "function") {
			return;
		}

		var element = target.closest("a[href], button[data-analytics-click]");
		if (!element) {
			return;
		}

		var payload = getCtaPayload(element);

		if (isContactIntentCta(payload)) {
			pushDataLayerEvent("cta_contact_click", payload);
		}

		if (isStartProjectCta(payload)) {
			pushDataLayerEvent("cta_start_project_click", payload);
		}

		if (
			document.querySelector(".roi-tool-page") &&
			(element.closest(".roi-tool-results-cta") || element.closest(".roi-next"))
		) {
			pushDataLayerEvent(
				"roi_calculator_cta_click",
				Object.assign({ tool_name: "website_roi_calculator" }, payload),
			);
		}
	});
}

function bindMeaningfulStart(form, eventName) {
	var stateAttr = "data-analytics-" + eventName.replace(/_/g, "-");

	if (!form || form.getAttribute(stateAttr) === "true") {
		return;
	}

	function trackStart(target) {
		if (!target || !form.contains(target)) {
			return;
		}

		if (/^(hidden|submit|button)$/i.test(target.type || "")) {
			return;
		}

		var value =
			target.type === "checkbox" || target.type === "radio"
				? String(Boolean(target.checked))
				: normalizeAnalyticsText(target.value);

		if (!value || value === "false") {
			return;
		}

		form.setAttribute(stateAttr, "true");
		pushDataLayerEvent(eventName, {
			form_name: form.getAttribute("name") || form.getAttribute("id") || "unknown",
			page_path: window.location.pathname,
		});
		form.removeEventListener("input", handleInput, true);
		form.removeEventListener("change", handleChange, true);
	}

	function handleInput(event) {
		trackStart(event.target);
	}

	function handleChange(event) {
		trackStart(event.target);
	}

	form.addEventListener("input", handleInput, true);
	form.addEventListener("change", handleChange, true);
}

document.addEventListener("DOMContentLoaded", function (event) {
	bindGlobalAnalyticsEvents();
	gsap.registerPlugin(ScrollTrigger, SplitText);

	gsap.set(".cursor", { xPercent: -50, yPercent: -50 });

	var cursor = document.querySelector(".cursor");
	var pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
	var mouse = { x: pos.x, y: pos.y };
	var speed = 0.1;

	var fpms = 60 / 1000;

	var xSet = gsap.quickSetter(cursor, "x", "px");
	var ySet = gsap.quickSetter(cursor, "y", "px");

	document.body.addEventListener("mousemove", (e) => {
		mouse.x = e.x;
		mouse.y = e.y;
	});

	gsap.ticker.add((time, deltaTime) => {
		var delta = deltaTime * fpms;
		var dt = 1.0 - Math.pow(1.0 - speed, delta);

		pos.x += (mouse.x - pos.x) * dt;
		pos.y += (mouse.y - pos.y) * dt;
		xSet(pos.x);
		ySet(pos.y);
	});

	//REFRESH ON ORIENTATION CHANGE https://stackoverflow.com/questions/17708869/how-to-reload-the-webpage-when-orientation-changes
	window.onorientationchange = function () {
		var orientation = window.orientation;
		switch (orientation) {
			case 0:
			case 90:
			case -90:
				window.location.reload();
				break;
		}
	};
});

window.addEventListener("load", (event) => {
	// NAV

	if (window.innerWidth > 1024) {
		navItems = document.querySelectorAll(
			"nav:not(.anchors) .nav-items__inner .nav-item",
		);
		containerItems = document.querySelectorAll(".nav-container__inner");

		var marqueeTimelines = [];
		var marqueeSpeed = 300;
		navItems.forEach((item, i) => {
			var el = containerItems[i].querySelector(".nav-marquee"),
				container = el.querySelector(".nav-marquee__container"),
				marquee = el.querySelector(".nav-marquee__inner"),
				w = marquee.clientWidth,
				x = Math.round(window.innerWidth / w + 1),
				dur = w / marqueeSpeed;

			for (var y = 0; y < x; y++) {
				var clone = marquee.cloneNode(true);
				container.appendChild(clone);
			}

			var marqueeTl = gsap.timeline({ paused: true });
			marqueeTl.to(container, {
				duration: dur,
				ease: "none",
				x: "-=" + w,
				modifiers: {
					x: gsap.utils.unitize((x) => parseFloat(x)),
				},
				repeat: -1,
			});
			marqueeTimelines.push({
				containerItem: containerItems[i],
				tl: marqueeTl,
			});
			item.addEventListener("mouseenter", function () {
				containerItems[i].classList.add("active");
				document.body.classList.add("init__nav");
				marqueeTl.play();
			});

			item.addEventListener("mouseleave", function () {
				containerItems[i].classList.remove("active");
				document.body.classList.remove("init__nav");
				marqueeTl.pause();
			});
		});

		var ctaBtn = document.querySelector("nav:not(.anchors) .nav-cta");
		var contactContainer = document.querySelector(
			".nav-container__inner.contact",
		);
		if (ctaBtn && contactContainer) {
			var contactEl = contactContainer.querySelector(".nav-marquee"),
				contactC = contactEl.querySelector(".nav-marquee__container"),
				contactM = contactEl.querySelector(".nav-marquee__inner"),
				contactW = contactM.clientWidth,
				contactX = Math.round(window.innerWidth / contactW + 1);
			for (var cy = 0; cy < contactX; cy++) {
				contactC.appendChild(contactM.cloneNode(true));
			}
			var contactTl = gsap.timeline({ paused: true });
			contactTl.to(contactC, {
				duration: contactW / marqueeSpeed,
				ease: "none",
				x: "-=" + contactW,
				modifiers: {
					x: gsap.utils.unitize(function (x) {
						return parseFloat(x);
					}),
				},
				repeat: -1,
			});
			ctaBtn.addEventListener("mouseenter", function () {
				contactContainer.classList.add("active");
				document.body.classList.add("init__nav");
				contactTl.play();
			});
			ctaBtn.addEventListener("mouseleave", function () {
				contactContainer.classList.remove("active");
				document.body.classList.remove("init__nav");
				contactTl.pause();
			});
		}
	} else {
		var navToggle = document.querySelector(".nav-toggle");
		navToggle.addEventListener("click", function () {
			document.body.classList.toggle("init__nav");
		});
	}
});

function initStickyProgressBars() {
	gsap.utils.toArray(".pin__sticky").forEach((pin) => {
		var minor = pin.querySelector(".minor");
		var bar = pin.querySelector(".bar");
		if (!minor || !bar) return;

		ScrollTrigger.create({
			trigger: pin,
			start: "top 80px",
			end: () => "+=" + (pin.offsetHeight - minor.offsetHeight),
			onUpdate: (self) => {
				bar.style.width = self.progress * 100 + "%";
			},
		});
	});
}

function initSplitHeadlines() {
	cleanupSplitHeadlines();

	if (document.querySelector(".st__headline")) {
		gsap.utils.toArray(".st__headline").forEach(function (headline) {
			var splitInner = new SplitText(headline, {
				type: "lines",
				linesClass: "line__inner",
			});
			var splitOuter = new SplitText(headline, {
				type: "lines",
				linesClass: "line__outer",
			});

			if (headline.dataset.splitRevealed) {
				gsap.set(headline, { pointerEvents: "initial" });
				activeSplitInstances.push({ inner: splitInner, outer: splitOuter });
				return;
			}

			var triggerEl, start;
			if (headline.classList.contains("headline__footer")) {
				triggerEl = headline.closest(".footer-spacer") || headline;
				start = "top 30%";
			} else {
				triggerEl = headline;
				start = "top 85%";
			}

			var tl = gsap.timeline({
				onComplete: function () {
					gsap.set(headline, { pointerEvents: "initial" });
					headline.dataset.splitRevealed = "true";
				},
				scrollTrigger: {
					trigger: triggerEl,
					start: start,
				},
			});
			tl.from(splitInner.lines, 0.8, {
				yPercent: 50,
				rotation: 5,
				opacity: 0,
				ease: "power2.easeOut",
				stagger: 0.1,
			});

			activeSplitInstances.push({
				inner: splitInner,
				outer: splitOuter,
				timeline: tl,
			});
		});
	}

	if (document.querySelector(".st__headline--spread")) {
		document
			.querySelectorAll(".st__headline--spread")
			.forEach(function (headline) {
				var start = headline.classList.contains("--banner")
					? "top top"
					: "top bottom";
				var trigger = headline.closest("section");

				var splitInner = new SplitText(headline, {
					type: "lines",
					linesClass: "line__inner",
				});
				var splitOuter = new SplitText(headline, {
					type: "lines",
					linesClass: "line__outer",
				});

				var tweens = [];
				if (splitOuter.lines[0]) {
					tweens.push(
						gsap.to(splitOuter.lines[0], {
							xPercent: -15,
							scrollTrigger: {
								trigger: trigger,
								start: start,
								scrub: 1.2,
							},
						}),
					);
				}
				if (splitOuter.lines[1]) {
					tweens.push(
						gsap.to(splitOuter.lines[1], {
							xPercent: 15,
							scrollTrigger: {
								trigger: trigger,
								start: start,
								scrub: 1.2,
							},
						}),
					);
				}

				activeSplitInstances.push({
					inner: splitInner,
					outer: splitOuter,
					tweens: tweens,
				});
			});
	}

	ScrollTrigger.refresh();
}

function cleanupSplitHeadlines() {
	activeSplitInstances.forEach(function (instance) {
		if (instance.timeline) {
			if (instance.timeline.scrollTrigger)
				instance.timeline.scrollTrigger.kill();
			instance.timeline.kill();
		}
		if (instance.tweens) {
			instance.tweens.forEach(function (tw) {
				if (tw.scrollTrigger) tw.scrollTrigger.kill();
				tw.kill();
			});
		}
		try {
			instance.outer.revert();
			instance.inner.revert();
		} catch (e) {}
	});
	activeSplitInstances = [];
}

function loadGlobalScripts() {
	if (document.querySelector(".cursor__hide")) {
		gsap.utils.toArray(".cursor__hide").forEach((el) => {
			el.addEventListener("mouseenter", function () {
				document.body.classList.add("cursor__hidden");
			});
			el.addEventListener("mouseleave", function () {
				document.body.classList.remove("cursor__hidden");
			});
		});
	}

	if (document.querySelector(".cursor__hover")) {
		document.querySelectorAll(".cursor__hover").forEach((hover) => {
			var text = hover.getAttribute("data-attribute-text");

			if (hover.classList.contains("--highlight")) {
				var highlight = "--highlight";
			} else {
				var highlight = "";
			}
			hover.addEventListener("mouseenter", function () {
				document.querySelector(".cursor span").textContent = text;
				document.body.classList.add("cursor__hover" + highlight);
			});
			hover.addEventListener("mouseleave", function () {
				document.body.classList.remove("cursor__hover" + highlight);
			});
		});
	}

	//  GLOBAL TEXT LOAD

	// TEXT TRANSITIONS — deferred until fonts are ready to prevent incorrect line breaks
	document.fonts.ready.then(function () {
		initSplitHeadlines();
	});

	if (splitResizeHandler) {
		window.removeEventListener("resize", splitResizeHandler);
	}
	var splitResizeTimer;
	splitResizeHandler = function () {
		clearTimeout(splitResizeTimer);
		splitResizeTimer = setTimeout(function () {
			initSplitHeadlines();
		}, 250);
	};
	window.addEventListener("resize", splitResizeHandler);

	if (document.querySelector(".st__text")) {
		gsap.utils.toArray(".st__text").forEach((headline) => {
			gsap.from(headline, 1, {
				y: 40,
				opacity: 0,
				ease: "power2.easeOut",
				scrollTrigger: {
					trigger: headline,
					start: "top 90%",
				},
			});
		});
	}
	// IMAGE TRANSITIONS

	if (document.querySelector(".st__image")) {
		gsap.utils.toArray(".st__image").forEach((image) => {
			var pos = image.getAttribute("data-attribute-pos");
			var fade = image.getAttribute("data-attribute-fade");

			if (pos == "right" || pos == "down") {
				var skew = -5;
				pos == "down" ? (skew = 5) : (skew = -5);

				if (window.innerWidth > 1024) {
					var y = "25";
				} else {
					var y = "20";
				}
			} else {
				var skew = 5;
				var y = "-25";

				if (window.innerWidth > 1024) {
					var y = "-25";
				} else {
					var y = "-20";
				}
			}

			if (fade) {
				var opacity = 1;
			} else {
				var opacity = 0;
			}

			gsap.from(image, 0.8, {
				skewY: skew,
				yPercent: 35,
				opacity: opacity,
				scrollTrigger: {
					trigger: image,
					start: "top 100%",
					ease: "power3.In",
				},
			});

			//PARALLAX

			var plaxEl = image.closest(".st__image-container");

			if (plaxEl) {
				gsap.to(plaxEl, {
					yPercent: y,
					scrollTrigger: {
						trigger: plaxEl,
						start: "top bottom",
						scrub: true,
					},
				});
			}
		});
	}
	if (document.querySelector(".st__full-width")) {
		gsap.utils.toArray(".st__full-width").forEach((container) => {
			var image = container.querySelector("img");
			gsap.to(image, {
				scale: 1,
				scrollTrigger: {
					trigger: container,
					scrub: true,
					ease: "power3.Out",
				},
			});
		});
	}
	if (document.querySelector(".st__plax")) {
		gsap.utils.toArray(".st__plax").forEach((container) => {
			var image = container.querySelector(".st__plax--inner");
			var y = container.classList.contains("--full") ? 40 : 20;
			if (container.classList.contains("--banner")) {
				var start = "top top";
			} else {
				var start = "top bottom";
			}

			gsap.to(image, {
				yPercent: y,
				scrollTrigger: {
					trigger: container,
					scrub: true,
					ease: "power3.Out",
					start: start,
				},
			});
		});
	}
	// MAGNETIC BUTTON

	var buttons = document.querySelectorAll(".btn__circle");

	if (buttons) {
		buttons.forEach((btn) => {
			var offsetHoverMax = 1;
			var offsetHoverMin = 1;
			var hover = false;

			window.addEventListener("mousemove", function (e) {
				var hoverArea = hover ? offsetHoverMax : offsetHoverMin;

				var cursor = {
					x: e.clientX,
					y: e.clientY + this.window.scrollY,
				};

				var width = btn.clientWidth;
				var height = btn.clientHeight;

				function getOffset(element) {
					if (!element.getClientRects().length) {
						return { top: 0, left: 0 };
					}

					let rect = element.getBoundingClientRect();
					let win = element.ownerDocument.defaultView;
					return {
						top: rect.top + win.pageYOffset,
						left: rect.left + win.pageXOffset,
					};
				}
				var offset = getOffset(btn);

				var elPos = {
					x: offset.left + width / 2,
					y: offset.top + height / 2,
				};

				var x = cursor.x - elPos.x;
				var y = cursor.y - elPos.y;

				var dist = Math.sqrt(x * x + y * y);

				var mutHover = false;

				if (dist < width * hoverArea) {
					mutHover = true;
					if (!hover) {
						hover = true;
					}
					onHover(x, y);
				}

				if (!mutHover && hover) {
					onLeave();
					hover = false;
				}
			});

			var onHover = function (x, y) {
				document.body.classList.add("cursor__hidden");
				btn.classList.add("active");
				gsap.to(btn, 0.4, {
					x: x * 0.4,
					y: y * 0.4,
					ease: "power2.easeOut",
				});
				gsap.to(btn.querySelector("*"), 0.4, {
					x: x * 0.1,
					y: y * 0.1,
					ease: "power2.easeOut",
				});
			};

			var onLeave = function () {
				document.body.classList.remove("cursor__hidden");
				btn.classList.remove("active");
				gsap.to(btn, 1, {
					x: 0,
					y: 0,
					scale: 1,
					ease: Elastic.easeOut.config(1.2, 0.4),
				});
				gsap.to(btn.querySelector("*"), 1, {
					x: 0,
					y: 0,
					scale: 1,
					ease: Elastic.easeOut.config(1.2, 0.4),
				});
			};
		});
	}

	// LINES
	if (document.querySelector(".st__line")) {
		gsap.utils.toArray(".st__line").forEach((line, i) => {
			gsap.to(line, 0.8, {
				width: "100vw",
				scrollTrigger: {
					trigger: line,
					start: "top bottom",
					ease: "power2.easeIn",
				},
			});
		});
	}

	// FOOTER

	if (document.querySelector(".horizontal") && window.innerWidth > 1024) {
		var slider = document.querySelector(".horizontal");

		var horizontalScroll = gsap.to(slider, {
			x: () =>
				-slider.scrollWidth +
				slider.closest(".section__wrapper").clientWidth +
				"px",
			ease: "none",
			scrollTrigger: {
				trigger: slider.closest(".section__wrapper"),
				invalidateOnRefresh: true,
				pin: true,
				pinSpacing: true,
				scrub: true,
				start: "top top",
				end: "250% bottom",
				anticipatePin: 1,
				id: "horizontalSlider",
				onUpdate: (self) => {
					document.querySelector(".bar").style.width =
						self.progress * 100 + "%";
				},
			},
		});

		gsap.utils.toArray(".horizontal .col").forEach((col) => {
			gsap.to(col, {
				opacity: 1,
				scrollTrigger: {
					trigger: col,
					containerAnimation: horizontalScroll,
					start: "left 56%",
					toggleActions: "play none none reverse",
				},
			});
		});
	}

	var footerPin = document.querySelector(".footer-spacer");

	if (footerPin) {
		var footerEl = footerPin.querySelector("footer");
		var footerH = footerEl ? footerEl.offsetHeight : window.innerHeight;

		if (window.innerHeight > 650) {
			gsap.from("footer", {
				yPercent: -50,
				opacity: 0,
				scrollTrigger: {
					trigger: footerPin,
					start: "top bottom",
					scrub: true,
					end: () => "+=" + footerH,
				},
			});
		}
	}

	if (document.querySelector(".bg__trigger")) {
		gsap.utils.toArray(".bg__trigger").forEach((section) => {
			ScrollTrigger.create({
				trigger: section,
				start: "top 50%",
				end: "bottom 50%",
				toggleClass: { targets: "body", className: "bg__dark" },
			});
		});
	}

	if (document.querySelector("form")) {
		document.querySelectorAll("input, textarea").forEach((input) => {
			input.addEventListener("focus", function () {
				var parent = this.closest(".input-wrapper");
				parent ? parent.classList.add("active") : null;
			});

			input.addEventListener("focusout", function () {
				var parent = this.closest(".input-wrapper");
				parent ? parent.classList.remove("active") : null;
			});
		});
		// TEXTAREA AUTOHEIGHT
		// source:https://stackoverflow.com/questions/454202/creating-a-textarea-with-auto-resize
		const tx = document.getElementsByTagName("textarea");
		for (let i = 0; i < tx.length; i++) {
			tx[i].setAttribute(
				"style",
				"height:" + tx[i].scrollHeight + "px;overflow-y:hidden;",
			);
			tx[i].addEventListener("input", OnInput, false);
		}

		function OnInput() {
			this.style.height = "auto";
			this.style.height = this.scrollHeight + "px";
			ScrollTrigger.refresh();
		}

		// FORM SUBMISSION (https://docs.netlify.com/forms/setup/)
		const handleSubmit = (event) => {
			const myForm = event.target;
			if (myForm.hasAttribute("data-contact-form")) {
				return;
			}

			event.preventDefault();
			const formData = new FormData(myForm);
			const name = myForm.getAttribute("name");

			fetch("/", {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: new URLSearchParams(formData).toString(),
			})
				.then(() => document.querySelector("button").classList.add("success"))
				.catch((error) => alert(error));

			pushDataLayerEvent("formSubmission", {
				form_name: name,
			});
		};

		document.querySelectorAll("form").forEach((form) => {
			if (form.hasAttribute("data-contact-form")) {
				return;
			}
			form.addEventListener("submit", handleSubmit);
		});
	}
}

// ================================================
// SWIPER GALLERY COMPONENT
// Reusable swiper with cursor-based navigation
// Called after Swiper library is loaded
// ================================================
function initSwiperGalleries() {
	if (!document.querySelector(".swiper__gallery")) return;

	document.querySelectorAll(".swiper__gallery").forEach((gallery) => {
		// Skip if already initialized
		if (gallery.swiper) return;

		// Calculate gutter based on viewport (matches $gutter: calc(min(6vw, 115px)))
		const gutter = Math.min(window.innerWidth * 0.06, 115);
		const mobileGutter = 24; // 1.5rem
		const spaceBetween = window.innerWidth > 1024 ? gutter : mobileGutter;

		const swiperInstance = new Swiper(gallery, {
			slidesPerView: "auto",
			centeredSlides: true,
			loop: true,
			speed: 700,
			allowTouchMove: true,
			touchRatio: 1,
			touchAngle: 45,
		});

		// Mobile: Button navigation
		const prevBtn = gallery.querySelector(".swiper__nav-buttons .--prev");
		const nextBtn = gallery.querySelector(".swiper__nav-buttons .--next");

		if (prevBtn) {
			prevBtn.addEventListener("click", function () {
				swiperInstance.slidePrev();
			});
		}
		if (nextBtn) {
			nextBtn.addEventListener("click", function () {
				swiperInstance.slideNext();
			});
		}
	});
}

// ================================================
// LOTTIE ANIMATION COMPONENT
// Initializes all data-lottie-src containers
// Called after lottie-web library is loaded
// ================================================
function initLottieAnimations() {
	if (typeof lottie === "undefined") return;

	document.querySelectorAll("[data-lottie-src]").forEach(function (container) {
		// Skip if already initialized
		if (container.dataset.lottieInitialized) return;
		container.dataset.lottieInitialized = "true";

		var src = container.dataset.lottieSrc;
		var autoplay = container.dataset.lottieAutoplay !== "false";
		var loop = container.dataset.lottieLoop !== "false";

		lottie.loadAnimation({
			container: container,
			renderer: "svg",
			loop: loop,
			autoplay: autoplay,
			path: src,
		});
	});
}

function loadIndexScripts() {
	document.querySelector(".barba-container").classList.remove("loading");

	var loaderTl = gsap.timeline();
	loaderTl.from(".promo", {
		opacity: 0,
		delay: 0.2,
		ease: "power2.easeIn",
	});

	loaderTl.from(
		".top .line__inner",
		0.8,
		{
			yPercent: 50,
			rotation: 5,
			opacity: 0,
			ease: "power2.easeOut",
			stagger: 0.1,
		},
		"<",
	);
	loaderTl.from(
		"#banner p, #banner .btn__small",
		0.6,
		{
			opacity: 0,
			ease: "power2.Out",
		},
		"<50%",
	);

	if (document.querySelector("#banner")) {
		gsap.to("#banner .content", {
			opacity: 0,
			filter: "blur(5px)",
			scrollTrigger: {
				trigger: "#banner",
				start: "top top",
				ease: "expo.inOut",
				scrub: true,
				end: () => document.querySelector("#banner .promo").clientHeight,
			},
		});

		if (window.innerWidth > 1024) {
			ScrollTrigger.create({
				trigger: "#banner .content",
				start: "top top",
				pin: true,
				end: () => document.querySelector("#banner .promo").clientHeight,
			});
		}
	}

	loaderTl.to("#banner .promo", {
		scaleX: 1,
		scaleY: 1,
		scrollTrigger: {
			trigger: "#banner",
			start: "top top",
			ease: "expo.inOut",
			scrub: true,
			end: "70% 50%",
		},
	});

	ScrollTrigger.create({
		trigger: "#intro",
		start: "top 50%",
		end: "bottom 50%",
		onEnter: function () {
			document.body.classList.add("intro-leave");
		},
		onLeaveBack: function () {
			document.body.classList.remove("intro-leave");
		},
	});

	// HOVERS

	var cursorText = document.querySelector(".cursor span");
	function playVid() {
		video.muted = false;
		cursorText.textContent = "Sound off";
		gsap.to("#banner .btn__small, #banner aside", 0.2, {
			opacity: 0,
			ease: "power2.inOut",
		});
	}

	function pauseVid() {
		video.muted = true;
		cursorText.textContent = "Sound on";
		gsap.to("#banner .btn__small, #banner aside", 0.2, {
			opacity: 1,
			ease: "power2.inOut",
		});
	}
	if (window.innerWidth > 768) {
		var video = document.querySelector(".promo video:not(.mobile)");

		setTimeout(() => {
			video.play();
		}, 700);
		video.addEventListener("mouseenter", function () {
			if (video.muted) {
				cursorText.textContent = "Sound on";
			} else {
				cursorText.textContent = "Sound off";
			}
		});
		video.onclick = function () {
			this.muted ? playVid() : pauseVid();
		};
	} else {
		var video = document.querySelector(".promo video.mobile");
		video.onclick = function () {
			this.muted ? playVid() : pauseVid();
		};
		setTimeout(() => {
			video.play();
		}, 700);
	}

	// INTRO
	if (document.querySelector("#intro")) {
		var rows = document.querySelectorAll("#intro .row");

		rows.forEach((row) => {
			row.addEventListener("mouseenter", () => {
				rows.forEach((rowClass) => {
					rowClass.classList.remove("active");
				});
				row.classList.add("active");
			});
		});
	}

	// VALUE

	if (document.querySelector("#clients .value")) {
		ScrollTrigger.create({
			trigger: ".bg__trigger--custom",
			start: "top 50%",
			invalidateOnRefresh: true,
			end: () => "+=10000",
			toggleClass: { targets: "body", className: "bg__dark" },
		});

		var headerTitle = document.querySelector("#clients .grid__header h2");
		if (headerTitle && window.innerWidth > 1024) {
			gsap.to(headerTitle, {
				filter: "blur(5px)",
				scale: 0.95,
				ease: "none",
				scrollTrigger: {
					trigger: "#clients .grid__item.--a",
					start: "top bottom",
					end: "top 60%",
					scrub: true,
				},
			});
		}

		var valueImages = document.querySelectorAll(
			"#clients .grid__item.--images .images-clip img",
		);
		var contentItems = document.querySelectorAll(
			"#clients .grid__item.--content",
		);

		if (valueImages.length && contentItems.length) {
			valueImages[0].classList.add("active");

			function setActiveImage(index) {
				valueImages.forEach(function (img, j) {
					if (j === index) {
						img.classList.add("active");
					} else {
						img.classList.remove("active");
					}
				});
			}

			contentItems.forEach(function (item, i) {
				ScrollTrigger.create({
					trigger: item.querySelector("h3"),
					start: "top 85%",
					onEnter: function () {
						setActiveImage(i);
					},
					onLeaveBack: function () {
						setActiveImage(Math.max(0, i - 1));
					},
				});
			});
		}
	}

	// CLIENTS & MENTIONS

	gsap.set(".client-images", { xPercent: -50, yPercent: -50 });
	var cursor = document.querySelector(".client-images");
	var pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
	var mouse = { x: pos.x, y: pos.y };
	var speed = 0.1;

	var fpms = 60 / 1000;

	var xSet = gsap.quickSetter(cursor, "x", "px");
	var ySet = gsap.quickSetter(cursor, "y", "px");

	document.body.addEventListener("mousemove", (e) => {
		mouse.x = e.x;
		mouse.y = e.y;
	});

	gsap.ticker.add((time, deltaTime) => {
		var delta = deltaTime * fpms;
		var dt = 1.0 - Math.pow(1.0 - speed, delta);

		pos.x += (mouse.x - pos.x) * dt;
		pos.y += (mouse.y - pos.y) * dt;
		xSet(pos.x);
		ySet(pos.y);
	});

	var clientsContainer = document.querySelector(
		".clients-section .container__inner",
	);
	if (clientsContainer) {
		var clientRows = clientsContainer.querySelectorAll(".inner");
		clientRows.forEach(function (client) {
			var idx = client.getAttribute("data-client-idx");
			client.addEventListener("mouseenter", function () {
				document.body.classList.add(
					"cursor__image",
					"init__clients-hover",
					"init__" + idx,
				);
			});
			client.addEventListener("mouseleave", function () {
				document.body.classList.remove(
					"cursor__image",
					"init__clients-hover",
					"init__" + idx,
				);
			});
		});
	}

	var loadBtn = document.querySelector(".clients-section .load-more");

	if (loadBtn) {
		loadBtn.addEventListener("click", function () {
			var btn = this;
			var container = document.querySelector(".clients-section .-clients");
			var allClients = Array.from(container.querySelectorAll(".inner"));
			var visibleClients = allClients.filter(function (el) {
				return !el.classList.contains("next");
			});

			gsap.to(btn, { opacity: 0, pointerEvents: "none", display: "none" });

			gsap.to(visibleClients, {
				opacity: 0,
				duration: 0.3,
				onComplete: function () {
					allClients.forEach(function (el) {
						el.classList.remove("next");
					});
					gsap.set(allClients, { display: "flex", opacity: 0, y: 20 });

					var sorted = allClients.sort(function (a, b) {
						return (
							parseInt(a.getAttribute("data-client-idx")) -
							parseInt(b.getAttribute("data-client-idx"))
						);
					});
					sorted.forEach(function (el) {
						container.appendChild(el);
					});

					gsap.timeline({
						onStart: function () {
							lenis.stop();
						},
						onComplete: function () {
							lenis.start();
							ScrollTrigger.refresh();
						},
					}).to(sorted, {
						opacity: 1,
						y: 0,
						duration: 0.5,
						ease: "power2.out",
						stagger: 0.03,
					});
				},
			});
		});
	}
}

function loadStudioScripts() {
	var headline = document.querySelector(".headline__load");
	var splitInner = new SplitText(headline, {
		type: "lines",
		linesClass: "line__inner",
	});
	var splitOuter = new SplitText(headline, {
		type: "lines",
		linesClass: "line__outer",
	});

	gsap.fromTo(
		"#full-image img",
		{
			scale: 0.2,
			yPercent: window.innerWidth > 1024 ? -25 : -10,
			xPercent: window.innerWidth > 1024 ? -12 : -6,
			transformOrigin: "top right",
		},
		{
			scale: 1,
			yPercent: 0,
			xPercent: 0,
			transformOrigin: "top right",
			scrollTrigger: {
				trigger: "#banner",
				scrub: true,
				start: "top top",
			},
		},
	);
	var loaderTl = gsap.timeline();

	document.querySelector(".barba-container").classList.remove("loading");

	loaderTl.from(splitInner.lines, 0.8, {
		yPercent: 50,
		rotation: 5,
		opacity: 0,
		ease: "power2.easeOut",
		stagger: 0.1,
	});
	loaderTl.from(
		"#banner p",
		1,
		{
			y: 10,
			opacity: 0,
			ease: "power2.easeOut",
			stagger: 0.2,
		},
		"<.2",
	);

	loaderTl.from(
		"#full-image",
		0.8,
		{
			yPercent: 12,
			skewY: -5,
			opacity: 0,
			ease: "power3.In",
		},
		"<.2",
	);

	// IMAGE SPLIT

	if (document.querySelector("#join") && window.innerWidth > 550) {
		gsap.utils.toArray(".st__image--spread").forEach((img, i) => {
			var x = i % 2 == 0 ? 100 : -100,
				r = i % 2 == 0 ? -5 : 5;

			gsap.fromTo(
				img,
				{
					xPercent: x,
				},
				{
					xPercent: 0,
					rotate: r,
					scrollTrigger: {
						trigger: img,
						scrub: 1.5,
						end: "60% 50%",
					},
				},
			);
		});
	}

	if (document.querySelector("#team")) {
		var slider = document.querySelector(".horizontal");

		gsap.fromTo(
			".horizontal .col",
			{
				opacity: 0,
				xPercent: 20,
				rotate: 3,
			},
			{
				opacity: 1,
				xPercent: 0,
				stagger: 0.1,
				transformOrigin: "bottom left",
				rotate: 0,
				scrollTrigger: {
					trigger: "#team .container",
					start: "top 50%",
				},
			},
		);
	}
}

function initContactFormSubmission() {
	const form = document.querySelector("[data-contact-form]");
	if (!form || !window.fetch || form.dataset.contactBound === "true") {
		return;
	}

	form.dataset.contactBound = "true";
	bindMeaningfulStart(form, "contact_form_start");

	const button = form.querySelector('button[type="submit"]');
	const referrer = form.querySelector("#referrer");
	const turnstileElement = form.querySelector(".cf-turnstile");

	function resetTurnstileWidget() {
		if (window.turnstile && turnstileElement) {
			window.turnstile.reset(turnstileElement);
		}
	}

	form.addEventListener("submit", async (event) => {
		event.preventDefault();
		event.stopImmediatePropagation();

		const turnstileToken = form.querySelector('[name="cf-turnstile-response"]')?.value;

		button?.classList.remove("loading");
		button?.classList.remove("success");

		if (!turnstileToken) {
			pushDataLayerEvent("contact_form_submit_error", {
				form_name: form.getAttribute("name") || "contact",
				page_path: window.location.pathname,
				error_message: "Missing verification token",
			});
			resetTurnstileWidget();
			return;
		}

		button?.setAttribute("disabled", "disabled");
		button?.setAttribute("aria-busy", "true");
		button?.classList.add("loading");

		try {
			const response = await fetch(form.action, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
					"X-Requested-With": "fetch",
				},
				body: new URLSearchParams(new FormData(form)).toString(),
			});

			const payload = await response.json();
			if (!response.ok || !payload.ok) {
				throw new Error(payload.error || "Something went wrong.");
			}

			button?.classList.remove("loading");
			button?.classList.add("success");
			pushDataLayerEvent("formSubmission", {
				form_name: form.getAttribute("name") || "contact",
				page_path: window.location.pathname,
			});
			form.reset();
			referrer?.classList.remove("selected");
			resetTurnstileWidget();
		} catch (error) {
			console.error("Contact form submit failed", error);
			pushDataLayerEvent("contact_form_submit_error", {
				form_name: form.getAttribute("name") || "contact",
				page_path: window.location.pathname,
				error_message: normalizeAnalyticsText(error?.message || "Something went wrong."),
			});
			resetTurnstileWidget();
		} finally {
			button?.classList.remove("loading");
			button?.removeAttribute("disabled");
			button?.removeAttribute("aria-busy");
		}
	});
}

function loadContactScripts() {
	initContactFormSubmission();

	var headline = document.querySelector(".headline__load"),
		wrapper = document.querySelector("form .wrapper"),
		textarea = document.querySelector("textarea"),
		textWidth = window.innerWidth > 1024 ? "27vw" : "300";
	tl = gsap.timeline();
	var splitInner = new SplitText(headline, {
		type: "lines",
		linesClass: "line__inner",
	});

	var splitOuter = new SplitText(headline, {
		type: "lines",
		linesClass: "line__outer",
	});

	document.querySelector(".barba-container").classList.remove("loading");

	var tl = gsap.timeline();

	tl.from(splitInner.lines, 0.8, {
		yPercent: 50,
		rotation: 5,
		opacity: 0,
		ease: "power2.easeOut",
		stagger: 0.1,
	});
	tl.fromTo(
		wrapper,
		0.6,
		{
			width: "0",
		},
		{
			width: textWidth,
			ease: SteppedEase.config(23),
		},
		"<60%",
	);
	tl.fromTo(
		".highlight",
		0.5,
		{
			opacity: 0.1,
		},
		{
			opacity: 1,
			repeat: -1,
			ease: SteppedEase.config(23),
		},
		"<",
	);
	tl.add(function () {
		textarea.focus();
	}, "+=.2");

	textarea.addEventListener("focus", function () {
		gsap.set(".highlight", { display: "none" });
		textarea.classList.add("loaded");
		tl.paused(true);
	});

	var referrer = document.querySelector("#referrer");
	if (referrer) {
		referrer.addEventListener("change", function () {
			this.classList.add("selected");
		});
	}
}

function loadWorkScripts() {
	var headline = document.querySelector(".headline__load");
	var splitInner = new SplitText(headline, {
		type: "lines",
		linesClass: "line__inner",
	});
	var splitOuter = new SplitText(headline, {
		type: "lines",
		linesClass: "line__outer",
	});
	var tl = gsap.timeline();
	document.querySelector(".barba-container").classList.remove("loading");

	tl.from(splitInner.lines, 0.8, {
		yPercent: 50,
		rotation: 5,
		opacity: 0,
		ease: "power2.easeOut",
		stagger: 0.1,
	});
	tl.from(
		"header .container .row > *",
		1,
		{ y: 20, opacity: 0, ease: "power2.easeOut" },
		"<25%",
	);
}

function loadServicesScripts() {
	var headline = document.querySelector(".headline__load");
	var splitInner = new SplitText(headline, {
		type: "lines",
		linesClass: "line__inner",
	});
	var splitOuter = new SplitText(headline, {
		type: "lines",
		linesClass: "line__outer",
	});
	var tl = gsap.timeline();
	document.querySelector(".barba-container").classList.remove("loading");

	tl.from(splitInner.lines, 0.8, {
		yPercent: 50,
		rotation: 5,
		opacity: 0,
		ease: "power2.easeOut",
		stagger: 0.1,
	});
	if (document.querySelector("header .content")) {
		tl.from(
			"header .content",
			1,
			{ y: 20, opacity: 0, ease: "power2.easeOut" },
			"<25%",
		);
	}

	if (document.querySelector(".plax__cols")) {
		if (window.innerWidth > 1024) {
			var container = document.querySelector(".plax__cols"),
				colOne = container.querySelector(".col:nth-child(2)"),
				colTwo = container.querySelector(".col:nth-child(3)");

			var tl = gsap.timeline({
				scrollTrigger: {
					trigger: container,
					start: "30% bottom",
					end: "+=220%",
					scrub: 0.7,
				},
			});
			tl.fromTo(
				colOne,
				{
					yPercent: 30,
					ease: "power3.Out",
				},
				{
					yPercent: -30,
					ease: "power3.Out",
				},
			);
			tl.fromTo(
				colTwo,
				{
					yPercent: 60,
					ease: "power3.Out",
				},
				{
					yPercent: -60,
					ease: "power3.Out",
				},
				"<",
			);
		}
	}

	if (document.querySelector("#process")) {
		var processHeader = document.querySelector(".process-header");
		if (processHeader) {
			var setHeaderHeight = function () {
				document.documentElement.style.setProperty(
					"--process-header-h",
					processHeader.offsetHeight + "px",
				);
			};
			setHeaderHeight();
			window.addEventListener("resize", setHeaderHeight);
		}

		ScrollTrigger.create({
			trigger: ".bg__trigger--custom",
			start: "top 50%",
			end: "bottom 50%",
			invalidateOnRefresh: true,
			toggleClass: { targets: "body", className: "bg__dark" },
		});
	}

	if (document.querySelector("#why") && window.innerWidth > 1024) {
		var section = document.querySelector("#why");

		gsap.from("#why .mask", {
			xPercent: -25,
			filter: "blur(15px)",
			opacity: 0,
			ease: "power2.inOut",
			duration: 0.7,
			scrollTrigger: {
				trigger: section,
				start: "top 60%",
			},
		});

		section.addEventListener("click", function () {
			var fwdTl = gsap.timeline({ paused: true });

			fwdTl.fromTo(
				section.querySelectorAll(".col:nth-child(1)"),
				{
					filter: "blur(0px)",
					opacity: 1,
				},
				{
					filter: "blur(15px)",
					opacity: 0,
					ease: "power2.inOut",
				},
			);
			fwdTl.fromTo(
				section.querySelectorAll(".col:nth-child(2)"),
				{
					filter: "blur(15px)",
					opacity: 0,
				},
				{
					filter: "blur(0px)",
					opacity: 1,
					ease: "power2.inOut",
				},
				"<",
			);
			fwdTl.fromTo(
				"#why .mask",
				{
					xPercent: 0,
				},
				{
					xPercent: -100,
					ease: "power2.inOut",
				},
				"<",
			);
			fwdTl.fromTo(
				"#why .mask",
				{
					xPercent: 0,
				},
				{
					xPercent: -100,
					ease: "power2.inOut",
				},
				"<",
			);

			var revTl = gsap.timeline({ paused: true });

			revTl.fromTo(
				section.querySelectorAll(".col:nth-child(2)"),
				{
					filter: "blur(0px)",
					opacity: 1,
				},
				{
					filter: "blur(15px)",
					opacity: 0,
					ease: "power2.inOut",
				},
			);
			revTl.fromTo(
				section.querySelectorAll(".col:nth-child(1)"),
				{
					filter: "blur(15px)",
					opacity: 0,
				},
				{
					filter: "blur(0px)",
					opacity: 1,
					ease: "power2.inOut",
				},
				"<",
			);
			revTl.fromTo(
				"#why .mask",
				{
					xPercent: -100,
				},
				{
					xPercent: 0,
					ease: "power2.inOut",
				},
				"<",
			);

			if (this.classList.contains("active")) {
				revTl.play();
				this.classList.remove("active");
			} else {
				fwdTl.play();
				this.classList.add("active");
			}
		});
	}

	// SINGLE SERVICES

	if (document.querySelector("#service-wrapper")) {
		gsap.from("#service-wrapper .row, #service-wrapper img", {
			y: 10,
			opacity: 0,
			ease: "power2.easeOut",
			stagger: 0.2,
		});
		ScrollTrigger.create({
			trigger: "#intro",
			start: "top 50%",
			end: "bottom 50%",
			onEnter: function () {
				document.body.classList.add("intro-leave");
			},
			onLeaveBack: function () {
				document.body.classList.remove("intro-leave");
			},
		});
	}
}

function loadProjectScripts(triggerState, prev) {
	var trigger = document.querySelector(".top"),
		end =
			document.querySelector("#banner").clientHeight - trigger.clientHeight + 2;

	var splitInner = new SplitText(trigger, {
		type: "lines",
		linesClass: "line__inner",
	});

	var splitOuter = new SplitText(trigger, {
		type: "lines",
		linesClass: "line__outer",
	});
	document.querySelector(".barba-container").classList.remove("loading");

	if (prev !== "project") {
		var loaderTl = gsap.timeline();
		loaderTl.from(".promo", {
			opacity: 0,
			delay: 0.2,
			ease: "power2.easeIn",
		});
		loaderTl.from(
			splitInner.lines,
			0.8,
			{
				yPercent: 50,
				rotation: 5,
				opacity: 0,
				ease: "power2.easeOut",
				stagger: 0.1,
			},
			"<",
		);
	} else {
		if (
			triggerState == "popstate" ||
			triggerState == "back" ||
			triggerState == "forward"
		) {
			var loaderTl = gsap.timeline();
			loaderTl.from(".promo", {
				opacity: 0,
				delay: 0.2,
				ease: "power2.easeIn",
			});
			loaderTl.from(
				splitInner.lines,
				0.8,
				{
					yPercent: 50,
					rotation: 5,
					opacity: 0,
					ease: "power2.easeOut",
					stagger: 0.1,
				},
				"<",
			);
		}
	}
	ScrollTrigger.create({
		trigger: "#sec__001",
		start: "top 50%",
		end: "bottom 50%",
		id: "projectIntroLeave",
		onEnter: function (self) {
			document.body.classList.add("intro-leave");
		},
		onLeaveBack: function (self) {
			document.body.classList.remove("intro-leave");
		},
	});
	if (window.innerWidth > 1024) {
		initStickyProgressBars();
	}

	ScrollTrigger.create({
		trigger: ".footer-spacer",
		start: "-2px top",
		id: "nextProjectST",
		onEnter: (self) => {
			barba.go(self.trigger.getAttribute("href"));
		},
	});
}

function loadArchiveScripts() {
	document.querySelector(".barba-container").classList.remove("loading");

	document.querySelectorAll(".archive-cell video").forEach(function (video) {
		video.addEventListener("ended", function () {
			this.currentTime = 0;
			this.play();
		});
	});

	var gridEl = document.querySelector(".archive-grid");
	var dragSurface = document.querySelector(".archive-drag-surface");
	var cells = gsap.utils.toArray(".archive-cell");

	if (!gridEl || !cells.length) return;

	var COLS = parseInt(gridEl.dataset.cols) || 7;
	var ROWS = parseInt(gridEl.dataset.rows) || 6;
	var cardW, cardH, gap, totalW, totalH;
	var offsetX = 0,
		offsetY = 0;

	function computeLayout() {
		var vw = window.innerWidth;
		cardW =
			vw < 640 ? vw * 0.8 : vw < 1024 ? vw * 0.45 : Math.min(vw * 0.35, 672);
		cardH = cardW * 0.6;
		gap = Math.min(vw * 0.014, 27);
		totalW = COLS * (cardW + gap);
		totalH = ROWS * (cardH + gap);
		cells.forEach(function (cell) {
			cell.style.width = cardW + "px";
			cell.style.height = cardH + "px";
		});
		updateCards();
	}

	function updateCards() {
		for (var i = 0; i < cells.length; i++) {
			var col = i % COLS;
			var row = Math.floor(i / COLS);
			var baseX = col * (cardW + gap);
			var baseY = row * (cardH + gap);
			var x = ((((baseX + offsetX) % totalW) + totalW) % totalW) - cardW;
			var y = ((((baseY + offsetY) % totalH) + totalH) % totalH) - cardH;
			gsap.set(cells[i], { x: x, y: y });
		}
	}

	computeLayout();

	gsap.fromTo(
		cells,
		{ opacity: 0, scale: 0.8 },
		{
			opacity: 1,
			scale: 1,
			duration: 0.9,
			ease: "power2.out",
			stagger: { amount: 0.8, from: "random" },
		},
	);

	var isDragging = false;
	var startMouseX, startMouseY, startOffX, startOffY;
	var prevMouseX, prevMouseY, prevTime;
	var velX = 0,
		velY = 0;
	var momentum = { x: 0, y: 0 };
	var driftRestartCall = null;

	function driftUpdate() {
		var speed = window.innerWidth * 0.00035;
		offsetX += speed;
		offsetY += speed * 0.5;
		updateCards();
	}

	function startDrift() {
		gsap.ticker.add(driftUpdate);
	}

	function stopDrift() {
		gsap.ticker.remove(driftUpdate);
		if (driftRestartCall) driftRestartCall.kill();
	}

	var entranceDelay = gsap.delayedCall(1.5, startDrift);

	if (dragSurface) {
		dragSurface.addEventListener("pointerdown", function (e) {
			isDragging = true;
			gsap.killTweensOf(momentum);
			stopDrift();
			startMouseX = prevMouseX = e.clientX;
			startMouseY = prevMouseY = e.clientY;
			startOffX = offsetX;
			startOffY = offsetY;
			prevTime = Date.now();
			velX = velY = 0;
			dragSurface.setPointerCapture(e.pointerId);
		});

		window.addEventListener("pointermove", function (e) {
			if (!isDragging) return;
			var now = Date.now();
			var dt = Math.max(now - prevTime, 1);
			velX = 0.6 * (((e.clientX - prevMouseX) / dt) * 1000) + 0.4 * velX;
			velY = 0.6 * (((e.clientY - prevMouseY) / dt) * 1000) + 0.4 * velY;
			prevMouseX = e.clientX;
			prevMouseY = e.clientY;
			prevTime = now;
			offsetX = startOffX + (e.clientX - startMouseX) * 0.7;
			offsetY = startOffY + (e.clientY - startMouseY) * 0.7;
			updateCards();
		});

		window.addEventListener("pointerup", function (e) {
			if (!isDragging) return;
			isDragging = false;
			dragSurface.releasePointerCapture(e.pointerId);
			momentum.x = offsetX;
			momentum.y = offsetY;
			gsap.to(momentum, {
				x: offsetX + velX * 0.2,
				y: offsetY + velY * 0.2,
				duration: 1.2,
				ease: "power3.out",
				onUpdate: function () {
					offsetX = momentum.x;
					offsetY = momentum.y;
					updateCards();
				},
				onComplete: function () {
					driftRestartCall = gsap.delayedCall(1, startDrift);
				},
			});
		});
	}

	window.addEventListener("resize", computeLayout);
}

function load404Scripts() {
	document.querySelector(".barba-container").classList.remove("loading");
}

function loadToolsScripts() {
	document.querySelector(".barba-container").classList.remove("loading");
}

function loadPrivacyScripts() {
	var headline = document.querySelector(".headline__load");
	var splitInner = new SplitText(headline, {
		type: "lines",
		linesClass: "line__inner",
	});
	var splitOuter = new SplitText(headline, {
		type: "lines",
		linesClass: "line__outer",
	});
	var loaderTl = gsap.timeline();

	document.querySelector(".barba-container").classList.remove("loading");

	loaderTl.from(splitInner.lines, 0.8, {
		yPercent: 50,
		rotation: 5,
		opacity: 0,
		ease: "power2.easeOut",
		stagger: 0.1,
	});

	loaderTl.from(
		"#banner h2, article",
		1,
		{
			opacity: 0,
			y: 20,
			ease: "power2.easeOut",
			stagger: 0.1,
		},
		"<.3",
	);
}
function loadLandingScripts() {
	var page = document.querySelector(".barba-container > main");
	var headline = document.querySelector(".headline__load");
	var splitInner = new SplitText(headline, {
		type: "lines",
		linesClass: "line__inner",
	});
	var splitOuter = new SplitText(headline, {
		type: "lines",
		linesClass: "line__outer",
	});
	var loaderTl = gsap.timeline();

	document.querySelector(".barba-container").classList.remove("loading");

	if (page.classList.contains("b")) {
		var xxlSplitInner = new SplitText(".xxl", {
			type: "lines",
			linesClass: "line__inner",
		});
		var xxlSplitOuter = new SplitText(".xxl", {
			type: "lines",
			linesClass: "line__outer",
		});
		var hh = document.querySelector("#banner").clientHeight / 2,
			hth = document.querySelector(".top").clientHeight / 2,
			pos = hh - hth;
		loaderTl.from(xxlSplitInner.lines, 0.8, {
			yPercent: 50,
			opacity: 0,
			ease: "power2.easeOut",
			delay: 0.3,
			stagger: 0.1,
		});
		loaderTl.fromTo(
			".top",
			{
				y: pos,
			},
			{
				y: 0,
				ease: "expo.inOut",
				duration: 1,
			},
		);
		loaderTl.fromTo(
			".bottom",
			{
				y: -pos,
			},
			{
				y: 0,
				ease: "expo.inOut",
				duration: 1,
			},
			"<",
		);
		loaderTl.to(".screen", 1.2, { opacity: 0.25, ease: "expo.inOut" }, "<.2");
		loaderTl.to("#banner img", 1.2, { scale: 1, ease: "expo.Out" }, "<");
		loaderTl.from(
			splitInner.lines,
			0.8,
			{
				yPercent: 50,
				rotation: 5,
				opacity: 0,
				ease: "power2.easeOut",
				stagger: 0.1,
			},
			"<70%",
		);
		loaderTl.from(
			"#banner .btn__circle",
			{
				opacity: 0,
				ease: "power2.easeOut",
			},
			"<.2",
		);
		gsap.to(xxlSplitOuter.elements[0], {
			xPercent: -20,
			scrollTrigger: {
				trigger: "#banner",
				start: "top top",
				scrub: 1.2,
			},
		});
		gsap.to(xxlSplitOuter.elements[1], {
			xPercent: 20,
			scrollTrigger: {
				trigger: "#banner",
				start: "top top",
				scrub: 1.2,
			},
		});
	} else {
		loaderTl.from(splitInner.lines, 0.8, {
			yPercent: 50,
			rotation: 5,
			opacity: 0,
			ease: "power2.easeOut",
			stagger: 0.1,
		});

		loaderTl.from(
			"#banner p, #banner .btn__small",
			1,
			{
				opacity: 0,
				y: 20,
				stagger: 0.2,
				ease: "power2.easeOut",
			},
			"<.2",
		);
	}

	if (document.querySelector("#banner").classList.contains("is-dark")) {
		ScrollTrigger.create({
			trigger: "#featured",
			start: "top 50%",
			end: "bottom 50%",
			onEnter: function () {
				document.body.classList.add("intro-leave");
			},
			onLeaveBack: function () {
				document.body.classList.remove("intro-leave");
			},
		});
	}
	var anchors = document.querySelectorAll(".anchor");
	anchors.forEach((anchor) => {
		var section = anchor.getAttribute("data-attribute-scroll");
		anchor.addEventListener("click", function () {
			lenis.scrollTo(document.getElementById(section), { immediate: true });
		});
	});

	if (document.querySelector("#banner .img-wrapper")) {
		var cursorImgs = document.querySelectorAll("#banner .img-wrapper img");
		document
			.querySelector("#banner")
			.addEventListener("mousemove", function (e) {
				var axOne = (window.innerWidth / 2 - e.pageX) / 20;
				var ayOne = -(window.innerHeight / 2 - e.pageY) / 20;
				cursorImgs.forEach((img) => {
					img.setAttribute(
						"style",
						"transform: rotateY(" +
							axOne +
							"deg) rotateX(" +
							ayOne +
							"deg);-webkit-transform: rotateY(" +
							axOne +
							"deg) rotateX(" +
							ayOne +
							"deg);-moz-transform: rotateY(" +
							axOne +
							"deg) rotateX(" +
							ayOne +
							"deg)",
					);
				});
			});
	}

	if (document.querySelector(".mousecanvas")) {
		if (window.innerWidth > 1024) {
			var mousecanvas = document.querySelectorAll(".mousecanvas");

			mousecanvas.forEach((canvas) => {
				var hover = canvas.querySelector(".mousecanvas__hover"),
					hoverText = hover.querySelectorAll(".mousecanvas__hover--text"),
					canvasImgContainer = canvas.querySelector(
						".mousecanvas__img-container",
					),
					canvasImgs = canvasImgContainer.querySelectorAll("img");

				if (hoverText) {
					hoverText.forEach((text, i) => {
						text.addEventListener("mouseenter", function () {
							canvasImgs.forEach((img) => {
								img.classList.remove("init");
							});
							canvasImgs[i].classList.add("init");
						});
					});
				}

				gsap.set(canvasImgContainer, { yPercent: -50 });

				var pos = { y: canvasImgContainer.clientHeight / 2 };
				var mouse = { y: pos.y };
				var speed = 0.1;

				var fpms = 60 / 1000;

				var ySet = gsap.quickSetter(canvasImgContainer, "y", "px");

				hover.addEventListener("mousemove", (e) => {
					const bounds = hover.getBoundingClientRect();
					mouse.y = e.y - bounds.top;
				});

				gsap.ticker.add((time, deltaTime) => {
					var delta = deltaTime * fpms;
					var dt = 1.0 - Math.pow(1.0 - speed, delta);
					pos.y += (mouse.y - pos.y) * dt;
					ySet(pos.y);
				});
			});
		}
	}

	if (document.querySelector(".plax__cols")) {
		if (window.innerWidth > 1024) {
			var container = document.querySelector(".plax__cols"),
				colOne = container.querySelector(".col:nth-child(2)"),
				colTwo = container.querySelector(".col:nth-child(3)");

			var tl = gsap.timeline({
				scrollTrigger: {
					trigger: container,
					start: "30% bottom",
					end: "+=220%",
					scrub: 0.7,
				},
			});
			tl.fromTo(
				colOne,
				{
					yPercent: 30,
					ease: "power3.Out",
				},
				{
					yPercent: -30,
					ease: "power3.Out",
				},
			);
			tl.fromTo(
				colTwo,
				{
					yPercent: 60,
					ease: "power3.Out",
				},
				{
					yPercent: -60,
					ease: "power3.Out",
				},
				"<",
			);
		}
	}

	if (document.querySelector("#featured").classList.contains("featured-carousel")) {
		var container = document.querySelector("#featured"),
			headlines = container.querySelectorAll(".slider__title h4"),
			bgs = container.querySelectorAll(".slider__bg img"),
			h = headlines[0].clientHeight * 1.1;

		var bgTl = gsap.timeline({
			repeat: -1,
			paused: true,
		});

		bgs.forEach((bg, i) => {
			var nextBg = bg.nextElementSibling;
			var z = "1";
			if (!nextBg) {
				var nextBg = bgs[0];
				var z = "2";
			}

			bgTl.to(bg, 1, {
				filter: "blur(20px)",
				opacity: 0,
				ease: "power3.in",
			});
			bgTl.set(
				nextBg,
				{
					zIndex: z,
				},
				"<",
			);
			bgTl.to(
				nextBg,
				1,
				{
					opacity: 1,
					scale: 1,
					ease: "power3.inOut",
				},
				"<",
			);
			bgTl.set(bg, {
				filter: "blur(0px)",
				zIndex: "-1",
				opacity: 0,
				scale: 1.1,
			});
			bgTl.addPause();
		});

		var headlineTl = gsap.timeline({
			repeat: -1,
			paused: true,
		});

		headlines.forEach((headline, i) => {
			var nextHeadline = headline.nextElementSibling;
			if (!nextHeadline) {
				var nextHeadline = headlines[0];
			}

			headlineTl.to(headline, 1, {
				y: -h,
				rotation: -5,
				opacity: 0,
				ease: "power2.inOut",
			});
			headlineTl.to(
				nextHeadline,
				1,
				{
					y: 0,
					rotation: 0,
					opacity: 1,
					ease: "power2.inOut",
				},
				"<",
			);

			headlineTl.set(headline, {
				y: h,
				rotation: 5,
				opacity: 0,
			});
			headlineTl.addPause();
		});
		var display = document.querySelectorAll(".display");
		display.forEach((el, i) => {
			var inner = el.querySelectorAll(".display__inner");
			var innerHeight = inner[0].clientHeight;
			var displayTl = gsap.timeline({
				repeat: -1,
				paused: true,
			});
			inner.forEach((innerEl) => {
				var nextEl = innerEl.nextElementSibling;
				if (!nextEl) {
					var nextEl = inner[0];
				}
				displayTl.to(innerEl, 1, {
					y: -innerHeight,
					ease: "power2.inOut",
				});
				displayTl.to(
					nextEl,
					1,
					{
						y: 0,
						ease: "power2.inOut",
					},
					"<",
				);

				displayTl.set(innerEl, {
					y: innerHeight,
				});
				displayTl.addPause();
			});

			container.addEventListener("click", function () {
				displayTl.play();
			});
		});
		container.addEventListener("click", function () {
			bgTl.play();
			headlineTl.play();
		});
	}

	if (document.querySelector("#faq")) {
		var accordions = document.querySelectorAll("#faq .col");
		accordions.forEach((accordion) => {
			var question = accordion.querySelector(".question");
			var answer = accordion.querySelector(".answer");
			question.addEventListener("click", function () {
				document.body.classList.contains("init__faq")
					? ""
					: document.body.classList.add("init__faq");
				gsap.to("#faq .container", {
					width: "100vw",
					ease: "power2.inOut",
				});
				accordion.classList.toggle("expanded");
				document.body.classList.add("bg__dark");
				setTimeout(() => {
					ScrollTrigger.refresh();
				}, 400);
			});
		});
	}

	if (document.getElementById("testimonial")) {
		var testimonialTl = gsap.timeline({
			repeat: -1,
			paused: true,
		});

		var testimonial = document.getElementById("testimonial"),
			allContent = testimonial.querySelectorAll(".content"),
			pagination = testimonial.querySelectorAll(".col .inner"),
			opacity = window.innerWidth > 1024 ? 0.3 : 0,
			y = window.innerWidth > 1024 ? 0 : "-1em";

		if (testimonial.querySelector(".img-container")) {
			var imgs = testimonial.querySelectorAll(".content__img");
		}
		allContent.forEach((content, i) => {
			var text = content,
				nextContent = content.nextElementSibling;
			if (!nextContent) {
				var nextText = allContent[0],
					x = 0;
			} else {
				var nextText = nextContent,
					x = i + 1;
			}

			if (testimonial.querySelector(".img-container")) {
				var img = imgs[i],
					nextImg = img.nextElementSibling;
				if (!nextImg) {
					var nextImg = imgs[0];
				} else {
					var nextImg = nextImg;
				}

				testimonialTl.to(img, 0.2, {
					opacity: 0,
					ease: "power2.inOut",
				});
				testimonialTl.to(
					nextImg,
					0.2,
					{
						opacity: 1,
						ease: "power2.inOut",
					},
					"<",
				);
			}
			testimonialTl.to(
				text,
				0.6,
				{
					y: "-1em",
					opacity: 0,
					ease: "power2.Out",
				},
				"<",
			);
			testimonialTl.to(
				pagination[i],
				{
					y: y,
					opacity: opacity,
					ease: "power2.In",
				},
				"<",
			);
			testimonialTl.to(nextText, 0.6, {
				y: 0,
				opacity: 1,
				ease: "power2.In",
			});
			testimonialTl.to(
				pagination[x],
				{
					opacity: 1,
					y: 0,
				},
				"<",
			);
			testimonialTl.set(text, {
				y: "1em",
			});

			if (window.innerWidth < 1024) {
				testimonialTl.set(pagination[i], {
					y: "1em",
				});
			}

			testimonialTl.addPause();
		});

		testimonial.addEventListener("click", function () {
			testimonialTl.play();
		});
	}

	// FORMS
	var wrapper = document.querySelector("form .wrapper"),
		textarea = document.querySelector("textarea");

	textarea.addEventListener("focus", function () {
		gsap.set(".highlight", { display: "none" });
		textTl.pause();
	});
	if (page.classList.contains("crtv")) {
		var textTl = gsap.timeline({
			scrollTrigger: {
				trigger: ".footer-spacer",
				start: "top 35%",
			},
		});

		var textWidth = window.innerWidth > 1024 ? "38vw" : "300";

		textTl.fromTo(
			wrapper,
			0.6,
			{
				width: "0",
			},
			{
				width: textWidth,
				ease: SteppedEase.config(23),
			},
			0,
		);
		textTl.fromTo(
			".highlight",
			0.5,
			{
				opacity: 0.1,
			},
			{
				opacity: 1,
				repeat: -1,
				ease: SteppedEase.config(23),
			},
			0,
		);
		textTl.add(function () {
			textarea.focus();
		}, "+=.2");
	}
}

function loadJournalScripts() {
	var headline = document.querySelector(".headline__load");
	var splitInner = new SplitText(headline, {
		type: "lines",
		linesClass: "line__inner",
	});
	var splitOuter = new SplitText(headline, {
		type: "lines",
		linesClass: "line__outer",
	});
	var loaderTl = gsap.timeline();

	document.querySelector(".barba-container").classList.remove("loading");

	loaderTl.from(splitInner.lines, 0.8, {
		yPercent: 50,
		rotation: 5,
		opacity: 0,
		ease: "power2.easeOut",
		stagger: 0.1,
	});

	loaderTl.from(
		".entry__content > div",
		1,
		{
			opacity: 0,
			y: 20,
			ease: "power2.easeOut",
			stagger: 0.1,
		},
		"<.3",
	);

	//FILTER
	if (document.querySelector(".posts")) {
		var filters = document.querySelectorAll(".filter li");
		var posts = document.querySelectorAll(".entry__item");
		filters.forEach((filter) => {
			var cat = filter.getAttribute("data-attribute-category");
			filter.addEventListener("click", function () {
				filters.forEach((filterClass) => {
					filterClass.classList.remove("active");
				});
				filter.classList.add("active");

				var tl = gsap.timeline({
					onStart: function () {
						lenis.stop();
					},
					onComplete: function () {
						lenis.start();
						ScrollTrigger.refresh();
					},
				});

				tl.to(".entry", { opacity: 0, ease: "power2.easeIn" });
				tl.add(function () {
					posts.forEach((post) => {
						post.classList.remove("hidden");

						if (cat) {
							post.getAttribute("data-attribute-category") !== cat
								? post.classList.add("hidden")
								: "";
						}
					});

					var count = document.querySelectorAll(
						".entry__item:not(.hidden)",
					).length;
					document.querySelector(".count").textContent = count;
					count > 1
						? (document.querySelector(".suffix").textContent = "Entries")
						: (document.querySelector(".suffix").textContent = "Entry");
					ScrollTrigger.refresh();
				});
				tl.to(".entry", { opacity: 1, ease: "power2.easeOut" });
			});
		});
	}

	//POST

	if (document.querySelector(".entry__content--sidebar-toc")) {
		var links = document.querySelectorAll(".entry__content--sidebar-toc a");
		links.forEach((link) => {
			link.addEventListener("click", (e) => {
				e.preventDefault();
				var anchor = link.getAttribute("href");
				lenis.scrollTo(anchor, { offset: -80, immediate: true });
			});
		});
	}

	const videos = document.querySelectorAll("video");
	videos.forEach((video) => {
		video.addEventListener("click", function () {
			video.paused ? video.play() : video.pause();
		});
	});
}
document.addEventListener("DOMContentLoaded", function (event) {
	var nav = document.querySelector("nav:not(.anchors)"),
		navItems = nav.querySelectorAll(".nav-items__inner .nav-item, .nav-cta");
	//GENERAL TRANSITIONS
	function pageTransitionLeave() {
		lenis.stop();
		var tl = gsap.timeline({
			onComplete: function () {
				nav.classList.add("no-pointer");
				document.body.classList.remove("intro-leave", "--project");
				gsap.set(".nav-container", { clearProps: "all" });
			},
		});
		tl.to(".page-transition", {
			skewX: 0,
			skewY: 0,
			y: 0,
			rotate: 0,
			scale: 1,
			ease: "power3.InOut",
		});
		tl.to(
			".barba-container, .nav-container",
			{ filter: "blur(20px)", ease: "power3.Out" },
			"<",
		);
		tl.add(function () {
			let allTriggers = ScrollTrigger.getAll();
			for (let i = 0; i < allTriggers.length; i++) {
				allTriggers[i].kill(true);
			}
		});
	}

	function pageTransitionEnter(data) {
		lenis.start();
		var tl = gsap.timeline();
		tl.to(".page-transition", {
			opacity: 0,
			ease: "power3.Out",
		});
		tl.set(".page-transition", { clearProps: "all" });
		nav.classList.remove("no-pointer");
	}

	//NEXT PROJECT TRANSITION

	function projectTransitionLeave(data) {
		document.body.classList.add("--project");
		ScrollTrigger.getById("nextProjectST").disable();
		ScrollTrigger.getById("projectIntroLeave").kill();

		gsap.to(".footer-spacer .btn__circle", 0.2, {
			opacity: 0,
			ease: "power3.Out",
		});
		lenis.scrollTo(".footer-spacer", { immediate: true });
		lenis.stop();
	}

	function projectTransitionEnter(data) {
		document.querySelector(".barba-container").classList.remove("loading");
		document.body.classList.remove("--project");
	}
	function delay(n) {
		n = n || 2000;
		return new Promise((done) => {
			setTimeout(() => {
				done();
			}, n);
		});
	}
	barba.hooks.beforeEnter((data) => {
		if (data.current.container) {
			if (document.body.classList.contains("--project")) {
				var scrollY = window.scrollY || window.pageYOffset;
				data.current.container.style.position = "fixed";
				data.current.container.style.top = -scrollY + "px";
				data.current.container.style.left = "0";
				data.current.container.style.width = "100%";
				data.current.container.style.zIndex = "5";
				window.scrollTo(0, 0);
			}
			data.current.container.remove();
			ScrollTrigger.refresh();
		}
		document.body.classList.remove(
			"intro-leave",
			"cursor__hover",
			"init__nav",
			"--expanded",
		);

		var scrollContainer = data.next.container,
			fullHeight = document.querySelectorAll(".full-height"),
			namespace = data.next.namespace;

		if (window.innerWidth < 1024) {
			fullHeight.forEach((el) => {
				if (el.classList.contains("--overflow")) {
					el.style.height = document.documentElement.clientHeight * 1.2 + "px";
				} else {
					el.style.height = document.documentElement.clientHeight + "px";
				}
			});
		}

		if (data.next.container.querySelector(".swiper__gallery")) {
			var imported = document.createElement("script");
			imported.src =
				"https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.js";
			imported.onload = function () {
				initSwiperGalleries();
			};
			data.next.container.appendChild(imported);
		}

		if (data.next.container.querySelector("[data-lottie-src]")) {
			var lottieScript = document.createElement("script");
			lottieScript.src =
				"https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.13.0/lottie.min.js";
			lottieScript.onload = function () {
				initLottieAnimations();
			};
			data.next.container.appendChild(lottieScript);
		}

		navItems.forEach((item) => {
			var attr = item.getAttribute("data-attribute-item");
			if (attr == namespace) {
				item.classList.add("active");
			} else {
				item.classList.remove("active");
			}
		});

		imagesLoaded(
			scrollContainer.querySelector("section:nth-child(1)"),
			function () {
				if (history.scrollRestoration) {
					history.scrollRestoration = "manual";
				}
				ScrollTrigger.clearScrollMemory();
				window.scrollTo(0, 0);

				if (lenis) {
					lenis.destroy();
				}
				if (lenisTickerCallback) {
					gsap.ticker.remove(lenisTickerCallback);
				}
				lenis = new Lenis({
					duration: 0.6,
					easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
				});
				lenis.on("scroll", ScrollTrigger.update);
				lenisTickerCallback = (time) => {
					lenis.raf(time * 1000);
				};
				gsap.ticker.add(lenisTickerCallback);
				gsap.ticker.lagSmoothing(0);

				loadGlobalScripts();
				lenis.stop();
				setTimeout(() => {
					lenis.start();
				}, 100);
			},
		);
	});

	barba.hooks.afterEnter((data) => {
		pushDataLayerEvent("virtualPageview", {
			pageUrl: data.next.url.path,
			pageTitle: document.title,
		});
		var vids = document.querySelectorAll("video");
		vids.forEach((vid) => {
			var playPromise = vid.play();
			if (playPromise !== undefined) {
				playPromise.then((_) => {}).catch((error) => {});
			}
		});
	});

	barba.init({
		transitions: [
			{
				name: "general-transition",
				async leave(data) {
					const done = this.async();

					pageTransitionLeave(data);
					await delay(1500);
					done();
				},

				async enter(data) {
					pageTransitionEnter(data);
				},
			},
			{
				name: "next-project",
				from: {
					namespace: ["project"],
				},
				to: {
					namespace: ["project"],
				},
				async leave(data) {
					var triggerState = data.trigger;
					const done = this.async();

					if (
						triggerState == "popstate" ||
						triggerState == "back" ||
						triggerState == "forward"
					) {
						pageTransitionLeave(data);
						await delay(1500);
					} else {
						projectTransitionLeave(data);
						await delay(450);
					}
					done();
				},

				async enter(data) {
					var triggerState = data.trigger;
					if (
						triggerState == "popstate" ||
						triggerState == "back" ||
						triggerState == "forward"
					) {
						pageTransitionEnter(data);
					} else {
						projectTransitionEnter(data);
					}
				},
			},
		],

		views: [
			{
				namespace: "home",
				afterEnter({ next }) {
					var scrollContainer = next.container;
					imagesLoaded(scrollContainer.querySelector("#banner"), function () {
						loadIndexScripts();
						setTimeout(() => {
							ScrollTrigger.refresh();
						}, 100);
					});
				},
			},

			{
				namespace: "work",
				afterEnter({ next }) {
					var scrollContainer = next.container;
					imagesLoaded(scrollContainer, function () {
						loadWorkScripts();
					});
				},
			},

			{
				namespace: "services",
				afterEnter({ next }) {
					var scrollContainer = next.container;
					imagesLoaded(scrollContainer, function () {
						loadServicesScripts();
					});
				},
			},

			{
				namespace: "studio",
				afterEnter({ next }) {
					var scrollContainer = next.container;
					imagesLoaded(scrollContainer, function () {
						loadStudioScripts();
					});
				},
			},
			{
				namespace: "journal",
				afterEnter({ next }) {
					var scrollContainer = next.container;

					imagesLoaded(scrollContainer, function () {
						loadJournalScripts();
					});
				},
			},
			{
				namespace: "contact",
				afterEnter({ next }) {
					var scrollContainer = next.container;

					imagesLoaded(scrollContainer, function () {
						loadContactScripts();
					});
				},
			},

			{
				namespace: "project",
				afterEnter(data) {
					var next = data.next,
						prev = data.current.namespace,
						triggerState = data.trigger,
						scrollContainer = next.container;

					imagesLoaded(
						scrollContainer.querySelector("section:nth-child(1)"),
						function () {
							loadProjectScripts(triggerState, prev);
						},
					);
				},
			},

			{
				namespace: "archive",
				afterEnter({ next }) {
					var scrollContainer = next.container;

					imagesLoaded(scrollContainer, function () {
						loadArchiveScripts();
					});
				},
			},
			{
				namespace: "tools",
				afterEnter({ next }) {
					var scrollContainer = next.container;

					imagesLoaded(scrollContainer, function () {
						loadToolsScripts();
					});
				},
			},
			{
				namespace: "404",
				afterEnter({ next }) {
					var scrollContainer = next.container;

					imagesLoaded(scrollContainer, function () {
						load404Scripts();
					});
				},
			},
			{
				namespace: "privacy",
				afterEnter({ next }) {
					var scrollContainer = next.container;

					imagesLoaded(scrollContainer, function () {
						loadPrivacyScripts();
					});
				},
			},
			{
				namespace: "landing",
				afterEnter({ next }) {
					var scrollContainer = next.container;

					imagesLoaded(scrollContainer, function () {
						loadLandingScripts();
					});
				},
			},
		],
	});
});
