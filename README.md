[![p5Catalyst. Generative branding, open to all. Initiated by Multitude.](https://github.com/multitude-amsterdam/p5Catalyst/blob/main/p5Catalyst-header.svg?raw=true)](https://multitude.nl/ "Multitude")

<p align="center" style="font-size:1.25em">
	<em>p5Catalyst is a wrapper for </em><code>p5.js</code><em> designed to easily create usable web apps for professional generative visuals.</em>
</p>

<p align="center">
	<img alt="p5Catalyst licence" src="https://img.shields.io/github/license/multitude-amsterdam/p5Catalyst?style=flat-square&color=78f">
	<img alt="p5Catalyst stars" src="https://img.shields.io/github/stars/multitude-amsterdam/p5Catalyst?style=flat-square&color=7685F7">
	<img alt="p5Catalyst watchers" src="https://img.shields.io/github/watchers/multitude-amsterdam/p5Catalyst?style=flat-square&color=7685F7">
	<img alt="p5Catalyst contributors" src="https://img.shields.io/github/contributors/multitude-amsterdam/p5Catalyst?style=flat-square&color=7685F7">
	<img alt="p5Catalyst commit activity" src="https://img.shields.io/github/commit-activity/y/multitude-amsterdam/p5Catalyst?style=flat-square&color=7685F7">
	<img alt="p5Catalyst forks" src="https://img.shields.io/github/forks/multitude-amsterdam/p5Catalyst?style=flat-square&color=7685F7">
	<img alt="p5Catalyst issues" src="https://img.shields.io/github/issues/multitude-amsterdam/p5Catalyst?style=flat-square&color=7685F7">
	<img alt="p5Catalyst pull-requests" src="https://img.shields.io/github/issues-pr/multitude-amsterdam/p5Catalyst?style=flat-square&color=7685F7">
</p>

<hr>


# 🧪 What is p5Catalyst?
At [Multitude](https://multitude.nl/), we believe branding should be **fluid, flexible, and future-proof**. Instead of static design systems, we embrace **generative branding**, where design systems evolve and adapt in real-time. **p5Catalyst** evolved for this purpose. 

**p5Catalyst** is an **open-source generative branding tool** that allows **creative coders** to create **dynamic visual identities** in a [p5.js](https://p5js.org/)-based environment.

With **p5Catalyst**, you can generate **professional brand-consistent visual content** by providing **high-quality assets** for web, print, or motion graphics.

p5Catalyst was initiated by creative agency [Multitude](https://multitude.nl/).


# 🛠️ Features
- **Generative templates**: define branded elements that evolve dynamically.
- **Modular & expandable**: the vanilla JavaScript framework affords adding custom classes and libraries as you go.
- **PNG & SVG exporting**: save your generated artwork in high-quality formats.
- **Video rendering**: uses `ffmpeg.wasm` for high-quality video exports.
- **Works in the browser**: no installation needed, fully web-based.
- **Dark mode support**: defaults to system theme.
- **Multi-language support**: add your own translations.
- **File I/O**: Save and load GUI settings. Also saves to `localStorage`.


# 👀 Demo

Load the project [on GitHub pages](https://multitude-amsterdam.github.io/p5Catalyst/app/)!


# 🔁 Why open-source?

**p5Catalyst is our invitation to the creative coding community:** hack, extend, and redefine what branding can be. We encourage experimentation and collaboration—let’s build the future of visual identities, together 🌱.


# 📥 Installation & setup
To run p5Catalyst locally, follow these steps. 

## 1. Clone the repository
```sh
git clone https://github.com/multitude-amsterdam/p5Catalyst.git YOUR_NEW_APP
```
or alternatively, download the code as a ZIP file by clicking the "**<> Code**" button at the top-right of this page. ↗️

## 2. Start a local development server
The `/app` directory holds the runnable website. You need to start a local web server (a "dev server") in this folder to use p5 and the other libraries. Opening the `index.html` file will not work on its own. Here are some options to do this in a command prompt window:

First, open a command prompt and navigate to the `/app` directory.
```sh
cd /Users/You/Your Github Folder/YOUR_NEW_APP/app
```

*If you have Python installed:*
```sh
python3 -m http.server 8000
```
*If you have Node.js installed:*
```sh
npx http-server -p 8000
```
*If you PHP installed:*
```sh
php -S localhost:8000
```
The app will be up and running at `http://localhost:8000`.

[More on running local web servers by Mozilla.](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Tools_and_setup/set_up_a_local_testing_server)

## 3. Create your generative sketch in `generator.js`
The `Generator` class in generator.js is designed to correspond with the `setup()` and `draw()` functions in p5. You can copy/paste your sketches in there. You won't need to use `createCanvas()`, as there is a `canvas` object available already. There is also some structure in place to help you get started with using shaders as well.
```javascript
class Generator {
	static name = 'Project Name';
	...
	setup() {
	...
	draw() {
	...
```

## 4. Create GUI elements in `create-gui.js`
There is a custom set of GUI controller classes that can be used, including sliders, text boxes, buttons, colour selectors, dropdowns and a toggle. You can add custom callback functions to handle the data from these DOM elements.
```javascript
...
gui.addController(new ColourBoxes(
	gui, 'colourBoxesBirdCol', 'Bird flock colour', generator.birdPalette, 0,
	(controller, value) => {
		generator.birdCol = value;
	}
));
...
```

## 5. Customise the styling in `style.css`
Most of the styling variables can be found under `:root`, like colours, sizes and font settings.
```css
:root {
	...
	--gui-base-col: #7685F7;
	...
```

That's it! You can now host the application 😶‍🌫️ and send it to your client or users for testing.


# 🤝 Contributing

We encourage you to make modifications, improvements, or entirely new generators, it's easier than you think! For more info, see [CONTRIBUTING.md](https://github.com/multitude-amsterdam/p5Catalyst/blob/main/CONTRIBUTING.md).

For security concerns, please review the [security policy](./SECURITY.md).


# 🌍 Sharing your work

If you've built something unique, whether it's a wild new generator, an adaptation for a client, or just a fun remix, **we'd love to see it 👀**!

- Open an issue to link your version
- Share screenshots or videos of your creations
- Mention us if you publish your forked project online

We kindly ask: if you make something cool with p5Catalyst, please share it with us in the [Show and tell sectgion of the Discussions](https://github.com/multitude-amsterdam/p5Catalyst/discussions/categories/show-and-tell)!


# ❤️‍🔥 Credits
Developed using [p5.js](https://p5js.org/), [p5.js-svg](https://github.com/zenozeng/p5.js-svg), [toxiclibs.js](https://github.com/hapticdata/toxiclibsjs), and [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm).


# 🧾 License
This project is licensed under the **MIT License**: free to use and modify.


# 📢 Stay Updated
Follow the development and join the discussion:
- GitHub Discussions: [join the conversation](https://github.com/multitude-amsterdam/p5Catalyst/discussions)
- Multitude's Instagram: [@multitudecreativeagency](https://www.instagram.com/multitudecreativeagency/)
- Creative Coding Amsterdam: [join a Meetup](https://www.meetup.com/nl-NL/creative-coding-amsterdam/) and ask Aidan about this project in person 🤔🤔 or [find the Discord server here](https://cca.codes/) 👋
