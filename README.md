<div align="center">
  <h1 style="font-family: serif; letter-spacing: 0.4em; font-weight: 300;">V E S P E R A</h1>
  <p style="font-family: monospace; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(255,255,255,0.55);">Realtime gesture instrument</p>
</div>

<br />

A realtime gesture-powered visual instrument. It transforms the physical space between your hands into a dynamic digital canvas. No interface required, just your hands.

Built with **React Three Fiber**, **GLSL**, and **MediaPipe**.

---

## ✦ The Interaction 

Raise your hands to create a viewport. The space between your palms becomes an interactive shader canvas. Your hands are rendered as minimal skeletal overlays, while the surrounding environment gently desaturates to focus on the effect.

Pinch your thumb and index finger to cycle through different visual effects.

You can view the canvas as a single unified effect (Spotlight mode), or divided into three distinct horizontal slices (3 Frames mode).

### The Effects
1. **Inferno** — Noise-displaced fire gradient.
2. **Neon** — High-contrast cyan glow.
3. **Thermal** — Intense heat-map color ramp.
4. **Matrix** — Halftone green phosphor grid.
5. **Glitch** — Chromatic aberration and scanlines.
6. **Edges** — Sobel edge detection in a cyberpunk palette.
7. **Constellation** — Deep-space node pulse with luminance sparks.
8. **Glass** — Refractive frosted edge distortion that blends the environment.

---

## ✦ Architecture

- **React 18 & TypeScript**: Core application and state management.
- **R3F & Three.js**: Canvas orchestration and fragment shader uniforms.
- **GLSL Shaders**: Highly optimized fragment pipeline, utilizing simplex noise, Sobel operators, and matrix convolutions in a single pass.
- **MediaPipe Tasks Vision**: Real-time hand landmark tracking at 30fps with automatic hardware-accelerated GPU delegates.
- **Tailwind CSS**: Structural UI and typography.

---

## ✦ Installation & Running Local

```bash
# Clone the repository
git clone https://github.com/harshwaah/vespera.git

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
Rather than computing visual effects via costly post-processing passes, Vespera determines inside/outside bounding boxes dynamically on the fragment scale. It routes UV coordinates through conditional effect pipelines with precomputed luminance values to maintain peak performance on low-end hardware.

### Contextual Aesthetic
Vespera relies entirely on cinematic minimalism. Interfaces are rendered like museum plaques. Interactions operate exclusively off gesture recognition algorithms processing Euclidean distance between specific MediaPipe nodes (e.g., pinching `INDEX_FINGER_TIP` and `THUMB_TIP`).

---

## ✦ Privacy

Vespera is entirely client-side. WebAssembly and MediaPipe models are fetched via CDN, but your camera feed is processed **locally** in your browser memory. No recording is made. No video data is ever transmitted.

---

<div align="center">
  <p><i>Made with love by Harsh</i></p>
</div>
