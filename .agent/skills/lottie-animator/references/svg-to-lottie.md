# SVG to Lottie Mapping

Guide for manually translating SVG elements to Lottie shapes.

## 1. Colors
*   **SVG**: Hex `#FF0000` or `rgb(255, 0, 0)`
*   **Lottie**: Array `[R, G, B, A]` where values are normalized `0-1`.
    *   `#FF0000` -> `[1, 0, 0, 1]`
    *   `rgb(128, 128, 128)` -> `[0.5, 0.5, 0.5, 1]`

## 2. Shapes

### Rectangle `<rect>`
*   **SVG**: `<rect x="10" y="10" width="100" height="50" rx="5" />`
*   **Lottie (`rc`)**:
    *   `p` (Position): `[x + w/2, y + h/2]` (Lottie anchors rects at center!) -> `[60, 35]`
    *   `s` (Size): `[100, 50]`
    *   `r` (Roundness): `5`

### Circle/Ellipse `<circle>`
*   **SVG**: `<circle cx="50" cy="50" r="25" />`
*   **Lottie (`el`)**:
    *   `p` (Position): `[50, 50]`
    *   `s` (Size): `[50, 50]` (Diameter, so `r*2`)

### Path `<path>`
*   **SVG**: `<path d="M10 10 L50 50 ..." />`
*   **Lottie (`sh`)**:
    *   Must parse the `d` string into Bezier vertices.
    *   `k` object:
        *   `v`: Array of vertices `[[x,y], [x,y]]` (Anchors)
        *   `i`: Array of "In" tangents (control points relative to anchor). `[0,0]` for sharp lines.
        *   `o`: Array of "Out" tangents.
        *   `c`: Closed boolean (`true` if ends with Z).

## 3. Transforms `<g transform="...">`
*   **SVG Translate**: `translate(x, y)` -> Lottie `ks.p` (Add to existing).
*   **SVG Rotate**: `rotate(deg, cx, cy)` -> Lottie `ks.r`. Note anchor point `ks.a` needs to be set to `[cx, cy, 0]`.
*   **SVG Scale**: `scale(x, y)` -> Lottie `ks.s` `[x*100, y*100, 100]`.

## 4. Stroke
*   **SVG**: `stroke="black" stroke-width="2" stroke-linecap="round"`
*   **Lottie (`st`)**:
    *   `c`: Color `[0,0,0,1]`
    *   `w`: Width `2`
    *   `lc`: Line Cap (`1`=Butt, `2`=Round, `3`=Projecting)
    *   `lj`: Line Join (`1`=Miter, `2`=Round, `3`=Bevel)
