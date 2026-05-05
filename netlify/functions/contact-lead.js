const fs = require("fs");

const CONTACT_FLOW_VERSION = "2026-05-05-linear-route-v2";
const LINEAR_TEAM_ID = "8cd9163c-3887-4d93-a357-fcae4422b162";
const LINEAR_PROJECT_ID = "4ffc0326-b8ed-4d9f-9e85-569d9583a5fe";
const LINEAR_STATE_ID = "da9b8fd6-4f74-4913-985b-ce1c617e2ef2";
const LINEAR_LABEL_IDS = [
	"a1669389-bdc9-4cb8-a3c0-a24cab70e1ff",
	"27465a14-3c49-47ce-98ae-c48bc2d1401c",
	"0e768e48-4410-4919-8f29-15a286f54a9e",
];

function getEnv(name, fallbackPath) {
	if (process.env[name]) {
		return process.env[name];
	}

	if (fallbackPath && fs.existsSync(fallbackPath)) {
		return fs.readFileSync(fallbackPath, "utf8").trim();
	}

	return "";
}

function getMissingEnvNames(envMap) {
	return Object.keys(envMap).filter((name) => !envMap[name]);
}

function isTurnstileRequired() {
	return /^(1|true|yes)$/i.test(getEnv("TURNSTILE_REQUIRED"));
}

function json(statusCode, body) {
	return {
		statusCode,
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Cache-Control": "no-store",
			"X-Duo-Contact-Flow": CONTACT_FLOW_VERSION,
		},
		body: JSON.stringify({
			...body,
			version: CONTACT_FLOW_VERSION,
		}),
	};
}

function redirect(location) {
	return {
		statusCode: 303,
		headers: {
			Location: location,
			"Cache-Control": "no-store",
		},
		body: "",
	};
}

function parseBody(event) {
	const contentType = (event.headers["content-type"] || event.headers["Content-Type"] || "").toLowerCase();
	const raw = event.body || "";

	if (!raw) {
		return {};
	}

	if (contentType.includes("application/json")) {
		return JSON.parse(raw);
	}

	const params = new URLSearchParams(raw);
	return Object.fromEntries(params.entries());
}

function clean(value, max = 2000) {
	return String(value || "")
		.replace(/\r\n/g, "\n")
		.replace(/\u0000/g, "")
		.trim()
		.slice(0, max);
}

function isoDate(daysFromNow = 0) {
	const date = new Date();
	date.setUTCDate(date.getUTCDate() + daysFromNow);
	return date.toISOString().slice(0, 10);
}

function getHeader(event, name) {
	return event.headers?.[name] || event.headers?.[name.toLowerCase()] || event.headers?.[name.toUpperCase()] || "";
}

function getClientIp(event) {
	const forwardedFor = getHeader(event, "x-forwarded-for");
	if (forwardedFor) {
		return forwardedFor.split(",")[0].trim();
	}

	return clean(
		getHeader(event, "x-nf-client-connection-ip") ||
		getHeader(event, "client-ip") ||
		getHeader(event, "x-bb-ip"),
		120,
	);
}

function normalizeSource(referrer, message) {
	const raw = `${referrer} ${message}`.toLowerCase();

	if (raw.includes("chatgpt") || raw.includes("perplexity") || raw.includes("claude") || raw.includes("ai search")) {
		return { source: "AI Search", detail: "Detected AI-search mention in lead text." };
	}
	if (raw.includes("google")) {
		return { source: "Organic Search", detail: "Google search selected or mentioned." };
	}
	if (raw.includes("instagram") || raw.includes("linkedin") || raw.includes("facebook") || raw.includes("social")) {
		return { source: "Social", detail: "Social platform selected or mentioned." };
	}
	if (raw.includes("referral") || raw.includes("referred") || raw.includes("word of mouth")) {
		return { source: "Referral", detail: "Referral selected or mentioned." };
	}
	if (raw.includes("clutch") || raw.includes("awwwards") || raw.includes("partner")) {
		return { source: "Partner", detail: "Directory or partner ecosystem source." };
	}
	if (raw.includes("direct")) {
		return { source: "Direct", detail: "Direct brand recall or direct visit implied." };
	}

	return { source: "Unknown", detail: referrer ? `Unmapped referrer: ${referrer}` : "No clear source provided." };
}

