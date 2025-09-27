#!/usr/bin/env node
// Simple smoke test that hits a Vercel deployment with the protection bypass header
const https = require('https')

const url = process.env.DEPLOYMENT_URL || process.argv[2]
const secret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET

if (!url) {
  console.error('Usage: smoke-bypass.js <deployment-url> OR set DEPLOYMENT_URL env')
  process.exit(2)
}
if (!secret) {
  console.error('Missing VERCEL_AUTOMATION_BYPASS_SECRET env')
  process.exit(2)
}

const options = new URL(url)
options.method = 'GET'
options.headers = {
  'x-vercel-protection-bypass': secret,
  'x-vercel-set-bypass-cookie': 'true',
  'User-Agent': 'affinity-smoke/1.0'
}

const req = https.request(options, (res) => {
  console.log('status', res.statusCode)
  if (res.statusCode >= 200 && res.statusCode < 400) {
    console.log('Smoke test OK')
    process.exit(0)
  } else {
    console.error('Smoke test failed: status', res.statusCode)
    process.exit(3)
  }
})

req.on('error', (err) => {
  console.error('Request error', err.message)
  process.exit(3)
})

req.end()
