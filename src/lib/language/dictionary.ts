import type { Dictionary } from '../types';
import { getControlKeyName } from '../utils/data';

/**
 * Holds all translatable "hot strings".
 *
 * The top level keys are replacement tokens used inside the GUI.
 *
 * The dictionary keys should be sorted alphabetically in reverse order,
 * so that the longest keys are replaced first.
 *
 * (Use the VS Code "Sort JS Object keys" extension to sort the keys.)
 * (Use "JS Sort Object Keys (Reverse)" to sort in reverse order.)
 * (Only select the outer most braces for this to work correctly.)
 */
export const dictionary: Dictionary = {
	LANG_WRONG_FILE_TYPE_MSG: {
		nl: '<h1>Verkeerd bestandstype</h1><p>Het verkeerde bestandtype was geselecteerd.</p>',
		en: '<h1>Wrong file type</h1><p>The wrong file type was selected.</p>',
	},
	LANG_WIDTH: {
		nl: 'breedte',
		en: 'width',
	},
	LANG_VIDEO_READY_MSG: {
		nl: '<h1>Video gereed</h1><p>De video is gereed and is gedownload.</p>',
		en: '<h1>Video ready</h1><p>The video is ready and was downloaded.</p>',
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
	LANG_TOO_SMALL_IMG_ALERT: {
		nl:
			'<h1>Afbeelding te klein</h1><p>De afmetingen van de afbeelding ({0} x {1}) zijn te laag voor een mooi optisch effect.\n' +
			'Kies een afbeelding van ten minste {2} x {3} pixels.</p>',
		en:
			'<h1>Image too small</h1><p>The dimensions of the image ({0} x {1}) are too low for a good optical effect.\n' +
			'Choose an image of at least {2} x {3} pixels.</p>',
	},
	LANG_TOO_SMALL_IMG: {
		nl: 'Kleiner dan minimum afmetingen: {0} x {1} pixels.',
		en: 'Smaller than minimum dimensions: {0} x {1} pixels.',
	},
	LANG_TITLE_TEXT: {
		nl: 'titeltekst',
		en: 'title text',
	},
	LANG_FRAME_RATE: {
		en: 'frame rate',
		nl: 'framerate',
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
	LANG_RESET: {
		nl: 'resetten',
		en: 'reset',
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
	LANG_LIGHT_MODE: {
		nl: 'licht thema',
		en: 'light theme',
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
	LANG_HELPME_MSG: {
		nl:
			`<h1>Help</h1>` +
			`<div class="helpme">` +
			`<ul>` +
			`<li><span>Geselcteerde controls randomizen</span> <span><code>R</code></span></li>` +
			`<li><span>Pauzeren / afspelen animatie</span> <span><code>spatiebalk</code></span></li>` +
			`<li><span>Ongedaan maken</span> <span><code>${getControlKeyName()}</code> + <code>Z</code></span></li>` +
			`<li><span>Opnieuw</span> <span><code>${getControlKeyName()}</code> + <code>SHIFT</code> + <code>Z</code></span></li>` +
			`<li><span>Volledig scherm</span> <span><code>F</code></span></li>` +
			`<li><span>Zijbalk verspringen</span> <span><code>B</code></span></li>` +
			`<li><span>Wissel tussen licht/donker thema</span> <span><code>M</code></span></li>` +
			`<li><span>Laat deze popup zien</span> <span><code>H</code></span></li>` +
			`</ul>` +
			`</div>`,
		en:
			`<h1>Help</h1>` +
			`<div class="helpme">` +
			`<ul>` +
			`<li><span>Randomize selected controls</span> <span><code>R</code></span></li>` +
			`<li><span>Pause / play animation</span> <span><code>spacebar</code></span></li>` +
			`<li><span>Undo</span> <span><code>${getControlKeyName()}</code> + <code>Z</code></span></li>` +
			`<li><span>Redo</span> <span><code>${getControlKeyName()}</code> + <code>SHIFT</code> + <code>Z</code></span></li>` +
			`<li><span>Toggle fullscreen</span> <span><code>F</code></span></li>` +
			`<li><span>Flip sidebar</span> <span><code>B</code></span></li>` +
			`<li><span>Toggle light/dark mode</span> <span><code>M</code></span></li>` +
			`<li><span>Show this popup</span> <span><code>H</code></span></li>` +
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
	LANG_RESOLUTION: {
		nl: 'resolutie',
		en: 'resolution',
	},
	LANG_FGCOL: {
		nl: 'voorgrondkleur',
		en: 'foreground color',
	},
	LANG_EXPORT: {
		nl: 'exporteren',
		en: 'export',
	},
	LANG_DOWNLOAD_IMAGE: {
		nl: 'afbeelding downloaden',
		en: 'download image',
	},
	LANG_DARK_MODE: {
		nl: 'donker thema',
		en: 'dark theme',
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
		en: 'background color',
	},
	LANG_APPEARANCE: {
		nl: 'verschijning',
		en: 'appearance',
	},
};
