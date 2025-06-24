# 🧱 p5Catalyst code architecture

This document gives a structured overview of the `p5Catalyst` codebase, specifically focused on the `/app` directory. It helps new contributors or curious users to get oriented quickly.

---

## 📃 Outline of `/app`
```
index.html
style.css
assets/
	favicon.png
	generator-logo.svg
	p5catalyst-logo-darkmode.svg
	p5catalyst-logo-lightmode.svg
	dark-mode/
		auto-mode-icon.svg
		dark-mode-icon.svg
		light-mode-icon.svg
	dice/
		die (1).svg
		die (2).svg
		die (3).svg
		die (4).svg
		die (5).svg
		die (6).svg
ffmpeg/
	ffmpeg.js
	core/
		ffmpeg-core.js
		ffmpeg-core.wasm
	ffmpeg/
		814.ffmpeg.js
		814.ffmpeg.js.map
		ffmpeg.js
		ffmpeg.js.map
	util/
		index.js
scripts/
	changeset.js
	create-gui.js
	generator.js
	lang.js
	sketch.js
	lib/
		controllers.js
		gui.js
		p5.min-1.6.1.js
		p5.svg-1.5.1.js
		toxiclibs-helper.js
		toxiclibs.min.js
		util-maths.js
		util.js
	shader/
		shader.frag
		shader.vert

(auxiliary)
demo.html
demo/
	assets/
		felix.jpg
		meowtrition.png
	scripts/
		create-gui-demo.js
		generator-demo.js
```

---

## ⬇️ Main entrypoints

### `index.html`
Loads all scripts, serves as the HTML wrapper for the interactive app.

### `style.css`
Customise theme and layout styles here, including dark mode styles.

### `generator.js`
Your p5 sketch logic goes here, inside the `Generator` class. Use the `.setup()` and `.draw()` methods as you would with p5 normally. `Generator` is treated as the *engine* or *creative logic* of the app.

### `create-gui.js`
Defines the layout and behavior of GUI controls in a single function, `createGUI()` that is called in the master `setup()` in `sketch.js`. Connects each controller to values in `generator.js`.

### `sketch.js`
Top-level `setup()` and `draw()` hooks for p5. Handles canvas (auto resizing for example), GUI setup, animation timing, and ffmpeg (video) hooks. 


## 🎛️ GUI architecture

### `gui.js`
The `GUIforP5` class is the master controller for GUI layout. Manages `Field`s, `Controller`s, dark mode, side toggles, and some controller logic.
In this file, you can also find the following classes:
- `Randomizer`: GUI randomizer.
- `DieIcon`: class to manage the 🎲 next to controllers in the GUI.
- `Field`: master class of a GUI item.
- `Label`: label for a controller.
- `Title`: title field item.
- `Textfield`: a `<p>` item wrapper.
- `GUIImage`: a `<img>` wrapper.
- `Divider`: a `<hr>` wrapper.

### `controllers.js`
Defines all controller types. Includes serialisation, randomizer support, and UX behavior.
In this file you may find the following `Controller` classes:
- `Controller`: the main controller class that is also a `Field`.
- `ValuedController`: a `Controller` that has a value that can change. Most controllers are valued, some aren't, like buttons.
- `Button`: a button `Controller`.
- `FileLoader`: a `Button` for loading in file data.
- `TextFileLoader`: a `FileLoader` for text files.
- `JSONFileLoader`: a `FileLoader` for JSON files.
- `ImageLoader`: a `FileLoader` for images.
- `Toggle`: a `ValuedController` that can be either `true` or `false`.
- `Select`: a `ValuedController` that creates a dropdown menu with `<select>`.
- `ResolutionSelect`: a `Select` that changes the size of the canvas with `canvas.resize()`, handled in `sketch.js`. Takes in presets defined in `create-gui.js`. 
- `Slider`: a `ValuedController` that implements a range slider.
- `XYSlider`: a `ValuedController` that creates a 2D slider from a div with a draggable handle (a personal favourite).
- `ColourBoxes`: a `ValuedController` that creates a set of radio buttons styled as selectable plain colour fields.
- `Textbox`: a `ValuedController` for a text `<input>`.
- `ResolutionTextboxes`: a `ValuedController` that uses two `TextBox`es to create an alternative way to set the width and height of the canvas. 
- `Textarea`: a `ValuedController` for a `<textarea>`.
- `ColourTextArea`: a `Textarea` in which you can type a list of hex colours, like this: `#ff0000, #00ff00, #0000ff`, which will output a `value` of an array of `p5.Color`s.

For any `Controller`, the main callback function passed into it will trigger when the controller is triggered, like this:
```js
const triggerButton = new Button(
	gui, 'buttonTrigger', 'Do something!',
	(controller) => {
		doSomething();
	}
);

```
You can add an optional `setupCallback` function which calls after the GUI item is created:
```js
const triggerButton = new Button(
	gui, 'buttonTrigger', 'Do something!',
	(controller) => {
		doSomething();
	},
	(controller) => {
		// simulate a click on loading the app
		controller.click();
	}
);

```
Any `ValuedController` importantly also passes its updated value to the callback to be used elsewhere in the system. I usually link it to `generator` like so, also using data from `generator` to construct the controller:

```js
const fgColBoxes = new ColourBoxes(
	gui, 'colourBoxesFgCol', 'Foreground colour', generator.palette, 0,
	(controller, value) => {
		generator.fgCol = value;
	}
);

```

## ⏰ State & history

### `changeset.js`
Tracks undo/redo `gui` and `generator` states. It saves JSON serialisations of these two objects to an array that can be indexed to restore these states. Any change will save the entire state of the app.


## 🌐 Language support

### `lang.js`
Supports internationalisation. Adding `?lang=en` to the URL will force english. Add translations and a language key (eg., `fr`). Use these translations anywhere in your code (after `lang.js` has loaded) with `lang.process('YOUR_MESSAGE_KEY')`.


## 📽 Export system

### `/ffmpeg/ffmpeg.js`
Uses `ffmpeg.wasm` to compile image frames into MP4 or WEBM. Frames are saved from canvas and processed client-side in a local, fenced-off file system (`FS`).


### ⛑️ `util.js` & `util-maths.js`
Randomness, color parsing, hashing, time logic and more. Utility animation math, and geometry functions.

---

# 🪀 Made something cool?
Please [share it](https://github.com/multitude-amsterdam/p5Catalyst/discussions/categories/show-and-tell), or consider [contributing](./contributing)!

---