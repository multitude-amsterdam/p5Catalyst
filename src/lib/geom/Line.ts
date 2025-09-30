import { Vec } from './Vec';
import { Circle } from './Circle';

export class Line {
	a: Vec;
	b: Vec;

	constructor(a: Vec, b: Vec) {
		this.a = a;
		this.b = b;
	}

	getHeading() {
		return this.b.sub(this.a);
	}

	getDir() {
		return this.getHeading().normalize();
	}

	getLength() {
		return this.getHeading().mag();
	}

	getMidpoint() {
		return this.a.lerp(this.b, 0.5);
	}

	copy() {
		return new Line(this.a.copy(), this.b.copy());
	}

	toString() {
		return `Line(${this.a.toString()} -> ${this.b.toString()})`;
	}

	intersectLine(line: Line) {
		const x1 = this.a.x;
		const y1 = this.a.y;
		const x2 = this.b.x;
		const y2 = this.b.y;
		const x3 = line.a.x;
		const y3 = line.a.y;
		const x4 = line.b.x;
		const y4 = line.b.y;
		const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
		if (denom === 0) {
			return null; // Lines are parallel
		}
		const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
		const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
		if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
			return new Vec(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
		}
		return null; // No intersection within the line segments
	}

	intersectCircle(circle: Circle): Vec[] {
		const d = this.getHeading();
		const f = this.a.sub(circle);
		const a = d.magSq();
		const b = 2 * f.dot(d);
		const c = f.magSq() - circle.radius * circle.radius;
		const discriminant = b * b - 4 * a * c;
		if (discriminant < 0) {
			return []; // No intersection
		}
		const sqrtDiscriminant = Math.sqrt(discriminant);
		const t1 = (-b - sqrtDiscriminant) / (2 * a);
		const t2 = (-b + sqrtDiscriminant) / (2 * a);
		const intersections = [];
		if (t1 >= 0 && t1 <= 1) {
			intersections.push(this.a.add(d.scale(t1)));
		}
		if (t2 >= 0 && t2 <= 1) {
			intersections.push(this.a.add(d.scale(t2)));
		}
		return intersections;
	}

	static fromAngleLength(
		angle: number,
		length: number,
		origin = new Vec(0, 0)
	): Line {
		let dir = Vec.fromAngle(angle).scale(length);
		let a = origin.copy();
		let b = origin.add(dir);
		return new Line(a, b);
	}
}
