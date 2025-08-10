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
	catalyst.setConfigPlugin({ fileName: 'mySketch' }),
	catalyst.resolutionPlugin(catalyst.resolutionPresets),
	catalyst.languagePlugin('en', {
		LANG_SLEEP: {
			nl: 'slaapen',
			en: 'sleep',
		},
	}),
	catalyst.imageExportPlugin('jpg'),
];

catalyst.initialize(
	sketchFunction,
	gui => {
		gui.addTitle(20, 'LANG_SLEEP', false);
	},
	plugins
);
