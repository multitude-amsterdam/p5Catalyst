import { catalyst } from './lib';

const sketchFunction = async (sketch, state) => {
	state.size = 50;

	sketch.setup = async () => {
		state.color = sketch.color(0);

		sketch.angleMode(sketch.DEGREES);
		sketch.noStroke();
		sketch.frameRate(60);
	};

	sketch.draw = () => {
		sketch.fill(0, 0, 255);
		let sx = state.width / 5;
		let sy = state.height / 5;
		for (let x = 0; x < 5; x++) {
			for (let y = 0; y < 5; y++) {
				sketch.ellipse((x + 0.5) * sx, (y + 0.5) * sy, sx, sy);
			}
		}

		sketch.fill(state.color);
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

		panel.addColorBoxes(
			'colorBox',
			'Circle color',
			['#FF6400', '#86D594', '#004D30', '#002835ff', '#8373FF'],
			0,
			(controller, value) => {
				state.color = value;
			}
		);

		panel.addSlider(
			'slider',
			'Circle size',
			1,
			500,
			100,
			1,
			(controller, value) => {
				state.size = value;
			}
		);

		panel.open();
	},
	plugins
);
