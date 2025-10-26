export interface Config {
	defaultLanguage?: string;
	userDictionary?: Dictionary;
	fileName?: string;
	contactMail?: string;
	doCreateRandomizer?: boolean;
	doClearBackground?: boolean;
	doWebglMode?: boolean;
}

export interface UserConfig extends Pick<Config, 'fileName' | 'contactMail'> {}

export type ImageFileType = 'png' | 'jpg' | 'webp';
