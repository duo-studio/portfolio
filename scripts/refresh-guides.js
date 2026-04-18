const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const GUIDES_DIR = path.join(ROOT, "content", "guides");

const palette = {
	paper: "#FEFCFF",
	ink: "#0F0D0D",
	rose: "#EDBFFF",
	fog: "#E8E4EB",
	mist: "#F3F3F3",
	stone: "#D8D2DD",
};

const guideConfig = [
	{
		slug: "ai-search-optimization",
		file: "ai-search-optimization.md",
		displayHeadline: "What it takes to earn visibility in AI search",
		motif: "network",
	},
	{
		slug: "baltimore-branding-agency",
		file: "baltimore-branding-agency.md",
		displayHeadline: "A Baltimore branding studio for businesses in transition",
		motif: "baltimoreBrand",
	},
	{
		slug: "baltimore-web-design",
		file: "baltimore-web-design.md",
		displayHeadline: "Finding the right web design partner in Baltimore",
		motif: "baltimoreWeb",
	},
	{
		slug: "branding-vs-logo-design",
		file: "branding-vs-logo-design.md",
		displayHeadline: "A logo is one part of the brand",
		motif: "brandVsLogo",
	},
	{
		slug: "choose-branding-agency",
		file: "choose-branding-agency.md",
		displayHeadline: "What to look for in a branding agency",
		motif: "stackedCards",
	},
	{
		slug: "choose-web-design-agency",
		file: "choose-web-design-agency.md",
		displayHeadline: "What to look for in a web design agency",
		motif: "wireframeCards",
	},
	{
		slug: "headless-wordpress-vs-traditional",
		file: "headless-wordpress-vs-traditional.md",
		displayHeadline: "Choosing between headless and traditional WordPress",
		motif: "architectureSplit",
	},
	{
		slug: "nonprofit-web-design",
		file: "nonprofit-web-design.md",
		displayHeadline: "What nonprofit websites need to make clear",
		motif: "impactRings",
	},
	{
		slug: "rebrand-cost",
		file: "rebrand-cost.md",
		displayHeadline: "What shapes the cost of a rebrand",
		motif: "costBars",
	},
	{
		slug: "signs-you-need-rebrand",
		file: "signs-you-need-rebrand.md",
		displayHeadline: "When the brand no longer fits the business",
		motif: "brandDrift",
	},
	{
		slug: "small-business-website-design",
		file: "small-business-website-design.md",
		displayHeadline: "What a small business website needs to do well",
		motif: "storefrontGrid",
	},
	{
		slug: "tech-company-branding",
		file: "tech-company-branding.md",
		displayHeadline: "What helps a tech brand stand apart",
		motif: "signalCircuit",
	},
	{
		slug: "website-not-converting",
		file: "website-not-converting.md",
		displayHeadline: "Why traffic isn't turning into leads",
		motif: "brokenFunnel",
	},
	{
		slug: "website-redesign-cost",
		file: "website-redesign-cost.md",
		displayHeadline: "What shapes the cost of a website redesign",
		motif: "blueprintBudget",
	},
	{
		slug: "what-branding-agency-does",
		file: "what-branding-agency-does.md",
		displayHeadline: "What a branding agency is there to shape",
		motif: "processPath",
	},
];

function attrString(attrs) {
	return Object.entries(attrs)
		.filter(([, value]) => value !== undefined && value !== null)
		.map(([key, value]) => `${key}="${String(value)}"`)
		.join(" ");
}

function rect(attrs) {
	return `<rect ${attrString(attrs)}/>`;
}

function circle(attrs) {
	return `<circle ${attrString(attrs)}/>`;
}

function line(attrs) {
	return `<line ${attrString(attrs)}/>`;
}

function pathTag(attrs) {
	return `<path ${attrString(attrs)}/>`;
}

function polyline(attrs) {
	return `<polyline ${attrString(attrs)}/>`;
}

