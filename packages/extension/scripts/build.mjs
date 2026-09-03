import { build } from 'vite'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { cpSync, existsSync, rmSync } from 'node:fs'

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const outDir = resolve(packageRoot, 'dist')

if (existsSync(outDir)) {
  rmSync(outDir, { recursive: true, force: true })
}

/**
 * Content scripts and the background service worker are each built as their
 * own self-contained IIFE (no shared chunks, no ESM `import` at runtime),
 * because Chrome's manifest V3 `content_scripts` array loads them as plain
 * classic scripts - it doesn't support ES module imports between them.
 */
async function buildScript(fileBaseName, entry) {
  // IIFE builds need a global variable `name` that's a legal JS identifier,
  // which filenames like "content-script" aren't (hyphens aren't allowed) -
  // so the identifier and the output filename are kept separate here.
  const identifier = fileBaseName.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())

  await build({
    root: packageRoot,
    envDir: packageRoot,
    build: {
      outDir,
      emptyOutDir: false,
      lib: {
        entry: resolve(packageRoot, entry),
        name: identifier,
        formats: ['iife'],
        fileName: () => `${fileBaseName}.js`,
      },
    },
  })
}

// Popup is a normal HTML page, so it's built as a regular Vite multi-page app
// (this is what lets it use ES modules + code splitting normally).
await build({
  root: packageRoot,
  envDir: packageRoot,
  build: {
    outDir,
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(packageRoot, 'popup.html'),
    },
  },
})

await buildScript('background', 'src/background.ts')
await buildScript('content-script', 'src/content-script.ts')
await buildScript('inject', 'src/inject.ts')

cpSync(resolve(packageRoot, 'manifest.json'), resolve(outDir, 'manifest.json'))

console.log('\nBuilt to packages/extension/dist - load this folder as an unpacked extension in Chrome.')
