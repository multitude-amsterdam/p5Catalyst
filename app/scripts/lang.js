/**
 * @fileoverview Simple helper class {@link Lang} used to translate GUI
 * strings into user-defined languages. Modifiable/extensible.
 * @see Lang
 * @see lang
 * @see dictionary
 * @see language
 */

/**
 * @constant
 * @type {string}
 * @default
 * */
const language = 'en';

/**
 * Holds all translatable "hot strings".
 *
 * The top level keys are replacement tokens used inside the GUI.
 *
 * The dictionary keys should be sorted alphabetically in reverse order,
 * so that the longest keys are replaced first.
 *
 * (Use the VS Code "Sort JS Object keys" extension to sort the keys.)
 *
 * @constant
 * @type {Object<string, {nl:string, en:string}>}
 */
const dictionary = {
	LANG_WRONG_FILE_TYPE_MSG: {
		nl: 'Het verkeerde bestandtype was geselecteerd.',
		en: 'The wrong file type was selected.',
	},
	LANG_WIDTH: {
		nl: 'breedte',
		en: 'width',
	},
	LANG_VIDEO_READY_MSG: {
		nl: 'De video is gereed and wordt gedownload.',
		en: 'The video is ready and will be downloaded.',
	},
	LANG_VIDEO: {
		nl: 'video',
		en: 'video',
	},
	LANG_VID_DURATION: {
		nl: 'duur video',
		en: 'video duration',
	},
	LANG_VID_CAPTURE: {
		nl: 'video-opname',
		en: 'video capture',
	},
	LANG_UNDO: {
		nl: 'ongedaan maken',
		en: 'undo',
	},
	LANG_TITLE_TEXT: {
		nl: 'titeltekst',
		en: 'title text',
	},
	LANG_TEXT: {
		nl: 'tekst',
		en: 'text',
	},
	LANG_SUPPORT: {
		nl: 'ondersteuning',
		en: 'support',
	},
	LANG_SQUARE: {
		nl: 'vierkant',
		en: 'square',
	},
	LANG_SPEED: {
		nl: 'snelheid',
		en: 'speed',
	},
	LANG_SHOW: {
		nl: 'toon',
		en: 'show',
	},
	LANG_SETTINGS: {
		nl: 'instellingen',
		en: 'settings',
	},
	LANG_SELECT: {
		nl: 'selecteer',
		en: 'select',
	},
	LANG_SCALE: {
		nl: 'schaal',
		en: 'scale',
	},
	LANG_SAVE_SETTINGS: {
		nl: 'instellingen opslaan als bestand',
		en: 'save settings as file',
	},
	LANG_REDO: {
		nl: 'opnieuw',
		en: 'redo',
	},
	LANG_RANDOMIZE: {
		nl: 'doe maar wat',
		en: 'randomize',
	},
	LANG_PROFILEPIC: {
		nl: 'profielfoto',
		en: 'profile picture',
	},
	LANG_PORTRAIT: {
		nl: 'staand',
		en: 'portrait',
	},
	LANG_LOAD_SETTINGS: {
		nl: 'open instellingen',
		en: 'open settings file',
	},
	LANG_LANDSCAPE: {
		nl: 'liggend',
		en: 'landscape',
	},
	LANG_IMAGE_POSITION: {
		nl: 'positie afbeelding',
		en: 'image position',
	},
	LANG_IMAGE: {
		nl: 'afbeelding',
		en: 'image',
	},
	LANG_HIDE: {
		nl: 'verberg',
		en: 'hide',
	},
	LANG_TOO_SMALL_IMG_ALERT: {
		nl:
			'De afmetingen van de afbeelding ({0} x {1}) zijn te laag voor een mooi optisch effect.\n' +
			'Kies een afbeelding van ten minste {2} x {3} pixels.',
		en:
			'The dimensions of the image ({0} x {1}) are too low for a good optical effect.\n' +
			'Choose an image of at least {2} x {3} pixels.',
	},
	LANG_TOO_SMALL_IMG: {
		nl: 'Kleiner dan minimum afmetingen: {0} x {1} pixels.',
		en: 'Smaller than minimum dimensions: {0} x {1} pixels.',
	},
	LANG_HELPME_MSG: {
		nl:
			`<h1>Help</h1>` +
			`<div class="helpme">` +
			`<ul>` +
			`<li><span>Laat deze popup zien</span> <span><code>H</code></span></li>` +
			`<li><span>Pauzeren / afspelen animatie</span> <span><code>spatiebalk</code></span></li>` +
			`<li><span>Ongedaan maken / opnieuw</span> <span><code>CTRL / CMD</code> + <code>Z</code></span></li>` +
			`<li><span>Opnieuw</span> <span><code>CTRL / CMD</code> + <code>SHIFT</code> + <code>Z</code></span></li>` +
			`<li><span>Volledig scherm</span> <span><code>F</code></span></li>` +
			`<li><span>Zijbalk verspringen</span> <span><code>B</code></span></li>` +
			`<li><span>Wissel tussen licht/donker thema</span> <span><code>M</code></span></li>` +
			`</ul>` +
			`</div>`,
		en:
			`<h1>Help</h1>` +
			`<div class="helpme">` +
			`<ul>` +
			`<li><span>Show this popup</span> <span><code>H</code></span></li>` +
			`<li><span>Pause / play animation</span> <span><code>spacebar</code></span></li>` +
			`<li><span>Undo</span> <span><code>CTRL / CMD</code> + <code>Z</code></span></li>` +
			`<li><span>Redo</span> <span><code>CTRL / CMD</code> + <code>SHIFT</code> + <code>Z</code></span></li>` +
			`<li><span>Toggle fullscreen</span> <span><code>F</code></span></li>` +
			`<li><span>Flip sidebar</span> <span><code>B</code></span></li>` +
			`<li><span>Toggle light/dark mode</span> <span><code>M</code></span></li>` +
			`</ul>` +
			`</div>`,
	},
	LANG_HELP: {
		nl: 'help',
		en: 'help',
	},
	LANG_HEIGHT: {
		nl: 'hoogte',
		en: 'height',
	},
	LANG_FORMAT: {
		nl: 'formaat',
		en: 'dimensions',
	},
	LANG_FGCOL: {
		nl: 'voorgrondkleur',
		en: 'foreground colour',
	},
	LANG_EXPORT: {
		nl: 'exporteren',
		en: 'export',
	},
	LANG_COPY_TO_CLIPBOARD: {
		nl: 'afbeelding kopiëren',
		en: 'copy image',
	},
	LANG_CONTACT_MSG: {
		nl: 'Contact voor ondersteuning & feedback',
		en: 'Contact for support & feedback',
	},
	LANG_CHOOSE_FILE_NAME_MSG: {
		nl: 'Kies een bestandsnaam:',
		en: 'Choose a file name:',
	},
	LANG_BUTTON: {
		nl: 'knop',
		en: 'button',
	},
	LANG_BODY_TEXT: {
		nl: 'bodytekst',
		en: 'body text',
	},
	LANG_BGCOL: {
		nl: 'achtergrondkleur',
		en: 'background colour',
	},
	LANG_APPEARANCE: {
		nl: 'verschijning',
		en: 'appearance',
	},
};

