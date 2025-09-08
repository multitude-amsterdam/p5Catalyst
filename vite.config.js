import { defineConfig } from 'vite';

export default defineConfig({
	server: {
		headers: {
			'Cross-Origin-Embedder-Policy': 'credentialless',
			'Cross-Origin-Opener-Policy': 'same-origin',
		},
	},
	optimizeDeps: {
		exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
	},
});
