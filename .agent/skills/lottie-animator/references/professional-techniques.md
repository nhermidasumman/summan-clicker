# Professional Techniques

To make animations feel "premium" and not just mechanical translation, apply these principles.

## 1. Follow Through & Overlap
Nothing in nature stops instantly.
*   **Scale**: When scaling up to 100%, overshoot to 110% then settle back to 100% (Elastic/Back ease).
*   **Rotation**: When an object stops rotating, let it rotate slightly past the target and bounce back.

## 2. Squash and Stretch
Give mass to objects.
*   When a ball hits the ground (Y position min), Scale X should increase (120%) and Scale Y decrease (80%) to flatten it.
*   Preserve volume: $X \times Y \approx 100 \times 100$.

## 3. Secondary Action
Don't just animate the main object.
*   If a "Success" checkmark draws, add subtle particle sparkles or a ring ripple (pulsing circle) behind it.
*   If a menu opens, stagger the items appearing by 2-3 frames each rather than all at once.

## 4. Staggering (Offset)
If you have multiple elements (e.g., 3 bars in a chart):
*   Copy the animation keys.
*   Shift the start time (`st` / keyframe `t`) of the second bar by 5 frames.
*   Shift the third by 10 frames.
This creates a "wave" effect that is much more pleasing than synchronous motion.

## 5. Trim Paths (The "Writing" Effect)
Essential for sleek UI.
*   Use `tm` (Trim Paths) on stroked paths.
*   Animate `end` from 0 -> 100.
*   **Pro Tip**: Also animate `start` from 0 -> 100 with a slight delay (and different easing) to make a line that travels and disappears, like a laser bolt or a "loading snake".

## 6. Color Transitions
Don't just cut colors.
*   Animate the `c` (Color) property in the `fl` (Fill) or `st` (Stroke) object.
*   Remember Lottie uses `0-1` RGB. To fade from Red `[1,0,0]` to Blue `[0,0,1]`, use linear interpolation in the keyframes.