function motifBase(content) {
	return [
		`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" fill="none">`,
		rect({ width: 1600, height: 900, fill: palette.paper }),
		rect({
			x: 24,
			y: 24,
			width: 1552,
			height: 852,
			rx: 28,
			fill: palette.paper,
			stroke: palette.ink,
			"stroke-opacity": 0.08,
		}),
		line({
			x1: 72,
			y1: 118,
			x2: 1528,
			y2: 118,
			stroke: palette.ink,
			"stroke-opacity": 0.08,
		}),
		line({
			x1: 72,
			y1: 782,
			x2: 1528,
			y2: 782,
			stroke: palette.ink,
			"stroke-opacity": 0.08,
		}),
		circle({ cx: 90, cy: 90, r: 5, fill: palette.ink, "fill-opacity": 0.12 }),
		circle({ cx: 1510, cy: 810, r: 5, fill: palette.ink, "fill-opacity": 0.12 }),
		content,
		`</svg>`,
	].join("\n");
}

function node(x, y, r, fill, stroke, strokeWidth = 0) {
	return circle({
		cx: x,
		cy: y,
		r,
		fill,
		stroke,
		"stroke-width": strokeWidth,
	});
}

function networkMotif() {
	const nodes = [
		[220, 280],
		[360, 220],
		[470, 360],
		[640, 250],
		[760, 430],
		[980, 340],
		[1180, 240],
		[1250, 510],
	];
	const links = [
		[0, 1],
		[0, 2],
		[1, 3],
		[2, 3],
		[2, 4],
		[3, 5],
		[4, 5],
		[5, 6],
		[5, 7],
	];

	return motifBase(
		[
			circle({ cx: 1180, cy: 250, r: 210, fill: palette.rose, "fill-opacity": 0.32 }),
			circle({ cx: 350, cy: 630, r: 150, fill: palette.mist }),
			...links.map(([a, b]) =>
				line({
					x1: nodes[a][0],
					y1: nodes[a][1],
					x2: nodes[b][0],
					y2: nodes[b][1],
					stroke: palette.ink,
					"stroke-opacity": 0.24,
					"stroke-width": 2,
				}),
			),
			...nodes.map(([x, y], index) =>
				index === 6
					? node(x, y, 18, palette.paper, palette.ink, 2)
					: node(x, y, 10, index === 5 ? palette.rose : palette.ink, undefined),
			),
			rect({ x: 1035, y: 520, width: 240, height: 18, rx: 9, fill: palette.ink, "fill-opacity": 0.16 }),
			rect({ x: 1035, y: 552, width: 180, height: 18, rx: 9, fill: palette.ink, "fill-opacity": 0.1 }),
			rect({ x: 1035, y: 584, width: 210, height: 18, rx: 9, fill: palette.rose, "fill-opacity": 0.55 }),
		].join("\n"),
	);
}

function baltimoreBrandMotif() {
	return motifBase(
		[
			circle({ cx: 270, cy: 690, r: 230, fill: palette.rose, "fill-opacity": 0.34 }),
			pathTag({
				d: "M170 612C296 542 402 528 558 560C698 590 781 640 916 642C1068 644 1158 573 1300 524",
				stroke: palette.ink,
				"stroke-width": 4,
				"stroke-linecap": "round",
				"stroke-opacity": 0.22,
			}),
			...[
				160, 250, 356, 462, 568, 674, 780, 886, 992, 1098, 1204,
			].map((x) =>
				line({
					x1: x,
					y1: 170,
					x2: x,
					y2: x % 212 === 0 ? 660 : 700,
					stroke: palette.ink,
					"stroke-opacity": 0.12,
				}),
			),
			...[
				218, 320, 430, 532, 634,
			].map((y) =>
				line({
					x1: 124,
					y1: y,
					x2: 1320,
					y2: y,
					stroke: palette.ink,
					"stroke-opacity": 0.1,
				}),
			),
			rect({ x: 1035, y: 250, width: 200, height: 270, rx: 28, fill: palette.ink, "fill-opacity": 0.92 }),
			rect({ x: 1074, y: 290, width: 122, height: 34, rx: 17, fill: palette.paper, "fill-opacity": 0.88 }),
			rect({ x: 1074, y: 350, width: 122, height: 122, rx: 20, fill: palette.rose }),
		].join("\n"),
	);
}

