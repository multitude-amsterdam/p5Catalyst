import type p5 from 'p5';
import type { setupCallback, valueCallback } from '../../../types';
import type { CatalystGUI } from '../../CatalystGUI';
import { ValuedController } from '../ValuedController';
import { Controller } from '../Controller';

/**
 * Two dimensional slider returning an {x,y} object.
 * @extends ValuedController
 */
export class XYSlider extends ValuedController {
	minValX: number;
	maxValX: number;
	stepSizeX: number;
	minValY: number;
	maxValY: number;
	stepSizeY: number;
	valueCallback?: valueCallback;

	handle: p5.Element;
	isDragging: boolean;

	constructor(
		gui: CatalystGUI,
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
		super(
			gui,
			name,
			labelStr,
			gui.sketch.createVector(defaultValX, defaultValY),
			controller => {
				this.setDisplay();
				if (setupCallback !== undefined) setupCallback(controller);
			}
		);
		this.minValX = minValX;
		this.minValY = minValY;
		this.maxValX = maxValX;
		this.maxValY = maxValY;
		this.stepSizeX = stepSizeX;
		this.stepSizeY = stepSizeY;
		this.valueCallback =
			valueCallback || ((controller: Controller, value: any) => {});

		this.controllerElement = gui.sketch.createDiv();
		this.controllerElement.class('xyslider');
		this.controllerElement.parent(this.controllerWrapper);
		const handle = gui.sketch.createDiv();
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

		this.value = gui.sketch.createVector(defaultValX, defaultValY);
		this.valueCallback(this, this.value);
		this.setDisplay();
	}

	getValueFromHandlePosition(mouseEvent: MouseEvent) {
		const sliderElement = this.controllerElement?.elt;
		if (!sliderElement) {
			return (this.value as p5.Vector).copy();
		}

		const compStyle = window.getComputedStyle(sliderElement);
		const borderW = parseFloat(compStyle.borderWidth);

		const rect = sliderElement.getBoundingClientRect();
		const rectW = rect.width - borderW * 2;
		const rectH = rect.height - borderW * 2;

		let x =
			mouseEvent.clientX - rect.left - this.handle.elt.offsetWidth / 2;
		let y =
			mouseEvent.clientY - rect.top - this.handle.elt.offsetHeight / 2;

		const handleW = this.handle.elt.offsetWidth;
		const handleH = this.handle.elt.offsetHeight;
		x = this.gui.sketch.constrain(x, -handleW / 2, rectW - handleW / 2);
		y = this.gui.sketch.constrain(y, -handleH / 2, rectH - handleH / 2);

		let normX = this.gui.sketch.map(
			x,
			-handleW / 2,
			rectW - handleW / 2,
			-1,
			1
		);
		let normY = this.gui.sketch.map(
			y,
			-handleH / 2,
			rectH - handleH / 2,
			-1,
			1
		);

		return this.mapSteppedFromNormedVec(
			this.gui.sketch.createVector(normX, normY)
		);
	}

	mapSteppedFromNormedVec(normedVec: p5.Vector) {
		// snap to axes
		if (this.gui.sketch.abs(normedVec.x) < 0.033) normedVec.x = 0;
		if (this.gui.sketch.abs(normedVec.y) < 0.033) normedVec.y = 0;

		const nStepsX = this.gui.sketch.round(
			(this.maxValX - this.minValX) / this.stepSizeX
		);
		const nStepsY = this.gui.sketch.round(
			(this.maxValY - this.minValY) / this.stepSizeY
		);

		const returnX =
			this.minValX +
			(this.gui.sketch.round((normedVec.x * 0.5 + 0.5) * nStepsX) /
				nStepsX) *
				(this.maxValX - this.minValX);
		const returnY =
			this.minValY +
			(this.gui.sketch.round((normedVec.y * 0.5 + 0.5) * nStepsY) /
				nStepsY) *
				(this.maxValY - this.minValY);
		const returnVector = this.gui.sketch.createVector(returnX, returnY);
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
		const sliderElement = this.controllerElement?.elt;
		if (!sliderElement) return;

		const compStyle = window.getComputedStyle(sliderElement);
		const borderW = parseFloat(compStyle.borderWidth);
		const rect = sliderElement.getBoundingClientRect();
		const rectW = rect.width - borderW * 2;
		const rectH = rect.height - borderW * 2;
		const handleW = this.handle.elt.offsetWidth;
		const handleH = this.handle.elt.offsetHeight;
		const feedbackX = this.gui.sketch.map(
			(this.value as p5.Vector).x,
			this.minValX,
			this.maxValX,
			-handleW / 2,
			rectW - handleW / 2
		);
		const feedbackY = this.gui.sketch.map(
			(this.value as p5.Vector).y,
			this.minValY,
			this.maxValY,
			-handleH / 2,
			rectH - handleH / 2
		);

		this.handle.elt.style.left = `${feedbackX}px`;
		this.handle.elt.style.top = `${feedbackY}px`;
	}

	show() {
		this.div.elt.style.display = ''; // same as in Field
		this.setDisplay();
	}

	randomize() {
		const randomX = this.gui.sketch.random(-1, 1);
		const randomY = this.gui.sketch.random(-1, 1);
		this.setValue(
			this.mapSteppedFromNormedVec(
				this.gui.sketch.createVector(randomX, randomY)
			)
		);
	}
}
