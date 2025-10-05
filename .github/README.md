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
// src/main.js

const sketchFunction = async (sketch, state) => {
	sketch.setup = async () => {
		sketch.noStroke();

		// the `state` object stores shared values that update via the GUI
		state.circleColor = sketch.color(0);
		state.circleDiameter = 0.5;
		state.bgColor = sketch.color(0);
		state.nBgElements = 5;
	};

	sketch.draw = () => {
		// background ellipses
		sketch.fill(state.bgColor);
		let sx = state.width / state.nBgElements;
		let sy = state.height / state.nBgElements;
		for (let x = 0; x < state.nBgElements; x++) {
			for (let y = 0; y < state.nBgElements; y++) {
				sketch.ellipse((x + 0.5) * sx, (y + 0.5) * sy, sx, sy);
			}
		}

		// animated circle
		sketch.fill(state.circleColor);
		const diam =
			sketch.width *
			sketch.lerp(1 / state.nBgElements, 1, state.circleDiameter);
		const amp = (sketch.height - diam) / 2;
		// `state.progress` is automatically provided by p5Catalyst to animate over time
		sketch.circle(
			state.width / 2,
			state.height / 2 +
				sketch.sin(state.progress * sketch.TAU * 2) * amp,
			diam
		);
	};
};
```

### 4.2. GUI Definition: `createGui`

This section creates user-facing controls to interact with the sketch. Think of it as all of the controllers: sliders, color pickers, textboxes, etc.

Controllers are grouped into tabs and panels. All controllers can access `state` via a callback, so that they can store data there that can be accessed by the `sketchFunction`.

Naming controller, like 'sliderCircleDiameter', is important for plugin targeting, like randomization.

```js
const createGui = (gui, { state }) => {
	const appearanceTab = gui.getTab('appearance');

	const circlePanel = appearanceTab.addPanel('Circle', true);
	circlePanel.addColorBoxes(
		'colorBoxesCircle',
		'Circle color',
		['#FF2600', '#86D594', '#004D30', '#336DFF', '#F5CBFF'],
		0,
		(controller, value) => {
			state.circleColor = value;
		}
	);
	circlePanel.addSlider(
		'sliderCircleDiameter',
		'Circle size',
		0,
		1,
		state.circleDiameter,
		0.001,
		(controller, value) => {
			state.circleDiameter = value;
		}
	);

	const bgPanel = appearanceTab.addPanel('Background pattern', true);
	bgPanel.addColorBoxes(
		'colorBoxesBg',
		'Background color',
		['#FF2600', '#86D594', '#004D30', '#336DFF', '#F5CBFF'],
		3,
		(controller, value) => {
			state.bgColor = value;
		}
	);
	bgPanel.addSlider(
		'sliderNBg',
		'Number of ellipses',
		1,
		10,
		state.nBgElements,
		1,
		(controller, value) => {
			state.nBgElements = value;
		}
	);
};
```

### 4.3. Plugins

This section defines which p5Catalyst features your sketch will use. Many of these are additions to the GUI that add specific functionality, like video exporting.

```js
const plugins = [
	catalyst.defaultPlugin(), // adds state and time management
	catalyst.randomizerPlugin([
		// adds 🎲 randomization support for these controls
		'colorBoxesCircle',
		'sliderCircleDiameter',
		'colorBoxesBg',
		'sliderNBg',
	])
	catalyst.storeSettingsPlugin(), // allows saving and restoring settings
];
```

### 4.4. Best practices

-   Share `state` between the GUI and sketch by reading or updating variables inside the `state` variable.
-   Import additional modules (GUI definitions, data loaders, etc.) at the top of `main.js`.
-   Extract reusable logic into files in `src/` and `import` them into `main.js` as your project grows.

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
