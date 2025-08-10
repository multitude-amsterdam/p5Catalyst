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
};

const plugins = [
	catalyst.setConfigPlugin({
		fileName: 'mySketch',
		contactMail: 'maxmustermann@gmx.de',
	}),
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
	(gui, state) => {
		gui.addSlider(
			'slider',
			'slider',
			0,
			100,
			20,
			1,
			(controller, value) => {
				state.size = value;
			}
		);
		gui.addButton('buttonRandomize', 'LANG_RANDOMIZE', controller => {
			gui.randomize();
		});
	},
	plugins
);
