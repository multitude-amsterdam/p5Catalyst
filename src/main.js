import { catalyst } from './lib';
import { languagePlugin, resolutionPlugin } from './lib/plugins';

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
};

const plugins = [
	resolutionPlugin(catalyst.resolutionPresets),
	languagePlugin('nl'),
];

catalyst.initialize(
	sketchFunction,
	gui => {
		gui.addTitle(20, 'LANG_WIDTH', false);
	},
	plugins
);
