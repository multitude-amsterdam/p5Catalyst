/**
 * @fileoverview Utility for undo/redo functionality and persistence of GUI state.
 */

/**
 * Stores a sequence of generator/gui states enabling undo and redo.
 */
class ChangeSet {
	static localStorageKey = 'changeset';

	changeset = [];
	index = -1; // no state yet

	/**
	 * @param {boolean} [doInitFromLocalStorage=false] whether to load the
	 * last stored state from localStorage.
	 */
	constructor(doInitFromLocalStorage = false) {
		this.doInitFromLocalStorage = doInitFromLocalStorage;
		if (this.doInitFromLocalStorage) {
			this.restoreFromLocalStorage();
		} else {
			this.save();
		}
	}

	/**
	 * Capture current generator and GUI state.
	 * @returns {gui:Object}}
	 */
	getStates() {
		return {
			generator: generator.getState(),
			gui: gui.getState(),
		};
	}

	/** Remove redo history after current index. */
	cutToIndex() {
		this.changeset = this.changeset.slice(0, this.index + 1);
	}

	/**
	 * Push a new JSON state into the history.
	 * @param {string} json
	 */
	addState(json) {
		if (this.changeset[this.index] == json) return;

		this.cutToIndex();
		this.changeset.push(json);
		this.index++;
	}

	/**
	 * Snapshot the current state and optionally persist it to
	 * localStorage.
	 */
	save() {
		const json = JSON.stringify(this.getStates());
		this.addState(json);

		if (this.doInitFromLocalStorage) this.saveToLocalStorage(json);
	}

	/** Step backward in history. */
	undo() {
		if (this.index <= 0) return;
		this.index--;
		this.restore(this.changeset[this.index]);
	}

	/** Step forward in history. */
	redo() {
		if (this.index >= this.changeset.length - 1) return;
		this.index++;
		this.restore(this.changeset[this.index]);
	}

	/**
	 * Restore a JSON encoded state.
	 * @param {string} json
	 */
	restore(json) {
		const state = JSON.parse(json);
		if (state.generator) generator.restoreState(state.generator);
		if (state.gui) gui.restoreState(state.gui);
	}

	/** Store the JSON state in localStorage. */
	saveToLocalStorage(json) {
		localStorage[ChangeSet.localStorageKey] = json;
	}

	/** Retrieve the last stored state from localStorage. */
	restoreFromLocalStorage() {
		const json = localStorage[ChangeSet.localStorageKey];
		if (!json || json.length <= 2) {
			return;
		}
		this.restore(json);
	}

	/**
	 * Save the current state to disk.
	 * @param {string} fileName base name without extension
	 * @param {boolean} [doMinify=true] whether to minify the JSON
	 * @see Generator.getOutputFileName
	 */
	download(fileName, doMinify = true) {
		const json = this.changeset[this.index];
		saveJSON(
			JSON.parse(json),
			fileName + '_' + Generator.getOutputFileName('settings'),
			doMinify
		);
	}

	/**
	 * Load a state from a JSON string.
	 * @param {string} json
	 */
	loadFromJSON(json) {
		this.addState(json);
		this.restore(this.changeset[this.index]);
	}
}
