# Image Sourcing Guide

Two areas need fresh assets: the **Services page** thumbnails and the **Archive page** grid. This guide covers specs, naming, and priority for both.

---

## 1. Services Page — Service Card Thumbnails

The three service cards (Branding, Websites, Content) under `#services` use parallax portrait images. The current ones are outdated and need replacing.

### What's Needed

| # | Card | Current file | What to shoot/source |
|---|------|-------------|----------------------|
| 1 | **Branding** | `services__branding-thumbnail.webp` | A recent branding deliverable — identity system, business cards, brand guidelines spread, etc. |
| 2 | **Websites** | `services__website-thumbnail.webp` | A recent website project — browser/device mockup showing a homepage or key page. |
| 3 | **Content** | `services__content-thumbnail.webp` | A recent content/graphic design deliverable — print collateral, illustration, social media design, etc. |

### Specs

| | Value |
|---|---|
| **Orientation** | Portrait (tall) |
| **Export size** | **500 × 640 px** |
| **Source / working file** | **1000 × 1280 px** minimum (2x retina) |
| **Format** | `.webp`, quality 80–85 |
| **File size target** | Under 100 KB each |

These images have a parallax effect (`st__plax`) so the actual visible area is slightly less than the full height — **keep the subject centered** and avoid putting critical details at the very top or bottom edges (leave ~10% breathing room).

### Creative Direction

- Each image should feel like a polished portfolio shot, not a raw screenshot
- Think: mockup on a clean background, device frame, or styled flat-lay
- Should represent Duo's *best, most recent* work in that service category
- Avoid using case study clients if possible — we want fresh, distinct imagery
- All three should feel cohesive in tone/lighting/treatment (same shoot or same editing style)

### File Names (Google Drive)

Use these exact names — they'll replace the existing files 1:1:

```
services__branding-thumbnail.webp
services__website-thumbnail.webp
services__content-thumbnail.webp
```

**Destination folder on site:** `public/assets/services/`

---

## 2. Archive Page — Infinite Canvas Grid

The archive page is a draggable, infinitely wrapping canvas — a 7×6 grid (42 cells) that tiles seamlessly. Right now only **9 of 42 cells** have real content. We need to fill this out so it feels like "wow, Duo has worked with *everyone*."

**Goal:** Source images for **20 new clients** (minimum) to bring us to 29 project cells with 13 placeholders for visual breathing room. If you have bandwidth, source all 25 — that's even better.

> **Important:** None of the new additions should be case study clients (Genimex, Africa Dream Safaris, Amparo, Cruefilms, Finturity, Lumina, Made Good, MGNY, Vista Theater Hollywood). Those live on the Work page.
>
> *Note: Genimex is currently on the archive AND has a case study — we may want to swap it out. Flag for Dat.*

### Specs

| | Value |
|---|---|
| **Orientation** | Landscape (wide) |
| **Export size** | **692 × 415 px** |
| **Source / working file** | **1400 × 840 px** minimum (2x retina) |
| **Aspect ratio** | ~5:3 |
| **Format** | `.webp`, quality 80–85 |
| **File size target** | 40–80 KB each |
| **Video (optional)** | `.mp4`, H.264, under 2 MB, 4–8 sec loop, no audio |

Cells use `object-fit: cover`, so images crop to fill. A few pixels off on height is fine (existing range 413–428px), but stay close to **692 × 415**.

### What to Capture

Each image should be a **single, polished screenshot or mockup** of the work Duo did for that client:

- Hero section of a website on a clean background
- A brand identity spread (logo + colors + type)
- A product page or landing page in a browser frame
- An illustration or graphic design deliverable

**Do NOT use:** client headshots, stock photos, logos alone, or raw Figma screenshots.

Only use video when the work truly benefits from motion (scroll animations, UI interactions). Videos autoplay muted on the page.

### Client Priority List

Sourced from the homepage roster, excluding case study clients and clients already on the archive. Tiers based on a site-by-site audit of business health, revenue signals, and credibility (April 2026).

