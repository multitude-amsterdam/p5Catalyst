export interface Config {
	defaultLanguage?: string;
	userDictionary?: Dictionary;
	fileName?: string;
	contactMail?: string;
	createRandomizer?: boolean;
	clearBackground?: boolean;
}

export interface UserConfig extends Pick<Config, 'fileName' | 'contactMail'> {}

export type ImageFileType = 'png' | 'jpg' | 'webp';
