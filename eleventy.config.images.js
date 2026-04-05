const path = require("path");
const eleventyImage = require("@11ty/eleventy-img");

module.exports = (eleventyConfig) => {
	function relativeToInputPath(inputPath, relativeFilePath) {
		let split = inputPath.split("/");
		split.pop();

		return path.resolve(split.join(path.sep), relativeFilePath);
	}

	// Eleventy Image shortcode
	// https://www.11ty.dev/docs/plugins/image/
	//
	// Usage:
	//   {% image "./image.png", "alt text" %}
	//   {% image "./image.png", "alt text", [640, 1024, 1920] %}
	//   {% image "./image.png", "alt text", [640, 1024, 1920], "100vw" %}
	//   {% image "./image.png", "alt text", [640, 1024, 1920], "100vw", "my-class" %}
	//   {% image "./image.png", "alt text", [640, 1024, 1920], "100vw", "my-class", "eager" %}
	//
	eleventyConfig.addAsyncShortcode(
		"image",
		async function imageShortcode(src, alt, widths, sizes, className, loading) {
			// Full list of formats here: https://www.11ty.dev/docs/plugins/image/#output-formats
			let formats = ["avif", "webp", "auto"];
			let file = relativeToInputPath(this.page.inputPath, src);

			// Default widths for responsive images
			const defaultWidths = [640, 1024, 1920];

			let metadata = await eleventyImage(file, {
				widths: widths || defaultWidths,
				formats,
				urlPath: "/assets/" + this.page.url,
				outputDir: path.join(
					eleventyConfig.dir.output,
					"assets/" + this.page.url,
				),
				// Optimize output filenames
			filenameFormat: function (id, src, width, format) {
				const name = path.basename(src, path.extname(src));
				const dir = path.basename(path.dirname(src));
				return `${dir}-${name}-${width}.${format}`;
			},
			});

			let imageAttributes = {
				alt,
				sizes: sizes || "100vw",
				loading: loading === "eager" ? "eager" : "lazy",
				decoding: "async",
			};

			// Add class if provided
			if (className) {
				imageAttributes.class = className;
			}

			// Add fetchpriority for eager images (above the fold)
			if (loading === "eager") {
				imageAttributes.fetchpriority = "high";
			}

			return eleventyImage.generateHTML(metadata, imageAttributes);
		},
	);
};
