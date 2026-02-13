# Lottie Examples

## 1. Simple Pulsing Circle (Scale & Opacity)

*   **Goal**: A circle that scales up and fades out (radar ping effect).
*   **Duration**: 30 frames (0.5s @ 60fps).

```json
{
  "v": "5.7.0",
  "fr": 60,
  "ip": 0,
  "op": 30,
  "w": 100,
  "h": 100,
  "nm": "Pulse",
  "layers": [
    {
      "ddd": 0,
      "ind": 1,
      "ty": 4, // Shape Layer
      "nm": "Circle",
      "sr": 1,
      "ks": { // Transform
        "o": { // Opacity
          "a": 1,
          "k": [
            { "t": 0, "s": [100], "e": [0], "i": {"x":[0.833],"y":[0.833]}, "o": {"x":[0.167],"y":[0.167]} },
            { "t": 30, "s": [0], "e": [0] } // End empty
          ]
        },
        "r": { "a": 0, "k": 0 },
        "p": { "a": 0, "k": [50, 50, 0] },
        "a": { "a": 0, "k": [0, 0, 0] },
        "s": { // Scale
          "a": 1,
          "k": [
            { "t": 0, "s": [0, 0], "e": [100, 100], "i": {"x":[0.6],"y":[1]}, "o": {"x":[0.4],"y":[0]} },
            { "t": 30, "s": [100, 100] }
          ]
        }
      },
      "shapes": [
        {
          "ty": "gr", // Group
          "it": [
            {
              "ty": "el", // Ellipse
              "p": { "a": 0, "k": [0, 0] },
              "s": { "a": 0, "k": [40, 40] } // Size matches viewbox roughly
            },
            {
              "ty": "fl", // Fill
              "c": { "a": 0, "k": [0.2, 0.6, 1, 1] }, // Blue
              "o": { "a": 0, "k": 100 }
            },
            { "ty": "tr", "p": {"a":0,"k":[0,0]}, "a": {"a":0,"k":[0,0]}, "s": {"a":0,"k":[100,100]}, "r": {"a":0,"k":0}, "o": {"a":0,"k":100} }
          ]
        }
      ]
    }
  ]
}
```

## 2. Stroke Drawing (Trim Paths)

*   **Goal**: Draw a checkmark.
*   **Technique**: Use `tm` (Trim Paths) property on a shape group.

To animate a stroke drawing, add a `tm` object to the shapes array.
*   `s`: Start (0-100)
*   `e`: End (0-100)
*   `o`: Offset

```json
{
  "ty": "tm", // Trim Paths
  "s": { "a": 0, "k": 0 },
  "e": {
    "a": 1,
    "k": [
       { "t": 0, "s": [0], "e": [100], "i": {...}, "o": {...} },
       { "t": 45, "s": [100] }
    ]
  },
  "o": { "a": 0, "k": 0 }
}
```
