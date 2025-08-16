import { catalyst } from './lib';

const sketchFunction = async (sketch, state) => {
	state.size = 50;
	state.color;

	let img;

	sketch.setup = async () => {
		state.color = sketch.color(0);
		sketch.angleMode(sketch.DEGREES);
		sketch.noStroke();
		sketch.frameRate(60);
	};

	sketch.draw = () => {
		sketch.fill(state.color);
		sketch.background(0, 0, 255);
		sketch.circle(
			state.width / 2,
			state.height / 2 + sketch.sin(sketch.frameCount * 2) * 700,
			state.size
		);
	};

	sketch.keyPressed = event => {
		console.log(event);
	};
};

const plugins = [
	catalyst.defaultPlugin(),
	catalyst.languagePlugin('en', {
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
