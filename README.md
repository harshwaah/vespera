<div align="center">
  <h1 style="font-family: serif; letter-spacing: 0.4em; font-weight: 300;">V E S P E R A</h1>
  <p style="font-family: monospace; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(255,255,255,0.55);">hand-powered visual synthesis</p>
</div>

<br />

A real-time webcam art installation that transforms the space between your hands into a living visual portal. No clicks. No buttons. Just gesture.

Built with **React Three Fiber**, **GLSL**, and **MediaPipe**.

---

## ✦ The Interaction 

```text
 RAISE PALMS TO REVEAL THE RIFT  |  PINCH INDEX AND THUMB TO SHIFT REALITY
```

When two hands are present, Vespera isolates the bounding space between them. Your hands are rendered as ghostly platinum and ivory skeletons overlaid onto the video feed. The external world fades into a dark, cinematic desaturation, while a frosted-glass boundary reveals one of seven vivid WebGL shader realms tracked directly inside your grip.

### The Realms
1. **Burning Inferno** — Noise-displaced fire gradient.
2. **Neon Silhouette** — High-contrast cyan glow.
3. **Thermal Vision** — Intense heat-map color ramp.
4. **Matrix Dots** — Halftone green phosphor CRT grid.
5. **Glitch Signal** — Chromatic aberration and scanlines.
6. **Neon Edges** — Sobel edge detection in a cyberpunk palette.
7. **Constellation** — Deep-space node pulse with luminance sparks.

---

## ✦ Architecture

- **React 18 & TypeScript**: Core application and state management.
- **R3F & Three.js**: Canvas orchestration and fragment shader uniforms.
- **GLSL Shaders**: Highly optimized fragment pipeline, utilizing simplex noise, Sobel operators, and matrix convolutions in a single pass.
- **MediaPipe Tasks Vision**: Real-time hand landmark tracking at 30fps with automatic hardware-accelerated GPU delegates (and grace CPU fallbacks).
- **Tailwind CSS**: Structural UI and typography.

---

## ✦ Installation & Running Local

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/vespera.git

# Enter the directory
cd vespera

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Open `http://localhost:5173` in a modern browser. 
> **Note:** Vespera requires a device with a webcam and works best in well-lit environments. Tested on Chrome 120+ and Safari 17+. 

---

## ✦ Technical Highlights

### Single-Pass Composite Shader
Rather than computing visual effects via costly post-processing passes, Vespera determines inside/outside bounding boxes dynamically on the fragment scale, routing UV coordinates through conditional effect pipelines with precomputed luminance values to maintain peak performance on low-end hardware.

### Contextual Aesthetic
Vespera rejects gaming-style UI elements. Interfaces are rendered like museum plaques. Interactions operate exclusively off gesture recognition algorithms processing Euclidean distance between specific MediaPipe nodes (e.g., pinching `INDEX_FINGER_TIP` and `THUMB_TIP`).

---

## ✦ Privacy

Vespera is entirely client-side. WebAssembly and MediaPipe models are fetched via CDN, but your camera feed is processed **locally** in your browser memory. No recording is made. No video data is ever transmitted.

---

<div align="center">
  <p><i>Made with love by Harsh</i></p>
</div>
