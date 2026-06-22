const { DateTime } = require("luxon");
const markdownItAnchor = require("markdown-it-anchor");

const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginBundle = require("@11ty/eleventy-plugin-bundle");
const pluginNavigation = require("@11ty/eleventy-navigation");
const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");

const pluginDrafts = require("./eleventy.config.drafts.js");
const pluginImages = require("./eleventy.config.images.js");
const schema = require("@quasibit/eleventy-plugin-schema");

const markdownIt = require("markdown-it");
const markdownItAttrs = require("markdown-it-attrs");

const SITE_URL = "https://duo-studio.co";
const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const DEFAULT_IMAGE = `${SITE_URL}/assets/DuoStudio_Meta--v2.jpg`;

const coreServices = [
	{
		id: "brand-identity-strategy",
		name: "Brand Identity & Strategy",
		serviceType: "Brand Identity Design",
		url: `${SITE_URL}/services/branding-identity-system/`,
		description:
			"Brand strategy, logo design, visual identity systems, messaging frameworks, positioning, art direction, brand guidelines, and collateral design for businesses that have outgrown their current brand.",
		keywords: [
			"brand strategy",
			"brand identity design",
			"logo design",
			"brand guidelines",
			"messaging",
		],
	},
	{
		id: "web-design-development",
		name: "Web Design & Development",
		serviceType: "Web Design and Development",
		url: `${SITE_URL}/services/web-design-development/`,
		description:
			"Custom web design, UI/UX, front-end development, back-end development, CMS implementation, analytics, SEO optimization, API integrations, and launch support.",
		keywords: [
			"web design",
			"web development",
			"custom websites",
			"CMS implementation",
			"technical SEO",
		],
	},
	{
		id: "content-graphic-design",
		name: "Content & Graphic Design",
		serviceType: "Graphic Design",
		url: `${SITE_URL}/services/graphic-design/`,
		description:
			"Marketing collateral, motion graphics, illustration, print design, packaging, campaign design, and content systems that reinforce a brand across touchpoints.",
		keywords: [
			"graphic design",
			"content strategy",
			"motion graphics",
			"marketing collateral",
			"campaign design",
		],
	},
];

function absoluteUrl(pathOrUrl, fallback = SITE_URL) {
	if (!pathOrUrl) {
		return fallback;
	}

	try {
		return new URL(pathOrUrl, SITE_URL).href;
	} catch (_error) {
		return fallback;
	}
}

function cleanText(value, fallback = "") {
	return String(value || fallback).replace(/\s+/g, " ").trim();
}

function serviceNode(service) {
	return {
		"@type": "Service",
		"@id": `${SITE_URL}/#service-${service.id}`,
		name: service.name,
		serviceType: service.serviceType,
		url: service.url,
		description: service.description,
		keywords: service.keywords,
		provider: {
			"@id": ORGANIZATION_ID,
		},
		areaServed: [
			{
				"@type": "City",
				name: "Baltimore",
				containedInPlace: {
					"@type": "State",
					name: "Maryland",
				},
			},
			{
				"@type": "City",
				name: "Washington",
				containedInPlace: {
					"@type": "AdministrativeArea",
					name: "District of Columbia",
				},
			},
			{
				"@type": "Country",
				name: "United States",
			},
		],
	};
}