function detectInquiryType(message) {
	const text = message.toLowerCase();
	const hits = [];

	if (/(brand|branding|identity|logo|rebrand|visual identity|positioning)/.test(text)) hits.push("Branding");
	if (/(website|site|web design|web redesign|web development|landing page|cms|wordpress|webflow)/.test(text)) hits.push("Website");
	if (/(content|copy|messaging|social media|seo|blog|guide|writing)/.test(text)) hits.push("Content");
	if (/(retainer|ongoing|monthly|support|maintenance|fractional)/.test(text)) hits.push("Retainer");

	const uniqueHits = [...new Set(hits)];
	if (uniqueHits.length > 1) return "Multi-service";
	if (uniqueHits.length === 1) return uniqueHits[0];
	return "Unsure";
}

function scoreLead(message, inquiryType, source) {
	const text = message.toLowerCase();
	let score = 6;
	const reasons = [];

	if (/(b2b|saas|healthcare|finance|industrial|manufacturing|technical|company|team)/.test(text)) {
		score += 1;
		reasons.push("Signals an established or more complex business.");
	}
	if (/(redesign|rebrand|strategy|conversion|growth|launch|new site|website)/.test(text)) {
		score += 1;
		reasons.push("Request sounds aligned with Duo's core offer.");
	}
	if (inquiryType === "Multi-service") {
		score += 1;
		reasons.push("Lead appears to need multiple services.");
	}
	if (source === "Referral" || source === "AI Search" || source === "Organic Search") {
		score += 1;
		reasons.push("Source suggests stronger intent than cold outreach.");
	}
	if (/(cheap|budget|quick fix|urgent bug|small tweak|student project|free)/.test(text)) {
		score -= 2;
		reasons.push("Language suggests lower-fit or low-budget work.");
	}
	if (/(job|hiring|career|resume|vendor list)/.test(text)) {
		score -= 2;
		reasons.push("May not be a direct sales lead.");
	}

	score = Math.max(1, Math.min(10, score));
	const priority = score >= 8 ? "High" : score >= 5 ? "Medium" : "Low";

	return { score, priority, reasons };
}

function summarizeMessage(message) {
	const singleLine = message.replace(/\s+/g, " ").trim();
	return singleLine.length > 280 ? `${singleLine.slice(0, 277)}...` : singleLine;
}

function buildNextStep(priority, inquiryType) {
	if (priority === "High") {
		return `Reply within 1 business day, confirm fit, and offer a discovery call focused on the ${inquiryType.toLowerCase()} scope.`;
	}
	if (priority === "Medium") {
		return "Reply within 1 business day, clarify scope, and confirm budget/timing fit before proposing a call.";
	}
	return "Acknowledge the inquiry, clarify budget and scope, and decide whether to nurture or decline.";
}

function buildWhyFit(inquiryType, scoreReasons) {
	const intro = inquiryType === "Unsure"
		? "Potential fit depends on clarifying scope."
		: `Looks like a ${inquiryType.toLowerCase()}-leaning inquiry that overlaps with Duo's positioning.`;

	return [intro, ...scoreReasons].join(" ");
}

function buildAiNotes({ source, sourceDetail, inquiryType, fitScore, priority, nextStep, message, scamScore }) {
	const notes = [
		`Heuristic classification only, no LLM enrichment yet.`,
		`Source: ${source}. ${sourceDetail}`,
		`Inquiry Type: ${inquiryType}.`,
		`Fit Score: ${fitScore}/10. Priority: ${priority}.`,
		`Scam Score: ${scamScore}/10.`,
		`Recommended Next Step: ${nextStep}`,
	];

	if (/(seo|search engine|organic traffic)/i.test(message)) {
		notes.push("Lead mentioned SEO-related needs, which may require positioning Duo as implementation-ready rather than full-service SEO.");
	}

	return notes.join(" ");
}

