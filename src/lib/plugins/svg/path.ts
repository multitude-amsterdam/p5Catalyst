export type SvgPathSegment =
	| { type: 'line'; x: number; y: number }
	| {
			type: 'cubic';
			control1X: number;
			control1Y: number;
			control2X: number;
			control2Y: number;
			x: number;
			y: number;
	  }
	| {
			type: 'quadratic';
			controlX: number;
			controlY: number;
			x: number;
			y: number;
	  };

export type SvgSubpath = {
	startX: number;
	startY: number;
	segments: SvgPathSegment[];
	closed: boolean;
};

const TOKEN_PATTERN =
	/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g;

function vectorAngle(ux: number, uy: number, vx: number, vy: number) {
	const length = Math.hypot(ux, uy) * Math.hypot(vx, vy);
	if (length === 0) return 0;
	const cosine = Math.max(-1, Math.min(1, (ux * vx + uy * vy) / length));
	return (ux * vy - uy * vx < 0 ? -1 : 1) * Math.acos(cosine);
}

function arcToCubics(
	startX: number,
	startY: number,
	rxValue: number,
	ryValue: number,
	angle: number,
	largeArc: boolean,
	sweep: boolean,
	endX: number,
	endY: number
): SvgPathSegment[] {
	let rx = Math.abs(rxValue);
	let ry = Math.abs(ryValue);
	if (startX === endX && startY === endY) return [];
	if (rx === 0 || ry === 0) {
		return [{ type: 'line', x: endX, y: endY }];
	}

	const phi = (angle * Math.PI) / 180;
	const cosPhi = Math.cos(phi);
	const sinPhi = Math.sin(phi);
	const dx = (startX - endX) / 2;
	const dy = (startY - endY) / 2;
	const xPrime = cosPhi * dx + sinPhi * dy;
	const yPrime = -sinPhi * dx + cosPhi * dy;
	const radiiScale = xPrime ** 2 / rx ** 2 + yPrime ** 2 / ry ** 2;
	if (radiiScale > 1) {
		const scale = Math.sqrt(radiiScale);
		rx *= scale;
		ry *= scale;
	}

	const rxSquared = rx ** 2;
	const rySquared = ry ** 2;
	const numerator = Math.max(
		0,
		rxSquared * rySquared -
			rxSquared * yPrime ** 2 -
			rySquared * xPrime ** 2
	);
	const denominator =
		rxSquared * yPrime ** 2 + rySquared * xPrime ** 2;
	const centerScale =
		(largeArc === sweep ? -1 : 1) *
		(denominator === 0 ? 0 : Math.sqrt(numerator / denominator));
	const centerPrimeX = (centerScale * rx * yPrime) / ry;
	const centerPrimeY = (-centerScale * ry * xPrime) / rx;
	const centerX =
		cosPhi * centerPrimeX -
		sinPhi * centerPrimeY +
		(startX + endX) / 2;
	const centerY =
		sinPhi * centerPrimeX +
		cosPhi * centerPrimeY +
		(startY + endY) / 2;

	const unitStartX = (xPrime - centerPrimeX) / rx;
	const unitStartY = (yPrime - centerPrimeY) / ry;
	const unitEndX = (-xPrime - centerPrimeX) / rx;
	const unitEndY = (-yPrime - centerPrimeY) / ry;
	const startAngle = vectorAngle(1, 0, unitStartX, unitStartY);
	let sweepAngle = vectorAngle(
		unitStartX,
		unitStartY,
		unitEndX,
		unitEndY
	);
	if (!sweep && sweepAngle > 0) sweepAngle -= Math.PI * 2;
	if (sweep && sweepAngle < 0) sweepAngle += Math.PI * 2;

	const segmentCount = Math.ceil(Math.abs(sweepAngle) / (Math.PI / 2));
	const segmentAngle = sweepAngle / segmentCount;
	const mapPoint = (x: number, y: number) => ({
		x: centerX + rx * cosPhi * x - ry * sinPhi * y,
		y: centerY + rx * sinPhi * x + ry * cosPhi * y,
	});
	const segments: SvgPathSegment[] = [];

	for (let index = 0; index < segmentCount; index++) {
		const theta1 = startAngle + index * segmentAngle;
		const theta2 = theta1 + segmentAngle;
		const alpha = (4 / 3) * Math.tan((theta2 - theta1) / 4);
		const cos1 = Math.cos(theta1);
		const sin1 = Math.sin(theta1);
		const cos2 = Math.cos(theta2);
		const sin2 = Math.sin(theta2);
		const control1 = mapPoint(cos1 - alpha * sin1, sin1 + alpha * cos1);
		const control2 = mapPoint(cos2 + alpha * sin2, sin2 - alpha * cos2);
		const end = mapPoint(cos2, sin2);
		segments.push({
			type: 'cubic',
			control1X: control1.x,
			control1Y: control1.y,
			control2X: control2.x,
			control2Y: control2.y,
			x: end.x,
			y: end.y,
		});
	}

	return segments;
}

