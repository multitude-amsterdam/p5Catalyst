import type { ResolutionTextBoxes } from '../gui/components';
import type { Plugin } from '../types';

import { COLUMN } from '../gui/components/groups/Group';

const resolutionPresets: string[] = [
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

	getASeriesPaperResolutionOptionAtDpi(5, 300),
	getASeriesPaperResolutionOptionAtDpi(4, 300),
	getASeriesPaperResolutionOptionAtDpi(3, 300),
	getASeriesPaperResolutionOptionAtDpi(2, 300),
	getASeriesPaperResolutionOptionAtDpi(1, 300),
	getASeriesPaperResolutionOptionAtDpi(0, 300),
	getASeriesPaperResolutionOptionAtDpi(5, 300, false),
	getASeriesPaperResolutionOptionAtDpi(4, 300, false),
	getASeriesPaperResolutionOptionAtDpi(3, 300, false),
	getASeriesPaperResolutionOptionAtDpi(2, 300, false),
	getASeriesPaperResolutionOptionAtDpi(1, 300, false),
	getASeriesPaperResolutionOptionAtDpi(0, 300, false),
];

function getASeriesPaperResolutionOptionAtDpi(
	sizeASeriesPaper: number,
	dpi: number,
	isPortrait: boolean = true
): string {
	// A0 paper size in mm
	const baseWidth = 841;
	const baseHeight = 1189;
	const factor = Math.pow(2, sizeASeriesPaper / 2);
	const wMm = Math.floor(baseWidth / factor);
	const hMm = Math.floor(baseHeight / factor);
	const wPx = Math.round((wMm / 25.4) * dpi);
	const hPx = Math.round((hMm / 25.4) * dpi);
	return (
		`A${sizeASeriesPaper} ${
			isPortrait ? 'LANG_PORTRAIT' : 'LANG_LANDSCAPE'
		} @ ${dpi} DPI: ` +
		`${isPortrait ? wPx : hPx} x ${isPortrait ? hPx : wPx}`
	);
}

export function resolutionPlugin(resolutionOptions?: string[]): Plugin {
	return {
		name: 'resolution',

		beforeUserCreatesGui: (gui, sketch, config) => {
			const appearanceTab = gui.getTab('appearance');

			const panel = appearanceTab?.addPanel('LANG_RESOLUTION', true);

			const group = panel?.addGroup('resolutionGroup', COLUMN);

			group?.addResolutionSelect(
				'Presets',
				resolutionOptions || resolutionPresets,
				0,
				(controller, value) => {
					const resbox = gui.getController<ResolutionTextBoxes>(
						'resolutionTextboxes'
					);
					resbox?.setValueOnlyDisplay(sketch.width, sketch.height);
				}
			);

			group?.addResolutionTextBoxes(sketch.width, sketch.height);
		},
	};
}
