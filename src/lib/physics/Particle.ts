import { Vec } from '../geom/Vec';

class Particle extends Vec {
	prev;
	temp;
	force;

	mass;
	isLocked;
	hasLifespan = false;
	lifespan = 255;
	hasTrail = false;
	trail = [];
	trailLength = 10;
	radius = 10;
	springs = null;

	// behaviors;

	constructor(pos: Vec, mass = 1, isLocked = false) {
		super(pos);
		this.prev = this.copy();
		this.temp = new Vec(0, 0);
		this.force = new Vec(0, 0);

		this.mass = mass;
		this.isLocked = isLocked;

		// this.x += (Math.random() * 2 - 1) * 1e-3;
		// this.y += (Math.random() * 2 - 1) * 1e-3;
	}

	addForce(v) {
		this.force.addSelf(v);
	}

	clearForce() {
		this.force.set(0, 0);
	}

	// applyBehaviors() {
	// 	for (let behavior of this.behaviors) {
	// 		behavior.applyBehavior(this);
	// 	}
	// }

	addVelocity(deltaVel) {
		this.prev.subSelf(deltaVel);
	}

	clearVelocity() {
		this.prev.set(this);
	}

	getVelocity() {
		return this.sub(this.prev);
	}

	dampen(gamma) {
		this.addVelocity(this.getVelocity().scale(1 - gamma));
	}

	update() {
		if (this.isLocked) return;

		// this.applyBehaviors();

		this.temp.set(this);
		this.addSelf(this.sub(this.prev).addSelf(this.force.scale(this.mass)));
		this.prev.set(this.temp);
		this.clearForce();
	}

	draw() {
		fill(0, this.lifespan);
		noStroke();
		circle(this.x, this.y, this.radius * 2);

		if (this.isHovered()) {
			console.log('hovered!');
			stroke(0, this.lifespan);
			noFill();
			circle(this.x, this.y, this.radius * 4);
		}

		if (this.hasTrail) {
			noFill();
			stroke(255, this.lifespan);
			beginShape();
			for (let p of this.trail) {
				vertex(p.x, p.y);
			}
			endShape();
		}
	}

	addSpring(spring) {
		if (this.springs === null) this.springs = [];
		this.springs.push(spring);
	}

	isHovered() {
		return (
			this.distanceToSq(new Vec(mouseX, mouseY)) <
			this.radius * this.radius
		);
	}
}

// class Behavior {
// 	applyBehavior(p) {}
// }

// class GravityBehavior extends Behavior {
// 	acc;

// 	constructor(acc) {
// 		this.acc = acc;
// 	}

// 	applyBehavior(p) {
// 		p.addForce(this.acc.div(p.mass));
// 	}
// }

class Spring {
	a;
	b;
	restLength;
	k; // Spring constant
	damping = 0.05;

	static epsilon = 1e-2;

	constructor(a, b, restLength, k) {
		this.a = a;
		this.b = b;
		this.restLength = restLength === null ? a.distanceTo(b) : restLength;
		this.k = k;

		a.addSpring(this);
		b.addSpring(this);
	}

	apply() {
		const diff = this.b.sub(this.a);
		const dx = diff.mag() - this.restLength;
		if (Math.abs(dx) > Spring.epsilon) {
			const force = diff.normalizeTo(this.k * -dx);
			this.a.addForce(force.scale(-0.5));
			this.b.addForce(force.scale(+0.5));
		}
	}

	draw() {
		const n = Math.floor(this.b.distanceTo(this.a) * 0.2);
		const delta = this.b.sub(this.a).div(n);
		const deltaPerp = delta.perp();
		const zig = delta.rotate(Math.PI / 4).scale(Math.SQRT2 / 2);
		beginShape();
		vertex(this.a.x, this.a.y);
		for (let i = 1; i <= n; i++) {
			const zigPos = this.a
				.add(delta.scale(i - 0.5))
				.add(deltaPerp.scale(i % 2 === 0 ? 1 : -1));
			const nextPos = this.a.add(delta.scale(i));
			vertex(zigPos.x, zigPos.y);
			vertex(nextPos.x, nextPos.y);
		}
		endShape();
		// line(this.a.x, this.a.y, this.b.x, this.b.y);
	}
}

class SpringChain {
	particles = [];