function baltimoreWebMotif() {
	return motifBase(
		[
			rect({ x: 850, y: 182, width: 520, height: 370, rx: 34, fill: palette.paper, stroke: palette.ink, "stroke-opacity": 0.28, "stroke-width": 2 }),
			rect({ x: 850, y: 182, width: 520, height: 56, rx: 34, fill: palette.fog }),
			circle({ cx: 900, cy: 210, r: 8, fill: palette.ink, "fill-opacity": 0.14 }),
			circle({ cx: 930, cy: 210, r: 8, fill: palette.rose, "fill-opacity": 0.7 }),
			circle({ cx: 960, cy: 210, r: 8, fill: palette.ink, "fill-opacity": 0.14 }),
			rect({ x: 904, y: 282, width: 412, height: 180, rx: 22, fill: palette.mist }),
			rect({ x: 904, y: 492, width: 210, height: 18, rx: 9, fill: palette.ink, "fill-opacity": 0.14 }),
			rect({ x: 1126, y: 492, width: 190, height: 18, rx: 9, fill: palette.rose, "fill-opacity": 0.6 }),
			...[
				210, 306, 402, 498, 594, 690,
			].map((x) =>
				line({
					x1: x,
					y1: 208,
					x2: x + 90,
					y2: 688,
					stroke: palette.ink,
					"stroke-opacity": x === 402 ? 0.25 : 0.08,
					"stroke-width": x === 402 ? 2 : 1,
				}),
			),
			pathTag({
				d: "M194 620C318 542 416 492 566 456C700 422 786 412 922 420",
				stroke: palette.rose,
				"stroke-width": 6,
				"stroke-linecap": "round",
				"stroke-opacity": 0.72,
			}),
		].join("\n"),
	);
}

function brandVsLogoMotif() {
	return motifBase(
		[
			rect({ x: 170, y: 190, width: 400, height: 400, rx: 48, fill: palette.mist }),
			circle({ cx: 370, cy: 390, r: 126, fill: palette.paper, stroke: palette.ink, "stroke-width": 3, "stroke-opacity": 0.32 }),
			pathTag({
				d: "M370 276L454 390L370 504L286 390Z",
				stroke: palette.rose,
				"stroke-width": 8,
				"stroke-linejoin": "round",
				"stroke-opacity": 0.75,
			}),
			line({ x1: 760, y1: 170, x2: 760, y2: 728, stroke: palette.ink, "stroke-opacity": 0.14 }),
			...Array.from({ length: 3 }).flatMap((_, row) =>
				Array.from({ length: 4 }).flatMap((__, column) => {
					const x = 920 + column * 122;
					const y = 230 + row * 150;
					return [
						rect({ x, y, width: 82, height: 82, rx: 22, fill: row === 1 && column === 1 ? palette.rose : palette.paper, stroke: palette.ink, "stroke-opacity": 0.16 }),
						circle({ cx: x + 41, cy: y + 41, r: 16, fill: palette.ink, "fill-opacity": row === 1 && column === 1 ? 0.92 : 0.1 }),
					];
				}),
			),
		].join("\n"),
	);
}

function stackedCardsMotif() {
	return motifBase(
		[
			rect({ x: 280, y: 230, width: 420, height: 280, rx: 32, fill: palette.paper, stroke: palette.ink, "stroke-opacity": 0.14 }),
			rect({ x: 410, y: 290, width: 420, height: 280, rx: 32, fill: palette.mist, stroke: palette.ink, "stroke-opacity": 0.14 }),
			rect({ x: 540, y: 350, width: 420, height: 280, rx: 32, fill: palette.paper, stroke: palette.ink, "stroke-opacity": 0.14 }),
			rect({ x: 566, y: 392, width: 144, height: 18, rx: 9, fill: palette.rose, "fill-opacity": 0.7 }),
			rect({ x: 566, y: 434, width: 310, height: 18, rx: 9, fill: palette.ink, "fill-opacity": 0.12 }),
			rect({ x: 566, y: 476, width: 280, height: 18, rx: 9, fill: palette.ink, "fill-opacity": 0.12 }),
			polyline({
				points: "1080,305 1120,345 1188,265",
				stroke: palette.ink,
				"stroke-width": 6,
				"stroke-linecap": "round",
				"stroke-linejoin": "round",
				"stroke-opacity": 0.22,
			}),
			polyline({
				points: "1180,470 1220,510 1288,430",
				stroke: palette.rose,
				"stroke-width": 8,
				"stroke-linecap": "round",
				"stroke-linejoin": "round",
				"stroke-opacity": 0.72,
			}),
			circle({ cx: 1210, cy: 675, r: 140, fill: palette.rose, "fill-opacity": 0.24 }),
		].join("\n"),
	);
}

