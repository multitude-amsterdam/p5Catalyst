import type p5 from 'p5';
import type { setupCallback, valueCallback } from '../../../types';
import type GUIForP5 from '../../gui';
import ValuedController from '../../valued_controller';

/**
 * Two dimensional slider returning an {x,y} object.
 * @extends ValuedController
 */
export default class XYSlider extends ValuedController {
	minValX: number;
	maxValX: number;
	defaultValX: number;
	stepSizeX: number;
	minValY: number;
	maxValY: number;
	defaultValY: number;
	stepSizeY: number;
	valueCallback?: valueCallback;

	handle: p5.Element;
	isDragging: boolean;

	constructor(
		gui: GUIForP5,
		name: string,
		labelStr: string,
		minValX: number,
		maxValX: number,
		defaultValX: number,
		stepSizeX: number,
		minValY: number,
		maxValY: number,
		defaultValY: number,
		stepSizeY: number,
		valueCallback?: valueCallback,
		setupCallback?: setupCallback
	) {
		super(gui, name, labelStr, controller => {
			this.setDisplay();
			if (setupCallback !== undefined) setupCallback(controller);
		});
		this.minValX = minValX;
		this.minValY = minValY;
		this.maxValX = maxValX;
		this.maxValY = maxValY;
		this.defaultValX = defaultValX;
		this.defaultValY = defaultValY;
		this.stepSizeX = stepSizeX;
		this.stepSizeY = stepSizeY;
		this.valueCallback =
			valueCallback || ((controller: ValuedController, value: any) => {});

		this.controllerElement = gui.p5Instance.createDiv();
		this.controllerElement.class('xyslider');
		this.controllerElement.parent(this.controllerWrapper);
		const handle = gui.p5Instance.createDiv();
		handle.class('handle');
		handle.parent(this.controllerElement);
		this.handle = handle;

		this.isDragging = false;
		this.controllerElement.elt.addEventListener(
			'mousedown',
			(event: MouseEvent) => {
				this.isDragging = true;
				this._doUpdateChangeSet = false;
			}
		);
		handle.elt.addEventListener('mousedown', (event: MouseEvent) => {
			this.isDragging = true;
			this._doUpdateChangeSet = false;
		});
		handle.elt.addEventListener('mouseup', (event: MouseEvent) => {
			this.isDragging = false;
			this._doUpdateChangeSet = true;
			this.setValue(this.getValueFromHandlePosition(event));
		});
		document.addEventListener('mousemove', e => {
			if (!this.isDragging) return;
			this.setValue(this.getValueFromHandlePosition(e));
		});

		this.value = gui.p5Instance.createVector(defaultValX, defaultValY);
		this.valueCallback(this, this.value);
		this.setDisplay();
	}

	getValueFromHandlePosition(mouseEvent: MouseEvent) {
		const compStyle = window.getComputedStyle(this.controllerElement?.elt);
		const borderW = parseFloat(compStyle.borderWidth);

		const rect = this.controllerElement?.elt.getBoundingClientRect();
		rect.width -= borderW * 2;
		rect.height -= borderW * 2;

		let x =
			mouseEvent.clientX - rect.left - this.handle.elt.offsetWidth / 2;
		let y =
			mouseEvent.clientY - rect.top - this.handle.elt.offsetHeight / 2;

		const handleW = this.handle.elt.offsetWidth;
		const handleH = this.handle.elt.offsetHeight;
		x = this.gui.p5Instance.constrain(
			x,
			-handleW / 2,
			rect.width - handleW / 2
		);
		y = this.gui.p5Instance.constrain(
			y,
			-handleH / 2,
			rect.height - handleH / 2
		);

		let normX = this.gui.p5Instance.map(
			x,
			-handleW / 2,
			rect.width - handleW / 2,
			-1,
			1
		);
		let normY = this.gui.p5Instance.map(
			y,
			-handleH / 2,
			rect.height - handleH / 2,
			-1,
			1
		);

		return this.mapSteppedFromNormedVec(
			this.gui.p5Instance.createVector(normX, normY)
		);
	}

	mapSteppedFromNormedVec(normedVec: p5.Vector) {
		// snap to axes
		if (this.gui.p5Instance.abs(normedVec.x) < 0.033) normedVec.x = 0;
		if (this.gui.p5Instance.abs(normedVec.y) < 0.033) normedVec.y = 0;

		const nStepsX = this.gui.p5Instance.round(
			(this.maxValX - this.minValX) / this.stepSizeX
		);
		const nStepsY = this.gui.p5Instance.round(
			(this.maxValY - this.minValY) / this.stepSizeY
		);

		const returnX =
			this.minValX +
			(this.gui.p5Instance.round((normedVec.x * 0.5 + 0.5) * nStepsX) /
				nStepsX) *
				(this.maxValX - this.minValX);
		const returnY =
			this.minValY +
			(this.gui.p5Instance.round((normedVec.y * 0.5 + 0.5) * nStepsY) /
				nStepsY) *
				(this.maxValY - this.minValY);
		const returnVector = this.gui.p5Instance.createVector(returnX, returnY);
		return returnVector;
	}

	setValue(vec: p5.Vector) {
		if (vec.x === undefined || vec.y === undefined) {
			console.error(
				'Value must be a vector {x: X, y: Y}, not this: ',
				vec
			);
			return;
		}
		this.value = vec;
		this.setDisplay();
		if (this.valueCallback) this.valueCallback(this, this.value);
		if (this.doUpdateChangeSet()) this.gui.changeSet.save();
	}

	setDisplay() {
		const compStyle = window.getComputedStyle(this.controllerElement?.elt);
		const borderW = parseFloat(compStyle.borderWidth);
		const rect = this.controllerElement?.elt.getBoundingClientRect();
		rect.width -= borderW * 2;
		rect.height -= borderW * 2;
		const handleW = this.handle.elt.offsetWidth;
		const handleH = this.handle.elt.offsetHeight;
		const feedbackX = this.gui.p5Instance.map(
			this.value.x,
			this.minValX,
			this.maxValX,
			-handleW / 2,
			rect.width - handleW / 2
		);
		const feedbackY = this.gui.p5Instance.map(
			this.value.y,
			this.minValY,
			this.maxValY,
			-handleH / 2,
			rect.height - handleH / 2
		);

		this.handle.elt.style.left = `${feedbackX}px`;
		this.handle.elt.style.top = `${feedbackY}px`;
	}

	show() {
		this.div.elt.style.display = ''; // same as in Field
		this.setDisplay();
	}

	randomize() {
		const randomX = this.gui.p5Instance.random(-1, 1);
		const randomY = this.gui.p5Instance.random(-1, 1);
		this.setValue(
			this.mapSteppedFromNormedVec(
				this.gui.p5Instance.createVector(randomX, randomY)
			)
		);
	}
}
