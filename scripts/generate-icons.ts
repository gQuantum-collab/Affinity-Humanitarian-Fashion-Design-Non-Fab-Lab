import sharp from 'sharp'
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
const srcPrimary = 'assets/logo-master.png'
const srcAlt = 'public/logo.svg'
const outPublic = 'public'
const outIcons = 'public/icons'
if (!existsSync(outIcons)) mkdirSync(outIcons, { recursive: true })
function getInput() {
  if (existsSync(srcPrimary)) return readFileSync(srcPrimary)
  if (existsSync(srcAlt)) return readFileSync(srcAlt)
  throw new Error('Missing assets/logo-master.png (or public/logo.svg)')
}
async function run() {
  const input = getInput()
  writeFileSync(`${outPublic}/favicon-48.png`, await sharp(input).resize(48,48).png().toBuffer())
  writeFileSync(`${outPublic}/favicon-32.png`, await sharp(input).resize(32,32).png().toBuffer())
  writeFileSync(`${outPublic}/favicon-16.png`, await sharp(input).resize(16,16).png().toBuffer())
  await sharp(input).resize(512,512).png().toFile(`app/icon.png`)
  await sharp(input).resize(180,180).png().toFile(`${outPublic}/apple-touch-icon.png`)
  await sharp(input).resize(192,192).png().toFile(`${outIcons}/icon-192.png`)
  await sharp(input).resize(512,512).png().toFile(`${outIcons}/icon-512.png`)
  await sharp(input).resize(800,800).png().toFile(`${outPublic}/og-logo.png`)
  console.log('✅ Icons generated')
}
run().catch(e=>{console.error(e);process.exit(1)})
