# Sticky Process Section — Implementation Guide

This pattern creates a section where a header pins to the top of the viewport, and each row item pins directly below it. As the user scrolls, each new item slides up and covers the previous one (like stacking cards). Reference: [1820productions.com/services](https://www.1820productions.com/services).

## How It Works

There are three layers:

1. **Section wrapper** — contains everything, no fixed height
2. **Header** — `position: sticky; top: 0; z-index: 2` — pins to the viewport top
3. **Row items** — `position: sticky; top: var(--process-header-h); z-index: N` — pin directly below the header, with incrementing z-index so each new item covers the previous one

The key insight: CSS `position: sticky` combined with incrementing `z-index` creates the stacking effect with zero JavaScript animation. The only JS needed is measuring the header height so items know where to pin.

## HTML Structure

```html
<section id="process">
    <div class="process-section">
        <header class="process-header">
            <!-- Title + CTA button, side by side -->
            <div class="title">Section Title</div>
            <a href="/contact/" class="btn">CTA Label</a>
        </header>
        <div class="process-list">
            <div class="process-item">
                <!-- Each item is a 3-column grid: index | content | image -->
                <div class="process-index"><span>001</span> / 004</div>
                <div class="process-content">
                    <h2>Title</h2>
                    <p>Description text</p>
                </div>
                <div class="process-image">
                    <img src="..." alt="..." />
                </div>
            </div>
            <!-- Repeat .process-item for each row -->
        </div>
    </div>
</section>
```

## CSS (Critical Parts)

```scss
// The outer section needs no fixed height — content determines it
.process-section {
    padding: [top] 0 [bottom]; // No horizontal padding here — items span full viewport width
}

// Header: sticky at top, needs opaque background to cover content scrolling behind it
.process-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: [vertical] [horizontal-gutter] [vertical];
    position: sticky;
    top: 0;
    z-index: 2; // Higher than items so header always stays on top
    background: [section-background-color]; // MUST be opaque, not transparent

    @media (max-width: $mobile-breakpoint) {
        position: relative; // Disable sticky on mobile
    }
}

// Each row item: sticky, pins below the header
.process-item {
    display: grid;
    grid-template-columns: auto 1fr auto; // index | content | image
    gap: [gutter];
    padding: [vertical] [horizontal-gutter];
    border-top: 1px solid [border-color];
    position: sticky;
    top: var(--process-header-h, 0px); // Pins below header — value set by JS
    background: [section-background-color]; // MUST be opaque to cover previous item

    // CRITICAL: Each item needs a higher z-index than the previous one
    // This is what makes item 2 cover item 1, item 3 cover item 2, etc.
    @for $i from 1 through 10 {
        &:nth-child(#{$i}) {
            z-index: #{$i};
        }
    }

    @media (max-width: $mobile-breakpoint) {
        position: relative; // Disable sticky on mobile
        top: unset;
        grid-template-columns: 1fr; // Stack vertically
    }
}
```

## JavaScript (Minimal)

Only one thing needed: measure the header height and set a CSS variable so items know where to pin.

```js
var processHeader = document.querySelector(".process-header");
if (processHeader) {
    var setHeaderHeight = function () {
        document.documentElement.style.setProperty(
            "--process-header-h",
            processHeader.offsetHeight + "px"
        );
    };
    setHeaderHeight();
    window.addEventListener("resize", setHeaderHeight);
}
```

## Common Pitfalls

1. **Transparent backgrounds break the effect.** Every sticky element (header + items) MUST have an opaque background. Otherwise you see content stacking behind/through them.

2. **z-index must increment.** If all items share the same z-index, they stack at the same layer and overlap messily instead of covering each other cleanly.

3. **Mobile should disable sticky.** On small screens, stacking cards doesn't work well — too much content gets hidden. Set `position: relative` on mobile.

4. **The `top` value for items must match the header's actual rendered height.** Use JS to measure `offsetHeight` and set a CSS custom property. Don't hardcode a pixel value — it'll break at different viewport sizes and when content wraps.

5. **If the section has a background color transition** (e.g., light-to-dark on scroll), the header and items need the same transition duration and timing as the parent section, AND they need explicit starting backgrounds (not `transparent`). Otherwise the children flash or lag behind.

## Live Implementation

See `content/services/index.njk` (HTML), `public/styles/imports/_services.scss` (CSS), and `public/scripts/global.js` (JS, search for `processHeader`) for the working implementation in this project.
