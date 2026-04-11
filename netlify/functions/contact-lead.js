const fs = require("fs");

const MONDAY_BOARD_ID = 18408203777;
const MONDAY_COLUMNS = {
	contactName: "text_mm2a46q7",
	email: "email_mm2a625q",
	ipAddress: "text_mm2a9v0y",
	website: "text_mm2asr5w",
	phone: "phone_mm2av6jq",
	stage: "color_mm2a8a63",
	priority: "color_mm2aswcx",
	fitScore: "numeric_mm2abwb4",
	sourceRaw: "text_mm2abgqr",
	source: "color_mm2aceev",
	sourceDetail: "text_mm2aa3zq",
	inquiryType: "color_mm2as15a",
	projectSummary: "long_text_mm2a9wc6",
	nextStep: "long_text_mm2annhv",
	followUpDate: "date_mm2ac5dt",
	lastContacted: "date_mm2a782p",
	whyFit: "long_text_mm2an8yg",
	aiNotes: "long_text_mm2anva6",
	scamScore: "numeric_mm2afyk2",
	scamAudit: "long_text_mm2aeexv",
};

function getEnv(name, fallbackPath) {
	if (process.env[name]) {
		return process.env[name];
	}

	if (fallbackPath && fs.existsSync(fallbackPath)) {
		return fs.readFileSync(fallbackPath, "utf8").trim();
	}

	return "";
}