export function parseSvgPath(pathData: string): SvgSubpath[] {
	const tokens = pathData.match(TOKEN_PATTERN) || [];
	const paths: SvgSubpath[] = [];
	let index = 0;
	let command = '';
	let previousCommand = '';
	let x = 0;
	let y = 0;
	let cubicControlX = 0;
	let cubicControlY = 0;
	let quadraticControlX = 0;
	let quadraticControlY = 0;
	let path: SvgSubpath | undefined;

	const isCommand = (token: string | undefined) =>
		Boolean(token && /^[a-zA-Z]$/.test(token));
	const number = () => {
		const token = tokens[index++];
		if (token == null || isCommand(token)) {
			throw new Error(`Invalid SVG path data near token ${index}.`);
		}
		const value = Number(token);
		if (!Number.isFinite(value)) throw new Error(`Invalid SVG number: ${token}`);
		return value;
	};
	const ensurePath = () => {
		if (!path) throw new Error('SVG path must begin with a move command.');
		return path;
	};
	const finishPath = () => {
		if (path) paths.push(path);
		path = undefined;
	};
	const resetControls = () => {
		cubicControlX = x;
		cubicControlY = y;
		quadraticControlX = x;
		quadraticControlY = y;
	};

	while (index < tokens.length) {
		if (isCommand(tokens[index])) command = tokens[index++];
		if (!command) throw new Error('SVG path data is missing a command.');

		const relative = command === command.toLowerCase();
		const type = command.toUpperCase();
		const hasNumbers = () => index < tokens.length && !isCommand(tokens[index]);

		if (type === 'Z') {
			const currentPath = ensurePath();
			currentPath.closed = true;
			x = currentPath.startX;
			y = currentPath.startY;
			resetControls();
			previousCommand = type;
			command = '';
			continue;
		}

		if (!hasNumbers()) throw new Error(`SVG command ${command} has no values.`);
		let firstSet = true;
		while (hasNumbers()) {
			switch (type) {
				case 'M': {
					const nextX = number();
					const nextY = number();
					x = relative ? x + nextX : nextX;
					y = relative ? y + nextY : nextY;
					if (firstSet) {
						finishPath();
						path = { startX: x, startY: y, segments: [], closed: false };
					} else {
						ensurePath().segments.push({ type: 'line', x, y });
					}
					break;
				}
				case 'L': {
					const nextX = number();
					const nextY = number();
					x = relative ? x + nextX : nextX;
					y = relative ? y + nextY : nextY;
					ensurePath().segments.push({ type: 'line', x, y });
					break;
				}
				case 'H': {
					const nextX = number();
					x = relative ? x + nextX : nextX;
					ensurePath().segments.push({ type: 'line', x, y });
					break;
				}
				case 'V': {
					const nextY = number();
					y = relative ? y + nextY : nextY;
					ensurePath().segments.push({ type: 'line', x, y });
					break;
				}
				case 'C': {
					const values = Array.from({ length: 6 }, number);
					const originX = x;
					const originY = y;
					const [x1, y1, x2, y2, endX, endY] = values;
					cubicControlX = relative ? originX + x2 : x2;
					cubicControlY = relative ? originY + y2 : y2;
					x = relative ? originX + endX : endX;
					y = relative ? originY + endY : endY;
					ensurePath().segments.push({
						type: 'cubic',
						control1X: relative ? originX + x1 : x1,
						control1Y: relative ? originY + y1 : y1,
						control2X: cubicControlX,
						control2Y: cubicControlY,
						x,
						y,
					});
					break;
				}
				case 'S': {
					const values = Array.from({ length: 4 }, number);
					const originX = x;
					const originY = y;
					const [x2, y2, endX, endY] = values;
					const reflect = previousCommand === 'C' || previousCommand === 'S';
					const control1X = reflect ? 2 * originX - cubicControlX : originX;
					const control1Y = reflect ? 2 * originY - cubicControlY : originY;
					cubicControlX = relative ? originX + x2 : x2;
					cubicControlY = relative ? originY + y2 : y2;
					x = relative ? originX + endX : endX;
					y = relative ? originY + endY : endY;
					ensurePath().segments.push({
						type: 'cubic',
						control1X,
						control1Y,
						control2X: cubicControlX,
						control2Y: cubicControlY,
						x,
						y,
					});
					break;
				}
				case 'Q': {
					const values = Array.from({ length: 4 }, number);
					const originX = x;
					const originY = y;
					const [controlX, controlY, endX, endY] = values;
					quadraticControlX = relative ? originX + controlX : controlX;
					quadraticControlY = relative ? originY + controlY : controlY;
					x = relative ? originX + endX : endX;
					y = relative ? originY + endY : endY;
					ensurePath().segments.push({
						type: 'quadratic',
						controlX: quadraticControlX,
						controlY: quadraticControlY,
						x,
						y,
					});
					break;
				}
				case 'T': {
					const originX = x;
					const originY = y;
					const endX = number();
					const endY = number();
					const reflect = previousCommand === 'Q' || previousCommand === 'T';
					quadraticControlX = reflect
						? 2 * originX - quadraticControlX
						: originX;
					quadraticControlY = reflect
						? 2 * originY - quadraticControlY
						: originY;
					x = relative ? originX + endX : endX;
					y = relative ? originY + endY : endY;
					ensurePath().segments.push({
						type: 'quadratic',
						controlX: quadraticControlX,
						controlY: quadraticControlY,
						x,
						y,
					});
					break;
				}
				case 'A': {
					const originX = x;
					const originY = y;
					const rx = number();
					const ry = number();
					const angle = number();
					const largeArc = number() !== 0;
					const sweep = number() !== 0;
					const endX = number();
					const endY = number();
					x = relative ? originX + endX : endX;
					y = relative ? originY + endY : endY;
					ensurePath().segments.push(
						...arcToCubics(
							originX,
							originY,
							rx,
							ry,
							angle,
							largeArc,
							sweep,
							x,
							y
						)
					);
					break;
				}
				default:
					throw new Error(`Unsupported SVG path command: ${command}`);
			}

			if (type !== 'C' && type !== 'S') {
				cubicControlX = x;
				cubicControlY = y;
			}
			if (type !== 'Q' && type !== 'T') {
				quadraticControlX = x;
				quadraticControlY = y;
			}
			previousCommand = type === 'M' && !firstSet ? 'L' : type;
			firstSet = false;
		}
	}

	finishPath();
	return paths;
}
