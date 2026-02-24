import {
	appTitlePlugin,
	languagePlugin,
	resolutionPlugin,
	backdropPlugin,
	randomizerPlugin,
	imageExportPlugin,
	videoExportPlugin,
	storeSettingsPlugin,
	shaderTemplatePlugin,
} from './lib/plugins';

export const plugins = [
	appTitlePlugin('p5Catalyst Project'), // set app name
	shaderTemplatePlugin({ enabled: false }), // set enabled=true to render with the shader template
	languagePlugin('en'),

	{
		// custom plugin to create tabs
		name: 'create-tabs',
		beforeUserCreatesGui: (gui, sketch, config) => {
			gui.addTabs('appearance', 'export');
		},
	},

	// appearance tab
	resolutionPlugin(), // variable-size canvas
	// (gui creation for appearance in main.js happens here)
	backdropPlugin(), // upload images to feed the shader or fallback sketch
	randomizerPlugin([
		// names of controllers to add to the randomizer
		'colorBoxesCircle',
		'sliderCircleDiameter',
		'colorBoxesBg',
		'sliderNBg',
		'sliderShaderAA',
		'sliderShaderLogoScale',
		'sliderShaderPanX',
		'sliderShaderPanY',
		'sliderShaderPlaneOffset',
		'sliderShaderInfPlaneColorSet',
		'sliderShaderK',
		'toggleShaderBackdrop',
		'toggleShaderDebug',
	]),

	// export tab
	imageExportPlugin('png'), // download as png
	videoExportPlugin(), // record and download as video
	storeSettingsPlugin(), // download and load settings as json

	// template for custom plugin:
	// {
	// 	name: 'customPlugin',
	// 	beforeGuiExists(sketch, config) {
	// 		console.log('beforeGuiExists!');
	// 	},
	// 	beforeUserCreatesGui: (gui, sketch, config) => {
	// 		console.log('beforeUserCreatesGui!');
	// 	},
	// 	afterUserCreatesGui: (gui, sketch, config) => {
	// 		console.log('afterUserCreatesGui!');
	// 	},
	// },
];
