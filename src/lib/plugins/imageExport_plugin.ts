import type { Config, GUIControllerInterface, Plugin, State } from '../types';
import type { imageFileType } from '../types/plugin';

export const imageExportPlugin: Plugin = (fileType: imageFileType) => ({
	name: 'image_export',
	setup: (gui: GUIControllerInterface, state: State, config: Config) => {
		if (fileType !== 'jpg' || 'png' || 'webp') {
			console.log('p5Catalyst can only export jpg, png or webp');
		}
		let fileName = config.fileName || 'p5Catalyst';

		const exportField = gui.addField('exportField', 'button-group');

		const copyButton = gui.addButton(
			'buttonCopyPNG',
			'LANG_COPY_TO_CLIPBOARD',
			controller => {
				state.canvasToClipboard();
			}
		);
		const downloadButton = gui.addButton(
			'buttonDownloadImage',
			'LANG_DOWNLOAD_IMAGE',
			controller => {
				state.exportImage(fileType, fileName);
			}
		);
		exportField.div.child(copyButton.div);
		exportField.div.child(downloadButton.div);
	},
});