function hasHighEntropyToken(value, minLength = 12) {
	const tokens = String(value || "").split(/\s+/).filter(Boolean);
	return tokens.some((token) => {
		if (token.length < minLength) return false;
		const lettersOnly = token.replace(/[^a-z]/gi, "");
		if (lettersOnly.length < minLength - 2) return false;
		const upperRatio = (token.match(/[A-Z]/g) || []).length / token.length;
		const digitRatio = (token.match(/[0-9]/g) || []).length / token.length;
		const vowelRatio = ((lettersOnly.match(/[aeiou]/gi) || []).length || 0) / lettersOnly.length;
		return upperRatio > 0.45 || digitRatio > 0.2 || vowelRatio < 0.22;
	});
}

const PERSONAL_EMAIL_PROVIDERS = new Set([
	"gmail.com",
	"googlemail.com",
	"yahoo.com",
	"hotmail.com",
	"outlook.com",
	"icloud.com",
	"me.com",
	"mac.com",
	"aol.com",
	"proton.me",
	"protonmail.com",
	"live.com",
	"msn.com",
	"comcast.net",
]);

const COMPANY_NOISE_WORDS = new Set([
	"and",
	"the",
	"co",
	"company",
	"inc",
	"incorporated",
	"corp",
	"corporation",
	"llc",
	"ltd",
	"limited",
	"pllc",
	"studio",
	"agency",
	"group",
	"holdings",
	"partners",
	"partner",
]);

const DOMAIN_NOISE_LABELS = new Set([
	"www",
	"mail",
	"email",
	"hello",
	"contact",
	"info",
	"team",
	"app",
	"go",
	"get",
	"try",
	"weare",
	"hq",
]);

function isMajorBrandMismatch(company, emailDomain) {
	const brand = String(company || "").trim().toLowerCase();
	if (!brand) return false;
	const majorBrands = ["google", "meta", "facebook", "apple", "amazon", "microsoft", "netflix", "tesla"];
	return majorBrands.includes(brand) && !emailDomain.includes(`${brand}.com`);
}

function getCompanyIdentityTokens(company) {
	return [...new Set(
		String(company || "")
			.toLowerCase()
			.replace(/&/g, " and ")
			.replace(/[^a-z0-9]+/g, " ")
			.split(/\s+/)
			.filter((token) => token.length >= 2 && !COMPANY_NOISE_WORDS.has(token)),
	)];
}

function getDomainIdentityText(emailDomain) {
	const labels = String(emailDomain || "")
		.toLowerCase()
		.split(".")
		.filter(Boolean);

	if (labels.length <= 1) {
		return labels.join("");
	}

	return labels
		.slice(0, -1)
		.filter((label) => !DOMAIN_NOISE_LABELS.has(label))
		.join("");
}

function assessCompanyEmailAlignment(company, emailDomain) {
	if (!company || !emailDomain) {
		return { status: "unknown" };
	}

	if (PERSONAL_EMAIL_PROVIDERS.has(emailDomain)) {
		return { status: "personal" };
	}

	const companyTokens = getCompanyIdentityTokens(company);
	if (!companyTokens.length) {
		return { status: "unknown" };
	}

	const domainIdentity = getDomainIdentityText(emailDomain);
	if (!domainIdentity) {
		return { status: "unknown" };
	}

	const matchedTokens = companyTokens.filter((token) =>
		token.length >= 3 && (domainIdentity.includes(token) || token.includes(domainIdentity)),
	);

	if (matchedTokens.length) {
		return { status: "aligned", matchedTokens };
	}

	const initials = companyTokens.map((token) => token[0]).join("");
	if (initials.length >= 2 && domainIdentity.includes(initials)) {
		return { status: "aligned", matchedTokens: [initials] };
	}

	const strongTokens = companyTokens.filter((token) => token.length >= 4);
	if (!strongTokens.length) {
		return { status: "unknown" };
	}

	return {
		status: "mismatch",
		note: `Custom email domain "${emailDomain}" does not clearly reference "${company}".`,
	};
}

