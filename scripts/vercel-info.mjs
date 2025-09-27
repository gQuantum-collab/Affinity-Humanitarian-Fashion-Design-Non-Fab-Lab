#!/usr/bin/env node
import dotenv from 'dotenv'
dotenv.config({ path: '.env.secrets' })

const token = process.env.VERCEL_TOKEN
const projectId = process.env.VERCEL_PROJECT_ID

function err(msg){ console.error('\x1b[31mERR:\x1b[0m', msg) }
function ok(msg){ console.log('\x1b[32mOK:\x1b[0m', msg) }

if (!token) { err('VERCEL_TOKEN not set in .env.secrets'); process.exit(2) }
if (!projectId) { err('VERCEL_PROJECT_ID not set in .env.secrets'); process.exit(2) }

console.log('Checking Vercel project')

const base = 'https://api.vercel.com'

async function main(){
  try{
    const res = await fetch(`${base}/v1/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.status === 200){
      const j = await res.json()
      ok(`Project found: ${j.name}`)
      ok('VERCEL_TOKEN and VERCEL_PROJECT_ID appear valid')
      process.exit(0)
    } else {
      const body = await res.text()
      err(`Vercel API returned ${res.status}: ${body}`)
      process.exit(3)
    }
  } catch(e){
    err('Request failed: '+(e && e.message?e.message:String(e)))
    process.exit(4)
  }
}

main()
