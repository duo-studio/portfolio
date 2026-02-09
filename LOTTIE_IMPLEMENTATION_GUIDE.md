# Lottie Animation Implementation Guide

> **Audience:** This document is written for an agent building on an **11ty (Eleventy) + Nunjucks** static site framework (HTML, CSS, vanilla JS). All patterns described below are translated from a React/Next.js source implementation into framework-agnostic equivalents you can use directly.

---

## Table of Contents

1. [Overview](#overview)
2. [Library Choice](#library-choice)
3. [How Lottie Files Are Stored & Referenced](#how-lottie-files-are-stored--referenced)
4. [Core Rendering Pattern](#core-rendering-pattern)
5. [Usage Pattern 1: Always-Playing Animations (Hero Icons)](#usage-pattern-1-always-playing-animations-hero-icons)
6. [Usage Pattern 2: Hover/Touch-Triggered Animations (Cards)](#usage-pattern-2-hovertouch-triggered-animations-cards)
7. [MIME Type Detection & Conditional Rendering](#mime-type-detection--conditional-rendering)
8. [Styling & Layout](#styling--layout)
9. [Accessibility](#accessibility)
10. [Performance Considerations](#performance-considerations)
11. [Complete 11ty/NJK Implementation Reference](#complete-11ty-njk-implementation-reference)

---

## Overview

The project uses **Lottie** to render lightweight, scalable, JSON-based animations in place of static icons or GIFs. Lottie animations are used in two components:

| Component | Trigger Behavior | Container Size | Loop |
|-----------|-----------------|---------------|------|
| **Hero** (all 3 variations) | Always playing (`autoplay`) | 52×52px (`h-13 w-13`) | Yes |
| **Cards** | Play on hover/touch, stop otherwise | 80×80px desktop, 64×64px mobile | Yes |

Animations are stored as `.json` files (standard Lottie JSON format) served from a CMS/CDN URL. They are **not** `.lottie` (dotLottie) files.

---

## Library Choice

The source project uses `lottie-react` (a React wrapper), but that package internally uses **`lottie-web`** — the canonical, framework-agnostic Lottie player.

### For 11ty/NJK: Use `lottie-web` directly

**Option A — CDN (recommended for static sites):**

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.13.0/lottie.min.js"></script>
```

**Option B — npm (if using a build step):**

```bash
npm install lottie-web
```

```js
import lottie from 'lottie-web';
```

The `lottie-web` library exposes a global `lottie` (or `bodymovin`) object with methods like `loadAnimation()`, `.play()`, `.stop()`, `.pause()`, and `.destroy()`.

---

## How Lottie Files Are Stored & Referenced

Lottie animations are standard JSON files. In the source project they are uploaded to Sanity CMS as generic file assets and served via URL. The system detects them by checking `mimeType === "application/json"`.

**For your 11ty project, you can either:**

1. **Store JSON files locally** in a directory like `src/assets/lottie/` and reference them by path
2. **Serve them from a CDN/CMS** and reference them by URL

Either way, the Lottie player fetches and parses the JSON at runtime.

---

## Core Rendering Pattern

The source project wraps Lottie in a reusable component. Here is the equivalent vanilla JS pattern:

### Source Implementation (React)

The React component (`LottieAnimation.tsx`) does the following:
1. Accepts a `src` URL to a JSON file
2. Fetches the JSON via `fetch()`
3. Passes the parsed data to the Lottie renderer
4. Exposes `animating` (boolean) to control play/stop
5. Shows a loading spinner while fetching

### Equivalent Vanilla JS Function

```js
/**
 * Initialize a Lottie animation in a container element.
 *
 * @param {HTMLElement} container - The DOM element to render into
 * @param {string} src - URL or path to the Lottie JSON file
 * @param {Object} options
 * @param {boolean} options.loop - Whether to loop (default: true)
 * @param {boolean} options.autoplay - Whether to autoplay (default: false)
 * @returns {Object} The lottie animation instance (has .play(), .stop(), .destroy() methods)
 */
function initLottie(container, src, options = {}) {
  const { loop = true, autoplay = false } = options;

  const anim = lottie.loadAnimation({
    container: container,
    renderer: 'svg',           // SVG renderer (scalable, crisp)
    loop: loop,
    autoplay: autoplay,
    path: src,                 // URL/path to JSON — lottie-web fetches it internally
  });

  return anim;
}
```

> **Note:** `lottie-web` can fetch the JSON itself when you pass `path`. You do NOT need to manually `fetch()` the JSON first (the React version does this because `lottie-react` expects pre-parsed `animationData`, but `lottie-web` natively supports `path`).

---

## Usage Pattern 1: Always-Playing Animations (Hero Icons)

In the Hero component, Lottie animations are small icons that play continuously on load.

### Behavior
- `autoplay: true`
- `loop: true`
- Starts immediately when the page loads
- Container: 52×52px with a background color and rounded corners

### HTML (Nunjucks)

```njk
{% if animatedIcon and animatedIcon.mimeType == "application/json" %}
  <div class="hero-icon" role="img" aria-label="{{ animatedIcon.alt | default('Animated icon') }}">
    <div class="lottie-container"
         data-lottie-src="{{ animatedIcon.url }}"
         data-lottie-autoplay="true"
         data-lottie-loop="true">
    </div>
  </div>
{% endif %}
```

### CSS

```css
.hero-icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-accent);  /* equivalent to bg-lg-10 */
  border-radius: 8px;
}

.lottie-container {
  width: 100%;
  height: 100%;
}

.lottie-container svg {
  width: 100% !important;
  height: 100% !important;
  object-fit: contain;
}
```

### JS Initialization

```js
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-lottie-src]').forEach(container => {
    const src = container.dataset.lottieSrc;
    const autoplay = container.dataset.lottieAutoplay === 'true';
    const loop = container.dataset.lottieLoop === 'true';

    lottie.loadAnimation({
      container: container,
      renderer: 'svg',
      loop: loop,
      autoplay: autoplay,
      path: src,
    });
  });
});
```

---

## Usage Pattern 2: Hover/Touch-Triggered Animations (Cards)

In the Cards component, Lottie animations are card icons that **only play while the user hovers** (or touches on mobile). They stop when the user moves away.

### Behavior
- `autoplay: false` — animation is stopped by default
- `loop: true` — loops while hovering
- On `mouseenter` / `touchstart` → `.play()`
- On `mouseleave` / `touchend` → `.stop()` (resets to first frame)
- Container: 80×80px desktop, 64×64px mobile
- Background changes on hover

### HTML (Nunjucks)

```njk
{% for card in cardList %}
  <div class="card" data-card>
    {% if card.media and card.media.mimeType == "application/json" %}
      <div class="card-icon" role="img" aria-label="{{ card.media.alt | default('Animated icon') }}">
        <div class="lottie-container lottie-hover"
             data-lottie-src="{{ card.media.url }}"
             data-lottie-autoplay="false"
             data-lottie-loop="true">
        </div>
      </div>
    {% elif card.media and card.media.mimeType starts with "image/" %}
      <div class="card-icon">
        <img src="{{ card.media.url }}" alt="{{ card.media.alt | default('') }}" />
      </div>
    {% endif %}

    <h3 class="card-title">{{ card.title }}</h3>
    <p class="card-description">{{ card.description }}</p>
  </div>
{% endfor %}
```

### CSS

```css
.card-icon {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  background-color: var(--color-light-grey);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  transition: background-color 0.3s ease;
}

/* Background changes when parent card is hovered */
.card:hover .card-icon {
  background-color: var(--color-bg-accent);
}

.card-icon .lottie-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(1.25);  /* scale-125 to fill the icon area */
}

/* Mobile sizes */
@media (max-width: 768px) {
  .card-icon {
    width: 64px;
    height: 64px;
  }
}
```

### JS — Hover-Triggered Play/Stop

```js
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.lottie-hover').forEach(container => {
    const src = container.dataset.lottieSrc;
    const loop = container.dataset.lottieLoop === 'true';

    const anim = lottie.loadAnimation({
      container: container,
      renderer: 'svg',
      loop: loop,
      autoplay: false,   // Do NOT autoplay — wait for hover
      path: src,
    });

    // Find the parent card element to attach hover listeners
    const card = container.closest('[data-card]');
    if (!card) return;

    // Desktop: mouse hover
    card.addEventListener('mouseenter', () => anim.play());
    card.addEventListener('mouseleave', () => anim.stop());  // .stop() resets to frame 0

    // Mobile: touch
    card.addEventListener('touchstart', () => anim.play(), { passive: true });
    card.addEventListener('touchend', () => anim.stop(), { passive: true });
  });
});
```

> **Key difference:** `.stop()` resets the animation to frame 0 (matching the source implementation). If you want to freeze on the current frame instead, use `.pause()`.

---

## MIME Type Detection & Conditional Rendering

The source project uses MIME type to decide what to render. The same file field can contain a Lottie JSON, a static image, or a video. The decision tree is:

```
mimeType === "application/json"  → Lottie animation
mimeType.startsWith("image/")   → <img> tag
mimeType.startsWith("video/")   → <video> tag
otherwise                        → "Unsupported media type" fallback
```

### Nunjucks Equivalent

```njk
{% if media.mimeType == "application/json" %}
  {# Lottie Animation #}
  <div class="lottie-container"
       data-lottie-src="{{ media.url }}"
       data-lottie-autoplay="true"
       data-lottie-loop="true"
       role="img"
       aria-label="{{ media.alt | default('Animation') }}">
  </div>

{% elif media.mimeType is starting_with("image/") %}
  {# Static Image #}
  <img src="{{ media.url }}"
       alt="{{ media.alt | default('') }}"
       width="{{ media.width | default(100) }}"
       height="{{ media.height | default(100) }}"
       loading="lazy" />

{% elif media.mimeType is starting_with("video/") %}
  {# Video #}
  <video autoplay muted loop playsinline>
    <source src="{{ media.url }}" type="{{ media.mimeType }}">
  </video>

{% else %}
  <div class="unsupported-media">Unsupported media type</div>
{% endif %}
```

> **11ty Note:** Nunjucks doesn't have a built-in `startsWith` test. You may need to register a custom filter/test, or use `media.mimeType | truncate(6, true, '') == "image/"` as a workaround. Alternatively, check file extensions in your data pipeline before it reaches the template.

---

## Styling & Layout

### Inline Styles Applied to the Lottie SVG

The source project applies these styles to ensure the animation fills its container while maintaining aspect ratio:

```css
.lottie-container svg {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
```

### Container Patterns

| Context | Container Size | Background | Border Radius | Extra |
|---------|---------------|------------|---------------|-------|
| Hero icon | 52×52px | Accent bg (`bg-lg-10`) | 8px | — |
| Card icon | 80×80px (64px mobile) | Light grey, accent on hover | 8px | `overflow: hidden`, `scale(1.25)` on animation |

---

## Accessibility

The source implementation wraps every Lottie animation in a container with:

- `role="img"` — tells screen readers this is an image-like element
- `aria-label="..."` — provides alternative text (falls back to `"Lottie animation"`)

### Apply in HTML

```html
<div class="lottie-container"
     role="img"
     aria-label="Descriptive text for this animation"
     data-lottie-src="/assets/lottie/my-animation.json"
     data-lottie-autoplay="true"
     data-lottie-loop="true">
</div>
```

For users with `prefers-reduced-motion`, you should consider pausing animations:

```js
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  anim.goToAndStop(0, true);  // Show first frame only
}
```

---

## Performance Considerations

1. **Lazy load the library.** The source project dynamically imports the Lottie component with `ssr: false` to keep it out of the initial bundle. For 11ty, load the script with `defer` or `async`:

   ```html
   <script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.13.0/lottie.min.js" defer></script>
   ```

2. **Renderer choice.** Use `renderer: 'svg'` (default) for quality and scalability. Use `renderer: 'canvas'` only if you have many simultaneous animations causing performance issues.

3. **Destroy when not needed.** If animations are in dynamically removed DOM sections, call `anim.destroy()` to free memory.

4. **File size.** Lottie JSON files can be large. Consider:
   - Compressing with tools like [lottie-compress](https://github.com/nicolo-ribaudo/lottie-compress)
   - Serving with gzip/brotli compression on your CDN/server
   - Only loading animations when they scroll into view (Intersection Observer)

---

## Complete 11ty/NJK Implementation Reference

Here is a complete, copy-paste-ready implementation for an 11ty project:

### File: `src/_includes/components/lottie.njk`

```njk
{#
  Lottie Animation Component
  
  Params:
    src       - URL or path to the Lottie JSON file (required)
    alt       - Accessible label text (default: "Animation")
    autoplay  - "true" or "false" (default: "true")
    loop      - "true" or "false" (default: "true")
    hover     - "true" if animation should only play on parent hover (default: "false")
    class     - Additional CSS classes for the container
#}

{% set _alt = alt | default("Animation") %}
{% set _autoplay = autoplay | default("true") %}
{% set _loop = loop | default("true") %}
{% set _hover = hover | default("false") %}
{% set _class = class | default("") %}

<div class="lottie-container {{ 'lottie-hover' if _hover == 'true' }} {{ _class }}"
     role="img"
     aria-label="{{ _alt }}"
     data-lottie-src="{{ src }}"
     data-lottie-autoplay="{{ 'false' if _hover == 'true' else _autoplay }}"
     data-lottie-loop="{{ _loop }}">
</div>
```

### File: `src/assets/js/lottie-init.js`

```js
/**
 * Lottie Animation Initializer
 * 
 * Handles two modes:
 * 1. Autoplay animations: play immediately on load
 * 2. Hover animations (.lottie-hover): play on parent [data-card] hover/touch
 * 
 * Requires: lottie-web loaded globally as `lottie`
 */
(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initAutoplayAnimations() {
    document.querySelectorAll('[data-lottie-src]:not(.lottie-hover)').forEach(function (container) {
      var src = container.dataset.lottieSrc;
      var loop = container.dataset.lottieLoop === 'true';
      var autoplay = container.dataset.lottieAutoplay === 'true';

      var anim = lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: loop,
        autoplay: autoplay && !prefersReducedMotion,
        path: src,
      });

      if (prefersReducedMotion) {
        anim.addEventListener('DOMLoaded', function () {
          anim.goToAndStop(0, true);
        });
      }
    });
  }

  function initHoverAnimations() {
    document.querySelectorAll('.lottie-hover').forEach(function (container) {
      var src = container.dataset.lottieSrc;
      var loop = container.dataset.lottieLoop === 'true';

      var anim = lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: loop,
        autoplay: false,
        path: src,
      });

      // Show first frame when loaded
      anim.addEventListener('DOMLoaded', function () {
        anim.goToAndStop(0, true);
      });

      // Find closest hoverable parent
      var card = container.closest('[data-card]') || container.parentElement;

      if (prefersReducedMotion) return;  // Skip hover triggers for reduced motion

      // Desktop
      card.addEventListener('mouseenter', function () { anim.play(); });
      card.addEventListener('mouseleave', function () { anim.stop(); });

      // Mobile
      card.addEventListener('touchstart', function () { anim.play(); }, { passive: true });
      card.addEventListener('touchend', function () { anim.stop(); }, { passive: true });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (typeof lottie === 'undefined') {
      console.warn('lottie-web is not loaded. Lottie animations will not work.');
      return;
    }
    initAutoplayAnimations();
    initHoverAnimations();
  });
})();
```

### File: `src/_includes/layouts/base.njk` (script tags to add)

```html
<!-- Before </body> -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.13.0/lottie.min.js" defer></script>
<script src="/assets/js/lottie-init.js" defer></script>
```

### Example Usage in a Hero Template

```njk
{# Hero section with Lottie icon #}
<section class="hero">
  <div class="hero-content">
    {% if hero.animatedIcon and hero.animatedIcon.mimeType == "application/json" %}
      <div class="hero-icon">
        {% include "components/lottie.njk" with {
          src: hero.animatedIcon.url,
          alt: hero.animatedIcon.alt | default("Animated icon"),
          autoplay: "true",
          loop: "true"
        } %}
      </div>
    {% endif %}
    <h1>{{ hero.heading }}</h1>
    <p>{{ hero.description }}</p>
  </div>
</section>
```

### Example Usage in a Cards Template

```njk
{# Cards with hover-triggered Lottie #}
<section class="cards">
  {% for card in cards.cardList %}
    <div class="card" data-card>
      {% if card.media and card.media.mimeType == "application/json" %}
        <div class="card-icon">
          {% include "components/lottie.njk" with {
            src: card.media.url,
            alt: card.media.alt | default("Animated icon"),
            hover: "true",
            loop: "true"
          } %}
        </div>
      {% endif %}
      <h3>{{ card.title }}</h3>
      <p>{{ card.description }}</p>
    </div>
  {% endfor %}
</section>
```

---

## Key API Reference (`lottie-web`)

| Method | Description |
|--------|-------------|
| `lottie.loadAnimation(config)` | Creates and returns an animation instance |
| `anim.play()` | Start/resume playback |
| `anim.stop()` | Stop and reset to frame 0 |
| `anim.pause()` | Pause at current frame |
| `anim.goToAndStop(frame, isFrame)` | Jump to a specific frame and stop |
| `anim.destroy()` | Remove animation and free memory |
| `anim.setSpeed(speed)` | Set playback speed (1 = normal) |
| `anim.setDirection(dir)` | 1 = forward, -1 = reverse |

### `loadAnimation` Config Options

```js
lottie.loadAnimation({
  container: element,        // Required: DOM element to render into
  renderer: 'svg',           // 'svg' | 'canvas' | 'html'
  loop: true,                // Boolean
  autoplay: true,            // Boolean
  path: '/path/to/anim.json', // URL to JSON (use this OR animationData, not both)
  animationData: {},         // Pre-parsed JSON object (alternative to path)
});
```

---

## Summary of Differences from Source (React) to 11ty (Vanilla JS)

| Aspect | React Source | 11ty Equivalent |
|--------|-------------|-----------------|
| Library | `lottie-react` (wrapper) | `lottie-web` (direct) |
| JSON loading | Manual `fetch()` + pass as `animationData` | Use `path` option — lottie-web fetches internally |
| Component | `<LottieAnimation>` React component | `data-lottie-*` attributes + init script |
| Play/Stop control | React state + `useEffect` + `lottieRef` | DOM event listeners (`mouseenter`, `mouseleave`) |
| Lazy loading | `next/dynamic` with `ssr: false` | `<script defer>` |
| Hover detection | React `useState` for `hoveredIndex` | CSS `:hover` + JS event listeners on `[data-card]` |
| SSR handling | Disabled SSR for Lottie component | Not applicable (static HTML, JS runs client-side) |