function wireframeCardsMotif() {
	return motifBase(
		[
			rect({ x: 204, y: 214, width: 492, height: 472, rx: 30, fill: palette.paper, stroke: palette.ink, "stroke-opacity": 0.18, "stroke-width": 2 }),
			rect({ x: 742, y: 214, width: 654, height: 472, rx: 30, fill: palette.paper, stroke: palette.ink, "stroke-opacity": 0.1, "stroke-width": 2 }),
			rect({ x: 236, y: 246, width: 428, height: 54, rx: 18, fill: palette.fog }),
			rect({ x: 776, y: 248, width: 588, height: 170, rx: 22, fill: palette.mist }),
			...Array.from({ length: 4 }).flatMap((_, index) => {
				const y = 472 + index * 50;
				return [
					circle({ cx: 804, cy: y, r: 10, fill: index === 1 ? palette.rose : palette.ink, "fill-opacity": index === 1 ? 0.9 : 0.16 }),
					rect({ x: 832, y: y - 9, width: index === 1 ? 350 : 420, height: 18, rx: 9, fill: index === 1 ? palette.rose : palette.ink, "fill-opacity": index === 1 ? 0.5 : 0.1 }),
				];
			}),
			rect({ x: 280, y: 342, width: 188, height: 188, rx: 24, fill: palette.rose, "fill-opacity": 0.26 }),
			rect({ x: 488, y: 342, width: 132, height: 18, rx: 9, fill: palette.ink, "fill-opacity": 0.12 }),
			rect({ x: 488, y: 380, width: 132, height: 18, rx: 9, fill: palette.ink, "fill-opacity": 0.12 }),
			rect({ x: 488, y: 418, width: 100, height: 18, rx: 9, fill: palette.rose, "fill-opacity": 0.58 }),
		].join("\n"),
	);
}

function architectureSplitMotif() {
	return motifBase(
		[
			rect({ x: 210, y: 230, width: 420, height: 410, rx: 34, fill: palette.paper, stroke: palette.ink, "stroke-opacity": 0.16 }),
			rect({ x: 970, y: 230, width: 420, height: 410, rx: 34, fill: palette.paper, stroke: palette.ink, "stroke-opacity": 0.1 }),
			...[
				[260, 280, 320, 78],
				[260, 386, 320, 78],
				[260, 492, 320, 78],
			].map(([x, y, width, height], index) =>
				rect({
					x,
					y,
					width,
					height,
					rx: 20,
					fill: index === 1 ? palette.rose : palette.mist,
					"fill-opacity": index === 1 ? 0.36 : 1,
				}),
			),
			...[
				[1022, 280, 128, 128],
				[1174, 280, 128, 128],
				[1098, 442, 128, 128],
			].map(([x, y, width, height], index) =>
				rect({
					x,
					y,
					width,
					height,
					rx: 26,
					fill: index === 2 ? palette.rose : palette.paper,
					stroke: palette.ink,
					"stroke-opacity": 0.14,
				}),
			),
			pathTag({
				d: "M632 438H772C808 438 826 402 856 402H968",
				stroke: palette.ink,
				"stroke-width": 3,
				"stroke-linecap": "round",
				"stroke-opacity": 0.22,
			}),
			pathTag({
				d: "M632 466H752C790 466 814 510 856 510H968",
				stroke: palette.rose,
				"stroke-width": 6,
				"stroke-linecap": "round",
				"stroke-opacity": 0.72,
			}),
		].join("\n"),
	);
}

