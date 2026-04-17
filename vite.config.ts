import { defineConfig, loadEnv, type Connect } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import type { IncomingMessage, ServerResponse } from "http";
import dns from "node:dns";

// Force IPv4-first DNS resolution
dns.setDefaultResultOrder("ipv4first");

// Local API Router Plugin
function apiRouter() {
  const setupMiddleware = (server: any) => {
    const env = loadEnv("development", process.cwd(), "");
    Object.assign(process.env, env);

    server.middlewares.use(
      async (
        req: IncomingMessage,
        res: ServerResponse,
        next: Connect.NextFunction
      ) => {
        if (!req.url || !req.url.startsWith("/api/")) {
          return next();
        }

        if (!server.ssrLoadModule) {
          console.warn(
            `[API Router] SSR module loading unavailable for ${req.url}`
          );
          return next();
        }

        const url = new URL(req.url, `http://${req.headers.host}`);
        (req as any).query = Object.fromEntries(url.searchParams);

        const apiFilePath = path.resolve(__dirname, `.${url.pathname}.ts`);

        try {
          const module = await server.ssrLoadModule(apiFilePath);
          const handler = module.default;

          if (!handler) {
            res.statusCode = 404;
            res.end(
              JSON.stringify({
                error: `No default export found in ${url.pathname}.ts`,
              })
            );
            return;
          }

          if (
            ["POST", "PUT", "PATCH"].includes(req.method || "") &&
            !(req as any).body
          ) {
            let body = "";

            for await (const chunk of req) {
              body += chunk;
            }

            try {
              (req as any).body = JSON.parse(body);
            } catch {
              (req as any).body = body;
            }
          }

          (res as any).status = (code: number) => {
            res.statusCode = code;
            return res;
          };

          (res as any).json = (data: any) => {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(data));
            return res;
          };

          await handler(req, res);
        } catch (error: any) {
          console.error(`[API Error] ${url.pathname}:`, error.message);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              error: "Internal Server Error",
              message: error.message,
            })
          );
        }
      }
    );
  };

  return {
    name: "api-router",
    configureServer(server: any) {
      setupMiddleware(server);
    },
    configurePreviewServer(server: any) {
      setupMiddleware(server);
    },
  };
}

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

    apiRouter(),

    ViteImageOptimizer({
      test: /\.(jpe?g|png|gif|tiff|webp|svg|avif)$/i,
      includePublic: true,
      logStats: true,
      ansiColors: true,

      svg: {
        multipass: true,
        plugins: [
          {
            name: "preset-default",
            params: {
              overrides: {
                cleanupIds: false,
                removeViewBox: false,
              },
            },
          },
          "sortAttrs",
          {
            name: "addAttributesToSVGElement",
            params: {
              attributes: [{ xmlns: "http://www.w3.org/2000/svg" }],
            },
          },
        ],
      },

      png: { quality: 80 },
      jpeg: { quality: 80 },
      jpg: { quality: 80 },
      webp: { quality: 70 },
      avif: { quality: 60 },

      cache: true,
    }),
  ],

  build: {
    chunkSizeWarningLimit: 600,
    cssMinify: true,
    minify: "esbuild",
    reportCompressedSize: false,
  },

  esbuild: {
    drop: mode === "production" ? ["console", "debugger"] : [],
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));