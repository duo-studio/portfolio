# Contact Lead Flow

This repo now routes the main `/contact/` form through a Netlify Function instead of plain Netlify Forms.

## What it does

1. Accepts contact form submissions at `/.netlify/functions/contact-lead`
2. Rejects honeypot hits quietly
3. Creates a lead in Monday board `Sales CRM` (`18408203777`)
4. Applies deterministic enrichment for:
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
5. Sends an internal notification email to `hello@duo-studio.co` via Resend
   - plain, message-first layout
   - no logo or card chrome
   - subject includes company when present
   - body contains the message, then a lightweight sender line and optional website
6. Optionally sends a Slack webhook notification if configured
   - legacy-style field formatting for readability in `#project-management`
   - plus AI triage details below the original submission

## Required environment variables

Set these in Netlify site environment variables:

- `MONDAY_API_TOKEN`
- `RESEND_API_KEY`
- `TURNSTILE_SECRET_KEY`
- `FROM_EMAIL`
- `FROM_NAME`
- `REPLY_TO_EMAIL`

Optional:

- `SLACK_WEBHOOK_URL`
- `MONDAY_ITEM_URL_BASE` (optional)

Note: Slack incoming webhooks are usually channel-bound. If notifications are landing in the wrong channel, generate a new webhook specifically for `#project-management` and replace the existing `SLACK_WEBHOOK_URL` in Netlify.

## Recommended values right now

Now that `duo-studio.co` is verified in Resend:

- `FROM_EMAIL=hello@duo-studio.co`
- `FROM_NAME=Duo Studio`
- `REPLY_TO_EMAIL=hello@duo-studio.co`
- `MONDAY_ITEM_URL_BASE=https://duostudio-co.monday.com/boards/18408203777/views/249619657/pulses`

The Turnstile site key is embedded on the public contact form. The secret key must be stored only in Netlify as `TURNSTILE_SECRET_KEY`.

## Reply-To behavior

The function uses the submitter's email as `reply_to` when available. That makes the internal notification directly replyable to the lead, while the visible sender still stays on the Duo side.

The sender itself is formatted as `FROM_NAME <FROM_EMAIL>`, so the inbox display can read like `Duo Studio <hello@duo-studio.co>` instead of showing the raw mailbox alone.

If the lead email is missing or invalid, it falls back to `REPLY_TO_EMAIL`.

## Local testing

Example:

```bash
export MONDAY_API_TOKEN="..."
export RESEND_API_KEY="..."
export FROM_EMAIL="hello@duo-studio.co"
export FROM_NAME="Duo Studio"
export REPLY_TO_EMAIL="hello@duo-studio.co"
```

Then run the site locally however you normally do, or invoke the function directly with a Netlify-compatible local setup.

## Notes

- This only replaces the main contact form flow right now.
- The footer subscribe form and RFP template form still use their existing behavior.
- The enrichment is heuristic MVP logic, not LLM enrichment yet.
- Scam scoring is heuristic, intended as an early warning layer rather than a hard block.
- Turnstile blocks a chunk of low-effort bot traffic before it ever reaches Monday, email, or Slack.
- Slack is optional by design so the core flow is not blocked on Slack setup.
