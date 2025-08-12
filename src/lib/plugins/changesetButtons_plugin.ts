import type { Config, GUIControllerInterface, Plugin, State } from '../types';

export const changesetButtonsPlugin: Plugin = () => ({
	name: 'changeSetButtons',
	setup: (gui: GUIControllerInterface, state: State) => {
		const undoRedoField = gui.addField('', 'button-group');
		const undoButton = gui.addButton('undo', 'LANG_UNDO', controller => {
			gui.undo();
		});
		const redoButton = gui.addButton('redo', 'LANG_REDO', controller => {
			gui.redo();
		});
		undoRedoField.div.child(undoButton.div);
		undoRedoField.div.child(redoButton.div);
	},
});
