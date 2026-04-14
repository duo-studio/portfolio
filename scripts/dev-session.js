const fs = require("fs/promises");
const path = require("path");
const { spawn } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");
const lockPath = path.join(projectRoot, ".dev-session.lock");
const isWindows = process.platform === "win32";

let ownedLock = false;
let children = [];
let shuttingDown = false;

function commandExists(pid) {
	try {
		process.kill(pid, 0);
		return true;
	} catch (_error) {
		return false;
	}
}

async function readLock() {
	try {
		const raw = await fs.readFile(lockPath, "utf8");
		return JSON.parse(raw);
	} catch (_error) {
		return null;
	}
}

async function acquireLock() {
	try {
		await fs.writeFile(
			lockPath,
			JSON.stringify(
				{
					pid: process.pid,
					startedAt: new Date().toISOString(),
				},
				null,
				2
			),
			{ flag: "wx" }
		);
		ownedLock = true;
		return true;
	} catch (error) {
		if (error.code !== "EEXIST") {
			throw error;
		}

		const existingLock = await readLock();
		if (existingLock?.pid && commandExists(existingLock.pid)) {
			console.log(
				`[dev] Existing dev session is already running (pid ${existingLock.pid}).`
			);
			return false;
		}

		await fs.rm(lockPath, { force: true });
		return acquireLock();
	}
}

async function releaseLock() {
	if (!ownedLock) {
		return;
	}

	const existingLock = await readLock();
	if (existingLock?.pid === process.pid) {
		await fs.rm(lockPath, { force: true });
	}

	ownedLock = false;
}

function spawnChild(command, args, extraEnv = {}) {
	const child = spawn(command, args, {
		cwd: projectRoot,
		stdio: ["ignore", "pipe", "pipe"],
		shell: isWindows && /\.cmd$/i.test(command),
		env: {
			...process.env,
			...extraEnv,
		},
	});

	if (child.stdout) {
		child.stdout.on("data", (chunk) => {
			process.stdout.write(chunk);
		});
	}

	if (child.stderr) {
		child.stderr.on("data", (chunk) => {
			process.stderr.write(chunk);
		});
	}

	children.push(child);
	return child;
}

async function shutdown(code = 0) {
	if (shuttingDown) {
		return;
	}

	shuttingDown = true;

	for (const child of children) {
		if (!child.killed) {
			child.kill("SIGTERM");
		}
	}

	await releaseLock();
	process.exit(code);
}

async function main() {
	const didAcquireLock = await acquireLock();
	if (!didAcquireLock) {
		process.exit(0);
	}

	console.log("[dev] Starting single dev session.");

	const assetWatcher = spawnChild(process.execPath, [
		path.join(__dirname, "build-assets.js"),
		"--watch",
	]);

	const eleventyCommand = isWindows ? "npx.cmd" : "npx";
	const siteWatcher = spawnChild(
		eleventyCommand,
		["@11ty/eleventy", "--serve", "--quiet"],
		{ ELEVENTY_ENV: "development" }
	);

	const handleExit = (name) => async (code, signal) => {
		if (shuttingDown) {
			return;
		}

		if (code === 0 || signal === "SIGTERM") {
			await shutdown(0);
			return;
		}

		console.error(
			`[dev] ${name} exited unexpectedly with ${signal || `code ${code}`}.`
		);
		await shutdown(code || 1);
	};

	assetWatcher.on("exit", handleExit("asset watcher"));
	siteWatcher.on("exit", handleExit("Eleventy"));

	process.on("SIGINT", () => {
		void shutdown(0);
	});

	process.on("SIGTERM", () => {
		void shutdown(0);
	});
}

main().catch((error) => {
	console.error(error);
	void releaseLock().finally(() => {
		process.exit(1);
	});
});
