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

let { p5Instance, state } = catalyst.createContainer(sketchFunction);
catalyst.createGUI(p5Instance, state, gui => {
	gui.addField('test', 'test');
	gui.addTitle(20, 'hello there', false);
});
