import type { Plugin } from '../types';

export function sizedCanvas(width: number, height: number): Plugin {
	return {
		name: 'canvas-size',
		beforeGuiExists: (sketch, config) => {
			sketch.catalyst?.resizeCanvas(width, height);
		},
		beforeUserCreatesGui: () => {
			sketch.catalyst?.containCanvasInWrapper();
		},
	};
}
