import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    // server: {
    //     host: '0.0.0.0',
    //     port: 5173,
    //     strictPort: true,
    //     cors: {
    //         origin: '*',
    //         methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    //         allowedHeaders: ['Content-Type', 'Authorization'],
    //     },
    //     hmr: {
    //         host: '192.168.1.7',
    //         protocol: 'ws',
    //         port: 5173,
    //     },
    //     watch: {
    //         usePolling: true,
    //     },
    //     origin: 'http://192.168.1.7:5173',
    // },
    //     origin: 'http://192.168.1.7:5173',
    // },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['tests/Frontend/setup.ts'],
    },
});