function buildStructuredData(pageUrl, title, description, image) {
	const pageAbsoluteUrl = absoluteUrl(pageUrl || "/");
	const pageImage = absoluteUrl(image, DEFAULT_IMAGE);
	const pageTitle = cleanText(title, "Duo Studio");
	const pageDescription = cleanText(
		description,
		"Duo Studio creates brand and web systems for businesses that have outgrown their current brand."
	);
	const matchingService = coreServices.find(
		(service) => absoluteUrl(pageUrl || "/") === service.url
	);

	const webPage = {
		"@type": "WebPage",
		"@id": `${pageAbsoluteUrl}#webpage`,
		url: pageAbsoluteUrl,
		name: pageTitle,
		description: pageDescription,
		isPartOf: {
			"@id": WEBSITE_ID,
		},
		about: {
			"@id": ORGANIZATION_ID,
		},
		primaryImageOfPage: {
			"@type": "ImageObject",
			url: pageImage,
		},
		inLanguage: "en-US",
	};

	if (matchingService) {
		webPage.mainEntity = {
			"@id": `${SITE_URL}/#service-${matchingService.id}`,
		};
	}

	return JSON.stringify(
		{
			"@context": "https://schema.org",
			"@graph": [
				{
					"@type": ["Organization", "ProfessionalService"],
					"@id": ORGANIZATION_ID,
					name: "Duo Studio",
					legalName: "Duo Studio",
					url: SITE_URL,
					logo: {
						"@type": "ImageObject",
						url: `${SITE_URL}/assets/logo.svg`,
						width: 52,
						height: 35,
					},
					image: DEFAULT_IMAGE,
					description:
						"Duo Studio is a digital design studio based in Baltimore, MD that creates brand and web systems for businesses that have outgrown their current brand.",
					slogan: "Brand and web systems for businesses that have outgrown their current brand.",
					email: "hello@duo-studio.co",
					telephone: "+1-410-449-0366",
					priceRange: "$$$",
					foundingDate: "2020",
					address: {
						"@type": "PostalAddress",
						addressLocality: "Baltimore",
						addressRegion: "MD",
						addressCountry: "US",
					},
					contactPoint: {
						"@type": "ContactPoint",
						contactType: "sales",
						email: "hello@duo-studio.co",
						telephone: "+1-410-449-0366",
						url: `${SITE_URL}/contact/`,
						availableLanguage: ["English"],
						areaServed: "US",
					},
					founder: [
						{
							"@type": "Person",
							"@id": `${SITE_URL}/#sonia-polyzos`,
							name: "Sonia Polyzos",
							jobTitle: "Creative Director & Co-Founder",
							worksFor: {
								"@id": ORGANIZATION_ID,
							},
						},
						{
							"@type": "Person",
							"@id": `${SITE_URL}/#dat-nguyen`,
							name: "Dat Nguyen",
							jobTitle: "Developer & Co-Founder",
							worksFor: {
								"@id": ORGANIZATION_ID,
							},
						},
					],
					areaServed: [
						{
							"@type": "City",
							name: "Baltimore",
							containedInPlace: {
								"@type": "State",
								name: "Maryland",
							},
						},
						{
							"@type": "City",
							name: "Washington",
							containedInPlace: {
								"@type": "AdministrativeArea",
								name: "District of Columbia",
							},
						},
						{
							"@type": "Country",
							name: "United States",
						},
					],
					sameAs: [
						"https://www.instagram.com/duostudio_co/",
						"https://www.linkedin.com/company/duostudio/",
						"https://www.facebook.com/duostudioco/",
						"https://www.awwwards.com/sites/duo-studio-2",
					],
					knowsAbout: [
						"Brand Identity Design",
						"Brand Strategy",
						"Web Design",
						"Web Development",
						"UI/UX Design",
						"Graphic Design",
						"Logo Design",
						"Motion Graphics",
						"Content Strategy",
						"Technical SEO",
						"Analytics Implementation",
					],
					makesOffer: coreServices.map((service) => ({
						"@type": "Offer",
						itemOffered: {
							"@id": `${SITE_URL}/#service-${service.id}`,
						},
					})),
				},
				...coreServices.map(serviceNode),
				{
					"@type": "WebSite",
					"@id": WEBSITE_ID,
					url: SITE_URL,
					name: "Duo Studio",
					description:
						"Brand and web systems for businesses that have outgrown their current brand.",
					publisher: {
						"@id": ORGANIZATION_ID,
					},
					inLanguage: "en-US",
				},
				webPage,
			],
		},
		null,
		"\t"
	);
}

