import { catalyst } from './lib';

const sketchFunction = async (sketch, state) => {
	sketch.setup = async () => {
		sketch.noStroke();

		state.circleColor = sketch.color(0);
		state.circleDiameter = 0.5;
		state.bgColor = sketch.color(0);
		state.nBgElements = 5;
	};

	sketch.draw = () => {
		sketch.fill(state.bgColor);
		let sx = state.width / state.nBgElements;
		let sy = state.height / state.nBgElements;
		for (let x = 0; x < state.nBgElements; x++) {
			for (let y = 0; y < state.nBgElements; y++) {
				sketch.ellipse((x + 0.5) * sx, (y + 0.5) * sy, sx, sy);
			}
		}

		sketch.fill(state.circleColor);
		const diam =
			sketch.width *
			sketch.lerp(1 / state.nBgElements, 1, state.circleDiameter);
		const amp = (sketch.height - diam) / 2;
		sketch.circle(
			state.width / 2,
			state.height / 2 +
				sketch.sin(state.progress * sketch.TAU * 2) * amp,
			diam
		);
	};
};

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

const plugins = [
	catalyst.defaultPlugin(),
	catalyst.languagePlugin('en', {
		LANG_SLEEP: { nl: 'slapen', en: 'sleep' },
	}),
	catalyst.randomizerPlugin([
		'colorBoxesCircle',
		'sliderCircleDiameter',
		'colorBoxesBg',
		'sliderNBg',
	]),
	catalyst.debugPlugin(),
	catalyst.storeSettingsPlugin(),
];

catalyst.initialize(sketchFunction, createGui, plugins);
