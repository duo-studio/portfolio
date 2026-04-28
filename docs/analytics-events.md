# Analytics Events

This repo pushes analytics events into `dataLayer` through `window.duoPushEvent` in [`_includes/layouts/base.njk`](../_includes/layouts/base.njk) and the helpers in [`public/scripts/global.js`](../public/scripts/global.js).

## Canonical events

| Event | Fires when | Parameters |
| --- | --- | --- |
| `contact_cta_click` | A click shows clear contact or start-a-project intent. | `source_page`, `page_path`, `link_text`, `link_location`, `destination` |
| `email_click` | A `mailto:` link is clicked. | `source_page`, `page_path`, `link_text`, `link_location`, `destination` |
| `phone_click` | A `tel:` link is clicked. | `source_page`, `page_path`, `link_text`, `link_location`, `destination` |
| `contact_form_start` | First meaningful interaction in the contact form. | `form_name`, `source_page`, `page_path`, `landing_page`, `referrer` |
| `contact_form_submit_attempt` | Immediately before the contact form `fetch()` submit starts. | `form_name`, `source_page`, `page_path` |
| `contact_form_submit_success` | Only after the contact endpoint returns `ok`. | `form_name`, `source_page`, `page_path` |
| `contact_form_submit_error` | Contact form submission or verification fails. | `form_name`, `source_page`, `page_path`, `error_type`, `error_message` |

Notes:

- `source_page` is the current Barba namespace when available, otherwise a pathname-based fallback.
- `landing_page` is the first pathname stored in session storage for the visit.
- `referrer` is the sanitized document referrer without query strings or fragments.
- Do not add free-text message content, email addresses typed by users, or API secrets to analytics payloads.

## Legacy compatibility

These legacy events still fire for backward compatibility:

- `cta_contact_click`
- `cta_start_project_click`
- `formSubmission`

`contact_form_submit_success` is the new canonical conversion event. `formSubmission` remains available only to avoid breaking older GTM logic during migration.

## GTM and GA4 setup

1. In GTM, create or update Custom Event triggers for:
   - `contact_cta_click`
   - `email_click`
   - `phone_click`
   - `contact_form_start`
   - `contact_form_submit_attempt`
   - `contact_form_submit_success`
   - `contact_form_submit_error`
2. In GTM, map the event parameters you want to reuse in GA4 event tags:
   - `source_page`
   - `page_path`
   - `link_text`
   - `link_location`
   - `destination`
   - `form_name`
   - `landing_page`
   - `referrer`
   - `error_type`
   - `error_message`
3. In GA4 Admin, mark `contact_form_submit_success` as a key event after it appears.
4. In GA4 Admin, register custom dimensions for any parameters you want in reports. Recommended first set:
   - `source_page`
   - `link_location`
   - `destination`
   - `form_name`
   - `landing_page`
   - `error_type`
5. Use GTM Preview and GA4 DebugView to verify each event before publishing the container.
