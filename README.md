[![p5BrandLab. Generative branding, open to all. Initiated by Multitude.](https://github.com/multitude-amsterdam/p5BrandLab/blob/main/p5BrandLab-header.svg?raw=true)](https://multitude.nl/ "Multitude")


![GitHub commit activity](https://img.shields.io/github/commit-activity/y/multitude-amsterdam/p5BrandLab?style=flat-square&color=7685F7)
[![GitHub contributors](https://img.shields.io/github/contributors/multitude-amsterdam/p5BrandLab?style=flat-square&color=7685F7)](https://github.com/multitude-amsterdam/p5BrandLab/blob/main/CONTRIBUTING.md)
[![p5BrandLab licence"](https://img.shields.io/github/license/multitude-amsterdam/p5BrandLab)](https://github.com/multitude-amsterdam/p5BrandLab/blob/main/LICENSE) 
[![p5BrandLab forks](https://img.shields.io/github/forks/multitude-amsterdam/p5BrandLab)](https://github.com/multitude-amsterdam/p5BrandLab/fork) 
[![p5BrandLab stars](https://img.shields.io/github/stars/multitude-amsterdam/p5BrandLab)](https://github.com/multitude-amsterdam/p5BrandLab/stargazers) 
[![p5BrandLab issues](https://img.shields.io/github/issues/multitude-amsterdam/p5BrandLab)](https://github.com/multitude-amsterdam/p5BrandLab/issues) 
[![p5BrandLab pull-requests](https://img.shields.io/github/issues-pr/multitude-amsterdam/p5BrandLab)](https://github.com/multitude-amsterdam/p5BrandLab/pulls)

<p align="center">
<a href="https://github.com/multitude-amsterdam/p5BrandLab/blob/main/LICENSE" target="blank">
<img src="https://img.shields.io/github/license/multitude-amsterdam/p5BrandLab" alt="p5BrandLab licence" />
</a>
<a href="https://github.com/multitude-amsterdam/p5BrandLab/fork" target="blank">
<img src="https://img.shields.io/github/forks/multitude-amsterdam/p5BrandLab" alt="p5BrandLab forks"/>
</a>
<a href="https://github.com/multitude-amsterdam/p5BrandLab/stargazers" target="blank">
<img src="https://img.shields.io/github/stars/multitude-amsterdam/p5BrandLab" alt="p5BrandLab stars"/>
</a>
<a href="https://github.com/multitude-amsterdam/p5BrandLab/issues" target="blank">
<img src="https://img.shields.io/github/issues/multitude-amsterdam/p5BrandLab" alt="p5BrandLab issues"/>
</a>
<a href="https://github.com/multitude-amsterdam/p5BrandLab/pulls" target="blank">
<img src="https://img.shields.io/github/issues-pr/multitude-amsterdam/p5BrandLab" alt="p5BrandLab pull-requests"/>
</a>
</p>


# 🧪 What is p5BrandLab?
At [Multitude](https://multitude.nl/), we believe branding should be **fluid, flexible, and future-proof**. Instead of static design systems, we embrace **generative branding**, where design systems evolve and adapt in real-time. **p5BrandLab** evolved for this purpose. 

**p5BrandLab** is an **open-source generative branding tool** that allows **creative coders** to create **dynamic visual identities** in a [p5.js](https://p5js.org/)-based environment.

With **p5BrandLab**, you can generate **professional brand-consistent visual content** by providing **high-quality assets** for web, print, or motion graphics.

See what the p5BrandLab generator looks like [on GitHub pages](https://multitude-amsterdam.github.io/p5BrandLab/).

p5BrandLab was initiated by creative agency [Multitude](https://multitude.nl/).


# 🛠️ Features
- **Generative templates**: define branded elements that evolve dynamically.
- **Modular & expandable**: the vanilla JavaScript framework affords adding custom classes and libraries as you go.
- **PNG & SVG exporting**: save your generated artwork in high-quality formats.
- **Video rendering**: uses `ffmpeg.wasm` for high-quality video exports.
- **Works in the browser**: no installation needed, fully web-based.
- **Dark mode support**: defaults to system theme.
- **Multi-language support**: add your own translations.
- **File I/O**: Save and load GUI settings. Also saves to `localStorage`.


# 🔁 Why open-source?


**p5BrandLab is our invitation to the creative coding community:** hack, extend, and redefine what branding can be. We encourage experimentation and collaboration—let’s build the future of visual identities, together 🌱.


# 📥 Installation & setup
To run p5BrandLab locally, follow these steps. 

## 1. Clone the repository
```sh
git clone https://github.com/multitude-amsterdam/p5BrandLab.git YOUR_PROJECT_NAME
cd YOUR_PROJECT_NAME
```
or alternatively, download the code as a ZIP file by clicking the "**<> Code**" button at the top-right of this page. ↗️

## 2. Start a local development server
You need to start a local web server ("dev server") to use p5 and the other libraries. Here are some options to do this in a command prompt window:

If you have Python installed:
```sh
python3 -m http.server 8000
```
If you PHP installed:
```sh
php -S localhost:8000
```
The app will be available at `http://localhost:8000`.

[More on running local web servers.](https://gist.github.com/jgravois/5e73b56fa7756fd00b89)

## 3. Create your generative sketch in `generator.js`
The `Generator` class in generator.js is designed to correspond with the `setup()` and `draw()` functions in p5. You can copy/paste your sketches in there. You won't need to use `createCanvas()`, as there is a `canvas` object available already. There is also some structure in place to help you get started with using shaders as well.
```javascript
class Generator {
	static name = 'Project Name';
	...
	setup() {
	...
	draw() {
	....
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

We encourage you to make modifications, improvements, or entirely new generators, it's easier than you think! 

Examples of contributions might be:
- New **features** for users
- New types of **GUI controllers**
- Implementing multi-threaded ffmpeg.wasm
- **Anything else** you might think of!

(If you're not already using a git client, we recommend using [GitHub Desktop](https://github.com/apps/desktop), it's an easy way to interface with GitHub and perform the following operations with ease.)

To contribute directly to this project:

1. **Fork** this repository
2. Create a **feature branch**
3. **Commit** your changes
4. **Push** the branch to your fork
5. Open a **pull request** with a clear description

For larger or structural changes, please **open an issue** first to discuss ideas and ensure alignment.


# 🌍 Sharing your work

If you've built something unique, whether it's a wild new generator, an adaptation for a client, or just a fun remix, **we'd love to see it 👀**!

- Open an issue to link your version
- Share screenshots or videos of your creations
- Mention us if you publish your forked project online

We kindly ask: **if you make something cool with p5BrandLab, please share it with us.**

By sharing your work, you help grow a creative ecosystem.


# ❤️‍🔥 Credits
Developed using [p5.js](https://p5js.org/), [toxiclibs.js](https://github.com/hapticdata/toxiclibsjs), and [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm).


# 🧾 License
This project is licensed under the **MIT License** – free to use and modify.


# 📢 Stay Updated
Follow the development and join the discussion:
- GitHub Discussions: [join the conversation](https://github.com/multitude-amsterdam/p5BrandLab/discussions)
- Multitude's Instagram: [@multitudecreativeagency](https://www.instagram.com/multitudecreativeagency/)
- Creative Coding Amsterdam: [join a Meetup](https://www.meetup.com/nl-NL/creative-coding-amsterdam/) and ask Aidan about this project in person 🤔🤔 or [find the Discord server here](https://cca.codes/) 👋
