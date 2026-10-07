import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.BACKEND_URL || process.env.BACKEND_URL || 'https://new-ecoloop-backend.onrender.com'

  return {
    plugins: [react()],
    base: '/',
    build: {
      outDir: 'dist',
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          headers: {
            Origin: backendUrl,
            Referer: backendUrl,
          },
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Origin', backendUrl)
              proxyReq.setHeader('Referer', backendUrl)
            })
          },
        },
        '/actuator': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          headers: {
            Origin: backendUrl,
            Referer: backendUrl,
          },
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Origin', backendUrl)
              proxyReq.setHeader('Referer', backendUrl)
            })
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
  }
})