/** list of language keys supported by the dictionary */
const availableLangKeys = Object.keys(dictionary[Object.keys(dictionary)[0]]);

/**
 * Helper class that performs token replacement based on the selected language.
 */
class Lang {
	static verbose = false;

	static getURLLangKey() {
		// form: "?lang=nl"
		const urlParams = new URLSearchParams(window.location.search);
		let urlLangKey = urlParams.get('lang');
		if (urlLangKey == null) {
			if (Lang.verbose) console.log('No lang key set in URL.');
			return;
		}
		urlLangKey = urlLangKey.toLowerCase();
		if (!availableLangKeys.some(key => key == urlLangKey)) {
			console.error('Lang key set in URL but is invalid: ' + urlLangKey);
			return;
		}
		if (Lang.verbose) console.log('Lang key set: ' + urlLangKey);
		return urlLangKey;
	}

	constructor() {}

	/**
	 * Sets the language key to use for translations.
	 *
	 * If no key is provided, it will try to get the key from the URL.
	 *
	 * @param {string} langKey - The language key to use for translations.
	 * @see availableLangKeys
	 */
	setup(langKey) {
		this.langKey = langKey;
		this.langKey = Lang.getURLLangKey() || langKey;
	}

	/**
	 * Processes the input string by replacing all hot strings with their translations.
	 * @param {string} str - The string to process.
	 * @param {boolean} [doCapitalizeFirstLetter=false] - Whether to capitalize the first letter of the processed string.
	 * @param {number} [depth=10] - The maximum recursion depth to prevent infinite loops.
	 * @returns {string} - The processed string with all hot strings replaced by their translations or the original string if no replacements were made.
	 * @see dictionary
	 * @see lang
	 */
	process(str, doCapitalizeFirstLetter = false, depth = 10) {
		// recursively replace all hotStrings in str with their translations
		let replaced = str;
		for (let hotString in dictionary) {
			const translation = dictionary[hotString][this.langKey];
			if (Lang.verbose && str.match(hotString) != null)
				console.log(hotString, translation);
			replaced = replaced.replaceAll(hotString, translation);
		}
		if (str === replaced) {
			return replaced;
		}
		if (depth <= 0) {
			console.error(
				'Lang.process() reached max depth without replacing all strings.'
			);
			return replaced;
		}

		if (doCapitalizeFirstLetter) {
			replaced = this.capFirst(replaced);
		}
		return this.process(replaced, doCapitalizeFirstLetter, depth - 1);
	}

	capFirst(str) {
		const ind = this.indexOfFirstAlphabetic(str);
		if (ind == -1) return str;
		return (
			str.slice(0, ind) +
			str.charAt(ind).toUpperCase() +
			str.slice(ind + 1)
		);
	}

	indexOfFirstAlphabetic(str) {
		return str.search(/[a-zA-Z]/);
	}
}

/**
 * Global instance of {@link Lang} used throughout the GUI for translations.
 * @type {Lang}
 */
const lang = new Lang();
