import type p5 from 'p5';

/**
 * Check if two arrays contain the same values in the same order.
 * @param {Array} a
 * @param {Array} b
 * @returns {boolean}
 */
export function isArraysEqual(a: any[], b: any[]): boolean {
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (a.length !== b.length) return false;
	// If you don't care about the order of the elements inside
	// the array, you should sort both arrays here.
	// Please note that calling sort on an array will modify that array.
	// you might want to clone your array first.
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}

/**
 * Copy the current canvas bitmap to the system clipboard.
 */
export function copyCanvasToClipboard(canvas: p5.Graphics): void {
	canvas.elt.toBlob((blob: Blob) => {
		navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
	});
}

const b64Digits =
	'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
/**
 * Convert a number to a base64-like string.
 */
export function toB64(n: number): string {
	return n
		.toString(2)
		.split(/(?=(?:.{6})+(?!.))/g)
		.map(v => b64Digits[parseInt(v, 2)])
		.join('');
}
/**
 * Parse a base64-like string back into a number.
 */
export function fromB64(s64: string): number {
	return s64.split('').reduce((s, v) => s * 64 + b64Digits.indexOf(v), 0);
}
