# Responsive Tutorial Implementation Design

## 1. CSS Changes (`style.css`)
- Add `@media (max-width: 768px)` block.
- Target `.tutorial-bubble`:
  - Enforce full width minus margins (`calc(100vw - 32px)`).
  - Adjust padding/font-size for mobile.
  - Disable the little "tear" receipt effect if it looks bad on mobile (optional).

## 2. JS Changes (`tutorial-overlay.js`)
- **`getPreferredBubblePosition`**:
  - Detect `isMobile` (width < 768px).
  - If mobile:
    - Check target center Y.
    - If target Y < windowHeight / 2 -> Dock Bottom.
    - If target Y > windowHeight / 2 -> Dock Top.
    - `left` is fixed to `16px` (margin).
    - `width` is `calc(100vw - 32px)`.
- **`updateArrowLayout`**:
  - Detect `isMobile` logic (already has `getArrowMinScale`, generalize this).
  - If mobile and distance < 100px:
    - Use a simpler arrow? Or just ensure the `ARROW_MIN_SCALE` allows it to shrink enough without looking weird.
    - Current `ARROW_MIN_SCALE_MOBILE = 0.1` might be enough, but we should verify.

## 3. JS Changes (`tutorial-controller.js`)
- In `update()` loop:
  - When setting `target`:
    - Call `target.scrollIntoView({ behavior: 'smooth', block: 'center' })`
    - *Throttle* this call so it doesn't spam scroll on every tick (only when step changes).

## 4. CSS for "Docked" Bubble
- We might not need new classes if we just set `top`/`left` correctly in JS.
- BUT, for the "Slide up/down" animation, CSS classes like `.dock-bottom` / `.dock-top` with transitions would be nice.
- However, `tutorial-overlay.js` renders continuously (game loop). CSS transitions might fight with frame-by-frame updates if not careful.
- **Decision**: Stick to frame-updates for position, but use CSS for *dimensions* and *inner layout*.

