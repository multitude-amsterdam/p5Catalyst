export type LangCode = 'en' | 'nl';

export type DictionaryEntry = { [key in LangCode]: string };
export type Dictionary = {
	[key: string]: DictionaryEntry;
};
