# Handoff: Guide Pages Bug Fixes

**From:** Leo (OpenClaw) → Cursor Agent
**Date:** April 4, 2026
**Branch:** staging
**Context:** 8 new guide pages were added under `/content/guides/`. Content, schema, cross-links are done. Template/CSS bugs remain.

---

## Bug 1: "What Does a Branding Agency Actually Do" — Can't Scroll to Bottom

**Page:** `/guides/what-branding-agency-does/`
**Likely cause:** CSS sticky sidebar fix in `style-inline.css`:

```css
.barba-container[data-barba-namespace="journal"] .entry__content--sidebar {
  align-self: flex-start;
  position: sticky;
  top: calc(max(52px, 3.125vw) + 2rem);
}
```

This was added to fix the sticky TOC sidebar. It may be creating a height/overflow issue where the main content column gets cut off. The `.entry__content` parent is `display: flex; flex-wrap: wrap` — the sidebar's `align-self: flex-start` might be collapsing the flex container height.

**How to debug:**
1. Run `npm start` and open `/guides/what-branding-agency-does/`
2. Inspect `.entry__content` — check if its computed height is shorter than `.entry__content--main`
3. Try removing the `position: sticky` and `align-self: flex-start` from the sidebar override and see if scrolling restores
4. The real fix for sticky sidebar + full scroll probably needs the sidebar and main content to NOT be flex siblings — may need a wrapper restructure in `post.njk`

---

## Bug 2: Recommended Guides Thumbnails — Wrong/Repeated Images

**Template:** `_includes/layouts/post.njk` — look for the `{%- if category == "Guide" %}` block

**Current code:**
```nunjucks
{% set guideSlug = item.url | replace("/guides/", "") | replace("/", "") %}
{% set guideThumb = "../" + guideSlug + "/featured.webp" %}
{% image guideThumb, item.data.headline %}
```

**Problem:** The `{% image %}` shortcode resolves paths relative to `this.page.inputPath` (the current page's markdown file). So from `content/guides/rebrand-cost/rebrand-cost.md`, `../baltimore-branding-agency/featured.webp` should resolve to `content/guides/baltimore-branding-agency/featured.webp`. But:

1. The slug extraction via `replace("/guides/", "")` might not work for all URL formats
2. Eleventy's image plugin might be caching/deduping images incorrectly when multiple pages reference the same relative pattern
3. The `item.url` value might include trailing slashes or other characters that break the replace chain

**How to debug:**
1. Add `{{ guideThumb }}` as visible text in the template temporarily to see what path is actually being constructed
2. Check the generated HTML — are the `<picture>` `srcset` URLs pointing to the correct image files?
3. A more robust approach: use `item.data.thumbImage` (which is set as `guides/[slug]/featured.webp` in front matter) and resolve from the content root instead of using relative paths

**Each guide's front matter has:**
```yaml
thumbImage: guides/[slug]/featured.webp   # path from content/ root
featImage: ./featured.webp                 # path relative to the guide's own folder
```

---

## Bug 3 (Minor): Featured Image Aspect Ratio

**Ask:** Hero featured image should be 3:1 (shorter/cinematic). Currently in `style-inline.css`:

```css
.barba-container[data-barba-namespace="journal"][data-barba-namespace="journal"] .entry__thumbnail img {
  aspect-ratio: 3 / 1;
  object-fit: cover;
}
```

Verify this is actually rendering at 3:1 on the guide pages. The Eleventy image shortcode outputs `<picture><source><img>` — make sure the `img` inside `picture` is the one getting the aspect-ratio.

---

## Bug 4 (Minor): UL/OL/LI Font Size

**Ask:** All list items should be 18px. Override in `style-inline.css`:

```css
.barba-container[data-barba-namespace="journal"][data-barba-namespace="journal"] .entry__content ul li,
.barba-container[data-barba-namespace="journal"][data-barba-namespace="journal"] .entry__content ol li {
  font-size: 18px;
}
```

The doubled `[data-barba-namespace="journal"]` is a specificity hack to beat the compiled `style.css` without `!important`. Verify it's actually winning — check computed styles in devtools.

---

## Files Modified (by Leo)

- `_includes/layouts/post.njk` — Recommended Guides section, share buttons (Copy Link, Email), Twitter removed, Related Entries only for journal posts
- `public/styles/style-inline.css` — Font sizes (18px body, 18px li), sticky sidebar, 3:1 hero aspect ratio, entry content bottom spacing
- `content/guides/guides.11tydata.js` — Layout, category, author defaults
- `content/guides/*/` — 8 guide markdown files + featured.webp images
- `.gitignore` — Added .guide-briefs/

## What's Working

- All 8 guide pages render with content ✅
- FAQ schema (JSON-LD) on all guides ✅
- Cross-links between guides ✅
- Share buttons (Facebook, LinkedIn, Email, Copy Link) ✅
- Twitter removed ✅
- Dates staggered, authors contextual ✅
- Guides excluded from Journal listing (no `posts` tag) ✅
- Guides included in sitemap ✅
