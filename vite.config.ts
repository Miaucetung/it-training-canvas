import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";
import fs from "fs";
import path from "path";

import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import { resolve } from 'path'

/** Serves notes/ccna-exam/images/ as /exam-images/ in dev and copies to dist at build time. */
function examImagesPlugin(): PluginOption {
  const srcDir = path.resolve(__dirname, "notes/ccna-exam/images");
  const urlPrefix = "/exam-images/";

  return {
    name: "exam-images",
    // Dev: intercept requests for /exam-images/*
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith(urlPrefix)) return next();
        const filename = req.url.slice(urlPrefix.length).split("?")[0];
        const filePath = path.join(srcDir, filename);
        if (fs.existsSync(filePath)) {
          const ext = path.extname(filename).toLowerCase();
          const mime: Record<string, string> = {
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".gif": "image/gif",
            ".webp": "image/webp",
          };
          res.setHeader("Content-Type", mime[ext] ?? "application/octet-stream");
          fs.createReadStream(filePath).pipe(res);
        } else {
          next();
        }
      });
    },
    // Build: copy all images into dist/exam-images/
    closeBundle() {
      if (!fs.existsSync(srcDir)) return;
      const destDir = path.resolve(__dirname, "dist/exam-images");
      fs.mkdirSync(destDir, { recursive: true });
      let count = 0;
      for (const file of fs.readdirSync(srcDir)) {
        fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
        count++;
      }
      console.log(`[exam-images] Copied ${count} images → dist/exam-images/`);
    },
  };
}

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    examImagesPlugin(),
    // DO NOT REMOVE
    createIconImportProxy() as PluginOption,
    sparkPlugin() as PluginOption,
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
});
