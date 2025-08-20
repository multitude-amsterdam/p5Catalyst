import type { Config, GUIControllerInterface, Plugin, State } from '../types';
import type { imageFileType } from '../types/plugin';

export function imageExportPlugin(fileType: imageFileType): Plugin {
	return {
		name: 'image_export',
		setup: (gui: GUIControllerInterface, state: State, config?: Config) => {
			if (fileType !== 'jpg' || 'png' || 'webp') {
				console.log('p5Catalyst can only export jpg, png or webp');
			}
			let fileName = config?.fileName || 'p5Catalyst';

			const exportTab = gui.getTab('export');

			const exportField = gui.addField(
				'imageExportField',
				'button-group column'
			);

			const buttonGroup = gui.addField('buttonGroup', 'button-group row');

			const title = gui.addTitle(3, 'Export Image');

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

			exportField.div.child(title.div);
			buttonGroup.div.child(copyButton.div);
			buttonGroup.div.child(downloadButton.div);
			exportField.div.child(buttonGroup.div);

			exportTab?.addFields(exportField);
		},
	};
}
