import type { Plugin } from '../types';

export function sizedCanvas(width: number, height: number): Plugin {
	return {
		name: 'canvas-size',
		beforeUserCreatesGui: () => {
			sketch.catalyst?.resizeCanvas(width, height);
			sketch.catalyst?.containCanvasInWrapper();
		},
	};
}
