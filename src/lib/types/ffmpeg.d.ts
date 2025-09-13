export interface VideoFormatSettings {
	guiName: string;
	ext: string;
	mimeType: string;
	crf?: number; // inverse quality (constant rate factor)
	command: string;
}
