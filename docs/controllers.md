# `controllers.js`

In this file you can find all controller types and their UX behavior:
- `Controller`: the main controller class that is also a `Field`.
- `ValuedController`: a `Controller` that has a value that can change. Most controllers are valued, some aren't, like buttons. Has a `randomize()` method for the `Randomizer` in `gui.js`.
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