const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const path = require("path");
const fs = require("fs");

ffmpeg.setFfmpegPath(ffmpegPath);

// Configuration
const CONFIG = {
	// Source directories to scan for videos
	sourceDirs: ["public/assets/work", "public/assets/home"],
	// Output settings for thumbnails
	thumbnail: {
		width: 720,
		height: 480,
		suffix: "-thumbnail",
		crf: 28, // Quality (lower = better, 18-28 is good range)
	},
	// Output settings for banners (optional, larger size)
	banner: {
		maxWidth: 1920,
		suffix: "-compressed",
		crf: 23,
	},
};

// Find all mp4 files recursively
function findVideos(dir, videos = []) {
	if (!fs.existsSync(dir)) return videos;

	const files = fs.readdirSync(dir);
	for (const file of files) {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);

		if (stat.isDirectory()) {
			findVideos(filePath, videos);
		} else if (
			file.endsWith(".mp4") &&
			!file.includes("-thumbnail") &&
			!file.includes("-compressed") &&
			!file.includes("-reduced")
		) {
			videos.push(filePath);
		}
	}
	return videos;
}

// Compress a single video
function compressVideo(inputPath, outputPath, options) {
	return new Promise((resolve, reject) => {
		const { width, height, crf, maxWidth } = options;

		let command = ffmpeg(inputPath)
			.outputOptions([
				"-c:v libx264",
				`-crf ${crf}`,
				"-preset medium",
				"-an", // Remove audio
				"-movflags +faststart", // Optimize for web streaming
			]);

		// Apply scaling
		if (width && height) {
			// Fixed dimensions with padding to maintain aspect ratio
			command = command.videoFilters([
				`scale=${width}:${height}:force_original_aspect_ratio=decrease`,
				`pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`,
			]);
		} else if (maxWidth) {
			// Scale down if wider than maxWidth, maintain aspect ratio
			command = command.videoFilters([
				`scale='min(${maxWidth},iw)':-2`,
			]);
		}

		command
			.output(outputPath)
			.on("start", (cmd) => {
				console.log(`  Compressing: ${path.basename(inputPath)}`);
			})
			.on("end", () => {
				const inputSize = fs.statSync(inputPath).size;
				const outputSize = fs.statSync(outputPath).size;
				const savings = ((1 - outputSize / inputSize) * 100).toFixed(1);
				console.log(
					`  ✓ Created: ${path.basename(outputPath)} (${savings}% smaller)`
				);
				resolve();
			})
			.on("error", (err) => {
				console.error(`  ✗ Error: ${err.message}`);
				reject(err);
			})
			.run();
	});
}

async function main() {
	const args = process.argv.slice(2);
	const createThumbnails = args.includes("--thumbnails") || args.length === 0;
	const createBanners = args.includes("--banners");
	const specificFile = args.find((arg) => arg.endsWith(".mp4"));

	console.log("\n📹 Video Compression Script\n");

	let videos = [];

	if (specificFile) {
		// Process a specific file
		if (fs.existsSync(specificFile)) {
			videos.push(specificFile);
		} else {
			console.error(`File not found: ${specificFile}`);
			process.exit(1);
		}
	} else {
		// Find all videos in source directories
		for (const dir of CONFIG.sourceDirs) {
			findVideos(dir, videos);
		}
	}

	if (videos.length === 0) {
		console.log("No videos found to process.");
		return;
	}

	console.log(`Found ${videos.length} video(s) to process:\n`);

	for (const video of videos) {
		const dir = path.dirname(video);
		const ext = path.extname(video);
		const name = path.basename(video, ext);

		console.log(`\n📁 ${video}`);

		// Create thumbnail
		if (createThumbnails) {
			const thumbnailPath = path.join(
				dir,
				`${name}${CONFIG.thumbnail.suffix}${ext}`
			);
			if (!fs.existsSync(thumbnailPath)) {
				await compressVideo(video, thumbnailPath, CONFIG.thumbnail);
			} else {
				console.log(`  ⏭ Thumbnail already exists: ${path.basename(thumbnailPath)}`);
			}
		}

		// Create compressed banner version
		if (createBanners) {
			const bannerPath = path.join(
				dir,
				`${name}${CONFIG.banner.suffix}${ext}`
			);
			if (!fs.existsSync(bannerPath)) {
				await compressVideo(video, bannerPath, CONFIG.banner);
			} else {
				console.log(`  ⏭ Banner already exists: ${path.basename(bannerPath)}`);
			}
		}
	}

	console.log("\n✅ Done!\n");
}

main().catch(console.error);
