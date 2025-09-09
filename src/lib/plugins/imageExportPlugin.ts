import { COLUMN, ROW } from '../gui/components/groups/Group';
import type {
	Config,
	GUIControllerInterface,
	Plugin,
	Container,
} from '../types';
import type { imageFileType } from '../types/plugin';

export function imageExportPlugin(fileType: imageFileType): Plugin {
	return {
		name: 'image_export',
		setup: (
			gui: GUIControllerInterface,
			container: Container,
			config?: Config
		) => {
			if (
				fileType !== 'jpg' &&
				fileType !== 'png' &&
				fileType !== 'webp'
			) {
				console.error('p5Catalyst can only export jpg, png or webp');
			}
			let fileName = config?.fileName || 'p5Catalyst';

			const exportTab = gui.getTab('export');

			const panel = exportTab?.addPanel('Export image');

			const buttonGroup = panel?.addGroup('buttonGroup', ROW);

			buttonGroup?.addButton(
				'buttonCopyPNG',
				'LANG_COPY_TO_CLIPBOARD',
				controller => {
					container.sketchHook?.copyCanvasToClipboard();
				}
			);

			buttonGroup?.addButton(
				'buttonDownloadImage',
				'LANG_DOWNLOAD_IMAGE',
				controller => {
					container.sketchHook?.exportImage(fileType, fileName);
				}
			);

			panel?.open();
		},
	};
}
