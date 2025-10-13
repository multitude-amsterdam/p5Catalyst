![p5Catalyst](./../public/assets/p5catalyst-logo-dark.svg#gh-dark-mode-only)
![p5Catalyst](./../public/assets/p5catalyst-logo-light.svg#gh-light-mode-only)

<p align="center">
	<a style="text-decoration:none !important;" href="./LICENSE"><img alt="p5Catalyst license" src="https://img.shields.io/github/license/multitude-amsterdam/p5Catalyst?style=flat-square&color=336DFF"></a>
	<a style="text-decoration:none !important;" href="https://github.com/multitude-amsterdam/p5Catalyst/stargazers"><img alt="p5Catalyst stars" src="https://img.shields.io/github/stars/multitude-amsterdam/p5Catalyst?style=flat-square&color=336DFF"></a>
	<a style="text-decoration:none !important;" href="https://github.com/multitude-amsterdam/p5Catalyst/graphs/contributors"><img alt="p5Catalyst contributors" src="https://img.shields.io/github/contributors/multitude-amsterdam/p5Catalyst?style=flat-square&color=336DFF"></a>
	<a style="text-decoration:none !important;" href="https://github.com/multitude-amsterdam/p5Catalyst/graphs/commit-activity"><img alt="p5Catalyst commit activity" src="https://img.shields.io/github/commit-activity/t/multitude-amsterdam/p5Catalyst?style=flat-square&color=336DFF"></a>
	<a style="text-decoration:none !important;" href="https://github.com/multitude-amsterdam/p5Catalyst/forks"><img alt="p5Catalyst forks" src="https://img.shields.io/github/forks/multitude-amsterdam/p5Catalyst?style=flat-square&color=336DFF"></a>
	<a style="text-decoration:none !important;" href="https://github.com/multitude-amsterdam/p5Catalyst/issues"><img alt="p5Catalyst issues" src="https://img.shields.io/github/issues/multitude-amsterdam/p5Catalyst?style=flat-square&color=336DFF"></a>
	<a style="text-decoration:none !important;" href="https://github.com/multitude-amsterdam/p5Catalyst/pulls"><img alt="p5Catalyst pull-requests" src="https://img.shields.io/github/issues-pr/multitude-amsterdam/p5Catalyst?style=flat-square&color=336DFF"></a>
</p>

---

# 🧪 What is p5Catalyst?

p5Catalyst is a GUI framework that wraps your `p5.js` sketches into polished, interactive web apps—ready for real-time control, asset exporting and daily use. Whether you're building generative art, data visualizations, or dynamic brand systems, p5Catalyst gives your sketches the structure and tooling they need to go beyond the sketchpad—into production, publication, or public play.

Initiated by creative agency [Multitude](https://multitude.nl/), p5Catalyst grew out of real-world branding needs, and is now shared as a creative coding tool for everyone.

![p5Catalyst demo](./demo-dark.png#gh-dark-mode-only)
![p5Catalyst demo](./demo-light.png#gh-light-mode-only)

# 👀 Demo

[See it in action!](https://multitude-amsterdam.github.io/p5Catalyst)

# 🛠️ Features

-   **Sketch integration**: integrate a finished p5 sketch easily.
-   **Lives in the browser**: no install required, shareable and hackable by default.
-   **Built-in GUI system**: add sliders, dropdowns, toggles, and color pickers with minimal setup.
-   **Export support**: save outputs as PNG or video: PNG frames, MP4 or transparent WEBM.
-   **Theming**: GUI respects system theme and the light and dark themes are easy to style.
-   **File I/O**: save/load user settings.
<!-- -   **Change history**: use CTRL+Z and CTRL+SHIFT+Z to undo and redo changes. -->
-   **Change history**: undo and redo changes.
-   **Internationalization**: plug in translations for global-ready tools.

# 🔁 Why open-source?

At [Multitude](https://multitude.nl/), we believe branding should be fluid, flexible, and future-proof. Instead of static design systems, we embrace generative branding, where design systems evolve and adapt in real-time.

We originally started building p5Catalyst to give our clients control over the generative brand systems we designed. Now we're sharing it to help other creative coders do the same, and more!

Let's build the future of generative design!

# 📥 Installation & setup

The project now uses [Vite](https://vitejs.dev/) for development and builds. Follow the steps below to get started.

## 1. Clone the repository

```sh
git clone https://github.com/multitude-amsterdam/p5Catalyst.git YOUR_NEW_APP_NAME
```

or alternatively, download the code as a ZIP file by clicking the **`<> Code`** button at the top-right of this page. ↗️

## 2. Install dependencies with npm

Vite relies on Node.js tooling. Make sure you have [Node.js](https://nodejs.org/en/download) (which includes `npm`) installed, then install the project dependencies:

```sh
cd YOUR_NEW_APP_NAME
npm install
```

This command downloads the packages listed in `package.json`.

## 3. Run the development server

Start an interactive development environment:

```sh
npm run dev
```

Vite will print a local URL (usually `http://localhost:5173`) where you can preview p5Catalyst while you work. You can run "`o`" in the terminal to open the web page in your browser.

## 4. Develop your sketch

[`src/main.js`](./../src/main.js) is the single entry point that Vite loads. It initializes the GUI layer and spins up a p5 sketch in **instance mode**, meaning all sketch functions live on the `sketch` argument, rather than the global scope. Instance mode keeps the sketch encapsulated and avoids global name collisions as the project grows.

`src/main.js` is the main entrypoint for the p5 sketch. Using p5Catalyst here is done in three parts.

### 4.1. Sketch definition: `sketchFunction`

This is where your setup() and draw() functions live, just like in a regular p5 sketch.

```js
// src/sketch.js

export const sketchSeed = async sketch => {
	sketch.setup = async () => {
		sketch.circleDiameter = 0.5;
		sketch.circleColor = sketch.color(0);
		sketch.bgColor = sketch.color(0);

		sketch.noStroke();
	};

	sketch.draw = () => {
		// background ellipses
		sketch.background(sketch.bgColor);

		// method provided by p5Catalyst to display a backdrop image
		sketch.attemptDrawBackdrop();

		// animated circle
		sketch.fill(sketch.circleColor);
		const diam =
			sketch.width *
			sketch.lerp(1 / sketch.nBgElements, 1, sketch.circleDiameter);
		const amp = (sketch.height - diam) / 2;
		// `sketch.progress` is automatically provided by p5Catalyst to animate over time
		sketch.circle(
			sketch.width / 2,
			sketch.height / 2 +
				sketch.sin(sketch.progress * sketch.TAU * 2) * amp,
			diam
		);

		// method provided by p5Catalyst to display an overlay image
		sketch.attemptDrawOverlay();
	};
};
```

### 4.2. GUI Definition: `createGui`

This section creates user-facing controls to interact with the sketch. Think of it as all of the controllers: sliders, color pickers, textboxes, etc.

Controllers are grouped into tabs and panels. All controllers can access `state` via a callback, so that they can store data there that can be accessed by the `sketchFunction`.

Naming controller, like 'sliderCircleDiameter', is important for plugin targeting, like randomization.

```js
export function createGui(gui, sketch) {
	// get the 'Appearance' tab that is proved by p5Catalyst in `defaultPlugins`
	const appearanceTab = gui.getTab('appearance');

	// add a new collapsable panel to contain the controllers
	const circlePanel = appearanceTab?.addPanel('Circle', true);

	// add a color picker with multiple colored boxes
	circlePanel?.addColorBoxes(
		'colorBoxesCircle',
		'Circle color',
		['#FF2600', '#86D594', '#004D30', '#336DFF', '#F5CBFF'],
		0,
		(controller, value) => {
			// these callback are called when the controller's value changes
			sketch.circleColor = value;
		}
	);

	circlePanel?.addSlider(
		'sliderCircleDiameter',
		'Circle size',
		0,
		1,
		sketch.circleDiameter,
		0.001,
		(controller, value) => {
			sketch.circleDiameter = value;
		}
	);

	// add another collapsible panel
	const bgPanel = appearanceTab?.addPanel('Background pattern', true);

	bgPanel?.addColorBoxes(
		'colorBoxesBg',
		'Background color',
		['#FF2600', '#86D594', '#004D30', '#336DFF', '#F5CBFF'],
		3,
		(controller, value) => {
			sketch.bgColor = value;
		}
	);
}
```

### 4.3. Plugins

This section defines which p5Catalyst features your sketch will use. Many of these are additions to the GUI that add specific functionality, like video exporting.

```js
export const plugins = [
	// set the title of your app
	appTitlePlugin('CircleGen'),

	// add the default plugins
	...defaultPlugins,

	// add a randomizer (dice icons) on controllers by name
	randomizerPlugin([
		'colorBoxesCircle',
		'sliderCircleDiameter',
		'colorBoxesBg',
		'sliderNBg',
	]),

	// create your own custom plugin to run code at specific times during initialization
	{
		name: 'customPlugin',
		beforeGuiExists(sketch, config) {
			console.log('beforeGuiExists!');
		},
		beforeUserCreatesGui: (gui, sketch, config) => {
			console.log('beforeUserCreatesGui!');
		},
		afterUserCreatesGui: (gui, sketch, config) => {
			console.log('afterUserCreatesGui!');
		},
	},
];
```

### 4.4. Best practices

-   Extract your reusable code into JavaScript or TypeScript files in `src/` and `import` them into `sketch.js` as your project grows.
-   Share `sketch` between the GUI and sketch by reading or updating variables inside the `sketch` variable.
-   Access `sketch.catalyst` for additional fields provided by p5Catalyst, including properties:
    -   `isPlaying`: a flag to pause the updateing of `sketch.frameCount`, which causes a pause in `sketch.catalyst.progress` and `sketch.catalyst.time`
    -   `isRecording`: flag to indicate when frames are being saved for video exporting
    -   `animationFrameCount`: the number of frames to record for video export
    -   `exportStage`: a string describing the stage in video exporting (`"idle"`, `"recording "` or `"exporting"`)
    -   `duration`: suration of the animation setting in seconds
    -   `fps`: the set frame rate
    -   `mouseWheelScale`: a scaling factor that updates when a mousewheel event happens
    -   `sessionId`: a unique string per page load
    -   `sessionHash`: a unique number between 0–1
    -   And a bunch of helper methods (see: (p5Catalyst.ts)[../src/lib/Catalyst.ts])

### 5. Style the GUI

```css
/* src/style.css */

body {
	/* edit colors and other variables here */
	--base-col: #336dff;
	--text-col-on-base: var(--bg-col);
	--hover-col: #90de00;
	--focus-col: var(--hover-col);
}
```

## 6. Build for production

When you're ready to create an optimized build, run:

```sh
npm run build
```

If there are no errors, the project has now been built into the `dist/` directory and you can plop it in on a server with FTP.

# 🗞️ Updating your project

When you clone this repo and create a project out of it, you also disconnect from any updates to this repo. To update your project to match this repo, you can merge this main repo into your clone.

## 1. Add this repo to your clone as a `remote`:

```sh
git remote add p5catalyst https://github.com/multitude-amsterdam/p5Catalyst.git
```

## 2. Fetch the updates:

```sh
git fetch catalyst
```

You can view these changes with:

```sh
git diff main..p5catalyst/main
```

Or just for an overview:

```sh
git diff --stat main..p5catalyst/main
```

## 3. Merge into your local clone:

```sh
git merge p5catalyst/main
```

If any merge conflicts arise, you will need to resolve these in your editor.

## 4. Commit changes

```sh
git add .
git commit -m "p5catalyst update"
```

Done!

# 🌍 Sharing your work

We kindly ask: if you make something cool with p5Catalyst, please share it! Whether it's a wild new web app, an adaptation for a client, or just a fun remix, **we'd love to see it 👀**!

-   Create a new thread in the [**Show and tell section of the Discussions**](https://github.com/multitude-amsterdam/p5Catalyst/discussions/categories/show-and-tell)
-   Share **screenshots** or videos of your creations
-   Mention us if you publish your forked project online

Keep in mind the [**Community Code of Conduct**](./CODE_OF_CONDUCT.md) for this project.

# 🤝 Contributing

We encourage you to make modifications, improvements, or entirely new generators, it's easier than you think! For more information on contributing, continue reading [here](./CONTRIBUTING.md).

For security concerns, please review the [security policy](./SECURITY.md).

<a href="https://github.com/multitude-amsterdam/p5Catalyst/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=multitude-amsterdam/p5Catalyst" />
</a>

# ❤️‍🔥 Credits

Developed using [p5.js](https://p5js.org/) and [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm).

# 🧾 License

This project is licensed under the [**MIT License**](./../LICENSE): free to use and modify.

# 📢 Stay Updated

Follow the development and join the discussion:

-   GitHub Discussions: [join the conversation](https://github.com/multitude-amsterdam/p5Catalyst/discussions)
-   Multitude's Instagram: [@multitudecreativeagency](https://www.instagram.com/multitudecreativeagency/)

```

```

```

```
