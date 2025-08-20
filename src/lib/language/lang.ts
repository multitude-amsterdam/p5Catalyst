import type { Dictionary, LangCode } from '../types';
import { dictionary } from './dictionary';
/**
 * @fileoverview Simple helper class {@link Lang} used to translate GUI
 * strings into user-defined languages. Modifiable/extensible.
 * @see Lang
 * @see lang
 * @see dictionary
 * @see language
 */

/** list of language keys supported by the dictionary */
const availableLangKeys = Object.keys(dictionary[Object.keys(dictionary)[0]]);

/**
 * Helper class that performs token replacement based on the selected language.
 */
export default class Lang {
	static verbose = false;
	langKey: LangCode;
	dictionary: Dictionary;

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

	constructor(userDictionary?: Dictionary) {
		this.langKey = 'en';
		this.dictionary = { ...dictionary, ...userDictionary };
	}

	/**
	 * Sets the language key to use for translations.
	 *
	 * If no key is provided, it will try to get the key from the URL.
	 *
	 * @param {LangCode} langKey - The language key to use for translations.
	 * @see availableLangKeys
	 */
	setup(langKey: LangCode) {
		this.langKey = (Lang.getURLLangKey() as LangCode) || langKey;
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
	process(
		str: string,
		doCapitalizeFirstLetter: boolean = false,
		depth: number = 10
	): string {
		// recursively replace all hotStrings in str with their translations
		let replaced = str;
		for (let hotString in this.dictionary) {
			const translation = this.dictionary[hotString][this.langKey];
			if (Lang.verbose && str.match(hotString) != null)
				console.log(hotString, translation);
			replaced = replaced?.replaceAll(hotString, translation);
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

	capFirst(str: string) {
		const ind = this.indexOfFirstAlphabetic(str);
		if (ind == -1) return str;
		return (
			str.slice(0, ind) +
			str.charAt(ind).toUpperCase() +
			str.slice(ind + 1)
		);
	}

	indexOfFirstAlphabetic(str: string) {
		return str.search(/[a-zA-Z]/);
	}
}
