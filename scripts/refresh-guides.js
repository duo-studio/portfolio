const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const GUIDES_DIR = path.join(ROOT, "content", "guides");

const guideConfig = [
	{
		slug: "ai-search-optimization",
		file: "ai-search-optimization.md",
		displayHeadline: "What it takes to earn visibility in AI search",
	},
	{
		slug: "baltimore-branding-agency",
		file: "baltimore-branding-agency.md",
		displayHeadline: "A Baltimore branding studio for businesses in transition",
	},
	{
		slug: "baltimore-web-design",
		file: "baltimore-web-design.md",
		displayHeadline: "Finding the right web design partner in Baltimore",
	},
	{
		slug: "branding-vs-logo-design",
		file: "branding-vs-logo-design.md",
		displayHeadline: "A logo is one part of the brand",
	},
	{
		slug: "choose-branding-agency",
		file: "choose-branding-agency.md",
		displayHeadline: "What to look for in a branding agency",
	},
	{
		slug: "choose-web-design-agency",
		file: "choose-web-design-agency.md",
		displayHeadline: "What to look for in a web design agency",
	},
	{
		slug: "headless-wordpress-vs-traditional",
		file: "headless-wordpress-vs-traditional.md",
		displayHeadline: "Choosing between headless and traditional WordPress",
	},
	{
		slug: "nonprofit-web-design",
		file: "nonprofit-web-design.md",
		displayHeadline: "What nonprofit websites need to make clear",
	},
	{
		slug: "rebrand-cost",
		file: "rebrand-cost.md",
		displayHeadline: "What shapes the cost of a rebrand",
	},
	{
		slug: "signs-you-need-rebrand",
		file: "signs-you-need-rebrand.md",
		displayHeadline: "When the brand no longer fits the business",
	},
	{
		slug: "small-business-website-design",
		file: "small-business-website-design.md",
		displayHeadline: "What a small business website needs to do well",
	},
	{
		slug: "tech-company-branding",
		file: "tech-company-branding.md",
		displayHeadline: "What helps a tech brand stand apart",
	},
	{
		slug: "website-not-converting",
		file: "website-not-converting.md",
		displayHeadline: "Why traffic isn't turning into leads",
	},
	{
		slug: "website-redesign-cost",
		file: "website-redesign-cost.md",
		displayHeadline: "What shapes the cost of a website redesign",
	},
	{
		slug: "what-branding-agency-does",
		file: "what-branding-agency-does.md",
		displayHeadline: "What a branding agency is there to shape",
	},
];

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
	upsertLine(frontMatterLines, "thumbImage", `guides/${guide.slug}/archive.webp`, "category");
	upsertLine(frontMatterLines, "featImage", "./featured-sync.webp", "thumbImage");

	const updated = `---\n${frontMatterLines.join("\n")}\n---\n${body}`;
	fs.writeFileSync(markdownPath, updated);
}

function main() {
	for (const guide of guideConfig) {
		updateGuideMarkdown(guide);
	}

	console.log(`Updated ${guideConfig.length} guides.`);
}

main();
