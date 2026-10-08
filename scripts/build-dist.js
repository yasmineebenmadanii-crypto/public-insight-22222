import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const outputPublicDir = path.join(rootDir, ".output", "public");
const distDir = path.join(rootDir, "dist");

console.log("[build-dist] Preparing dist/ directory for Vercel and static hosting...");

// 1. Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 2. Copy all assets from .output/public to dist if present
if (fs.existsSync(outputPublicDir)) {
  fs.cpSync(outputPublicDir, distDir, { recursive: true });
  console.log("[build-dist] Copied files from .output/public to dist/");
}

// Also ensure public/ static files are in dist/
const publicDir = path.join(rootDir, "public");
if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, distDir, { recursive: true });
}

// 3. Find the compiled CSS and main JS bundles in dist/assets
const assetsDir = path.join(distDir, "assets");
let mainJsFile = "";
let mainCssFile = "";

if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);

  // Find main CSS
  const cssFiles = files.filter((f) => f.startsWith("styles-") && f.endsWith(".css"));
  if (cssFiles.length > 0) {
    mainCssFile = `/assets/${cssFiles[0]}`;
  } else {
    const anyCss = files.filter((f) => f.endsWith(".css"));
    if (anyCss.length > 0) mainCssFile = `/assets/${anyCss[0]}`;
  }

  // Find main JS entry (index-*.js with largest size or manifest)
  const jsCandidates = files.filter((f) => f.startsWith("index-") && f.endsWith(".js"));
  if (jsCandidates.length > 0) {
    // pick largest index file which contains the router & runtime
    jsCandidates.sort((a, b) => {
      const sizeA = fs.statSync(path.join(assetsDir, a)).size;
      const sizeB = fs.statSync(path.join(assetsDir, b)).size;
      return sizeB - sizeA;
    });
    mainJsFile = `/assets/${jsCandidates[0]}`;
  }
}

// 4. Build dist/index.html from root index.html
const indexHtmlPath = path.join(rootDir, "index.html");
if (fs.existsSync(indexHtmlPath)) {
  let html = fs.readFileSync(indexHtmlPath, "utf-8");

  // Inject compiled CSS if found and not already present
  if (mainCssFile && !html.includes(mainCssFile)) {
    const cssTag = `  <link rel="stylesheet" href="${mainCssFile}" />\n  </head>`;
    html = html.replace("</head>", cssTag);
  }

  // Replace /src/main.tsx with built script bundle
  if (mainJsFile) {
    html = html.replace(
      /<script type="module" src="\/src\/main\.tsx"><\/script>/,
      `<script type="module" src="${mainJsFile}"></script>`,
    );
  }

  fs.writeFileSync(path.join(distDir, "index.html"), html, "utf-8");
  console.log(`[build-dist] Created dist/index.html (CSS: ${mainCssFile}, JS: ${mainJsFile})`);
}

console.log("[build-dist] dist/ output directory is ready for deployment!");
