export interface VideoFormatSettings {
	ext: string;
	mimeType: string;
	crf?: 21; // inverse quality (constant rate factor)
	command: string;
}
