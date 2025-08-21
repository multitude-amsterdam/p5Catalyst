import { COLUMN, ROW } from '../gui/components/group';
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

			const exportGroup = exportTab?.addGroup('imageExportField', COLUMN);
			exportGroup?.addTitle(3, 'Export Image');

			const buttonGroup = exportGroup?.addGroup('buttonGroup', ROW);

			buttonGroup?.addButton(
				'buttonCopyPNG',
				'LANG_COPY_TO_CLIPBOARD',
				controller => {
					state.canvasToClipboard();
				}
			);

			buttonGroup?.addButton(
				'buttonDownloadImage',
				'LANG_DOWNLOAD_IMAGE',
				controller => {
					state.exportImage(fileType, fileName);
				}
			);
		},
	};
}
