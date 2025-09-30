export class Vec {
	x: number = 0;
	y: number = 0;

	constructor(x: Vec | number, y?: number) {
		if (x instanceof Vec) {
			this.x = x.x;
			this.y = x.y;
			return;
		}
		if (y === undefined) return;
		this.x = x;
		this.y = y;
	}

	set(x: Vec | number, y?: number): Vec {
		if (x instanceof Vec) {
			this.x = x.x;
			this.y = x.y;
			return this;
		}
		if (y === undefined) return this;
		this.x = x;
		this.y = y;
		return this;
	}

	add(v: Vec): Vec {
		return new Vec(this.x + v.x, this.y + v.y);
	}
	addSelf(v: Vec): Vec {
		this.set(this.add(v));
		return this;
	}

	sub(v: Vec): Vec {
		return new Vec(this.x - v.x, this.y - v.y);
	}
	subSelf(v: Vec): Vec {
		this.set(this.sub(v));
		return this;
	}

	scale(s: number): Vec {
		return new Vec(this.x * s, this.y * s);
	}
	scaleSelf(s: number): Vec {
		this.set(this.scale(s));
		return this;
	}
	div(s: number): Vec {
		return new Vec(this.x / s, this.y / s);
	}
	divSelf(s: number): Vec {
		this.set(this.div(s));
		return this;
	}

	dot(v: Vec): number {
		return this.x * v.x + this.y * v.y;
	}

	magSq(): number {
		return this.dot(this);
	}
	mag(): number {
		return Math.sqrt(this.magSq());
	}

	normalize(): Vec {
		let m = this.mag();
		if (m > Vec.epsilon) {
			return this.scale(1 / m);
		}
		return new Vec(0, 0);
	}
	normalizeSelf(): Vec {
		this.set(this.normalize());
		return this;
	}

	normalizeTo(len: number): Vec {
		return this.normalize().scale(len);
	}
	normalizeToSelf(len: number): Vec {
		this.set(this.normalizeTo(len));
		return this;
	}

	distanceToSq(v: Vec) {
		return this.sub(v).magSq();
	}
	distanceTo(v: Vec) {
		return this.sub(v).mag();
	}

	perp(): Vec {
		return new Vec(-this.y, this.x);
	}
	perpSelf(): Vec {
		this.set(this.perp());
		return this;
	}

	rotate(theta: number): Vec {
		let cos = Math.cos(theta);
		let sin = Math.sin(theta);
		return new Vec(
			this.x * cos - this.y * sin,
			this.x * sin + this.y * cos
		);
	}
	rotateSelf(theta: number): Vec {
		this.set(this.rotate(theta));
		return this;
	}

	lerp(v: Vec, t: number): Vec {
		return this.scale(1 - t).add(v.scale(t));
	}
	lerpSelf(v: Vec, t: number): Vec {
		this.set(this.lerp(v, t));
		return this;
	}

	angleTo(v: Vec): number {
		return Vec.angleBetween(this, v);
	}

	angle(): number {
		return Math.atan2(this.y, this.x);
	}

	copy(): Vec {
		return new Vec(this.x, this.y);
	}

	toString(): string {
		return `(${this.x}, ${this.y})`;
	}

	projectOnto(v: Vec): Vec {
		let dp = this.dot(v);
		let magSq = v.magSq();
		if (magSq === 0) return new Vec(0, 0);
		let scalar = dp / magSq;
		return v.scale(scalar);
	}
	projectOntoSelf(v: Vec): Vec {
		this.set(this.projectOnto(v));
		return this;
	}

	static epsilon = 1e-4;

	static random2D(): Vec {
		let angle = Math.random() * Math.PI * 2;
		return new Vec(Math.cos(angle), Math.sin(angle));
	}

	static fromAngle(angle: number): Vec {
		return new Vec(Math.cos(angle), Math.sin(angle));
	}

	static get ZERO(): Vec {
		return new Vec(0, 0);
	}

	static get X(): Vec {
		return new Vec(1, 0);
	}

	static get Y(): Vec {
		return new Vec(0, 1);
	}

	static angleBetween(a: Vec, b: Vec): number {
		let dot = a.dot(b);
		let mags = a.mag() * b.mag();
		if (mags === 0) return 0;
		let amt = dot / mags;
		if (amt <= -1) return Math.PI;
		if (amt >= 1) return 0;
		return Math.acos(amt);
	}

	static angleFromTo(a: Vec, b: Vec): number {
		return Math.atan2(b.y - a.y, b.x - a.x);
	}
}