function json(statusCode, body) {
	return {
		statusCode,
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Cache-Control": "no-store",
		},
		body: JSON.stringify(body),
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

async function mondayRequest(query, variables, token) {
	const response = await fetch("https://api.monday.com/v2", {
		method: "POST",
		headers: {
			Authorization: token,
			"Content-Type": "application/json",
			"API-Version": "2024-10",
		},
		body: JSON.stringify({ query, variables }),
	});

	if (!response.ok) {
		throw new Error(`Monday API request failed with ${response.status}`);
	}

	const payload = await response.json();
	if (payload.errors?.length) {
		throw new Error(payload.errors.map((error) => error.message).join(" | "));
	}

	return payload.data;
}

async function createMondayLead(lead, token) {
	const createUpdateBody = [
		`New submission in Duo Studio's website on page ${lead.page}`,
		"",
		`Name: ${lead.name}`,
		`Email: ${lead.email}`,
		`Company: ${lead.company}`,
		`Referrer: ${lead.referrer || "Unknown"}`,
		"",
		"Message:",
		lead.message,
	].join("\n");

	const columnValues = {
		[MONDAY_COLUMNS.contactName]: lead.name,
		[MONDAY_COLUMNS.email]: {
			email: lead.email,
			text: lead.email,
		},
		[MONDAY_COLUMNS.ipAddress]: lead.ipAddress || "Unknown",
		[MONDAY_COLUMNS.stage]: { label: "New" },
		[MONDAY_COLUMNS.priority]: { label: lead.priority },
		[MONDAY_COLUMNS.fitScore]: lead.fitScore,
		[MONDAY_COLUMNS.sourceRaw]: lead.referrer || "",
		[MONDAY_COLUMNS.source]: { label: lead.source },
		[MONDAY_COLUMNS.sourceDetail]: lead.sourceDetail,
		[MONDAY_COLUMNS.inquiryType]: { label: lead.inquiryType },
		[MONDAY_COLUMNS.projectSummary]: lead.projectSummary,
		[MONDAY_COLUMNS.nextStep]: lead.nextStep,
		[MONDAY_COLUMNS.followUpDate]: { date: lead.followUpDate },
		[MONDAY_COLUMNS.lastContacted]: { date: lead.lastContacted },
		[MONDAY_COLUMNS.whyFit]: lead.whyFit,
		[MONDAY_COLUMNS.aiNotes]: lead.aiNotes,
		[MONDAY_COLUMNS.scamScore]: lead.scamScore,
		[MONDAY_COLUMNS.scamAudit]: lead.scamAudit,
	};

	if (lead.website) {
		columnValues[MONDAY_COLUMNS.website] = lead.website;
	}
	if (lead.phone) {
		columnValues[MONDAY_COLUMNS.phone] = lead.phone;
	}

	const mutation = `
		mutation CreateLead($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
			create_item(board_id: $boardId, item_name: $itemName, column_values: $columnValues, create_labels_if_missing: true) {
				id
				name
			}
		}
	`;

	const data = await mondayRequest(mutation, {
		boardId: String(MONDAY_BOARD_ID),
		itemName: lead.company || lead.name,
		columnValues: JSON.stringify(columnValues),
	}, token);

	await mondayRequest(`
		mutation CreateLeadUpdate($itemId: ID!, $body: String!) {
			create_update(item_id: $itemId, body: $body) {
				id
			}
		}
	`, {
		itemId: String(data.create_item.id),
		body: createUpdateBody,
	}, token);

	return data.create_item;
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

async function sendResendEmail(lead, item, resendApiKey, fromEmail, fromName, fallbackReplyToEmail) {
	const replyTo = lead.email || fallbackReplyToEmail;
	const from = fromName ? `${fromName} <${fromEmail}>` : fromEmail;
	const logoUrl = "https://duo-studio.co/assets/logo.png";
	const companySuffix = lead.company ? ` at ${lead.company}` : "";
	const subject = `New inquiry from ${lead.name}${companySuffix}`;
	const headline = `${escapeHtml(lead.name)}${lead.company ? ` at ${escapeHtml(lead.company)}` : ""}`;
	const text = [
		subject,
		"",
		headline,
		lead.website ? `Website: ${lead.website}` : null,
		`Email: ${lead.email}`,
		"",
		lead.message,
		"",
		"Reply directly to respond.",
	].filter(Boolean).join("\n");

	const websiteHtml = lead.website
		? `
					<p style="margin:0 0 12px;color:#0f0d0d;font-size:15px;line-height:1.7;">
						<a href="${escapeHtml(lead.website)}" style="color:#0f0d0d;text-decoration:underline;">${escapeHtml(lead.website)}</a>
					</p>
				`
		: "";
	const companyHtml = lead.company
		? ` at ${escapeHtml(lead.company)}`
		: "";
	const html = `
		<div style="margin:0;padding:24px 16px;background:#fefcff;font-family:Helvetica,Arial,sans-serif;color:#0f0d0d;">
			<div style="max-width:640px;margin:0 auto;background:#fefcff;border:1px solid #f3e6ef;">
				<div style="padding:24px 28px 28px;background:#fefcff;">
					<img src="${logoUrl}" alt="Duo Studio" style="display:block;width:32px;max-width:100%;height:auto;margin:0 0 18px;" />
					<p style="margin:0 0 12px;color:#0f0d0d;font-size:20px;line-height:1.4;font-weight:600;">${escapeHtml(lead.name)}${companyHtml}</p>
					${websiteHtml}
					<p style="margin:0 0 20px;color:#0f0d0d;font-size:15px;line-height:1.7;">
						<a href="mailto:${escapeHtml(lead.email)}" style="color:#0f0d0d;text-decoration:none;">${escapeHtml(lead.email)}</a>
					</p>
					<div style="margin:0 0 20px;color:#0f0d0d;font-size:15px;line-height:1.8;">${formatMessageHtml(lead.message)}</div>
					<div style="height:1px;background:#f3e6ef;margin:0 0 16px;"></div>
					<p style="margin:0;color:#6f626a;font-size:13px;line-height:1.6;">Reply directly to respond.</p>
				</div>
			</div>
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

async function maybeSendSlackNotification(lead, item, webhookUrl) {
	if (!webhookUrl) {
		return;
	}

	const mondayItemUrl = getMondayItemUrl(item.id);
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
		`> <${mondayItemUrl}|Monday Item>`,
	];

	await fetch(webhookUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			text: lines.join("\n"),
		}),
	});
}

function getMondayItemUrl(itemId) {
	const baseUrl = process.env.MONDAY_ITEM_URL_BASE || `https://duostudio-co.monday.com/boards/${MONDAY_BOARD_ID}/views/249619657/pulses`;
	return `${baseUrl}/${itemId}`;
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

	const mondayToken = getEnv("MONDAY_API_TOKEN");
	const resendApiKey = getEnv("RESEND_API_KEY", "/Users/leo/.config/resend/api_key");
	const turnstileSecretKey = getEnv("TURNSTILE_SECRET_KEY");
	const fromEmail = getEnv("FROM_EMAIL") || "hello@mail.duo-studio.co";
	const fromName = getEnv("FROM_NAME") || "Duo Studio";
	const fallbackReplyToEmail = getEnv("REPLY_TO_EMAIL") || "hello@duo-studio.co";
	const slackWebhookUrl = getEnv("SLACK_WEBHOOK_URL");

	if (!mondayToken || !resendApiKey) {
		console.error("Missing required environment variables for contact flow.");
		return isFetchRequest
			? json(500, { ok: false, error: "Lead routing is not configured yet." })
			: redirect("/contact/");
	}

	try {
		const turnstileResult = await verifyTurnstile(turnstileToken, ipAddress, turnstileSecretKey);
		if (!turnstileResult.success) {
			return isFetchRequest
				? json(400, { ok: false, error: "Please verify that you are human." })
				: redirect("/contact/");
		}
	} catch (error) {
		console.error("Turnstile verification failed", error);
		return isFetchRequest
			? json(500, { ok: false, error: "Form verification is not configured correctly yet." })
			: redirect("/contact/");
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

	try {
		const item = await createMondayLead(lead, mondayToken);
		await sendResendEmail(lead, item, resendApiKey, fromEmail, fromName, fallbackReplyToEmail);
		await maybeSendSlackNotification(lead, item, slackWebhookUrl);

		return isFetchRequest
			? json(200, { ok: true, itemId: item.id })
			: redirect("/contact/thank-you/");
	} catch (error) {
		console.error("Contact lead flow failed", error);
		return isFetchRequest
			? json(500, { ok: false, error: "Something went wrong sending your message. Please email hello@duo-studio.co instead." })
			: redirect("/contact/");
	}
};
