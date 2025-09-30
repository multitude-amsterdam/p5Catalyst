import { Vec } from './Vec';

export class Circle extends Vec {
	radius: number;

	constructor(center: Vec, radius: number) {
		super(center);
		this.radius = radius;
	}

	distanceToPoint(pt: Vec) {
		return this.distanceTo(pt) - this.radius;
	}
}
