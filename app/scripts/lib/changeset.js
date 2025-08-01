class ChangeSet {
	static localStorageKey = 'changeset';

	changeset = [];
	index = -1; // no state yet

	constructor(doInitFromLocalStorage = false) {
		this.doInitFromLocalStorage = doInitFromLocalStorage;
		if (this.doInitFromLocalStorage) {
			this.restoreFromLocalStorage();
		} else {
			this.save();
		}
	}

	getState() {
		return { gui: gui.getState() };
	}

	cutToIndex() {
		this.changeset = this.changeset.slice(0, this.index + 1);
	}

	addState(json) {
		if (this.changeset[this.index] == json) return;

		this.cutToIndex();
		this.changeset.push(json);
		this.index++;
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

	restore(json) {
		const state = JSON.parse(json);
		if (state.gui) gui.restoreState(state.gui);
	}

	saveToLocalStorage(json) {
		localStorage[ChangeSet.localStorageKey] = json;
	}

	restoreFromLocalStorage() {
		const json = localStorage[ChangeSet.localStorageKey];
		if (!json || json.length <= 2) {
			return;
		}
		this.restore(json);
	}

	download(fileName, doMinify = true) {
		const json = this.changeset[this.index];
		saveJSON(
			JSON.parse(json),
			fileName + '_' + Generator.getOutputFileName('settings'),
			doMinify
		);
	}

	loadFromJSON(json) {
		this.addState(json);
		this.restore(this.changeset[this.index]);
	}
}