function impactRingsMotif() {
	return motifBase(
		[
			circle({ cx: 560, cy: 450, r: 220, fill: palette.mist }),
			circle({ cx: 560, cy: 450, r: 180, fill: palette.paper, stroke: palette.ink, "stroke-opacity": 0.12, "stroke-width": 2 }),
			circle({ cx: 560, cy: 450, r: 120, fill: palette.paper, stroke: palette.rose, "stroke-opacity": 0.72, "stroke-width": 8 }),
			...[
				[560, 252],
				[724, 350],
				[724, 550],
				[560, 648],
				[396, 550],
				[396, 350],
			].map(([x, y], index) =>
				node(x, y, index === 0 ? 16 : 11, index === 0 ? palette.rose : palette.ink),
			),
			pathTag({
				d: "M930 620C1008 544 1060 476 1120 394C1174 320 1230 286 1324 262",
				stroke: palette.ink,
				"stroke-width": 3,
				"stroke-linecap": "round",
				"stroke-opacity": 0.22,
			}),
			rect({ x: 1010, y: 500, width: 250, height: 18, rx: 9, fill: palette.ink, "fill-opacity": 0.1 }),
			rect({ x: 1010, y: 538, width: 218, height: 18, rx: 9, fill: palette.rose, "fill-opacity": 0.58 }),
			rect({ x: 1010, y: 576, width: 188, height: 18, rx: 9, fill: palette.ink, "fill-opacity": 0.1 }),
		].join("\n"),
	);
}

function costBarsMotif() {
	return motifBase(
		[
			circle({ cx: 1170, cy: 260, r: 180, fill: palette.rose, "fill-opacity": 0.3 }),
			...[
				[250, 610, 180],
				[470, 510, 220],
				[730, 410, 280],
				[1050, 300, 340],
			].map(([x, y, height], index) =>
				rect({
					x,
					y,
					width: 120,
					height,
					rx: 30,
					fill: index === 2 ? palette.rose : palette.ink,
					"fill-opacity": index === 2 ? 0.48 : 0.12,
				}),
			),
			line({ x1: 190, y1: 730, x2: 1410, y2: 730, stroke: palette.ink, "stroke-opacity": 0.16, "stroke-width": 2 }),
			pathTag({
				d: "M1295 260H1395V640H1295",
				stroke: palette.ink,
				"stroke-width": 3,
				"stroke-linecap": "round",
				"stroke-linejoin": "round",
				"stroke-opacity": 0.24,
			}),
		].join("\n"),
	);
}

function brandDriftMotif() {
	return motifBase(
		[
			rect({ x: 300, y: 218, width: 440, height: 440, rx: 46, fill: palette.paper, stroke: palette.ink, "stroke-opacity": 0.1 }),
			pathTag({
				d: "M404 318L640 284L676 520L440 554Z",
				fill: palette.rose,
				"fill-opacity": 0.38,
			}),
			pathTag({
				d: "M436 332L598 300L628 492L468 524Z",
				stroke: palette.ink,
				"stroke-opacity": 0.16,
				"stroke-width": 2,
			}),
			pathTag({
				d: "M510 300L542 368L612 394L548 432L532 510",
				stroke: palette.ink,
				"stroke-width": 5,
				"stroke-linecap": "round",
				"stroke-linejoin": "round",
				"stroke-opacity": 0.28,
			}),
			...Array.from({ length: 5 }).map((_, index) =>
				line({
					x1: 880,
					y1: 260 + index * 92,
					x2: 1320,
					y2: 220 + index * 92,
					stroke: palette.ink,
					"stroke-opacity": index === 2 ? 0.22 : 0.08,
					"stroke-width": index === 2 ? 2 : 1,
				}),
			),
			circle({ cx: 1220, cy: 560, r: 128, fill: palette.mist }),
			circle({ cx: 1220, cy: 560, r: 76, fill: palette.paper, stroke: palette.rose, "stroke-opacity": 0.7, "stroke-width": 6 }),
		].join("\n"),
	);
}

