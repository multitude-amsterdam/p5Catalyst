import { catalyst } from './lib';

const sketchFunction = async (sketch, state) => {
	state.size = 50;
	state.width = 50;
	state.height = 300;
	state.color;

	let img;

	sketch.setup = async () => {
		img = await sketch.loadImage('assets/image.jpg');
	};

	sketch.draw = () => {
		sketch.fill(state.color);
		sketch.image(img, 0, 0, state.width, state.height);
		sketch.circle(sketch.mouseX, sketch.mouseY, state.size);
		sketch.circle(200, 200, state.size * 2);
	};
};

const plugins = [
	catalyst.resolutionPlugin(catalyst.resolutionPresets),
	catalyst.languagePlugin('nl', {
		LANG_SLEEP: {
			nl: 'slaapen',
			en: 'sleep',
		},
	}),
];

catalyst.initialize(
	sketchFunction,
	(gui, state) => {
		gui.addTitle(20, 'LANG_SLEEP', false);
		gui.addTextField('hey there, this is a very neat text :)');
		gui.addToggle('toggle', 'true', 'false', false);
		gui.addSlider('slider', 'slider', 0, 500, 5, 1, (controller, value) => {
			state.size = value;
		});
		gui.addTextbox(
			'textbox',
			'textbox',
			'hey there',
			(controller, value) => {
				console.log(value);
			}
		);
		gui.addCrementer('crementer', 'crementer', 0, 10, 5, 1);
		gui.addColourBoxes(
			'boxes',
			'boxes',
			['red', 'blue'],
			0,
			(controller, value) => {
				state.color = value;
			}
		);
		gui.addImageLoader(
			'imageLoader',
			'imageLoader',
			(controller, value) => {
				state.loadedImage = value;
			}
		);
		gui.addJSONLoader('json', 'json', (controller, value) => {
			console.log(value);
		});
		gui.addTextLoader('text', 'text', (controller, value) => {
			console.log(value);
		});
	},
	plugins
);
