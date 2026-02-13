# Bezier Easing in Lottie

Lottie handles easing via `i` (in tangent) and `o` (out tangent) properties in keyframes. These correspond to the control points of a cubic bezier curve.

## Coordinate System

*   **X axis**: Time (0 to 1, representing percentage of the keyframe duration).
*   **Y axis**: Value (0 to 1, representing percentage of the value change).

## Standard Easings

To apply an easing, you must define the `i` and `o` objects in the *starting* keyframe of the transition.

### Linear
No easing needed (default is linear if `i`/`o` are missing, but explicit hold is `h: 1`).
*   `i`: `{x: [0.833], y: [0.833]}` (Standard Linear approximation)
*   `o`: `{x: [0.167], y: [0.167]}`

### Ease In (Quad)
Accelerates from zero velocity.
*   `i`: `{x: [0.833], y: [1]}`
*   `o`: `{x: [0.55], y: [0]}`

### Ease Out (Quad)
Decelerates to zero velocity.
*   `i`: `{x: [0.45], y: [1]}`
*   `o`: `{x: [0.167], y: [0]}`

### Ease In-Out (Quad)
Accelerates then decelerates.
*   `i`: `{x: [0.584], y: [1]}`
*   `o`: `{x: [0.416], y: [0]}`

### Expo Ease In-Out (Snappy)
Great for UI transitions.
*   `i`: `{x: [1], y: [1]}`
*   `o`: `{x: [0], y: [0]}` (Note: Extreme expo might need adjustment, typically 0.16, 1 / 0.84, 0)
*   **Material Design Standard**: `0.4, 0.0, 0.2, 1.0` -> `i:{x:0.2, y:1}, o:{x:0.4, y:0}`

## Custom Easing Calculation

To convert a CSS `cubic-bezier(x1, y1, x2, y2)` to Lottie:

1.  **Out Tangent (o)**: Corresponds to Point 1 `(x1, y1)`.
    *   `o: { x: [x1], y: [y1] }`
2.  **In Tangent (i)**: Corresponds to Point 2 `(x2, y2)`.
    *   `i: { x: [x2], y: [y2] }`

**Example**: CSS `cubic-bezier(0.68, -0.55, 0.265, 1.55)` (Back In-Out)
*   `o: { x: [0.68], y: [-0.55] }`
*   `i: { x: [0.265], y: [1.55] }`

> **Note**: For multi-dimensional properties (like Position `[x,y]`), `i` and `o` objects usually contain single values in arrays `[x]` because the easing applies to the *timeline progression*, not separate spatial axes (unless `s: true` is set for spatial separation).

## Keyframe Structure

```json
{
  "t": 0,           // Start Frame
  "s": [100],       // Start Value
  "e": [200],       // End Value
  "i": { "x": [0.833], "y": [0.833] }, // In Tangent (End of curve)
  "o": { "x": [0.167], "y": [0.167] }  // Out Tangent (Start of curve)
}
```
