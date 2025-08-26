import { defineConfig } from 'vite';

export const config = defineConfig({
        server: {
                headers: {
                        'Cross-Origin-Embedder-Policy': 'require-corp',
                        'Cross-Origin-Opener-Policy': 'same-origin',
                },
        },
        optimizeDeps: {
                exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
        },
});