function storefrontGridMotif() {
	return motifBase(
		[
			rect({ x: 224, y: 214, width: 1152, height: 472, rx: 38, fill: palette.paper, stroke: palette.ink, "stroke-opacity": 0.1 }),
			...Array.from({ length: 4 }).flatMap((_, column) =>
				Array.from({ length: 2 }).map((__, row) =>
					rect({
						x: 270 + column * 272,
						y: 264 + row * 192,
						width: 222,
						height: 146,
						rx: 24,
						fill: row === 1 && column === 1 ? palette.rose : palette.mist,
						"fill-opacity": row === 1 && column === 1 ? 0.42 : 1,
					}),
				),
			),
			rect({ x: 678, y: 264, width: 222, height: 338, rx: 30, fill: palette.paper, stroke: palette.ink, "stroke-opacity": 0.14 }),
			rect({ x: 724, y: 318, width: 130, height: 230, rx: 22, fill: palette.rose, "fill-opacity": 0.56 }),
			line({ x1: 788, y1: 318, x2: 788, y2: 548, stroke: palette.ink, "stroke-opacity": 0.18 }),
			line({ x1: 224, y1: 242, x2: 1376, y2: 242, stroke: palette.ink, "stroke-opacity": 0.08 }),
		].join("\n"),
	);
}

function signalCircuitMotif() {
	return motifBase(
		[
			circle({ cx: 1180, cy: 260, r: 180, fill: palette.rose, "fill-opacity": 0.28 }),
			...[
				"M310 620V330H520",
				"M520 330V240H770",
				"M520 330V510H720",
				"M770 240H1080V170",
				"M720 510H1040V630",
				"M870 330H1220",
			].map((d, index) =>
				pathTag({
					d,
					stroke: index === 3 ? palette.rose : palette.ink,
					"stroke-width": index === 3 ? 6 : 3,
					"stroke-linecap": "round",
					"stroke-linejoin": "round",
					"stroke-opacity": index === 3 ? 0.74 : 0.22,
				}),
			),
			...[
				[310, 620],
				[520, 330],
				[770, 240],
				[720, 510],
				[1080, 170],
				[1040, 630],
				[1220, 330],
			].map(([x, y], index) =>
				node(x, y, index === 4 ? 17 : 11, index === 4 ? palette.rose : palette.ink),
			),
		].join("\n"),
	);
}

function brokenFunnelMotif() {
	return motifBase(
		[
			pathTag({ d: "M220 214H1310L1080 404H450Z", fill: palette.mist }),
			pathTag({ d: "M450 404H1080L860 688H668Z", fill: palette.paper, stroke: palette.ink, "stroke-opacity": 0.1 }),
			rect({ x: 760, y: 396, width: 330, height: 46, rx: 23, fill: palette.rose, "fill-opacity": 0.74 }),
			rect({ x: 1098, y: 396, width: 96, height: 46, rx: 23, fill: palette.ink, "fill-opacity": 0.12 }),
			circle({ cx: 1162, cy: 528, r: 12, fill: palette.ink, "fill-opacity": 0.22 }),
			circle({ cx: 1214, cy: 572, r: 12, fill: palette.ink, "fill-opacity": 0.16 }),
			circle({ cx: 1260, cy: 626, r: 12, fill: palette.ink, "fill-opacity": 0.12 }),
		].join("\n"),
	);
}

function blueprintBudgetMotif() {
	return motifBase(
		[
			rect({ x: 248, y: 214, width: 480, height: 472, rx: 34, fill: palette.paper, stroke: palette.ink, "stroke-opacity": 0.12 }),
			rect({ x: 304, y: 270, width: 368, height: 130, rx: 26, fill: palette.mist }),
			rect({ x: 304, y: 430, width: 210, height: 206, rx: 26, fill: palette.paper, stroke: palette.ink, "stroke-opacity": 0.1 }),
			rect({ x: 538, y: 430, width: 134, height: 206, rx: 26, fill: palette.rose, "fill-opacity": 0.44 }),
			...[
				[866, 250, 290],
				[866, 362, 370],
				[866, 474, 446],
			].map(([x, y, width], index) =>
				rect({
					x,
					y,
					width,
					height: 58,
					rx: 20,
					fill: index === 1 ? palette.rose : palette.ink,
					"fill-opacity": index === 1 ? 0.55 : 0.12,
				}),
			),
			line({ x1: 866, y1: 206, x2: 866, y2: 676, stroke: palette.ink, "stroke-opacity": 0.1 }),
		].join("\n"),
	);
}

