import { defineConfig } from 'vite';

export default defineConfig({
	server: {
		headers: {
			'Cross-Origin-Embedder-Policy': 'require-corp',
			'Cross-Origin-Opener-Policy': 'same-origin',
		},
	},
	optimizeDeps: {
		exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
	},
	test: {
		environment: 'jsdom',
		include: ['tests/**/*.test.ts'],
	},
	base: '',
});
