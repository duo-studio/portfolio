# Oogubi Follow-Up Meeting — Prep Doc

**For: Dat Nguyen, Duo Studio**
**Date: [TBD]**

---

## Where We Left Off

- Oogubi sent their build partner discovery questionnaire (backend-heavy questions)
- We reviewed their full confidential MVP tech spec
- We responded transparently: we're a frontend/CMS team, not a backend shop
- We sent answers to their questionnaire + a frontend-only proposal ($60K–$82K range, ~5–7 months)
- We estimated their total MVP (frontend + backend) is likely $250K+
- No formal agreement yet — this meeting is likely to clarify scope, test fit, and discuss next steps

---

## What They Probably Want to Talk About


| Topic                                       | What to expect                                                                        | Your position                                                                                                                                                  |
| ------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scope confirmation**                      | "So you'd handle all the UI and we find someone else for backend?"                    | Yes. We own everything the user sees and touches. Backend partner owns everything behind the API.                                                              |
| **Can you do more?**                        | They may push to see if you can stretch into light backend work (auth, basic APIs)    | Be honest. If Hon can handle some Next.js API routes or Supabase-level backend, say so with caveats. Don't overcommit into identity graphs or data pipelines.  |
| **Timeline concerns**                       | 5–7 months with one primary dev may feel long to them                                 | Small team = consistent codebase + direct access, but sequential not parallel. If they want faster, they'd need to fund a second dev.                          |
| **Budget conversation**                     | They may want to negotiate the $60K–$82K range or understand what drives the variance | Range depends on: admin view complexity, how clean APIs are when we integrate, and whether scope stays locked. Low end is realistic if things go smoothly.     |
| **Backend partner status**                  | They may share who they're talking to or ask if you know anyone                       | If you have referrals, offer them. Either way, emphasize that your timeline depends on theirs.                                                                 |
| **CMS and tech stack**                      | Their spec says Next.js/React on Vercel + Sanity (or equivalent)                      | Confirm you're comfortable with this. If you'd recommend something different, have your reasoning ready.                                                       |
| **Start date**                              | "When can you start?"                                                                 | Be ready with a realistic answer. Factor in current workload and when design deliverables could be ready.                                                      |
| **COPPA / children's data on the frontend** | They may want to know how you'd handle this in the UI                                 | You'd implement whatever consent gates their legal team and backend partner define. You don't make COPPA compliance decisions — you build the flows they spec. |


---

## Things You Should Ask Them

### Scope & Roles

1. **Have you found a backend partner yet?** If not, when do you expect to? Our timeline is tied to theirs.
2. **Who is making technical decisions right now?** Until the CTO is hired, who approves architecture choices, API designs, and scope changes?
3. **Is the admin dashboard in our scope or the backend partner's?** This significantly affects our estimate — it's practically a second app.
4. **How much of the design is done?** Do you have wireframes, mockups, or a design system, or are we starting from scratch?

### Technical

1. **Are you committed to Next.js/React on Vercel?** We want to confirm before we start.
2. **Have you chosen a headless CMS?** Your spec mentions Sanity — is that decided or still open?
3. **Are there existing brand assets, style guides, or design files we'd be working from?**
4. **The AI assistant UI — how interactive is Phase 1?** Is it a simple chat window, or are there embedded actions (book an event from the chat, update a profile, etc.)?

### Process

1. **How do you want to communicate?** Weekly syncs? Slack? Async updates?
2. **What does your approval process look like?** Who signs off on deliverables per phase?
3. **Is there a hard launch deadline?** Or is this "ready when it's right"?

---

## Your Key Talking Points

### 1. We're not pretending to be full-stack.

You've already said this. Reinforce it. It builds trust and separates you from agencies that would say yes to everything and then scramble.

### 2. Our value is in the craft.

Your portfolio speaks for itself — Awwwards recognition, custom-coded sites, no templates. For a family-facing platform where trust and usability matter, that's exactly what they need on the frontend.

### 3. API contracts are the linchpin.

Say it again. If the backend partner doesn't deliver API specs early, both teams suffer — but especially a small team like yours that can't easily pivot to other work while waiting.

### 4. We can start small and prove it.

If they're hesitant about committing to the full $60–$82K, offer Phase 0 + Phase 1 as a standalone engagement (~$11,500–$15,500). Low risk for them, proves the working relationship before the heavy phases begin.

### 5. We've already done the homework.

You read their full spec, separated frontend from backend, identified risks, and came back with a scoped proposal. Most agencies would have just said "sure, we can do it all." That diligence matters.

---

## Risks to Flag (If They Come Up)


| Risk                       | How to address it                                                                                                                                                 |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **No backend partner yet** | We can start Phase 0 and design system work, but Phase 2+ needs APIs. We'd build against mocks, but real integration can't happen without a backend.              |
| **Scope creep**            | The spec is ambitious. Phase changes are fine, but they need to be scoped and priced separately. Set that expectation now.                                        |
| **Hon's bandwidth**        | If Duo takes on other projects during this engagement, Hon can't split focus. Decide internally whether this is a dedicated engagement or not.                    |
| **COPPA unknowns**         | We don't make legal compliance decisions. If their legal counsel hasn't defined exactly what the frontend consent flows need to do, that's a blocker for Phase 3. |
| **Design dependency**      | If Sonia and Florence are also juggling other projects, design deliverables could bottleneck dev. Align your internal timeline before the meeting.                |


---

## One-Page Cheat Sheet


|                             |                                                                                                                              |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **We do**                   | All UI, all user-facing flows, CMS setup, Stripe frontend, analytics, PWA, chat interface shell, admin views                 |
| **We don't do**             | Identity graph, data pipeline, consent enforcement, AI backend, COPPA compliance, auth infrastructure, notifications backend |
| **Price**                   | $60K–$82K frontend only                                                                                                      |
| **Timeline**                | ~5–7 months, sequential phases                                                                                               |
| **Team**                    | Hon (lead dev), Dat (supporting), design team separate                                                                       |
| **Biggest dependency**      | Backend partner API contracts                                                                                                |
| **Lowest-risk entry point** | Phase 0 + Phase 1 standalone (~$11.5K–$15.5K)                                                                                |


