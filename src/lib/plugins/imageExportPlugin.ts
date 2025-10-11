import type { ExtensibleP5, Config, Plugin, ImageFileType } from '../types';
import type { CatalystGUI } from '../gui/CatalystGUI';
import { COLUMN, ROW } from '../gui/components/groups/Group';

export function imageExportPlugin(fileType: ImageFileType): Plugin {
	return {
		name: 'image_export',
		afterUserCreatesGui: (
			gui: CatalystGUI,
			sketch: ExtensibleP5,
			config: Config
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
					sketch.catalyst?.copyCanvasToClipboard();
				}
			);

			buttonGroup?.addButton(
				'buttonDownloadImage',
				'LANG_DOWNLOAD_IMAGE',
				controller => {
					sketch.catalyst?.exportImage(fileType, fileName);
				}
			);

			panel?.open();
		},
	};
}
