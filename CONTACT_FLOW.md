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
   - Project Summary
   - Next Step
   - Why They're a Fit
   - AI Notes / Recommendation
5. Sends an internal notification email to `hello@duo-studio.co` via Resend
6. Optionally sends a Slack webhook notification if configured

## Required environment variables

Set these in Netlify site environment variables:

- `MONDAY_API_TOKEN`
- `RESEND_API_KEY`
- `FROM_EMAIL`
- `REPLY_TO_EMAIL`

Optional:

- `SLACK_WEBHOOK_URL`

## Recommended values right now

Because only `mail.duo-studio.co` is verified in Resend so far:

- `FROM_EMAIL=hello@mail.duo-studio.co`
- `REPLY_TO_EMAIL=hello@duo-studio.co`

If `duo-studio.co` itself gets verified in Resend later, `FROM_EMAIL` can be switched to:

- `hello@duo-studio.co`

## Reply-To behavior

The function uses the submitter's email as `reply_to` when available. That makes the internal notification directly replyable to the lead, while the visible sender still stays on the Duo side.

If the lead email is missing or invalid, it falls back to `REPLY_TO_EMAIL`.

## Local testing

Example:

```bash
export MONDAY_API_TOKEN="..."
export RESEND_API_KEY="..."
export FROM_EMAIL="hello@mail.duo-studio.co"
export REPLY_TO_EMAIL="hello@duo-studio.co"
```

Then run the site locally however you normally do, or invoke the function directly with a Netlify-compatible local setup.

## Notes

- This only replaces the main contact form flow right now.
- The footer subscribe form and RFP template form still use their existing behavior.
- The enrichment is heuristic MVP logic, not LLM enrichment yet.
- Slack is optional by design so the core flow is not blocked on Slack setup.
