import { defineConfig } from 'vite';

export default defineConfig({
	server: {
		headers: {
			'Cross-Origin-Embedder-Policy': 'require-corp',
			'Cross-Origin-Opener-Policy': 'same-origin',
			'test': 'test',
		},
	},
	optimizeDeps: {
		exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
	},
});
