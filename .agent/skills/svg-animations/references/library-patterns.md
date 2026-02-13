# JavaScript Libraries for SVG: The Heavy Lifters

When CSS isn't enough (complex sequencing, physics, morphing), use these libraries.

## 1. GSAP (The Industry Standard)
GreenSock Animation Platform is the gold standard for "Awwwards" websites.

### Setup
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
```

### Common Patterns
**Timeline Sequencing**
```javascript
const tl = gsap.timeline({ repeat: -1, yoyo: true });

tl.to("#circle", { duration: 1, x: 100, ease: "power2.inOut" })
  .to("#rect", { duration: 0.5, rotation: 360 }, "-=0.5") // Overlap
  .to("path", { duration: 2, drawSVG: "100%" }); // Requires DrawSVGPlugin (Club GreenSock) or manual stroke-dashoffset
```

**Staggering**
Great for revealing many SVG elements (like confetti or grid items).
```javascript
gsap.from(".grid-item", {
  duration: 0.8,
  scale: 0,
  opacity: 0,
  stagger: {
    amount: 1,
    grid: "auto",
    from: "center"
  },
  ease: "elastic.out(1, 0.3)"
});
```

## 2. Anime.js (Lightweight Alternative)
Great for simple, declarative animations.

```javascript
anime({
  targets: 'path',
  strokeDashoffset: [anime.setDashoffset, 0],
  easing: 'easeInOutSine',
  duration: 1500,
  delay: function(el, i) { return i * 250 },
  direction: 'alternate',
  loop: true
});
```

## 3. Motion One (Modern & Performant)
Built on the Web Animations API (WAAPI). Tiny file size.

```javascript
import { animate } from "motion";

animate("#my-svg-element", 
  { transform: "rotate(45deg)", opacity: 0.5 },
  { duration: 1, easing: "ease-in-out" }
);
```

## Best Practice: Which to Choose?
- **CSS**: Simple hovers, loaders, loops, simple drawing.
- **Motion One**: Standard UI transitions, simple sequences.
- **GSAP**: Complex narrative animations, morphing, physics, scrolling timelines (ScrollTrigger).
