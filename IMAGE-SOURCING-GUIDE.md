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

**Goal:** Source images for **21 new clients** (minimum) to bring us to 30 project cells with 12 placeholders for visual breathing room. If you have bandwidth, source all 25 — that's even better.

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

Sourced from the homepage roster, excluding case study clients and clients already on the archive.

#### Tier 1 — Source First (names that carry real weight)

| # | Client | Industry | Filename | Why |
|---|--------|----------|----------|-----|
| 1 | **DataTribe** | Cybersecurity & VC | `datatribe.webp` | High-profile DC-area VC firm — instant credibility |
| 2 | **SNF Parkway & Maryland Film Fest** | Film & Arts | `snf-parkway.webp` | Stavros Niarchos Foundation-backed cultural institution |
| 3 | **DC Scores** | Youth Development | `dc-scores.webp` | Well-known DC nonprofit, shows range beyond commercial work |
| 4 | **Inner Cosmos** | Neurotech | `inner-cosmos.webp` | Cutting-edge neuroscience startup — "wow" factor |
| 5 | **Dr. Anthony Gustin** | Health & Wellness | `dr-anthony-gustin.webp` | Large personal brand with 500k+ audience |
| 6 | **Advance Illinois** | Education Policy | `advance-illinois.webp` | Institutional org, policy/advocacy gravitas |
| 7 | **Frenos** | OT Cybersecurity | `frenos.webp` | Enterprise cybersecurity, serious B2B credibility |
| 8 | **Uncommon Capital Group** | Real Estate Investment | `uncommon-capital.webp` | Finance/RE investment = premium positioning |

#### Tier 2 — Source Next (solid work, adds industry range)

| # | Client | Industry | Filename | Why |
|---|--------|----------|----------|-----|
| 9 | **Fianu** | Technology & Governance | `fianu.webp` | Gov-tech niche, interesting industry signal |
| 10 | **SoCal BioMed** | Laboratory Equipment | `socal-biomed.webp` | Science/medical, good vertical diversity |
| 11 | **Clover Capital** | Private Investment | `clover-capital.webp` | Finance, premium feel |
| 12 | **Endurance Box** | Fitness & E-Commerce | `endurance-box.webp` | E-commerce = substantial project, long-term client |
| 13 | **Here & Away** | Travel & Lifestyle | `here-and-away.webp` | Travel/lifestyle, visually strong category |
| 14 | **Luxe Life** | Luxury Hospitality | `luxe-life.webp` | Luxury vertical, premium tone |
| 15 | **By Ereka** | Lifestyle & Culinary | `by-ereka.webp` | Lifestyle/culinary, visual diversity |
| 16 | **Autism Society of Maryland** | Advocacy | `autism-society-md.webp` | Shows heart, nonprofit credibility |
| 17 | **Startups & Hand Grenades** | Consulting | `startups-hg.webp` | Memorable name, consulting vertical |

#### Tier 3 — Source If Possible (complete the set)

| # | Client | Industry | Filename |
|---|--------|----------|----------|
| 18 | Samata Health | Mental Health SaaS | `samata-health.webp` |
| 19 | Nozy | Baby Tech & Wellness | `nozy.webp` |
| 20 | Landrec | Playgrounds & E-Commerce | `landrec.webp` |
| 21 | Miracle Maids | Cleaning Services | `miracle-maids.webp` |
| 22 | PME Indy | Staffing & Services | `pme-indy.webp` |
| 23 | RankPay | Digital Marketing | `rankpay.webp` |
| 24 | Rotary Digital | Digital Media | `rotary-digital.webp` |
| 25 | The Edge Creative | Video Production | `the-edge-creative.webp` |

### Already On the Archive (no action needed)

| Client | Type | File |
|--------|------|------|
| GiftBird | Image | `giftbird.webp` |
| Housing Line | Image | `housingline.webp` |
| TI Verbatim | Video | `tiverbatim.mp4` |
| Genimex* | Image | `genimex.webp` |
| Infinity Technology (ITLLC) | Video | `infinity.mp4` |
| GATA (GATAPACK) | Image | `gata.webp` |
| The Fitness Club | Video | `fitclub.mp4` |
| ApolloXStill | Video | `apollo.mp4` |
| BMWL | Image | `bmwl.webp` |

*\*Genimex is also a case study client — may need to swap out. TBD.*

### File Names (Google Drive)

Use the exact filenames from the tables above. They match the codebase naming convention and can be dropped straight in.

**Destination folder on site:** `public/assets/easter-egg/`

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

**Archive — Tier 1 (8 images):**
- [ ] DataTribe
- [ ] SNF Parkway
- [ ] DC Scores
- [ ] Inner Cosmos
- [ ] Dr. Anthony Gustin
- [ ] Advance Illinois
- [ ] Frenos
- [ ] Uncommon Capital Group

**Archive — Tier 2 (9 images):**
- [ ] Fianu
- [ ] SoCal BioMed
- [ ] Clover Capital
- [ ] Endurance Box
- [ ] Here & Away
- [ ] Luxe Life
- [ ] By Ereka
- [ ] Autism Society of Maryland
- [ ] Startups & Hand Grenades

**Archive — Tier 3 (8 images, stretch goal):**
- [ ] Samata Health
- [ ] Nozy
- [ ] Landrec
- [ ] Miracle Maids
- [ ] PME Indy
- [ ] RankPay
- [ ] Rotary Digital
- [ ] The Edge Creative
