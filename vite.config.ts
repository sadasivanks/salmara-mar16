import { defineConfig, loadEnv, type Connect } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import type { IncomingMessage, ServerResponse } from "http";
import dns from "node:dns";

// Force IPv4-first DNS resolution to fix "fetch failed" issues on some local networks
dns.setDefaultResultOrder("ipv4first");

// Tiny plugin to route /api requests to the local ./api/*.ts files during development
function apiRouter() {
  return {
    name: 'api-router',
    configureServer(server: any) {
      // Load .env variables into process.env for local development
      const env = loadEnv('development', process.cwd(), '');
      Object.assign(process.env, env);

      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
        if (!req.url || !req.url.startsWith('/api/')) {
          return next();
        }

        // Parse query parameters
        const url = new URL(req.url, `http://${req.headers.host}`);
        (req as any).query = Object.fromEntries(url.searchParams);

        // Clean up URL and find the matching file in /api
        const apiFilePath = path.resolve(__dirname, `.${url.pathname}.ts`);

        try {
          // Load the API handler dynamically using Vite's SSR engine
          const module = await server.ssrLoadModule(apiFilePath);
          const handler = module.default;

          if (!handler) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: `No default export found in ${url.pathname}.ts` }));
            return;
          }

          // Parse body if it's a POST/PUT request and not yet parsed
          if (['POST', 'PUT', 'PATCH'].includes(req.method || '') && !(req as any).body) {
            let body = '';
            for await (const chunk of req) {
              body += chunk;
            }
            try {
              (req as any).body = JSON.parse(body);
            } catch (e) {
              (req as any).body = body;
            }
          }

          // Add helper methods to match Vercel/Express-like response objects
          (res as any).status = (code: number) => {
            res.statusCode = code;
            return res;
          };
          (res as any).json = (data: any) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
            return res;
          };

          // Execute the handler
          await handler(req, res);
        } catch (error: any) {
          console.error(`[API Error] ${url.pathname}:`, error.message);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: "Internal Server Error", message: error.message }));
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  assetsInclude: ["**/*.webp"],
  plugins: [
    react(),
    apiRouter(), // Injects the local API router
    ViteImageOptimizer({
      test: /\.(jpe?g|png|gif|tiff|webp|svg|avif)$/i,
      exclude: undefined,
      include: undefined,
      includePublic: true,
      logStats: true,
      ansiColors: true,
      svg: {
        multipass: true,
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                cleanupIds: false,
                removeViewBox: false,
              },
            },
          },
          'sortAttrs',
          {
            name: 'addAttributesToSVGElement',
            params: {
              attributes: [{ xmlns: 'http://www.w3.org/2000/svg' }],
            },
          },
        ],
      },
      png: {
        quality: 80,
      },
      jpeg: {
        quality: 80,
      },
      jpg: {
        quality: 80,
      },
      webp: {
        lossless: true,
      },
      avif: {
        lossless: true,
      },
      cache: true,
      cacheLocation: undefined,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
