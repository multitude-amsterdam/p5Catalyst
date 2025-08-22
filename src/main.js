import { catalyst } from './lib';

const sketchFunction = async (sketch, state) => {
	state.size = 50;
	state.width = 1080;
	state.height = 1920;
	state.color;

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
			state.height / 2 + sketch.sin(state.time * 100) * 700,
			state.size
		);
	};
};

const plugins = [
	catalyst.defaultPlugin(),
	catalyst.languagePlugin('en', {
		LANG_SLEEP: { nl: 'slapen', en: 'sleep' },
	}),
	catalyst.randomizerPlugin(['slider', 'colorBox']),
	catalyst.debugPlugin(),
];

catalyst.initialize(
	sketchFunction,
	(gui, state) => {
		const appearanceTab = gui.getTab('appearance');

		const panel = appearanceTab.addPanel('Panel');

		panel.addColourBoxes(
			'colorBox',
			'Circle Color',
			['red', 'green', 'yellow'],
			0,
			(controller, value) => {
				state.color = value;
			}
		);

		panel.addSlider(
			'slider',
			'Slider',
			1,
			500,
			100,
			1,
			(controller, value) => {
				state.size = value;
			}
		);
	},
	plugins
);
