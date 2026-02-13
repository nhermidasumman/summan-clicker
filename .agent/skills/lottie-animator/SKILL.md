---
name: lottie-animator
description: Transform static SVGs into professional, production-ready Lottie JSON animations. Use this skill when the user asks to "animate this SVG", "create a Lottie file", "make a loader", "animate an icon", or mentions "Lottie", "After Effects alternative", or "Bodymovin".
---

# Lottie Animator Expert

This skill allows you to generate high-quality Lottie JSON animations directly from SVG code or descriptions, bypassing the need for Adobe After Effects.

## Core Computencies

1.  **SVG to Lottie Translation**: Converting standard SVG elements (`rect`, `circle`, `path`, `g`) into the precise Lottie JSON schema structure.
2.  **Animation Logic**: Implementing complex animations using Lottie's frame-based keyframe system (`k` arrays).
3.  **Bezier Easing**: Applying professional easing curves (cubic-bezier) to keyframes for natural, fluid motion.
4.  **Optimization**: Structures JSON for minimal file size and maximum performance on web/mobile.

## Workflow

1.  **Analyze Input**:
    *   If user provides SVG: Parse the structure (viewBox, paths, groups).
    *   If user provides description: Plan the SVG structure needed.
2.  **Plan Animation**:
    *   Define duration (e.g., 60 frames @ 60fps = 1s).
    *   Identify properties to animate: Position (`p`), Scale (`s`), Rotation (`r`), Opacity (`o`), Shape (`sh`), Trim Paths (`tm`).
    *   Determine easing: Linear, Ease-In-Out, Elastic, etc.
3.  **Generate JSON**:
    *   Construct the root Lottie object (`v`, `fr`, `ip`, `op`, `w`, `h`, `layers`).
    *   Map SVG colors to Lottie `[r, g, b, a]` (0-1 range).
    *   Generate keyframes with `i` (in tangent) and `o` (out tangent) for easing.
4.  **Validate**: Ensure JSON logic is sound (matching start/end frames, valid property types).

## Capabilities & Limitations

*   **Supported**: Paths, solid fills, strokes, gradients (linear/radial), transforms, opacity, masks (basic), trim paths (stroke drawing).
*   **Complex**: Morphing (requires matching vertex counts), complex filters (blur not supported in basic Lottie).
*   **Unsupported**: CSS Animations inside SVG (must be converted to Lottie keyframes), external images (unless base64 encoded, but prefer shapes).

## Reference Library

*   **Structure**: See `references/lottie-structure.md` for JSON schema.
*   **Conversion**: See `references/svg-to-lottie.md` for element mapping.
*   **Math**: See `references/bezier-easing.md` for tangent calculation.
*   **Examples**: See `references/examples.md` for copy-paste patterns.
