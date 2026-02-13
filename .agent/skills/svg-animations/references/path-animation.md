# Path Animations: The Art of the Line

Animating SVG strokes is the most reliable "wow" factor technique for icons, logos, and illustrations.

## 1. The Classic "Self-Drawing" Line
Uses `stroke-dasharray` and `stroke-dashoffset`.

### CSS Only
```css
.draw-me {
  stroke-dasharray: 1000; /* Assume path length < 1000 */
  stroke-dashoffset: 1000;
  animation: draw 2s ease-out forwards;
}

@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}
```

### JS (Perfect Precision)
If you don't know the length, calculate it at runtime.
```javascript
const path = document.querySelector('.draw-me');
const length = path.getTotalLength();

// Set up dash
path.style.strokeDasharray = length;
path.style.strokeDashoffset = length;

// Trigger layout to ensure styles are applied before animation
path.getBoundingClientRect();

// Animate
path.style.transition = 'stroke-dashoffset 2s ease-in-out';
path.style.strokeDashoffset = '0';
```

## 2. Moving Objects Along a Path
Instead of complex XY calculations, use a path to guide an element.

### CSS `offset-path`
Modern and fast.
```css
.moving-circle {
  offset-path: path("M10 80 Q 95 10 180 80 T 260 90");
  animation: move 3s linear infinite;
}

@keyframes move {
  0% { offset-distance: 0%; }
  100% { offset-distance: 100%; }
}
```

## 3. Trim Paths (Lottie Style in CSS)
Great for loaders or accents.
```css
/* Creates a "worm" that crawls around the shape */
@keyframes crawl {
  0% {
    stroke-dasharray: 0, 1000;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 200, 1000;
    stroke-dashoffset: -100;
  }
  100% {
    stroke-dasharray: 0, 1000;
    stroke-dashoffset: -400;
  }
}
```
