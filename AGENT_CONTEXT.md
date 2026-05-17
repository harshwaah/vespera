# Vespera: Agent Context & Technical Architecture

This file serves as the single source of truth for coding agents, AI models, and future human contributors working on Vespera.

## 1. Overview
Vespera is a realtime gesture-powered visual instrument. It is not a traditional camera filter app. Instead, it turns the tracked region between a user's hands into a realtime shader viewport where dynamic, generative effects are rendered. The physical bounds of the user's hands define the digital canvas.

## 2. Tech Stack
- **Framework:** React 18
- **Language:** TypeScript
- **3D Rendering:** React Three Fiber & Three.js
- **Shaders:** GLSL (WebGL 1.0 / WebGL 2.0 via Three.js)
- **Computer Vision:** MediaPipe Tasks Vision (Hand Landmarker)
- **Styling:** Tailwind CSS + Vanilla CSS

## 3. Rendering Pipeline
The application captures the user's webcam feed and feeds it into two parallel pipelines:
1. **MediaPipe Tracking Pipeline:** Analyzes frames to detect hand landmarks. Calculates the bounding box between the left and right hands.
2. **Three.js Shader Pipeline:** A single full-screen `<planeGeometry>` renders a fragment shader (`src/shaders/fragment.glsl`). The shader receives the webcam feed as a `uTexture` uniform.
   
The fragment shader uses the `uBox` uniform (calculated from MediaPipe) to determine whether a pixel is "inside" or "outside" the active area between the hands. 
- Pixels *outside* the box are rendered as desaturated grayscale.
- Pixels *inside* the box run complex generative effect math.

## 4. Gesture System
Tracking is handled in `src/hooks/useHandTracker.ts`.
- **Initialization:** MediaPipe's `HandLandmarker` is loaded via WASM.
- **Bounding Box:** The bounding box logic finds the outermost edges of the hands to form the interactive region.
- **Pinch Gesture:** Detecting a pinch between the thumb and index finger triggers an effect switch (`setEffectIndex`).

## 5. State Architecture
- **Global UI State:** Managed in `src/App.tsx`. Includes loading states, error states, and the currently selected effect index.
- **Performance State:** Bounding box coordinates (`boxRef`) and hand landmark data (`handsRef`) are stored in React `useRef` to avoid unnecessary re-renders. They are updated continuously in the `requestAnimationFrame` loop.
- **Shader Uniforms:** Updated every frame via `@react-three/fiber`'s `useFrame` hook in `EffectsCanvas.tsx`.

## 6. Effect System
Effects are defined purely in math within `fragment.glsl`.
- Effects are routed based on the `uEffect` uniform (or `activeEffect` in GLSL).
- **Single Mode:** The entire bounding box renders one effect.
- **Triple Frame Mode (`uMode == 1.0`):** The bounding box is sliced horizontally into three independent strips. The top strip uses Ghost Glass, the middle uses the current user-selected effect, and the bottom uses Thermal Vision.

## 7. Design Language
Vespera adheres to a **cinematic minimalism** design language.
- **Aesthetic:** Apple experimental demos, Teenage Engineering, Nothing, linear, museum-tech installations.
- **Typography:** Monospace, tracked out (`letter-spacing: 0.15em`), uppercase, small font sizes.
- **Colors:** Deep blacks, translucent blacks with `backdrop-filter: blur()`, soft whites, and low-opacity borders.
- **Copywriting:** Human, playful, tactile, and immediately understandable. 
  - *Do NOT use:* "Reveal the rift", "Shift reality", "Portal", "Dimension".
  - *USE:* "Raise your hands", "Pinch to switch effects", "Spotlight", "3 Frames".

## 8. Performance Constraints
- **NO duplicate texture reads:** Do not call `texture2D` inside complex loops or conditional branches if it can be pre-sampled. Vespera pre-samples necessary textures (e.g., base color, Sobel neighborhood) once at the top of the fragment shader.
- **NO React State for 60fps tracking:** Never put hand landmarks or bounding boxes in `useState`. Use `useRef` and mutate directly.
- **Avoid Expensive Shader Math where possible:** Use analytical gradients instead of complex branching.

## 9. Coding Rules
- **Naming Conventions:** Use clear, descriptive names. No "magic" or "sci-fi" variable names in code.
- **Shader Organization:** Keep helper functions at the top, pre-sampling in the middle, and effect routing at the bottom.
- **Component Boundaries:** Separation of concerns. `App.tsx` handles UI/State. `EffectsCanvas.tsx` handles Three.js. `OverlayCanvas.tsx` handles 2D hand skeleton rendering.

## 10. Future Expansion Notes
To add a new effect:
1. Update `EFFECT_NAMES` array in `EffectsCanvas.tsx`.
2. Add a new `else if (activeEffect < X.5)` block in `fragment.glsl`.
3. Keep the math performant and ensure it plays well with the Triple Frame slicing.