function isContextPoorShortMessage(message) {
	const trimmed = String(message || "").trim();
	const words = trimmed.split(/\s+/).filter(Boolean);
	if (words.length === 0) {
		return true;
	}

	if (words.length <= 3) {
		return true;
	}

	if (words.length >= 8) {
		return false;
	}

	const hasBusinessIntent = /(website|site|branding|brand|design|development|project|quote|proposal|budget|timeline|launch|help|need|looking|interested|scope|call|seo|rebrand|redesign)/i.test(trimmed);
	const hasBasicSentenceShape = /[.!?,]/.test(trimmed) || words.length >= 6;
	return !hasBusinessIntent && !hasBasicSentenceShape;
}

function countUrls(value) {
	return (String(value || "").match(/(?:https?:\/\/|www\.|(?:bit\.ly|tinyurl\.com|t\.co|rb\.gy|ow\.ly|buff\.ly|rebrand\.ly)\/)[^\s)]+/gi) || []).length;
}

function shouldBlockSpamLead({ scamScore, scamAudit, message, inquiryType }) {
	const audit = String(scamAudit || "").toLowerCase();
	const text = String(message || "").toLowerCase();
	const promoSignals = [
		/we noticed your website/,
		/free forever plan/,
		/unsubscribe/,
		/social profiles/,
		/manage posts from one dashboard/,
		/simple ai content/,
	];
	const matchedPromoSignals = promoSignals.filter((pattern) => pattern.test(text)).length;
	const hasShortlink = /(bit\.ly|tinyurl\.com|t\.co|rb\.gy|ow\.ly|buff\.ly|rebrand\.ly)/.test(text);
	const urls = countUrls(text);
	const genericOutreach = inquiryType === "Unsure" && /(noticed your website|thought to reach out|totally optional|future emails from us)/.test(text);
	const strongAuditSignal = audit.includes("unsolicited promotional outreach") || audit.includes("unsubscribe") || audit.includes("shortened link");

	return scamScore >= 8 || matchedPromoSignals >= 2 || hasShortlink || (genericOutreach && urls >= 1) || (strongAuditSignal && scamScore >= 6);
}

