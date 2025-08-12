import { catalyst } from './lib';

const sketchFunction = async (sketch, state) => {
	state.size = 50;
	state.color;

	let img;

	sketch.setup = async () => {
		img = await sketch.loadImage('assets/image.jpg');
		state.color = sketch.color(0);
	};

	sketch.draw = () => {
		sketch.fill(state.color);
		sketch.image(img, 0, 0, state.width, state.height);
		sketch.circle(sketch.mouseX, sketch.mouseY, state.size);
		sketch.circle(200, 200, state.size * 2);
	};

	sketch.keyPressed = event => {
		console.log(event);
	};
};

const plugins = [
	catalyst.defaultPlugin(),
	catalyst.languagePlugin('nl', {
		LANG_SLEEP: { nl: 'slapen', en: 'sleep' },
	}),
	catalyst.randomizerPlugin(['slider', 'select']),
];

catalyst.initialize(
	sketchFunction,
	(gui, state) => {
		gui.addColourBoxes(
			'colorBox',
			'colorBox',
			['red', '#00bf0073', 'blue'],
			0,
			(controller, value) => {
				state.color = value;
			}
		);
		gui.addSlider(
			'slider',
			'slider',
			0,
			500,
			250,
			1,
			(controller, value) => {
				state.size = value;
			}
		);
	},
	plugins
);
