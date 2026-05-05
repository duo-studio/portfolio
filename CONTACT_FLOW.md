# Contact Lead Flow

This repo now routes the main `/contact/` form through a Netlify Function instead of plain Netlify Forms.

## What it does

1. Accepts contact form submissions at `/.netlify/functions/contact-lead`
2. Verifies Cloudflare Turnstile when present, and only hard-blocks on failure when `TURNSTILE_REQUIRED=true`
3. Rejects honeypot hits quietly
4. Hard-blocks obvious contact-form spam before Linear, email, or Slack side effects
5. Creates a lead issue in Linear for legitimate submissions
   - workspace: `Duo Studio`
   - team: `Growth / GRW`
   - project: `Growth — Outreach Pipeline`
   - state: `To Do`
   - labels: `Growth`, `Prospect`, `Website / CRO`
6. Applies deterministic enrichment for:
   - Source
   - Inquiry Type
   - Priority
   - Fit Score
   - Scam Score
   - Scam Audit
   - IP Address capture
   - Project Summary
   - Next Step
   - Why They're a Fit
   - AI Notes / Recommendation
7. Sends an internal notification email to `hello@duo-studio.co` via Resend
   - this is the primary/failsafe delivery path and does not depend on Linear succeeding
   - plain, message-first layout
   - no logo or card chrome
   - subject includes company when present
   - body contains the message, then a lightweight sender line and optional website
8. Optionally sends a Slack webhook notification only if `CONTACT_LEAD_SLACK_WEBHOOK_URL` is configured
   - legacy-style field formatting for readability in a dedicated leads-only channel
   - plus AI triage details below the original submission
   - links to the Linear issue when a CRM issue was created

## Required environment variables

Set these in Netlify site environment variables:

- `LINEAR_API_KEY`
- `RESEND_API_KEY`
- `TURNSTILE_SECRET_KEY` only if `TURNSTILE_REQUIRED=true`

Optional:

- `FROM_NAME`
- `CONTACT_LEAD_SLACK_WEBHOOK_URL`

Note: Slack incoming webhooks are usually channel-bound. If notifications are landing in the wrong channel, set `CONTACT_LEAD_SLACK_WEBHOOK_URL` to a dedicated leads-only webhook. Do not reuse the general `SLACK_WEBHOOK_URL`; website leads should not post to `#project-management` by default.

## Recommended values right now

Now that `duo-studio.co` is verified in Resend:

- `LINEAR_API_KEY=...`
- `RESEND_API_KEY=...`
- `FROM_NAME=The Duo Team`

The Turnstile site key is embedded on the public contact form (`0x4AAAAAAC8DZtzuh8lgMSoU`). The secret key must be stored only in Netlify as `TURNSTILE_SECRET_KEY`.

## Reply-To behavior

The function uses the submitter's email as `reply_to` when available. That makes the internal notification directly replyable to the lead, while the visible sender still stays on the Duo side.

The sender itself is formatted as `FROM_NAME <FROM_EMAIL>`, so the inbox display can read like `The Duo Team <hello@duo-studio.co>` instead of showing the raw mailbox alone.

If the lead email is missing or invalid, it falls back to `hello@duo-studio.co`.

## Local testing

Example:

```bash
export LINEAR_API_KEY="..."
export RESEND_API_KEY="..."
export FROM_NAME="The Duo Team"
```

Then run the site locally however you normally do, or invoke the function directly with a Netlify-compatible local setup.

## Notes

- This only replaces the main contact form flow right now.
- The footer subscribe form and RFP template form still use their existing behavior.
- The enrichment is heuristic MVP logic, not LLM enrichment yet.
- Scam scoring is heuristic, with a conservative hard-block layer for high-confidence outreach spam.
- Current hard-block signals include Turnstile failure, unsubscribe language, shortened links, generic promotional outreach, and product-pitch phrasing like "we noticed your website" or "free forever plan".
- Turnstile blocks a chunk of low-effort bot traffic before it ever reaches Linear, email, or Slack.
- Slack is optional by design so the core flow is not blocked on Slack setup.
