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

function buildAiNotes({ source, sourceDetail, inquiryType, fitScore, priority, nextStep, message }) {
	const notes = [
		`Heuristic classification only, no LLM enrichment yet.`,
		`Source: ${source}. ${sourceDetail}`,
		`Inquiry Type: ${inquiryType}.`,
		`Fit Score: ${fitScore}/10. Priority: ${priority}.`,
		`Recommended Next Step: ${nextStep}`,
	];

	if (/(seo|search engine|organic traffic)/i.test(message)) {
		notes.push("Lead mentioned SEO-related needs, which may require positioning Duo as implementation-ready rather than full-service SEO.");
	}

	return notes.join(" ");
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

	return data.create_item;
}

async function sendResendEmail(lead, item, resendApiKey, fromEmail, fromName, fallbackReplyToEmail) {
	const replyTo = lead.email || fallbackReplyToEmail;
	const from = fromName ? `${fromName} <${fromEmail}>` : fromEmail;
	const text = [
		"New Duo Studio lead received",
		"",
		`Company: ${lead.company}`,
		`Contact: ${lead.name}`,
		`Email: ${lead.email}`,
		`Referrer: ${lead.referrer || "Unknown"}`,
		`Source: ${lead.source}`,
		`Inquiry Type: ${lead.inquiryType}`,
		`Priority: ${lead.priority}`,
		`Fit Score: ${lead.fitScore}/10`,
		`Monday Item: ${item.name} (#${item.id})`,
		`Next Step: ${lead.nextStep}`,
		"",
		"Project Summary",
		lead.projectSummary,
		"",
		"Original Message",
		lead.message,
		"",
		"AI Notes",
		lead.aiNotes,
	].join("\n");

	const summaryRows = [
		{ label: "Contact", value: escapeHtml(lead.name) },
		{ label: "Email", value: `<a href="mailto:${escapeHtml(lead.email)}" style="color:#111111;text-decoration:none;">${escapeHtml(lead.email)}</a>` },
		{ label: "Company", value: escapeHtml(lead.company) },
		{ label: "Referrer", value: escapeHtml(lead.referrer || "Unknown") },
		{ label: "Source", value: escapeHtml(lead.source) },
		{ label: "Inquiry Type", value: escapeHtml(lead.inquiryType) },
		{ label: "Priority", value: escapeHtml(lead.priority) },
		{ label: "Fit Score", value: `${escapeHtml(String(lead.fitScore))}/10` },
		{ label: "Monday Item", value: `${escapeHtml(item.name)} (#${escapeHtml(String(item.id))})` },
	];

	const summaryHtml = summaryRows
		.map((row) => `
			<tr>
				<td style="padding:10px 0;border-bottom:1px solid #ece7df;color:#6b6257;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;width:140px;vertical-align:top;">${row.label}</td>
				<td style="padding:10px 0;border-bottom:1px solid #ece7df;color:#111111;font-size:15px;line-height:1.6;">${row.value}</td>
			</tr>
		`).join("");

	const html = `
		<div style="margin:0;padding:32px 16px;background:#f6f1e8;font-family:Helvetica,Arial,sans-serif;color:#111111;">
			<div style="max-width:720px;margin:0 auto;background:#fbf7f1;border:1px solid #e7dfd2;">
				<div style="padding:28px 32px 20px;border-bottom:1px solid #e7dfd2;">
					<div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#7f7468;margin-bottom:12px;">Duo Studio</div>
					<h1 style="margin:0;font-size:34px;line-height:1.1;font-weight:600;">New lead inquiry</h1>
					<p style="margin:14px 0 0;color:#51483f;font-size:15px;line-height:1.7;max-width:560px;">A new contact form submission just came through the site and was logged in Monday. Key details are below.</p>
				</div>
				<div style="padding:28px 32px;">
					<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:28px;">${summaryHtml}</table>
					<div style="margin-bottom:24px;">
						<div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#7f7468;margin-bottom:10px;">Project Summary</div>
						<div style="padding:18px 20px;background:#ffffff;border:1px solid #e7dfd2;font-size:15px;line-height:1.8;color:#111111;">${escapeHtml(lead.projectSummary)}</div>
					</div>
					<div style="margin-bottom:24px;">
						<div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#7f7468;margin-bottom:10px;">Original Message</div>
						<div style="padding:18px 20px;background:#ffffff;border:1px solid #e7dfd2;font-size:15px;line-height:1.8;color:#111111;white-space:pre-wrap;">${escapeHtml(lead.message)}</div>
					</div>
					<div style="margin-bottom:24px;">
						<div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#7f7468;margin-bottom:10px;">Recommended Next Step</div>
						<div style="padding:18px 20px;background:#111111;color:#f6f1e8;font-size:15px;line-height:1.8;">${escapeHtml(lead.nextStep)}</div>
					</div>
					<div>
						<div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#7f7468;margin-bottom:10px;">AI Notes</div>
						<div style="padding:18px 20px;background:#ffffff;border:1px solid #e7dfd2;font-size:14px;line-height:1.8;color:#51483f;">${escapeHtml(lead.aiNotes)}</div>
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
			subject: `New Inquiry, ${lead.company}`,
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

	await fetch(webhookUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			text: `New Duo lead: ${lead.company} • ${lead.inquiryType} • ${lead.priority} priority • Monday item #${item.id}`,
		}),
	});
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
	const projectSummary = summarizeMessage(message);
	const nextStep = buildNextStep(priority, inquiryType);
	const whyFit = buildWhyFit(inquiryType, reasons);
	const aiNotes = buildAiNotes({ source, sourceDetail, inquiryType, fitScore, priority, nextStep, message });
	const lead = {
		name,
		email,
		company,
		message,
		referrer,
		website,
		phone,
		source,
		sourceDetail,
		inquiryType,
		priority,
		fitScore,
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