function buildScamAudit({ name, email, company, message, referrer, ipAddress }) {
	const text = `${name} ${email} ${company} ${message} ${referrer}`.toLowerCase();
	let score = 1;
	const signals = [];

	const suspiciousPatterns = [
		{ test: /(whatsapp|telegram|signal me|text me on)/, note: "Pushes conversation off normal business channels immediately.", weight: 2 },
		{ test: /(kindly|dear sir|dear friend|greetings of the day)/, note: "Contains common scam-form phrasing.", weight: 2 },
		{ test: /(urgent payment|invoice|outstanding payment|wire transfer|bank transfer|crypto|gift card)/, note: "Mentions money-transfer language unrelated to a normal project inquiry.", weight: 3 },
		{ test: /(seo service|guest post|backlink|link exchange|casino|viagra|loan|forex|essay|air duct|tirefaster)/, note: "Matches spam/scam outreach patterns Duo is likely to receive.", weight: 4 },
		{ test: /(guaranteed traffic|guaranteed ranking|100% results|earn money fast)/, note: "Promises unrealistic outcomes.", weight: 3 },
		{ test: /(reply urgently|asap today|immediately respond)/, note: "Pressure language without real project detail.", weight: 1 },
		{ test: /(we noticed your website|thought to reach out|totally optional|future emails from us)/, note: "Generic unsolicited outreach language.", weight: 2 },
		{ test: /(free forever plan|free plan|try our platform|book a demo|explore it here)/, note: "Promotional product pitch instead of a real project inquiry.", weight: 3 },
		{ test: /(ai content|social profiles|manage posts from one dashboard|social media dashboard|content dashboard)/, note: "Tool promotion language common in contact-form spam.", weight: 2 },
		{ test: /(unsubscribe|do not receive future emails|opt out)/, note: "Includes unsubscribe language that legitimate leads rarely send through a contact form.", weight: 4 },
		{ test: /(bit\.ly|tinyurl\.com|t\.co|rb\.gy|ow\.ly|buff\.ly|rebrand\.ly)/, note: "Contains a shortened link.", weight: 4 },
	];

	for (const pattern of suspiciousPatterns) {
		if (pattern.test.test(text)) {
			score += pattern.weight;
			signals.push(pattern.note);
		}
	}

	const messageWordCount = message.trim().split(/\s+/).filter(Boolean).length;
	if (messageWordCount === 0) {
		score += 3;
		signals.push("Message is empty.");
	} else if (isContextPoorShortMessage(message)) {
		score += 1;
		signals.push("Short message with little project context.");
	}

	const urlCount = countUrls(message);
	if (urlCount >= 2) {
		score += 3;
		signals.push("Contains multiple links, which is unusual for a real lead inquiry.");
	} else if (urlCount === 1 && /(unsubscribe|free forever|thought to reach out|explore it here)/.test(text)) {
		score += 2;
		signals.push("Pairs outreach copy with a promotional link.");
	}

	if (!company || /^(test|n\/a|none|unknown)$/i.test(company.trim())) {
		score += 2;
		signals.push("Missing or low-quality company identifier.");
	}

	const emailDomain = (email.split("@")[1] || "").toLowerCase();
	const emailLocal = (email.split("@")[0] || "").toLowerCase();
	if (emailDomain && /(mailinator|tempmail|10minutemail|guerrillamail)/.test(emailDomain)) {
		score += 4;
		signals.push("Disposable email domain.");
	}
	if (/(fringmail|fexbox|sharklasers|mailnesia)/.test(emailDomain)) {
		score += 3;
		signals.push("Suspicious or low-trust email domain.");
	}
	if (hasHighEntropyToken(emailLocal, 10)) {
		score += 2;
		signals.push("Email local-part looks auto-generated.");
	}
	if (hasHighEntropyToken(name, 10)) {
		score += 4;
		signals.push("Name field looks machine-generated or gibberish-like.");
	}
	if (hasHighEntropyToken(message, 14)) {
		score += 5;
		signals.push("Message contains high-entropy gibberish-like tokens.");
	}
	if (isMajorBrandMismatch(company, emailDomain)) {
		score += 3;
		signals.push("Company claims a major brand but email domain does not match.");
	}

	const companyEmailAlignment = assessCompanyEmailAlignment(company, emailDomain);
	if (companyEmailAlignment.status === "mismatch") {
		score += 1;
		signals.push(companyEmailAlignment.note);
	}

	const finalScore = Math.max(1, Math.min(10, score));
	if (ipAddress) {
		signals.push(`Observed client IP: ${ipAddress}.`);
	}
	if (!signals.length) {
		signals.push("No major scam indicators detected by the heuristic pass.");
	}

	const recommendation = finalScore >= 8
		? "High caution. Verify identity before spending time on the lead."
		: finalScore >= 5
			? "Medium caution. Reply carefully and confirm legitimacy early."
			: "Low scam risk based on current signals.";

	return {
		scamScore: finalScore,
		scamAudit: [...signals, recommendation].join(" "),
	};
}

async function linearRequest(query, variables, apiKey) {
	const response = await fetch("https://api.linear.app/graphql", {
		method: "POST",
		headers: {
			Authorization: apiKey,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ query, variables }),
	});

	if (!response.ok) {
		throw new Error(`Linear API request failed with ${response.status}`);
	}

	const payload = await response.json();
	if (payload.errors?.length) {
		throw new Error(payload.errors.map((error) => error.message).join(" | "));
	}

	return payload.data;
}

function buildLinearLeadDescription(lead) {
	return [
		"Website lead submitted via the duo-studio.co contact form.",
		"",
		`Name: ${lead.name}`,
		`Email: ${lead.email}`,
		`Company: ${lead.company}`,
		`Website: ${lead.website || "Not provided"}`,
		`Phone: ${lead.phone || "Not provided"}`,
		`Page: ${lead.page}`,
		`Referrer: ${lead.referrer || "Unknown"}`,
		`Source: ${lead.source}`,
		`Source Detail: ${lead.sourceDetail}`,
		`Inquiry Type: ${lead.inquiryType}`,
		`Priority: ${lead.priority}`,
		`Fit Score: ${lead.fitScore}/10`,
		`Scam Score: ${lead.scamScore}/10`,
		`Project Summary: ${lead.projectSummary}`,
		`Next Step: ${lead.nextStep}`,
		`Why Fit: ${lead.whyFit}`,
		`AI Notes: ${lead.aiNotes}`,
		"",
		"Full Message:",
		lead.message,
		"",
		`Scam Audit: ${lead.scamAudit}`,
	].join("\n");
}

