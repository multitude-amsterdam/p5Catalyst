/**
 * Commonly used classes re-exported from toxiclibs.js.
 * @constant
 */
const {
	Rect,
	Circle,
	Polygon2D,
	Vec2D,
	Line2D,
	Ray2D,
	Vec3D,
	Line3D,
	Ray3D,
	Quaternion,
} = toxi.geom;

/**
 * Physics classes from toxiclibs.
 * @constant
 */
const {
	VerletPhysics2D,
	GravityBehavior2D,
	AttractionBehavior2D,
	VerletParticle2D,
	VerletSpring2D,
	VerletMinDistanceSpring2D,
} = toxi.physics2d;

/**
 * Additional physics behaviors from toxiclibs.
 * @constant
 */
const { AttractionBehavior, ConstantForceBehavior, GravityBehavior } =
	toxi.physics2d.behaviors;

/**
 * Noise function from toxiclibs.
 * @constant
 */
const simplexNoise = toxi.math.noise.simplexNoise.noise;