module.exports = function (eleventyConfig) {
	// Copy only static and generated assets so source files in `public` remain
	// source-of-truth without being served directly.
	eleventyConfig.addPassthroughCopy({
		"./public/assets/": "/assets/",
	});
	eleventyConfig.addPassthroughCopy({
		"./public/robots.txt": "/robots.txt",
	});
	eleventyConfig.addPassthroughCopy({
		"./public/scripts/libs/": "/scripts/libs/",
	});
	eleventyConfig.addPassthroughCopy({
		"./public/generated/scripts/": "/scripts/",
	});
	eleventyConfig.addPassthroughCopy({
		"./public/generated/styles/": "/styles/",
	});
	eleventyConfig.addPassthroughCopy({
		"./public/concepts/": "/concepts/",
	});

	// Run Eleventy when these files change:
	// https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

	// Watch content images for the image pipeline and generated assets for live reload.
	eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpeg}");
	eleventyConfig.addWatchTarget("public/generated/**/*.{css,js}");

	// App plugins
	eleventyConfig.addPlugin(pluginDrafts);
	eleventyConfig.addPlugin(pluginImages);

	// Official plugins
	eleventyConfig.addPlugin(pluginRss);
	eleventyConfig.addPlugin(pluginSyntaxHighlight, {
		preAttributes: { tabindex: 0 },
	});
	eleventyConfig.addPlugin(pluginNavigation);
	eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
	eleventyConfig.addPlugin(pluginBundle);
	eleventyConfig.addPlugin(schema);

	// Filters
	eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
		// Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
		return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(
			format || "MM.dd.yy"
		);
	});

	eleventyConfig.addFilter("htmlDateString", (dateObj) => {
		// dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
		return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
	});

	eleventyConfig.addFilter("sitemapEligible", (page) => {
		const data = page?.data || {};
		const robots = String(data.robots || "").toLowerCase();
		const internalPrefixes = ["/concepts/"];
		const isInternalPreview = internalPrefixes.some((prefix) =>
			String(page?.url || "").startsWith(prefix)
		);

		return (
			Boolean(page?.url) &&
			data.ignore !== true &&
			!robots.includes("noindex") &&
			!isInternalPreview
		);
	});

	eleventyConfig.addFilter("sitemapLastmod", (page) => {
		const value = page?.data?.updated || page?.data?.date || page?.date;
		const date = value instanceof Date ? value : new Date(value);

		if (Number.isNaN(date.getTime())) {
			return DateTime.utc().toFormat("yyyy-LL-dd");
		}

		return DateTime.fromJSDate(date, { zone: "utc" }).toFormat("yyyy-LL-dd");
	});

	// Get the first `n` elements of a collection.
	eleventyConfig.addFilter("head", (array, n) => {
		if (!Array.isArray(array) || array.length === 0) {
			return [];
		}
		if (n < 0) {
			return array.slice(n);
		}

		return array.slice(0, n);
	});

	// Return the smallest number argument
	eleventyConfig.addFilter("min", (...numbers) => {
		return Math.min.apply(null, numbers);
	});

	// Return all the tags used in a collection
	eleventyConfig.addFilter("getAllTags", (collection) => {
		let tagSet = new Set();
		for (let item of collection) {
			(item.data.tags || []).forEach((tag) => tagSet.add(tag));
		}
		return Array.from(tagSet);
	});

	eleventyConfig.addFilter("filterTagList", function filterTagList(tags) {
		return (tags || []).filter(
			(tag) => ["all", "nav", "post", "posts"].indexOf(tag) === -1
		);
	});

	eleventyConfig.addShortcode("version", () => String(Date.now()));
	eleventyConfig.addShortcode("structuredData", buildStructuredData);

	const mdOptions = {
		html: true,
		breaks: true,
		linkify: true,
	};
	const markdownLib = markdownIt(mdOptions)
		.use(markdownItAttrs)
		.disable("code");

	eleventyConfig.setLibrary("md", markdownLib);

	return {
		// Control which files Eleventy will process
		// e.g.: *.md, *.njk, *.html, *.liquid
		templateFormats: ["md", "njk", "html", "liquid"],

		// Pre-process *.md files with: (default: `liquid`)
		markdownTemplateEngine: "njk",

		// Pre-process *.html files with: (default: `liquid`)
		htmlTemplateEngine: "njk",

		// These are all optional:
		dir: {
			input: "content", // default: "."
			includes: "../_includes", // default: "_includes"
			data: "../_data", // default: "_data"
			output: "_site",
		},

		// -----------------------------------------------------------------
		// Optional items:
		// -----------------------------------------------------------------

		// If your site deploys to a subdirectory, change `pathPrefix`.
		// Read more: https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix

		// When paired with the HTML <base> plugin https://www.11ty.dev/docs/plugins/html-base/
		// it will transform any absolute URLs in your HTML to include this
		// folder name and does **not** affect where things go in the output folder.
		pathPrefix: "/",
	};
};
