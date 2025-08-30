import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

<<<<<<< HEAD

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
=======
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()]
>>>>>>> f838246f65dfb83cf91b3b75bed3392ca020fcac
})
