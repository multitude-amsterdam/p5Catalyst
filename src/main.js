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

	sketch.keyPressed = event => {
		sketch.frameCount = 0;
	};
};

const plugins = [
	catalyst.defaultPlugin(),
	catalyst.languagePlugin('en', {
		LANG_SLEEP: { nl: 'slapen', en: 'sleep' },
	}),
	catalyst.randomizerPlugin(['slider', 'colorBox']),
];

catalyst
	.initialize(
		sketchFunction,
		(gui, state) => {
			const colorBox = gui.addColourBoxes(
				'colorBox',
				'Circle Color',
				['red', 'green', 'yellow'],
				0,
				(controller, value) => {
					state.color = value;
				}
			);
			const slider = gui.addSlider(
				'slider',
				'slider',
				1,
				500,
				100,
				1,
				(controller, value) => {
					state.size = value;
				}
			);

			const panel = gui.addPanel('Panel');

			panel.addFields([colorBox, slider]);

			gui.getTab('appearance').addFields(panel);
		},
		plugins
	)
	.then(({ container, gui }) => {
		globalThis.gui = gui;
		globalThis.container = container;
		globalThis.state = container.state;
	});
