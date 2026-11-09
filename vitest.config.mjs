import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
export default defineConfig({
    // Never load developer .env files or contact a real API in tests.
    envDir: '/nonexistent-jisme-test-env',
    plugins: [vue()],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    test: { environment: 'node', setupFiles: ['./tests/setup.js'], maxWorkers: 1, minWorkers: 1 },
});
