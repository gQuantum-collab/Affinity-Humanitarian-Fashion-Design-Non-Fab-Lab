#!/usr/bin/env node
// idempotent script to ensure IP mark component exists and is imported in layout
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve('.');
const compPath = './components/IPMark.tsx'
const layoutPath = './app/layout.tsx'

function ensureComponent() {
  if (!existsSync(compPath)) {
    const content = `export default function IPMark() {
  return (
    <div aria-hidden="false">
      <div className="fixed bottom-6 right-6 z-50 pointer-events-auto text-right">
        <div className="rounded-lg bg-black/60 px-3 py-2 text-xs text-white/70 ring-1 ring-white/5 backdrop-blur-sm">
          <div className="font-medium">Affinity™</div>
          <div className="mt-0.5 text-[11px]">Sovereign IP • All rights reserved</div>
        </div>
      </div>
    </div>
  )
}
`
    writeFileSync(compPath, content)
    console.log('✅ created', compPath)
  } else {
    console.log('ℹ️ exists', compPath)
  }
}

function ensureLayoutImport() {
  if (!existsSync(layoutPath)) {
    console.warn('⚠️ layout not found at', layoutPath)
    return
  }
  let layout = readFileSync(layoutPath, 'utf8')
  if (!layout.includes("IPMark")) {
    // add import after globals.css import
    layout = layout.replace("import './globals.css'", "import './globals.css'\nimport IPMark from '../components/IPMark'")
    // add component before closing body tag
    layout = layout.replace('</body>\n    </html>', '        <IPMark />\n      </body>\n    </html>')
    writeFileSync(layoutPath, layout)
    console.log('✅ updated', layoutPath)
  } else {
    console.log('ℹ️ layout already imports IPMark')
  }
}

function main() {
  ensureComponent()
  ensureLayoutImport()
  console.log('Done. Tip: run `pnpm dev` to preview the site locally.')
}

main()
