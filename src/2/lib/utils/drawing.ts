import p5 from 'p5';
/**
 * Execute a drawing function wrapped in push/pop calls. Can also operate on a
 * {@link p5.Graphics} instance if provided.
 */
export function pushpop(canvas: p5.Graphics, func: () => void): void {
	canvas.push();
	func();
	canvas.pop();
}

/**
 * Draw an image fitted to the canvas centre.
 */
export function imageCentered(
	sketch: p5,
	img: p5.Image,
	doFill: boolean
): void {
	sketch.image(
		img,
		0,
		0,
		sketch.width,
		sketch.height,
		0,
		0,
		img.width,
		img.height,
		doFill ? sketch.COVER : sketch.CONTAIN
	);
}

export function imageCenteredXYScale(
	canvas: p5 | p5.Graphics,
	img: p5.Image,
	doFill: boolean,
	posX: number = 0,
	posY: number = 0,
	sc: number = 1,
	doFlipHorizontal = false
): void {
	canvas.push();
	{
		canvas.resetMatrix();
		canvas.imageMode(canvas.CENTER);

		const am = canvas.width / canvas.height;
		const aimg = img.width / img.height;
		const doFitVertical = am > aimg !== doFill;

		let imgFitW = doFitVertical ? canvas.height * aimg : canvas.width;
		let imgFitH = doFitVertical ? canvas.height : canvas.width / aimg;

		canvas.translate(canvas.width * 0.5, canvas.height * 0.5);

		let renderW = imgFitW * sc;
		let renderH = imgFitH * sc;
		let dx = (-posX * (renderW - canvas.width)) / 2;
		let dy = (-posY * (renderH - canvas.height)) / 2;
		canvas.translate(dx, dy);

		canvas.scale(sc);

		if (doFlipHorizontal) canvas.scale(-1, 1);

		canvas.image(img, 0, 0, imgFitW, imgFitH);
	}
	canvas.pop();
}
