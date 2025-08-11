import type { GUIForP5 } from './gui';

export class ChangeSet {
	static localStorageKey = 'changeset';

	changeset: string[] = [];
	index = -1; // no state yet
	gui: GUIForP5;
	doInitFromLocalStorage = false;

	constructor(gui: GUIForP5, doInitFromLocalStorage = false) {
		this.doInitFromLocalStorage = doInitFromLocalStorage;
		this.gui = gui;
		if (this.doInitFromLocalStorage) {
			this.restoreFromLocalStorage();
		} else {
			this.save();
		}
	}

	getState() {
		return { gui: this.gui.getState() };
	}

	cutToIndex() {
		this.changeset = this.changeset.slice(0, this.index + 1);
	}

	addState(json: string) {
		if (this.changeset[this.index] == json) return;

		this.cutToIndex();
		this.changeset.push(json);
		this.index++;
		console.log(this.changeset);
	}

	save() {
		const json = JSON.stringify(this.getState());
		this.addState(json);

		if (this.doInitFromLocalStorage) this.saveToLocalStorage(json);
	}

	undo() {
		if (this.index <= 0) return false;
		this.index--;
		this.restore(this.changeset[this.index]);
		return true;
	}

	redo() {
		if (this.index >= this.changeset.length - 1) return false;
		this.index++;
		this.restore(this.changeset[this.index]);
		return true;
	}

	restore(json: string) {
		const state = JSON.parse(json);
		if (state.gui) this.gui.restoreState(state.gui);
	}

	saveToLocalStorage(json: string) {
		localStorage[ChangeSet.localStorageKey] = json;
	}

	restoreFromLocalStorage() {
		const json = localStorage[ChangeSet.localStorageKey];
		if (!json || json.length <= 2) {
			return;
		}
		this.restore(json);
	}

	download(fileName: string, doMinify = true) {
		const json = this.changeset[this.index];
		this.gui.p5Instance.saveJSON(
			JSON.parse(json),
			'test',
			// fileName + '_' + Generator.getOutputFileName('settings'),
			doMinify
		);
	}

	loadFromJSON(json: string) {
		this.addState(json);
		this.restore(this.changeset[this.index]);
	}
}
