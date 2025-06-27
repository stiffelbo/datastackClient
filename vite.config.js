import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,        // 👈 ustawienie portu dev
    open: true,        // (opcjonalnie) otwórz automatycznie
    strictPort: true,  // (opcjonalnie) jak zajęty to nie przełącza
  },
  base: '/datastack/', // jeśli hostujesz w podkatalogu
});