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
		gui.addSelect('select', 'select', ['one', 'two', 'three'], 0);
		gui.addTitle(3, 'LANG_SLEEP');
		gui.addButton('button');
		gui.addTextbox('textbox', 'texbox', 'hello');
	},
	plugins
);
