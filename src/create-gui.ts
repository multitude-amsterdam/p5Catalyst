import type { ExtensibleP5 } from './lib/types';
import type { CatalystGUI } from './lib/gui/CatalystGUI';

export function createGui(gui: CatalystGUI, sketch: ExtensibleP5) {
	const appearanceTab = gui.getTab('appearance');

	const circlePanel = appearanceTab?.addPanel('Circle', true);

	circlePanel?.addColorBoxes(
		'colorBoxesCircle',
		'Circle color',
		['#FF2600', '#86D594', '#004D30', '#336DFF', '#F5CBFF'],
		0,
		(controller, value) => {
			sketch.circleColor = value;
		}
	);

	circlePanel?.addSlider(
		'sliderCircleDiameter',
		'Circle size',
		0,
		1,
		sketch.circleDiameter,
		0.001,
		(controller, value) => {
			sketch.circleDiameter = value;
		}
	);

	const bgPanel = appearanceTab?.addPanel('Background pattern', true);

	bgPanel?.addColorBoxes(
		'colorBoxesBg',
		'Background color',
		['#FF2600', '#86D594', '#004D30', '#336DFF', '#F5CBFF'],
		3,
		(controller, value) => {
			sketch.bgColor = value;
		}
	);

	bgPanel?.addSlider(
		'sliderNBg',
		'Number of ellipses',
		1,
		10,
		sketch.nBgElements,
		1,
		(controller, value) => {
			sketch.nBgElements = value;
		}
	);
}
