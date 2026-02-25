import type p5 from 'p5';
import type { ExtensibleP5, Plugin } from '../types';

export type ShaderUniformValue =
	| number
	| boolean
	| number[]
	| p5.Image
	| p5.Graphics
	| p5.MediaElement;

export type ShaderUniformMap = Record<string, ShaderUniformValue>;

type ShaderTemplateState = {
	vertPath: string;
	fragPath: string;
	shader?: p5.Shader;
	AA: number;
	doDrawBackdrop: boolean;
	doDrawOverlay: boolean;
	doDebug: boolean;
	customUniforms: ShaderUniformMap;
};

export type ShaderTemplateAPI = {
	state: ShaderTemplateState;
	setup: () => Promise<void>;
	draw: () => boolean;
	/**
	 * Sets a custom shader uniform that is applied each frame.
	 *
	 * Custom uniforms are applied after built-in uniforms, so this can also
	 * override built-ins when needed.
	 *
	 * @example
	 * // inside sketch.draw, before sketch.shaderTemplate.draw()
	 * sketch.shaderTemplate?.setUniform(
	 * 	'uMouseUv',
	 * 	[sketch.mouseX / sketch.width, sketch.mouseY / sketch.height]
	 * );
	 * sketch.shaderTemplate?.setUniform(
	 * 	'uPulse',
	 * 	sketch.sin(sketch.frameCount * 0.05)
	 * );
	 */
	setUniform: (name: string, value: ShaderUniformValue) => void;
	/**
	 * Sets multiple custom shader uniforms at once.
	 *
	 * @example
	 * sketch.shaderTemplate?.setUniforms({
	 * 	uColorA: [1.0, 0.2, 0.1],
	 * 	uColorB: [0.1, 0.2, 1.0],
	 * 	uMouseDown: sketch.mouseIsPressed,
	 * });
	 */
	setUniforms: (uniforms: ShaderUniformMap) => void;
};

function createDefaultState(
	vertPath: string,
	fragPath: string
): ShaderTemplateState {
	return {
		vertPath,
		fragPath,
		shader: undefined,
		AA: 2,
		doDrawBackdrop: true,
		doDrawOverlay: true,
		doDebug: false,
		customUniforms: {},
	};
}

function setCoreUniforms(sketch: ExtensibleP5, state: ShaderTemplateState) {
	const catalyst = sketch.catalyst;
	const shader = state.shader;
	if (!catalyst || !shader) return;

	const hasBackdrop = Boolean(sketch.backdrop);
	const hasOverlay = Boolean(sketch.overlay);

	shader.setUniform('resolution', [sketch.width, sketch.height]);
	shader.setUniform('mouse', [
		sketch.mouseX,
		sketch.height - sketch.mouseY,
		sketch.mouseIsPressed ? 1 : 0,
	]);
	shader.setUniform('mousePosPx', [sketch.mouseX, sketch.mouseY]);
	shader.setUniform('isMouseDown', sketch.mouseIsPressed);
	shader.setUniform('progress', catalyst.progress);
	shader.setUniform('time', catalyst.time);
	shader.setUniform('mouseWheelScale', catalyst.mouseWheelScale);
	shader.setUniform('doDrawBackdrop', state.doDrawBackdrop && hasBackdrop);
	shader.setUniform(
		'backdropResolution',
		hasBackdrop ? [sketch.backdrop.width, sketch.backdrop.height] : [1, 1]
	);
	if (hasBackdrop) shader.setUniform('backdrop', sketch.backdrop);

	shader.setUniform('doDrawOverlay', state.doDrawOverlay && hasOverlay);
	shader.setUniform(
		'overlayResolution',
		hasOverlay ? [sketch.overlay.width, sketch.overlay.height] : [1, 1]
	);
	if (hasOverlay) shader.setUniform('overlay', sketch.overlay);

	shader.setUniform('sessionHash', catalyst.sessionHash);
	shader.setUniform('AA', Math.round(state.AA));
	shader.setUniform('doDebug', state.doDebug);

	for (const [name, value] of Object.entries(state.customUniforms)) {
		shader.setUniform(name, value);
	}
}

function createShaderTemplateAPI(
	sketch: ExtensibleP5,
	state: ShaderTemplateState
): ShaderTemplateAPI {
	return {
		state,
		setup: async () => {
			if (state.shader) return;
			try {
				state.shader = await sketch.loadShader(
					state.vertPath,
					state.fragPath
				);
			} catch (error) {
				console.error('Failed to load shader template.', error);
			}
		},
		draw: () => {
			if (!state.shader) return false;

			sketch.push();
			{
				sketch.shader(state.shader);
				setCoreUniforms(sketch, state);

				sketch.resetMatrix();
				sketch.rectMode(sketch.CENTER);
				sketch.noStroke();
				sketch.rect(0, 0, sketch.width, sketch.height);
			}
			sketch.pop();
			return true;
		},
		setUniform: (name, value) => {
			state.customUniforms[name] = value;
		},
		setUniforms: uniforms => {
			Object.assign(state.customUniforms, uniforms);
		},
	};
}

export function shaderTemplatePlugin(
	vertPath: string = 'shaders/shader.vert',
	fragPath: string = 'shaders/shader.frag',
	panelOpen: boolean = false
): Plugin {
	return {
		name: 'shader-template',

		beforeGuiExists: (sketch, config) => {
			const state = createDefaultState(vertPath, fragPath);
			sketch.shaderTemplate = createShaderTemplateAPI(sketch, state);
			config.doWebglMode = true;
		},

		afterUserCreatesGui: (gui, sketch) => {
			const shaderTemplate = sketch.shaderTemplate as
				| ShaderTemplateAPI
				| undefined;
			if (!shaderTemplate) return;

			const appearanceTab = gui.getTab('appearance') || gui;
			const panel = appearanceTab.addPanel('Shader', panelOpen);
			const state = shaderTemplate.state;

			panel.addSlider(
				'sliderShaderAA',
				'Anti-aliasing multisampling level',
				1,
				4,
				state.AA,
				1,
				(controller, value) => {
					state.AA = value as number;
					controller.label?.setText(
						`Anti-aliasing multisampling level: ${Math.round(state.AA)}`
					);
				}
			);
			panel.addToggle(
				'toggleShaderBackdrop',
				'Backdrop off',
				'Backdrop on',
				state.doDrawBackdrop,
				(controller, value) => {
					state.doDrawBackdrop = Boolean(value);
				}
			);
			panel.addToggle(
				'toggleShaderOverlay',
				'Overlay off',
				'Overlay on',
				state.doDrawOverlay,
				(controller, value) => {
					state.doDrawOverlay = Boolean(value);
				}
			);
			panel.addToggle(
				'toggleShaderDebug',
				'Debug off',
				'Debug on',
				state.doDebug,
				(controller, value) => {
					state.doDebug = Boolean(value);
				}
			);
		},
	};
}
