import p5 from 'p5';

export class Line {
	a: p5.Vector;
	b: p5.Vector;

	constructor(a: p5.Vector, b: p5.Vector) {
		this.a = a;
		this.b = b;
	}

	getHeading(): p5.Vector {
		return p5.Vector.sub(this.b, this.a);
	}

	getDir(): p5.Vector {
		return this.getHeading().normalize();
	}

	getLength(): number {
		return this.getHeading().mag();
	}
}

export class Circle extends p5.Vector {
	r: number;

	constructor(center: p5.Vector, r: number) {
		super(center.x, center.y);
		this.r = r;
	}

	distanceToPoint(pt: p5.Vector): number {
		return p5.Vector.dist(this, pt) - this.r;
	}
}
