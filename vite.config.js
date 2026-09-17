import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

function localApiPlugin() {
  return {
    name: 'local-api-handler',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/recipe-ai')) {
          try {
            const { default: handler } = await import('./api/recipe-ai.js')
            let body = ''
            req.on('data', (chunk) => { body += chunk })
            req.on('end', async () => {
              try {
                req.body = body ? JSON.parse(body) : {}
              } catch {
                req.body = {}
              }
              res.status = (code) => {
                res.statusCode = code
                return res
              }
              res.json = (data) => {
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify(data))
                return res
              }
              await handler(req, res)
            })
          } catch (err) {
            console.error('Local API Dev Middleware error:', err)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: err.message || 'Server error' }))
          }
          return
        }
        next()
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  if (env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY = env.GEMINI_API_KEY
  }

  return {
    plugins: [
      react(),
      localApiPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'icons.svg'],
        manifest: {
          name: "Project Usaari Evening School",
          short_name: "Project Usaari",
          description: "Executive Student Attendance & Registration PWA by Initiators of Change",
          theme_color: '#0F172A',
          background_color: '#080C14',
          start_url: '/',
          display: 'standalone',
          orientation: 'portrait',
          icons: [
            { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }
          ]
        },
        workbox: { globPatterns: ['**/*.{js,css,html,ico,png,svg}'] }
      })
    ],
  }
})
