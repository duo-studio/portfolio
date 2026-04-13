const fs = require("fs/promises");
const path = require("path");
const esbuild = require("esbuild");
const sass = require("sass");

const projectRoot = path.resolve(__dirname, "..");
const sourceRoot = path.join(projectRoot, "public");
const generatedRoot = path.join(sourceRoot, "generated");

const cssAssets = [
	{
		type: "scss",
		source: "styles/style-inline.scss",
		output: "styles/style-inline.min.css",
	},
	{
		type: "scss",
		source: "styles/style.scss",
		output: "styles/style.min.css",
	},
	{
		type: "scss",
		source: "styles/membership.scss",
		output: "styles/membership.min.css",
	},
	{
		type: "css",
		source: "styles/fonts.css",
		output: "styles/fonts.min.css",
	},
	{
		type: "css",
		source: "styles/lenis.css",
		output: "styles/lenis.min.css",
	},
];

const jsAssets = [
	{
		source: "scripts/global.js",
		output: "scripts/global.min.js",
	},
	{
		source: "scripts/tools.js",
		output: "scripts/tools.min.js",
	},
];

async function ensureDir(filePath) {
	await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function cleanGeneratedAssets() {
	await fs.rm(generatedRoot, { recursive: true, force: true });
}

async function buildCssAsset(asset) {
	const sourcePath = path.join(sourceRoot, asset.source);
	const outputPath = path.join(generatedRoot, asset.output);

	let css;
	if (asset.type === "scss") {
		const compiled = sass.compile(sourcePath, {
			loadPaths: [path.dirname(sourcePath)],
			style: "expanded",
		});
		css = compiled.css;
	} else {
		css = await fs.readFile(sourcePath, "utf8");
	}

	const minified = await esbuild.transform(css, {
		loader: "css",
		minify: true,
		legalComments: "none",
	});

	await ensureDir(outputPath);
	await fs.writeFile(outputPath, minified.code);
}

async function buildJsAsset(asset) {
	const sourcePath = path.join(sourceRoot, asset.source);
	const outputPath = path.join(generatedRoot, asset.output);
	const source = await fs.readFile(sourcePath, "utf8");

	const minified = await esbuild.transform(source, {
		loader: "js",
		minify: true,
		legalComments: "none",
		target: "es2018",
	});

	await ensureDir(outputPath);
	await fs.writeFile(outputPath, minified.code);
}

async function main() {
	await cleanGeneratedAssets();

	await Promise.all(cssAssets.map(buildCssAsset));
	await Promise.all(jsAssets.map(buildJsAsset));
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
