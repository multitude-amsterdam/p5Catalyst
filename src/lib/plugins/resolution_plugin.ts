import type { ResolutionTextboxes } from '../gui/components';
import { COLUMN } from '../gui/components/groups/group';

import type { State, Plugin, GUIControllerInterface } from '../types';

// Language plugin
export function resolutionPlugin(resolutionOptions: string[]): Plugin {
	return {
		name: 'resolution',
		setup: (gui: GUIControllerInterface, state: State) => {
			const exportTab = gui.getTab('export');
			const resolutionField = exportTab?.addGroup(
				'resolutionField',
				COLUMN
			);
			resolutionField?.addTitle(3, 'Resolution');
			resolutionField?.addResolutionSelect(
				'',
				resolutionOptions,
				0,
				(controller, value) => {
					const resbox = gui.getController<ResolutionTextboxes>(
						'resolutionTextboxes'
					);
					if (resbox)
						resbox.setValueOnlyDisplay(state.width, state.height);
				}
			);
			resolutionField?.addResolutionTextBoxes(state.width, state.height);
		},
	};
}

export const resolutionPresets = [
	'Full-HD (1080p) LANG_PORTRAIT: 1080 x 1920',
	'Full-HD (1080p) LANG_LANDSCAPE: 1920 x 1080',
	'4K-Ultra-HD (2160p): 3840 x 2160',

	'Instagram post LANG_PORTRAIT: 1080 x 1350',
	'(Instagram post LANG_SQUARE): 1080 x 1080',
	'Instagram story: 1080 x 1920',

	'Facebook post LANG_LANDSCAPE: 1200 x 630',
	'Facebook post LANG_PORTRAIT: 630 x 1200',
	'Facebook post LANG_SQUARE: 1200 x 1200',
	'Facebook story: 1080 x 1920',
	'Facebook cover photo: 851 x 315',

	'X post LANG_LANDSCAPE: 1600 x 900',
	'X post LANG_PORTRAIT: 1080 x 1350',
	'X post LANG_SQUARE: 1080 x 1080',
	'X cover photo: 1500 x 500',

	'Linkedin LANG_PROFILEPIC: 400 x 400',
	'Linkedin cover photo: 1584 x 396',
	'Linkedin image post: 1200 x 628',

	'Mastodon post LANG_LANDSCAPE: 1280 x 720',
	'Mastodon post LANG_SQUARE: 1200 x 1200',

	'BlueSky post LANG_LANDSCAPE: 1200 x 675',
	'BlueSky post LANG_SQUARE: 1200 x 1200',
	'BlueSky header: 1500 x 500',

	'YouTube LANG_PROFILEPIC: 800 x 800',
	'YouTube banner: 2048 x 1152',
	'YouTube thumbnail: 1280 x 720',
	'YouTube shorts/stories: 1080 x 1920',

	'TikTok LANG_PORTRAIT: 1080 x 1920',
	'TikTok LANG_SQUARE: 1080 x 1080',

	'PowerPoint: 1920 x 1080',

	getAPaperResolutionOptionAtDpi(5, 300),
	getAPaperResolutionOptionAtDpi(4, 300),
	getAPaperResolutionOptionAtDpi(3, 300),
	getAPaperResolutionOptionAtDpi(2, 300),
	getAPaperResolutionOptionAtDpi(1, 300),
	getAPaperResolutionOptionAtDpi(0, 300),
	getAPaperResolutionOptionAtDpi(5, 300, false),
	getAPaperResolutionOptionAtDpi(4, 300, false),
	getAPaperResolutionOptionAtDpi(3, 300, false),
	getAPaperResolutionOptionAtDpi(2, 300, false),
	getAPaperResolutionOptionAtDpi(1, 300, false),
	getAPaperResolutionOptionAtDpi(0, 300, false),
];

function getAPaperResolutionOptionAtDpi(
	aNumber: number,
	dpi: number,
	isPortrait: boolean = true
) {
	// A0 paper size in mm
	const baseWidth = 841;
	const baseHeight = 1189;
	const factor = Math.pow(2, aNumber / 2);
	const wMm = Math.floor(baseWidth / factor);
	const hMm = Math.floor(baseHeight / factor);
	const wPx = Math.round((wMm / 25.4) * dpi);
	const hPx = Math.round((hMm / 25.4) * dpi);
	return (
		`A${aNumber} ${
			isPortrait ? 'LANG_PORTRAIT' : 'LANG_LANDSCAPE'
		} @ ${dpi} DPI: ` +
		`${isPortrait ? wPx : hPx} x ${isPortrait ? hPx : wPx}`
	);
}
