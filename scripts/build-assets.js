const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const esbuild = require("esbuild");
const sass = require("sass");

const projectRoot = path.resolve(__dirname, "..");
const sourceRoot = path.join(projectRoot, "public");
const generatedRoot = path.join(sourceRoot, "generated");
const siteRoot = path.join(projectRoot, "_site");
const isWatchMode = process.argv.includes("--watch");

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
	await fsp.mkdir(path.dirname(filePath), { recursive: true });
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function cleanGeneratedAssets() {
	await fsp.rm(generatedRoot, { recursive: true, force: true });
}

async function writeFileWithRetries(filePath, contents, attempts = 8) {
	let lastError;

	for (let attempt = 0; attempt < attempts; attempt += 1) {
		try {
			await fsp.writeFile(filePath, contents);
			return;
		} catch (error) {
			lastError = error;
			if (!["EBUSY", "EPERM"].includes(error.code) || attempt === attempts - 1) {
				throw error;
			}

			await sleep(120 * (attempt + 1));
		}
	}

	throw lastError;
}

async function writeOutput(relativeOutputPath, contents) {
	const generatedPath = path.join(generatedRoot, relativeOutputPath);
	await ensureDir(generatedPath);
	await writeFileWithRetries(generatedPath, contents);

	try {
		await fsp.access(siteRoot);
		const sitePath = path.join(siteRoot, relativeOutputPath);
		await ensureDir(sitePath);
		await writeFileWithRetries(sitePath, contents);
	} catch (error) {
		if (error.code === "ENOENT") {
			// `_site` won't exist before the first Eleventy build, which is fine.
			return;
		}

		console.warn(
			`[assets] Unable to sync ${relativeOutputPath} into _site: ${error.code || error.message}`
		);
	}
}

async function buildCssAsset(asset) {
	const sourcePath = path.join(sourceRoot, asset.source);

	let css;
	if (asset.type === "scss") {
		const compiled = sass.compile(sourcePath, {
			loadPaths: [path.dirname(sourcePath)],
			style: "expanded",
		});
		css = compiled.css;
	} else {
		css = await fsp.readFile(sourcePath, "utf8");
	}

	const minified = await esbuild.transform(css, {
		loader: "css",
		minify: true,
		legalComments: "none",
	});

	await writeOutput(asset.output, minified.code);
}

async function buildJsAsset(asset) {
	const sourcePath = path.join(sourceRoot, asset.source);
	const source = await fsp.readFile(sourcePath, "utf8");

	const minified = await esbuild.transform(source, {
		loader: "js",
		minify: true,
		legalComments: "none",
		target: "es2018",
	});

	await writeOutput(asset.output, minified.code);
}

async function buildAll({ clean = false } = {}) {
	if (clean) {
		await cleanGeneratedAssets();
	}

	await Promise.all(cssAssets.map(buildCssAsset));
	await Promise.all(jsAssets.map(buildJsAsset));
}

function log(message) {
	console.log(`[assets] ${message}`);
}

function debounce(fn, delay) {
	let timerId;

	return (...args) => {
		clearTimeout(timerId);
		timerId = setTimeout(() => fn(...args), delay);
	};
}

async function listDirectories(rootDir) {
	const directories = [rootDir];
	const entries = await fsp.readdir(rootDir, { withFileTypes: true });

	for (const entry of entries) {
		if (!entry.isDirectory()) {
			continue;
		}

		const nextDir = path.join(rootDir, entry.name);
		const nestedDirectories = await listDirectories(nextDir);
		directories.push(...nestedDirectories);
	}

	return directories;
}

async function watchRoot(rootDir, onChange) {
	try {
		const watcher = fs.watch(
			rootDir,
			{ recursive: true },
			(_eventType, filename) => {
				if (!filename) {
					onChange(rootDir);
					return;
				}

				onChange(path.join(rootDir, filename.toString()));
			}
		);

		return [watcher];
	} catch (_error) {
		const directories = await listDirectories(rootDir);

		return directories.map((directory) =>
			fs.watch(directory, (_eventType, filename) => {
				if (!filename) {
					onChange(directory);
					return;
				}

				onChange(path.join(directory, filename.toString()));
			})
		);
	}
}

async function startWatchMode() {
	let isBuilding = false;
	let queuedReason = null;
	const cssSourceInputs = new Set(
		cssAssets.map((asset) => path.normalize(path.join(sourceRoot, asset.source)))
	);
	const jsSourceInputs = new Set(
		jsAssets.map((asset) => path.normalize(path.join(sourceRoot, asset.source)))
	);
	const ignoredLegacyStyleOutputs = new Set(
		[
			"style.css",
			"style.css.map",
			"style-inline.css",
			"style-inline.css.map",
			"membership.css",
			"membership.css.map",
		].map((filename) =>
			path.normalize(path.join(sourceRoot, "styles", filename))
		)
	);

	function shouldTriggerBuild(changedPath) {
		const normalizedPath = path.normalize(changedPath);

		if (normalizedPath.includes(`${path.sep}generated${path.sep}`)) {
			return false;
		}

		if (normalizedPath.endsWith(".map")) {
			return false;
		}

		if (normalizedPath.startsWith(path.join(sourceRoot, "styles"))) {
			if (ignoredLegacyStyleOutputs.has(normalizedPath)) {
				return false;
			}

			if (normalizedPath.endsWith(".scss")) {
				return true;
			}

			return cssSourceInputs.has(normalizedPath);
		}

		if (normalizedPath.startsWith(path.join(sourceRoot, "scripts"))) {
			return jsSourceInputs.has(normalizedPath);
		}

		return false;
	}

	const runBuild = async (reason, { clean = false } = {}) => {
		if (isBuilding) {
			queuedReason = reason;
			return;
		}

		isBuilding = true;
		log(`building${reason ? ` (${reason})` : ""}`);

		try {
			await buildAll({ clean });
			log("ready");
		} catch (error) {
			console.error(error);
		} finally {
			isBuilding = false;
		}

		if (queuedReason) {
			const nextReason = queuedReason;
			queuedReason = null;
			await runBuild(nextReason);
		}
	};

	await runBuild("initial", { clean: true });

	const watchRoots = [
		path.join(sourceRoot, "styles"),
		path.join(sourceRoot, "scripts"),
	];

	const scheduleBuild = debounce((changedPath) => {
		const relativePath = path.relative(projectRoot, changedPath) || changedPath;
		void runBuild(relativePath);
	}, 120);

	const watcherSets = await Promise.all(
		watchRoots.map((rootDir) =>
			watchRoot(rootDir, (changedPath) => {
				if (!shouldTriggerBuild(changedPath)) {
					return;
				}

				scheduleBuild(changedPath);
			})
		)
	);

	const watchers = watcherSets.flat();
	log("watching public/styles and public/scripts");

	const closeWatchers = () => {
		for (const watcher of watchers) {
			watcher.close();
		}
	};

	process.on("SIGINT", () => {
		closeWatchers();
		process.exit(0);
	});

	process.on("SIGTERM", () => {
		closeWatchers();
		process.exit(0);
	});
}

async function main() {
	if (isWatchMode) {
		await startWatchMode();
		return;
	}

	await buildAll({ clean: true });
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