	constructor(physics, firstParticle, segmentVector, segmentCount, k) {
		this.particles.push(firstParticle);
		for (let i = 0; i < segmentCount; i++) {
			this.particles.push(
				new Particle(this.particles.at(-1).add(segmentVector))
			);
		}
		for (let p of this.particles) physics.addParticle(p);

		const segmentLength = segmentVector.mag();
		for (let i = 0; i < this.particles.length - 1; i++) {
			let pi = this.particles[i];
			let pn = this.particles[i + 1];
			new Spring(pi, pn, segmentLength, k);
		}
	}

	draw() {
		beginShape();
		for (let p of this.particles) {
			vertex(p.x, p.y);
		}
		endShape();
	}
}

class Physics2D {
	particles = [];

	hasGravity = false;
	gravity = new Vec(0, 0.1);

	hasWind = false;
	wind = new Vec(0.1, 0);

	hasFriction = false;
	frictionCoefficient = 0.1;

	hasDrag = false;
	dragCoefficient = 0.0;

	hasBounce = false;
	bounceCoefficient = 0.8;

	hasRepulsion = false;
	repulsionStrength = 10;
	repulsionRadius = 10;

	hasDamping = true;
	damping = 0.01;

	hasMouseInteraction = true;
	heldParticleIndex = null;

	iters = 50;
	timeStep = 1 / this.iters;

	constructor() {}

	addParticle(p) {
		if (this.particles.indexOf(p) > -1) return;
		this.particles.push(p);
	}

	updateParticles() {
		// all accelerations first
		for (let p of this.particles) {
			if (p.isLocked) continue;

			// physics properties
			if (this.hasGravity) {
				p.addForce(this.gravity);
			}

			// if (this.hasWind) {
			// 	p.addForce(this.wind);
			// }

			if (this.hasFriction) {
				let friction = p.getVelocity().scale(-this.frictionCoefficient);
				p.addForce(friction);
			}

			if (this.hasDrag) {
				const vel = p.getVelocity();
				let drag = vel.normalizeTo(-this.dragCoefficient * vel.magSq());
				p.addForce(drag);
			}

			if (this.hasRepulsion) {
				const rrSq = this.repulsionRadius * this.repulsionRadius;
				for (let other of this.particles) {
					if (other === p) continue;

					let dir = p.sub(other);
					let distSq = dir.magSq();
					if (distSq < rrSq && distSq > 0) {
						dir.normalizeToSelf(this.repulsionStrength / distSq);
						p.addForce(dir);
					}
				}
			}

			if (
				this.hasMouseInteraction &&
				this.heldParticleIndex === null &&
				mouseIsPressed &&
				p.isHovered()
			) {
				this.heldParticleIndex = this.particles.indexOf(p);
			}

			// // particle properties
			// if (p.hasLifespan) {
			// 	p.lifespan -= 1;
			// 	if (p.lifespan <= 0) {
			// 		this.particles.splice(this.particles.indexOf(p), 1);
			// 		continue;
			// 	}
			// }

			// if (p.hasTrail) {
			// 	p.trail.push(p.copy());
			// 	if (p.trail.length > p.trailLength) {
			// 		p.trail.shift();
			// 	}
			// }

			if (p.springs !== null) {
				for (let s of p.springs) {
					s.apply();
				}
			}
		}

		// now change positions based on accelerations
		for (let p of this.particles) {
			if (p.isLocked) continue;

			p.force.scaleSelf(this.timeStep);

			if (this.hasDamping) {
				p.dampen(this.damping);
			}

			p.update();

			if (this.hasBounce) {
				if (p.x < p.radius) {
					p.x = p.radius;
					p.vel.x *= -this.bounceCoefficient;
				} else if (p.x >= width - p.radius) {
					p.x = width - p.radius;
					p.vel.x *= -this.bounceCoefficient;
				}
				if (p.y < p.radius) {
					p.y = p.radius;
					p.vel.y *= -this.bounceCoefficient;
				} else if (p.y >= height - p.radius) {
					p.y = height - p.radius;
					p.vel.y *= -this.bounceCoefficient;
				}
			}
		}

		if (
			this.hasMouseInteraction &&
			this.heldParticleIndex !== null &&
			mouseIsPressed
		) {
			const pHeld = this.particles[this.heldParticleIndex];
			pHeld.set(mouseX, mouseY);
			pHeld.clearVelocity();
		}
	}

	getSprings() {
		return [];
	}

	update() {
		for (let i = 0; i < this.iters; i++) {
			this.updateParticles();
		}
	}
}
