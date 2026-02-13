# Lottie JSON Structure

A Lottie file is a simple JSON object. Here is the breakdown of the critical top-level properties and the anatomy of a layer.

## Root Object

```json
{
  "v": "5.7.0",       // Version (Keep > 5.5 for modern features)
  "fr": 60,           // Frame Rate (60 is standard for smooth web anims)
  "ip": 0,            // In Point (Start frame)
  "op": 120,          // Out Point (End frame - total duration = (op-ip)/fr)
  "w": 500,           // ViewBox Width
  "h": 500,           // ViewBox Height
  "nm": "Animation",  // Name
  "ddd": 0,           // 3D flag (0 = 2D)
  "assets": [],       // Images or precomps
  "layers": []        // The Array of layer objects (Bottom to Top order usually)
}
```

## Layer Object (`layers`)

Each item in the `layers` array represents an element.
Types (`ty`):
*   `4`: **Shape Layer** (Most common for Vector/SVG content)
*   `0`: Precomp (Nested animation)
*   `1`: Solid (Background color)
*   `2`: Image

```json
{
  "ddd": 0,
  "ind": 1,       // Index
  "ty": 4,        // Type: Shape
  "nm": "Layer 1",
  "sr": 1,        // Stretch factor
  "st": 0,        // Start Frame
  "ip": 0,        // In Point (Visibility start)
  "op": 120,      // Out Point (Visibility end)
  "ks": { ... },  // TRANSFORM (Position, Scale, Rotation, Opacity)
  "shapes": [ ... ] // Content (Paths, Fills, Strokes)
}
```

## Transform Object (`ks`)

Every layer has a `ks` object defining its spatial properties.
*   `a`: Anchor Point (`[x, y, z]`)
*   `p`: Position (`[x, y, z]`)
*   `s`: Scale (`[x, y, z]` - 100 is 100%)
*   `r`: Rotation (Degrees)
*   `o`: Opacity (0-100)

**Animated Property Format**:
If a property is animated, `a` (animated flag) is `1`, and `k` is an array of keyframes.
If static, `a` is `0`, and `k` is the value (e.g., `[100, 100]`).

## Shapes Array (`shapes`)

Inside a Shape Layer (`ty: 4`), the content is defined in `shapes`.
Common Item Types (`ty`):
*   `gr`: Group (Container)
*   `sh`: Path ( The actual vector data `k: { v:[], i:[], o:[], c: true/false }` )
*   `fl`: Fill (`c`: Color `[r,g,b,alpha]`, `o`: Opacity)
*   `st`: Stroke (`c`: Color, `w`: Width)
*   `el`: Ellipse (`p`: Position, `s`: Size)
*   `rc`: Rect (`p`: Position, `s`: Size, `r`: Roundness)
*   `tm`: Trim Paths (Start, End, Offset - for drawing strokes)