#### Tier 1 — Source First (making real money or backed by serious institutions)

| # | Client | Industry | Filename | Evidence |
|---|--------|----------|----------|----------|
| 1 | **DataTribe** | Cybersecurity & VC | `datatribe.webp` | VC firm with exits to Microsoft and Synopsys. 8th annual DataTribe Challenge. Mike Janke (SEAL Team 6) co-founder. |
| 2 | **Fianu** | DevOps Governance | `fianu.webp` | Enterprise SaaS — Dexcom (major medical device co) is a case study client. Cut release cycles 80%. |
| 3 | **Uncommon Capital Group** | Real Estate Investment | `uncommon-capital.webp` | Private RE investment community. $76M+ deal closed and oversubscribed. Family offices, RIAs, HNW clients. |
| 4 | **Clover Capital** | Private Investment | `clover-capital.webp` | Private investment partnership founded 1998. Trust/estate, asset allocation, tax. Generational wealth management. |
| 5 | **PME Indy** | Federal Staffing & Services | `pme-indy.webp` | Federal contractor — CBP, Army. SBA Small Business Person of the Year. Saved government $200M on a contract. |
| 6 | **DC Scores** | Youth Development | `dc-scores.webp` | 30-year nonprofit, 3500+ kids/year, 68+ schools. One Night One Goal raised $500k+. WaPo, Fox Sports, SBJ coverage. |
| 7 | **Rotary Digital** | Digital Media | `rotary-digital.webp` | 1.3M newsletter subscribers across 4 publications. 50%+ open rates. 65% of readers HHI $150k+. Real ad revenue. |
| 8 | **Frenos** | OT Cybersecurity | `frenos.webp` | Enterprise OT pen-testing platform. Serves airports, utilities, healthcare, manufacturing, maritime. Partners with major vendors. |
| 9 | **Dr. Anthony Gustin** | Health & Wellness | `dr-anthony-gustin.webp` | Multi-brand health entrepreneur (Equip Foods, Lineage Provisions). Active podcast, newsletter, investor. |
| 10 | **SNF Parkway & Maryland Film Fest** | Film & Arts | `snf-parkway.webp` | Stavros Niarchos Foundation-backed cultural institution. Full event calendar. Expanding programming. |
| 11 | **Startups & Hand Grenades** | Venture & Cybersecurity | `startups-hg.webp` | Mike Janke — DataTribe co-founder, former SEAL Team 6. Goldman Sachs Top 100 Entrepreneurs. FP Top 100 Global Thinkers. WSJ, Newsweek, FT. |

#### Tier 2 — Source Next (legitimate businesses, real clients)

| # | Client | Industry | Filename | Evidence |
|---|--------|----------|----------|----------|
| 12 | **Inner Cosmos** | Neurotech | `inner-cosmos.webp` | FDA IDE-approved BCI trial for depression (first in 20 years). WashU collaboration. Forbes feature. Pre-revenue but world-class pedigree. |
| 13 | **RankPay** | Digital Marketing | `rankpay.webp` | 15+ years in business. SEO, PPC, content marketing. Real client testimonials, agency partner program. |
| 14 | **SoCal BioMed** | Laboratory Equipment | `socal-biomed.webp` | Lab equipment e-commerce with own Waverly brand. Real products shipping ($129–$1,245). |
| 15 | **Samata Health** | Mental Health EAP | `samata-health.webp` | SaaS EAP platform. Instabase and Hatch as clients. 7-10x engagement vs traditional EAPs. Usage-based model. |
| 16 | **The Edge Creative** | Video Production | `the-edge-creative.webp` | DC-based video agency. 5x Reed Awards, 5x Pollie Awards. Forbright Bank, Abbott Elementary as clients. |
| 17 | **Miracle Maids** | Commercial Cleaning | `miracle-maids.webp` | DMV cleaning company. Institutional clients since 2014 (Franciscan Monastery, St. Jude school, medical labs). |
| 18 | **Advance Illinois** | Education Policy | `advance-illinois.webp` | Education equity nonprofit. Policy research and advocacy across 850+ IL school districts. |
| 19 | **Autism Society of Maryland** | Advocacy | `autism-society-md.webp` | Active advocacy org. Community programs, events, press releases through 2026. Real community impact. |
| 20 | **Landrec** | Playground Design | `landrec.webp` | Custom playground fabrication & e-commerce. Real projects, design studio, Shopify store. |

