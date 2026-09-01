import { ROW } from '../gui/components/groups/Group';
import type { ExtensibleP5, Plugin } from '../types';
import { parseSvg, type ImportedSvg } from './svg/importSvg';

export { parseSvg, type ImportedSvg } from './svg/importSvg';

export type SvgImportPluginOptions = {
	autoDraw?: boolean;
	onLoad?: (svg: ImportedSvg, sketch: ExtensibleP5) => void;
};

async function readSvgSource(file: any): Promise<string> {
	if (typeof file?.file?.text === 'function') return await file.file.text();
	const data = String(file?.data || '');
	if (!data.startsWith('data:')) return data;
	const separator = data.indexOf(',');
	if (separator < 0) throw new Error('Invalid SVG data URL.');
	const metadata = data.slice(0, separator);
	const payload = data.slice(separator + 1);
	if (!metadata.includes(';base64')) return decodeURIComponent(payload);
	const bytes = Uint8Array.from(atob(payload), character =>
		character.charCodeAt(0)
	);
	return new TextDecoder().decode(bytes);
}

export function svgImportPlugin(
	options: SvgImportPluginOptions = {}
): Plugin {
	const installedSketches = new WeakSet<ExtensibleP5>();
	const autoDraw = options.autoDraw ?? true;

	const installApi = (sketch: ExtensibleP5) => {
		if (installedSketches.has(sketch)) return;
		installedSketches.add(sketch);
		sketch.importSvg = (svgContent: string) => {
			const importedSvg = parseSvg(svgContent);
			sketch.importedSvg = importedSvg;
			options.onLoad?.(importedSvg, sketch);
			return importedSvg;
		};
		sketch.drawImportedSvg = (
			x = 0,
			y = 0,
			width = sketch.importedSvg?.width,
			height = sketch.importedSvg?.height
		) => {
			if (!sketch.importedSvg || width == null || height == null) return;
			sketch.importedSvg.draw(sketch, x, y, width, height);
		};

		if (autoDraw) {
			const draw = sketch.draw;
			sketch.draw = function () {
				const result = draw?.call(this);
				sketch.drawImportedSvg(0, 0, sketch.width, sketch.height);
				return result;
			};
		}
	};

	return {
		name: 'svg_import',
		beforeGuiExists: sketch => installApi(sketch),
		afterUserCreatesGui: (gui, sketch) => {
			installApi(sketch);
			const appearanceTab = gui.getTab('appearance') || gui;
			const panel = appearanceTab.addPanel('Import SVG', false);
			const buttons = panel.addGroup('svgImportButtons', ROW);
			const loader = buttons.addTextLoader(
				'svgImportLoader',
				'LANG_LOAD_SVG',
				async file => {
					try {
						sketch.importSvg(await readSvgSource(file));
						if (!sketch.isLooping()) await sketch.redraw(1);
					} catch (error) {
						console.error('SVG import failed.', error);
						gui.dialog.alert(
							'<h1>SVG import failed</h1>' +
								'<p>The selected file could not be imported. Check the console for details.</p>'
						);
					}
				}
			);
			if (loader.controllerElement) {
				(loader.controllerElement.elt as HTMLInputElement).accept =
					'.svg,image/svg+xml';
			}
			buttons.addButton('clearImportedSvg', 'LANG_CLEAR_SVG', async () => {
				delete sketch.importedSvg;
				if (!sketch.isLooping()) await sketch.redraw(1);
			});
		},
	};
}