async function createLinearLead(lead, apiKey) {
	const mutation = `
		mutation CreateLeadIssue($input: IssueCreateInput!) {
			issueCreate(input: $input) {
				success
				issue {
					id
					identifier
					title
					url
				}
			}
		}
	`;

	const data = await linearRequest(mutation, {
		input: {
			title: `Website lead — ${lead.company || lead.name}`,
			description: buildLinearLeadDescription(lead),
			teamId: LINEAR_TEAM_ID,
			projectId: LINEAR_PROJECT_ID,
			stateId: LINEAR_STATE_ID,
			labelIds: LINEAR_LABEL_IDS,
			dueDate: lead.followUpDate,
		},
	}, apiKey);

	if (!data.issueCreate?.success || !data.issueCreate.issue) {
		throw new Error("Linear issueCreate did not return an issue.");
	}

	return data.issueCreate.issue;
}

async function verifyTurnstile(token, ipAddress, secretKey) {
	if (!secretKey) {
		throw new Error("Missing TURNSTILE_SECRET_KEY environment variable.");
	}

	if (!token) {
		return { success: false };
	}

	const payload = new URLSearchParams({
		secret: secretKey,
		response: token,
	});

	if (ipAddress) {
		payload.set("remoteip", ipAddress);
	}

	const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: payload.toString(),
	});

	if (!response.ok) {
		throw new Error(`Turnstile verification failed with ${response.status}`);
	}

	return response.json();
}