function processPathMotif() {
	return motifBase(
		[
			pathTag({
				d: "M226 512C342 420 430 380 552 380C666 380 726 462 844 462C970 462 1052 304 1174 304C1264 304 1324 344 1380 404",
				stroke: palette.ink,
				"stroke-width": 3,
				"stroke-linecap": "round",
				"stroke-opacity": 0.22,
			}),
			...[
				[226, 512, 64, palette.paper],
				[552, 380, 76, palette.rose],
				[844, 462, 68, palette.paper],
				[1174, 304, 88, palette.paper],
			].map(([x, y, r, fill], index) =>
				circle({
					cx: x,
					cy: y,
					r,
					fill,
					stroke: palette.ink,
					"stroke-opacity": index === 1 ? 0 : 0.12,
					"stroke-width": 2,
				}),
			),
			rect({ x: 190, y: 468, width: 72, height: 88, rx: 22, fill: palette.mist }),
			rect({ x: 514, y: 334, width: 76, height: 92, rx: 24, fill: palette.ink, "fill-opacity": 0.08 }),
			rect({ x: 810, y: 418, width: 68, height: 88, rx: 24, fill: palette.mist }),
			rect({ x: 1132, y: 258, width: 82, height: 92, rx: 26, fill: palette.rose, "fill-opacity": 0.32 }),
		].join("\n"),
	);
}

const motifBuilders = {
	network: networkMotif,
	baltimoreBrand: baltimoreBrandMotif,
	baltimoreWeb: baltimoreWebMotif,
	brandVsLogo: brandVsLogoMotif,
	stackedCards: stackedCardsMotif,
	wireframeCards: wireframeCardsMotif,
	architectureSplit: architectureSplitMotif,
	impactRings: impactRingsMotif,
	costBars: costBarsMotif,
	brandDrift: brandDriftMotif,
	storefrontGrid: storefrontGridMotif,
	signalCircuit: signalCircuitMotif,
	brokenFunnel: brokenFunnelMotif,
	blueprintBudget: blueprintBudgetMotif,
	processPath: processPathMotif,
};

function formatYamlString(value) {
	return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function upsertLine(lines, key, value, afterKey = "headline") {
	const formatted = `${key}: ${formatYamlString(value)}`;
	const lineIndex = lines.findIndex((line) => line.startsWith(`${key}:`));
	if (lineIndex >= 0) {
		lines[lineIndex] = formatted;
		return;
	}

	const afterIndex = lines.findIndex((line) => line.startsWith(`${afterKey}:`));
	if (afterIndex >= 0) {
		lines.splice(afterIndex + 1, 0, formatted);
		return;
	}

	lines.push(formatted);
}

function updateGuideMarkdown(guide) {
	const guideDir = path.join(GUIDES_DIR, guide.slug);
	const markdownPath = path.join(guideDir, guide.file);
	const raw = fs.readFileSync(markdownPath, "utf8");
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);

	if (!match) {
		throw new Error(`Missing front matter in ${markdownPath}`);
	}

	const frontMatterLines = match[1].split(/\r?\n/);
	const body = match[2];

	upsertLine(frontMatterLines, "displayHeadline", guide.displayHeadline);
	upsertLine(frontMatterLines, "cardHeadline", guide.displayHeadline, "displayHeadline");
	upsertLine(frontMatterLines, "thumbImage", `guides/${guide.slug}/featured.svg`, "category");
	upsertLine(frontMatterLines, "featImage", "./featured.svg", "thumbImage");

	const updated = `---\n${frontMatterLines.join("\n")}\n---\n${body}`;
	fs.writeFileSync(markdownPath, updated);
}

function writeGuideCover(guide) {
	const guideDir = path.join(GUIDES_DIR, guide.slug);
	const svgPath = path.join(guideDir, "featured.svg");
	const builder = motifBuilders[guide.motif];

	if (!builder) {
		throw new Error(`Missing motif builder for ${guide.slug}`);
	}

	fs.writeFileSync(svgPath, builder());
}

function main() {
	for (const guide of guideConfig) {
		updateGuideMarkdown(guide);
		writeGuideCover(guide);
	}

	console.log(`Updated ${guideConfig.length} guides with new titles and covers.`);
}

main();
