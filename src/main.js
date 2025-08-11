import { catalyst } from './lib';

const sketchFunction = async (sketch, state) => {
	state.size = 50;

	let img;

	sketch.setup = async () => {
		img = await sketch.loadImage('assets/image.jpg');
	};

	sketch.draw = () => {
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
		gui.addSlider(
			'slider',
			'slider',
			0,
			500,
			20,
			1,
			(controller, value) => {
				state.size = value;
			}
		);
		gui.addCrementer('crementer', 'crementer', 0, 10, 1, 1);
		gui.addSelect('select', 'select', ['one', 'two', 'three'], 0);
		gui.addToggle('toggle', 'true', 'false', true);
		gui.addXYSlider('xyslider', 'xyslider', 0, 10, 1, 1, 0, 10, 1, 1);
		gui.addButton('undo', 'LANG_UNDO', controller => {
			gui.undo();
		});
		gui.addButton('redo', 'LANG_REDO', controller => {
			gui.redo();
		});
	},
	plugins
);
