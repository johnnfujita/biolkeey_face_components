import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
//@ts-ignore
import crossOriginIsolation from 'vite-plugin-cross-origin-isolation'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), crossOriginIsolation()],
})
