import p5 from 'p5';

/**
 * Calculates the relative luminance of a color in sRGB color space.
 * The returned value is a number between 0 (black) and 1 (white), representing the perceived brightness.
 *
 * From: https://alvaromontoro.medium.com/building-a-color-contrast-checker-e62d53618318
 *
 * @param {p5.Color} col - The color value to compute luminance for. Must be compatible with p5.js color functions.
 * @returns {number} The relative luminance of the color (0 to 1).
 */
export function luminance(sketch: p5, col: p5.Color): number {
	// luminance as sRGB
	const a = [sketch.red(col), sketch.green(col), sketch.blue(col)].map(v => {
		v /= 255;
		return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
	});
	return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}