async function sendResendEmail(lead, resendApiKey, fromEmail, fromName, fallbackReplyToEmail) {
	const replyTo = lead.email || fallbackReplyToEmail;
	const from = fromName ? `${fromName} <${fromEmail}>` : fromEmail;
	const companySuffix = lead.company ? ` at ${lead.company}` : "";
	const subject = `New inquiry from ${lead.name}${companySuffix}`;
	const senderLineParts = [
		lead.name,
		lead.company ? `at ${lead.company}` : null,
		lead.email ? `<a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a>` : null,
	];
	const senderLine = senderLineParts.filter(Boolean).join(" · ");
	const text = [
		lead.message,
		"",
		`From: ${lead.name}${lead.company ? ` at ${lead.company}` : ""}${lead.email ? ` (${lead.email})` : ""}`,
		lead.website ? `Website: ${lead.website}` : null,
		"",
	].filter(Boolean).join("\n");
	const html = `
		<div style="margin:0;font-family:Helvetica,Arial,sans-serif;color:#0f0d0d;font-size:16px;line-height:1.7;">
			<div>${formatMessageHtml(lead.message)}</div>
			<p style="margin:18px 0 0;">From: ${senderLine}</p>
			${lead.website ? `<p style="margin:6px 0 0;">Website: <a href="${escapeHtml(lead.website)}">${escapeHtml(lead.website)}</a></p>` : ""}
		</div>
	`;

	const response = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${resendApiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			from,
			to: ["hello@duo-studio.co"],
			reply_to: replyTo,
			subject,
			text,
			html,
		}),
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Resend failed with ${response.status}: ${errorText}`);
	}
}

async function maybeSendSlackNotification(lead, issue, webhookUrl) {
	if (!webhookUrl) {
		return;
	}

	const crmLink = issue?.url ? `<${issue.url}|Linear Issue>` : "Email-only route";
	const lines = [
		`New submission in Duo Studio's website on page ${lead.page}`,
		"> *Name*",
		`> ${lead.name}`,
		">",
		"> *Email*",
		`> ${lead.email}`,
		">",
		"> *Company*",
		`> ${lead.company}`,
		">",
		"> *Referrer*",
		`> ${lead.referrer || "Unknown"}`,
		">",
		"> *Message*",
		`> ${lead.message.replace(/\n/g, "\n> ")}`,
		">",
		"> *AI Audit*",
		">",
		"> *Fit Score:*",
		`> ${lead.fitScore}/10`,
		">",
		"> *Scam Score:*",
		`> ${lead.scamScore}/10`,
		">",
		"> *Inquiry Type:*",
		`> ${lead.inquiryType}`,
		">",
		"> *Source:*",
		`> ${lead.source}`,
		">",
		"> *Scam Audit:*",
		`> ${lead.scamAudit}`,
		">",
		"> *Next Step:*",
		`> ${lead.nextStep}`,
		">",
		`> ${crmLink}`,
	];

	const response = await fetch(webhookUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			text: lines.join("\n"),
		}),
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Slack webhook failed with ${response.status}: ${errorText}`);
	}
}

function formatMessageHtml(value) {
	return escapeHtml(String(value || "").trim()).replace(/\n/g, "<br />");
}

function escapeHtml(value) {
	return String(value)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

exports.handler = async (event) => {
	if (event.httpMethod !== "POST") {
		return json(405, { ok: false, error: "Method not allowed." });
	}

	const isFetchRequest = (event.headers["x-requested-with"] || "").toLowerCase() === "fetch";
	const body = parseBody(event);
	const honeypot = clean(body["bot-field"], 255);

	if (honeypot) {
		return isFetchRequest ? json(200, { ok: true, skipped: true }) : redirect("/contact/thank-you/");
	}

	const name = clean(body.name, 120);
	const email = clean(body.email, 200);
	const company = clean(body.company, 160);
	const message = clean(body.message, 4000);
	const referrer = clean(body.referrer, 160);
	const website = clean(body.website, 200);
	const phone = clean(body.phone, 80);
	const page = clean(body.page, 160) || "/contact/";
	const turnstileToken = clean(body["cf-turnstile-response"], 4000);
	const ipAddress = getClientIp(event);

	if (!name || !email || !company || !message) {
		return isFetchRequest
			? json(400, { ok: false, error: "Please fill out all required fields." })
			: redirect("/contact/");
	}

	const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	if (!emailLooksValid) {
		return isFetchRequest
			? json(400, { ok: false, error: "Please enter a valid email address." })
			: redirect("/contact/");
	}

	const linearApiKey = getEnv("LINEAR_API_KEY");
	const resendApiKey = getEnv("RESEND_API_KEY", "/Users/leo/.config/resend/api_key");
	const turnstileSecretKey = getEnv("TURNSTILE_SECRET_KEY");
	const turnstileRequired = isTurnstileRequired();
	const fromEmail = "hello@duo-studio.co";
	const fromName = getEnv("FROM_NAME") || "The Duo Team";
	const fallbackReplyToEmail = "hello@duo-studio.co";
	const slackWebhookUrl = getEnv("CONTACT_LEAD_SLACK_WEBHOOK_URL");
	const missingEnvNames = getMissingEnvNames({
		...(turnstileRequired ? { TURNSTILE_SECRET_KEY: turnstileSecretKey } : {}),
	});

	if (missingEnvNames.length) {
		console.error("Missing required environment variables for contact flow.", {
			missingEnvNames,
		});
		return isFetchRequest
			? json(500, {
				ok: false,
				error:
					missingEnvNames.length === 1 &&
					missingEnvNames[0] === "TURNSTILE_SECRET_KEY"
						? "Form verification is not configured correctly yet."
						: "Form verification is not configured correctly yet.",
			})
			: redirect("/contact/");
	}

	if (!resendApiKey) {
		console.warn("RESEND_API_KEY is missing; contact flow will attempt Linear-only routing.");
	}
	if (!linearApiKey) {
		console.warn("LINEAR_API_KEY is missing; contact flow will attempt email-only routing.");
	}

	if (turnstileToken || turnstileRequired) {
		try {
			const turnstileResult = await verifyTurnstile(turnstileToken, ipAddress, turnstileSecretKey);
			if (!turnstileResult.success) {
				console.warn("Turnstile verification did not pass.", {
					errorCodes: turnstileResult["error-codes"] || [],
					required: turnstileRequired,
				});
				if (turnstileRequired) {
					return isFetchRequest
						? json(400, { ok: false, error: "Please verify that you are human." })
						: redirect("/contact/");
				}
			}
		} catch (error) {
			console.error("Turnstile verification failed", error);
			if (!turnstileRequired) {
				console.warn("Continuing contact submission because Turnstile is not required.");
			} else {
				return isFetchRequest
					? json(500, { ok: false, error: "Form verification is not configured correctly yet." })
					: redirect("/contact/");
			}
		}
	} else {
		console.warn("Turnstile token absent; continuing because Turnstile is not required.");
	}

	const { source, detail: sourceDetail } = normalizeSource(referrer, message);
	const inquiryType = detectInquiryType(message);
	const { score: fitScore, priority, reasons } = scoreLead(message, inquiryType, source);
	const { scamScore, scamAudit } = buildScamAudit({ name, email, company, message, referrer, ipAddress });
	const projectSummary = summarizeMessage(message);
	const nextStep = buildNextStep(priority, inquiryType);
	const whyFit = buildWhyFit(inquiryType, reasons);
	const aiNotes = buildAiNotes({ source, sourceDetail, inquiryType, fitScore, priority, nextStep, message, scamScore });
	const lead = {
		name,
		email,
		company,
		message,
		referrer,
		website,
		phone,
		page,
		ipAddress,
		source,
		sourceDetail,
		inquiryType,
		priority,
		fitScore,
		scamScore,
		scamAudit,
		projectSummary,
		nextStep,
		whyFit,
		aiNotes,
		followUpDate: isoDate(2),
		lastContacted: isoDate(0),
	};

	if (shouldBlockSpamLead({ scamScore, scamAudit, message, inquiryType })) {
		console.warn("Blocked suspected spam contact lead", {
			leadEmail: lead.email,
			scamScore: lead.scamScore,
			page: lead.page,
		});
		return isFetchRequest
			? json(200, { ok: true, skipped: true })
			: redirect("/contact/thank-you/");
	}

	const routingErrors = [];
	let issue = null;
	let emailSent = false;

	if (resendApiKey) {
		try {
			await sendResendEmail(lead, resendApiKey, fromEmail, fromName, fallbackReplyToEmail);
			emailSent = true;
		} catch (error) {
			routingErrors.push("email");
			console.error("Contact lead email failed", {
				message: error instanceof Error ? error.message : String(error),
				leadEmail: lead.email,
				page: lead.page,
			});
		}
	} else {
		routingErrors.push("email");
	}

	if (linearApiKey) {
		try {
			issue = await createLinearLead(lead, linearApiKey);
		} catch (error) {
			routingErrors.push("linear");
			console.error("Contact lead Linear routing failed", {
				message: error instanceof Error ? error.message : String(error),
				leadEmail: lead.email,
				page: lead.page,
			});
		}
	} else {
		routingErrors.push("linear");
	}

	if (emailSent || issue) {
		try {
			await maybeSendSlackNotification(lead, issue, slackWebhookUrl);
		} catch (error) {
			console.error("Slack notification failed", {
				message: error instanceof Error ? error.message : String(error),
				leadEmail: lead.email,
				linearIssueId: issue?.id || null,
			});
		}
	}

	if (emailSent || issue) {
		return isFetchRequest
			? json(200, {
				ok: true,
				issueId: issue?.identifier || null,
				url: issue?.url || null,
				routed: {
					email: emailSent,
					linear: Boolean(issue),
				},
			})
			: redirect("/contact/thank-you/");
	}

	console.error("Contact lead flow failed across all routing channels", {
		stages: routingErrors,
		leadEmail: lead.email,
		page: lead.page,
	});
	return isFetchRequest
		? json(500, {
			ok: false,
			error: "Something went wrong sending your message. Please email hello@duo-studio.co instead.",
			failedRoutes: routingErrors,
		})
		: redirect("/contact/");
};
