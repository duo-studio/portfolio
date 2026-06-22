const fs = require("fs");
const path = require("path");

const PRODUCTION_TURNSTILE_SITE_KEY = "0x4AAAAAAC8DZtzuh8lgMSoU";

function getLocalEnvValue(name) {
	const envPath = path.join(__dirname, "..", ".env");

	if (!fs.existsSync(envPath)) {
		return "";
	}

	const match = fs.readFileSync(envPath, "utf8").match(new RegExp(`^${name}=(.*)$`, "m"));
	return match ? match[1].trim() : "";
}

function getEnvValue(name) {
	return process.env[name] || getLocalEnvValue(name);
}

function getBooleanEnvValue(name, defaultValue = false) {
	const value = getEnvValue(name);
	return value ? /^(1|true|yes)$/i.test(value) : defaultValue;
}

module.exports = {
	title: "Duo Studio — A Digital Design Studio in Baltimore, MD",
	url:
		process.env.ELEVENTY_ENV === "development"
			? "http://localhost:8080"
			: "https://duo-studio.co",
	language: "en-US",
	description:
		"Duo Studio is a Baltimore design studio that creates brand and web systems for businesses that have outgrown their current brand. Custom branding and websites—tailored to where your business is going.",

	image: "https://duo-studio.co/assets/DuoStudio_Meta--v2.jpg",
	turnstileSiteKey:
		getEnvValue("TURNSTILE_SITE_KEY") ||
		PRODUCTION_TURNSTILE_SITE_KEY,
	turnstileRequired: getBooleanEnvValue(
		"TURNSTILE_REQUIRED",
		process.env.ELEVENTY_ENV === "production",
	),
};
