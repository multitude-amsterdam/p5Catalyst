# 🧱 p5Catalyst code architecture

This document gives a structured overview of the `p5Catalyst` codebase, specifically focused on the `/app` directory. It helps new contributors or curious users to get oriented quickly.

---

## Main entrypoints

### `index.html`
Loads all scripts, serves as the HTML wrapper for the interactive app.

### `style.css`
Customise theme and layout styles here, including dark mode styles.

### `generator.js`
Your p5 sketch logic goes here, inside the `Generator` class. Use the `.setup()` and `.draw()` methods as you would with p5 normally. `Generator` is treated as the *engine* or *creative logic* of the app.

### `create-gui.js`
Defines the layout and behavior of GUI controls. `createGUI()`
- Connects each controller to values in `generator.js`.

### `sketch.js`
- Top-level `setup()` and `draw()` hooks for p5.
- Handles canvas, GUI setup, animation timing, and ffmpeg hooks.


---

## 🎛 GUI architecture

### `gui.js`

- Master controller for GUI layout.
- Manages themes, side toggles, controller logic.

### `controllers.js`

- Defines all controller types (sliders, buttons, file loaders).
- Includes serialization, randomizer support, and UX behavior.

---

## 🔁 State & history

### `changeset.js`

- Tracks undo/redo states.
- Saves and restores full UI + sketch states.

### `util.js` & `util-maths.js`

- Utility math, animation, and geometry functions.
- Randomness, color parsing, hashing, time logic, etc.

---

## 🌐 Language support

### `lang.js`

- Supports internationalization (`i18n`).
- Replace placeholders like `LANG_EXPORT` with localized text.

---

## 📽 Export system

### `ffmpeg.js`

- Uses `ffmpeg.wasm` to compile image frames into MP4 or WEBM.
- Frames are saved from canvas and processed client-side.

---

## 🧰 Optional libraries

### `toxiclibs-helper.js`

- Wraps `toxiclibs.js` for advanced geometry and physics.
- Useful for complex visual logic.

---

## ✅ How to contribute

- Build your creative logic in `generator.js`
- Add GUI controls via `create-gui.js`
- Use built-in utilities and styles to handle state, themes, and export

For help or feedback, check out [Creative Coding Amsterdam](https://cca.codes/) or open a GitHub issue.
