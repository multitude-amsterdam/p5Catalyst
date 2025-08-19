import { Vector } from 'p5';

export class Line {
	a: Vector;
	b: Vector;

	constructor(a: Vector, b: Vector) {
		this.a = a;
		this.b = b;
	}

	getHeading(): Vector {
		return Vector.sub(this.b, this.a);
	}

	getDir(): Vector {
		return this.getHeading().normalize();
	}

	getLength(): number {
		return this.getHeading().mag();
	}
}

export class Circle extends Vector {
	r: number;

	constructor(center: Vector, r: number) {
		super(center.x, center.y);
		this.r = r;
	}

	distanceToPoint(pt: Vector): number {
		return Vector.dist(this, pt) - this.r;
	}
}
