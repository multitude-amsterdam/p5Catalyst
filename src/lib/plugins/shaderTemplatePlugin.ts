import type p5 from 'p5';
import type { ExtensibleP5, Plugin } from '../types';

type ShaderTemplateState = {
	enabled: boolean;
	vertPath: string;
	fragPath: string;
	shader?: p5.Shader;
	AA: number;
	logoScale: number;
	panX: number;
	panY: number;
	planeOffset: number;
	infPlaneColorSet: number;
	K: number;
	doDrawBackdrop: boolean;
	debug: boolean;
	utilBools: boolean[];
};

type ShaderTemplateAPI = {
	enabled: boolean;
	state: ShaderTemplateState;
	setup: () => Promise<void>;
	draw: () => boolean;
};

export type ShaderTemplatePluginOptions = {
	enabled?: boolean;
	vertPath?: string;
	fragPath?: string;
	panelOpen?: boolean;
};

function createDefaultState(
	enabled: boolean,
	vertPath: string,
	fragPath: string
): ShaderTemplateState {
	return {
		enabled,
		vertPath,
		fragPath,
		shader: undefined,
		AA: 2,
		logoScale: 1,
		panX: 0,
		panY: 0,
		planeOffset: 0,
		infPlaneColorSet: 0.25,
		K: 8,
		doDrawBackdrop: true,
		debug: false,
		utilBools: new Array(10).fill(false),
	};
}

function setCoreUniforms(sketch: ExtensibleP5, state: ShaderTemplateState) {
	const catalyst = sketch.catalyst;
	const shader = state.shader;
	if (!catalyst || !shader) return;

	const hasBackdrop = Boolean(sketch.backdrop);
	const utilBools = [...state.utilBools];
	utilBools[0] = state.debug;
	utilBools[1] = state.doDrawBackdrop && hasBackdrop;

	shader.setUniform('resolution', [sketch.width, sketch.height]);
	shader.setUniform('mouse', [
		sketch.mouseX,
		sketch.height - sketch.mouseY,
		sketch.mouseIsPressed ? 1 : 0,
	]);
	shader.setUniform('progress', catalyst.progress);
	shader.setUniform('time', catalyst.time);
	shader.setUniform('scrollVal', catalyst.mouseWheelScale);
	shader.setUniform('logoScale', state.logoScale);
	shader.setUniform('doDrawBackdrop', state.doDrawBackdrop && hasBackdrop);
	shader.setUniform('backdropResolution', hasBackdrop ? [
		sketch.backdrop.width,
		sketch.backdrop.height,
	] : [1, 1]);
	if (hasBackdrop) shader.setUniform('backdrop', sketch.backdrop);

	shader.setUniform('SSIDHash', catalyst.sessionHash);
	shader.setUniform('utilBools', utilBools.map(v => (v ? 1 : 0)));
	shader.setUniform('K', Math.round(state.K));
	shader.setUniform('AA', Math.max(1, Math.min(5, Math.round(state.AA))));
	shader.setUniform('pan', [state.panX, state.panY]);
	shader.setUniform('planeOffset', state.planeOffset);
	shader.setUniform('infPlaneColorSet', state.infPlaneColorSet);
	shader.setUniform('debug', state.debug);
}

function createShaderTemplateAPI(
	sketch: ExtensibleP5,
	state: ShaderTemplateState
): ShaderTemplateAPI {
	return {
		enabled: state.enabled,
		state,
		setup: async () => {
			if (!state.enabled || state.shader) return;
			try {
				state.shader = await sketch.loadShader(state.vertPath, state.fragPath);
			} catch (error) {
				console.error('Failed to load shader template.', error);
			}
		},
		draw: () => {
			if (!state.enabled || !state.shader) return false;

			sketch.shader(state.shader);
			setCoreUniforms(sketch, state);

			sketch.resetMatrix();
			sketch.rectMode(sketch.CENTER);
			sketch.noStroke();
			sketch.rect(0, 0, sketch.width, sketch.height);
			return true;
		},
	};
}

export function shaderTemplatePlugin(
	options: ShaderTemplatePluginOptions = {}
): Plugin {
	const {
		enabled = false,
		vertPath = 'shaders/shader.vert',
		fragPath = 'shaders/shader.frag',
		panelOpen = false,
	} = options;

	return {
		name: 'shader-template',

		beforeGuiExists: (sketch, config) => {
			const state = createDefaultState(enabled, vertPath, fragPath);
			sketch.shaderTemplate = createShaderTemplateAPI(sketch, state);

			if (enabled) {
				config.doWebglMode = true;
			}
		},

		beforeUserCreatesGui: (gui, sketch) => {
			const shaderTemplate = sketch.shaderTemplate as
				| ShaderTemplateAPI
				| undefined;
			if (!shaderTemplate?.enabled) return;

			const appearanceTab = gui.getTab('appearance') || gui;
			const panel = appearanceTab.addPanel('Shader template', panelOpen);
			const state = shaderTemplate.state;

			panel.addSlider(
				'sliderShaderAA',
				'AA',
				1,
				5,
				state.AA,
				1,
				(controller, value) => {
					state.AA = Math.max(1, Math.min(5, Math.round(value as number)));
				}
			);
			panel.addSlider(
				'sliderShaderLogoScale',
				'Logo scale',
				0,
				6,
				state.logoScale,
				0.001,
				(controller, value) => {
					state.logoScale = value as number;
				}
			);
			panel.addSlider(
				'sliderShaderPanX',
				'Pan x',
				-4,
				4,
				state.panX,
				0.001,
				(controller, value) => {
					state.panX = value as number;
				}
			);
			panel.addSlider(
				'sliderShaderPanY',
				'Pan y',
				-4,
				4,
				state.panY,
				0.001,
				(controller, value) => {
					state.panY = value as number;
				}
			);
			panel.addSlider(
				'sliderShaderPlaneOffset',
				'Plane offset',
				-2,
				2,
				state.planeOffset,
				0.001,
				(controller, value) => {
					state.planeOffset = value as number;
				}
			);
			panel.addSlider(
				'sliderShaderInfPlaneColorSet',
				'Inf plane color set',
				-2,
				2,
				state.infPlaneColorSet,
				0.001,
				(controller, value) => {
					state.infPlaneColorSet = value as number;
				}
			);
			panel.addSlider(
				'sliderShaderK',
				'K',
				0,
				64,
				state.K,
				1,
				(controller, value) => {
					state.K = Math.round(value as number);
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
				'toggleShaderDebug',
				'Debug off',
				'Debug on',
				state.debug,
				(controller, value) => {
					state.debug = Boolean(value);
				}
			);
		},
	};
}