#### Tier 3 — Source If Possible (small, pre-launch, or unclear revenue)

| # | Client | Industry | Filename | Note |
|---|--------|----------|----------|------|
| 21 | Luxe Life | Luxury STR Management | `luxe-life.webp` | Stats section shows "$0M" (placeholder or broken counters). Business model is real but scale unclear. |
| 22 | Endurance Box | Fitness Subscription | `endurance-box.webp` | Monthly subscription box ($49–$529/yr). Still has Lorem Ipsum in testimonials section. |
| 23 | Here & Away | Travel Blog | `here-and-away.webp` | Travel content/newsletter. No clear revenue model beyond affiliate/ads. |
| 24 | By Ereka | Apron E-Commerce | `by-ereka.webp` | ~5 apron SKUs at $75–$95. Very small product line. |
| 25 | Nozy | Baby Tech | `nozy.webp` | Still on "Join the Waitlist." Pre-launch, not shipping any product. |

### Already On the Archive (no action needed)

| Client | Type | File |
|--------|------|------|
| GiftBird | Image | `giftbird.webp` |
| Housing Line | Image | `housingline.webp` |
| TI Verbatim | Video | `tiverbatim.mp4` |
| ~~Genimex~~ | Image | `genimex.webp` — **REMOVE: already a case study client** |
| Infinity Technology (ITLLC) | Video | `infinity.mp4` |
| GATA (GATAPACK) | Image | `gata.webp` |
| The Fitness Club | Video | `fitclub.mp4` |
| ApolloXStill | Video | `apollo.mp4` |
| BMWL | Image | `bmwl.webp` |

**Action item: Remove Genimex from the archive — it's a case study client and shouldn't appear in both places. Replace its cell with a new T1 or T2 client.**

### File Names (Google Drive)

Use the exact filenames from the tables above. They match the codebase naming convention and can be dropped straight in.

**Destination folder on site:** `public/assets/archive/`

---

## Google Drive Upload Instructions

1. Create two folders in Google Drive:
   - **`Services Assets`** — the 3 portrait thumbnails
   - **`Archive Assets`** — all landscape archive images
2. Name every file **exactly** as listed in the Filename columns — lowercase, hyphens, `.webp`
3. No subfolders — all files flat in each folder
4. If exporting from Figma: File → Export → WebP, quality 80–85, 1x at the export sizes listed above

Once uploaded, ping Dat. The naming is 1:1 with the codebase so it's a straight drop-in.

---

## Quick Checklist

**Services (3 images):**
- [ ] Branding thumbnail (500 × 640, portrait)
- [ ] Websites thumbnail (500 × 640, portrait)
- [ ] Content thumbnail (500 × 640, portrait)

**Archive — Tier 1 (11 images):**
- [ ] DataTribe
- [ ] Fianu
- [ ] Uncommon Capital Group
- [ ] Clover Capital
- [ ] PME Indy
- [ ] DC Scores
- [ ] Rotary Digital
- [ ] Frenos
- [ ] Dr. Anthony Gustin
- [ ] SNF Parkway
- [ ] Startups & Hand Grenades

**Archive — Tier 2 (9 images):**
- [ ] Inner Cosmos
- [ ] RankPay
- [ ] SoCal BioMed
- [ ] Samata Health
- [ ] The Edge Creative
- [ ] Miracle Maids
- [ ] Advance Illinois
- [ ] Autism Society of Maryland
- [ ] Landrec

**Archive — Tier 3 (5 images, stretch goal):**
- [ ] Luxe Life
- [ ] Endurance Box
- [ ] Here & Away
- [ ] By Ereka
- [ ] Nozy
