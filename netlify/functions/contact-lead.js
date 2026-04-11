const fs = require("fs");

const MONDAY_BOARD_ID = 18408203777;
const MONDAY_COLUMNS = {
	contactName: "text_mm2a46q7",
	email: "email_mm2a625q",
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

function buildScamAudit({ name, email, company, message, referrer }) {
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
	if (messageWordCount < 8) {
		score += 2;
		signals.push("Very low-detail message.");
	}

	if (!company || /^(test|n\/a|none|unknown)$/i.test(company.trim())) {
		score += 2;
		signals.push("Missing or low-quality company identifier.");
	}

	const emailDomain = (email.split("@")[1] || "").toLowerCase();
	if (emailDomain && /(mailinator|tempmail|10minutemail|guerrillamail)/.test(emailDomain)) {
		score += 4;
		signals.push("Disposable email domain.");
	}

	if (emailDomain && company) {
		const normalizedCompany = company.toLowerCase().replace(/[^a-z0-9]/g, "");
		if (normalizedCompany && !emailDomain.includes(normalizedCompany.slice(0, Math.min(normalizedCompany.length, 6))) && !/(gmail|yahoo|hotmail|outlook|icloud)/.test(emailDomain)) {
			score += 1;
			signals.push("Company name and email domain do not obviously align.");
		}
	}

	const finalScore = Math.max(1, Math.min(10, score));
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

async function sendResendEmail(lead, item, resendApiKey, fromEmail, fromName, fallbackReplyToEmail) {
	const replyTo = lead.email || fallbackReplyToEmail;
	const from = fromName ? `${fromName} <${fromEmail}>` : fromEmail;
	const logoUrl = "https://duo-studio.co/assets/logo.png";
	const mondayItemUrl = getMondayItemUrl(item.id);
	const text = [
		`New Inquiry from ${lead.name}`,
		"",
		`Name: ${lead.name}`,
		`Email: ${lead.email}`,
		`Company: ${lead.company}`,
		"",
		"Message:",
		lead.message,
		"",
		`Monday Item: ${mondayItemUrl}`,
	].join("\n");

	const summaryRows = [
		{ label: "Name", value: escapeHtml(lead.name) },
		{ label: "Email", value: `<a href="mailto:${escapeHtml(lead.email)}" style="color:#0f0d0d;text-decoration:none;">${escapeHtml(lead.email)}</a>` },
		{ label: "Company", value: escapeHtml(lead.company) },
	];

	const summaryHtml = summaryRows
		.map((row) => `
			<tr>
				<td style="padding:12px 0;border-bottom:1px solid #f3e6ef;color:#0f0d0d;font-size:13px;font-weight:600;width:140px;vertical-align:top;">${row.label}</td>
				<td style="padding:12px 0;border-bottom:1px solid #f3e6ef;color:#0f0d0d;font-size:15px;line-height:1.7;">${row.value}</td>
			</tr>
		`).join("");

	const html = `
		<div style="margin:0;padding:32px 16px;background:#fefcff;font-family:Helvetica,Arial,sans-serif;color:#0f0d0d;">
			<div style="max-width:720px;margin:0 auto;background:#fefcff;border:1px solid #f3e6ef;">
				<div style="height:6px;background:#fefcff;"></div>
				<div style="padding:32px 36px 18px;background:#fefcff;">
					<img src="${logoUrl}" alt="Duo Studio" style="display:block;width:50px;max-width:100%;height:auto;margin:0 0 24px;" />
					<h1 style="margin:0;color:#0f0d0d;font-size:30px;line-height:1.15;font-weight:600;">New Inquiry from ${escapeHtml(lead.name)}</h1>
				</div>
				<div style="padding:0 36px 36px;background:#fefcff;">
					<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:28px;">${summaryHtml}</table>
					<div>
						<div style="font-size:13px;font-weight:600;color:#0f0d0d;margin-bottom:12px;">Message</div>
						<div style="padding:20px 22px;background:#fefcff;border:1px solid #f3e6ef;color:#0f0d0d;font-size:15px;line-height:1.8;white-space:pre-wrap;">${escapeHtml(lead.message)}</div>
					</div>
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
			subject: `New Inquiry from ${lead.name}`,
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

	const { source, detail: sourceDetail } = normalizeSource(referrer, message);
	const inquiryType = detectInquiryType(message);
	const { score: fitScore, priority, reasons } = scoreLead(message, inquiryType, source);
	const { scamScore, scamAudit } = buildScamAudit({ name, email, company, message, referrer });
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
