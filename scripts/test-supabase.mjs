#!/usr/bin/env node
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import pkg from 'pg'
import fs from 'fs'
const { Client } = pkg

// Opt-in insecure mode: set SUPABASE_INSECURE_SSL=1 or pass --insecure
// Optional CA support: set SUPABASE_CA_PATH env var or pass --ca=/path/to/ca.pem
const insecure = process.env.SUPABASE_INSECURE_SSL === '1' || process.argv.includes('--insecure')
let caPath = process.env.SUPABASE_CA_PATH || null
// parse --ca=... or --ca ...
for (let i = 0; i < process.argv.length; i++) {
  const a = process.argv[i]
  if (a && a.startsWith('--ca=')) caPath = a.split('=')[1]
  if (a === '--ca' && process.argv[i+1]) caPath = process.argv[i+1]
}
if (caPath) {
  if (!fs.existsSync(caPath)) {
    console.warn('SUPABASE_CA_PATH provided but file not found:', caPath)
    caPath = null
  } else {
    // Inform Node to use this extra CA for TLS. This is the simplest cross-library approach.
    process.env.NODE_EXTRA_CA_CERTS = caPath
    console.log('Using SUPABASE_CA_PATH for TLS verification:', caPath)
  }
}
if (insecure) {
  // Disable TLS verification for Node (local testing only)
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

dotenv.config({ path: '.env.secrets' })

function ok(msg) { console.log('\x1b[32m%s\x1b[0m', 'OK:', msg) }
function err(msg) { console.error('\x1b[31m%s\x1b[0m', 'ERR:', msg) }

async function testPublicSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  if (!url || !key) {
    err('Public Supabase URL or anon key missing')
    return false
  }
  console.log('Testing public Supabase client...')
  try {
    const sb = createClient(url, key)
    const { data, error } = await sb.from('notes').select('id,title').limit(5)
    if (error) { err('Public client query error: ' + error.message); return false }
    ok(`Public client returned ${Array.isArray(data) ? data.length : 0} rows`)
    return true
  } catch (e) {
    err('Public supabase test threw: ' + e.message)
    return false
  }
}

async function testAdminSupabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    err('Service role URL or key missing')
    return false
  }
  console.log('Testing service-role Supabase client...')
  try {
    const sb = createClient(url, key)
    // Service role should be able to see rows regardless of RLS
    const { data, error } = await sb.from('notes').select('id').limit(1)
    if (error) { err('Admin client query error: ' + error.message); return false }
    ok(`Admin client reachable${Array.isArray(data) ? `, rows: ${data.length}` : ''}`)
    return true
  } catch (e) {
    err('Admin supabase test threw: ' + e.message)
    return false
  }
}

async function testPostgres() {
  const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
  if (!url) { err('POSTGRES_URL or POSTGRES_URL_NON_POOLING missing'); return false }
  console.log('Testing direct Postgres connection...')
  try {
    // If a CA path was provided, pass it explicitly to node-postgres as well
    const clientOpts = { connectionString: url }
    if (caPath) {
      // honor insecure flag: if insecure, keep rejectUnauthorized false for local testing
      clientOpts.ssl = { ca: fs.readFileSync(caPath).toString(), rejectUnauthorized: !insecure }
    } else if (insecure) {
      // Local-only insecure mode: explicitly ask pg to skip cert verification
      clientOpts.ssl = { rejectUnauthorized: false }
    }
    const client = new Client(clientOpts)
    await client.connect()
    const res = await client.query('select count(*) as c from public.notes')
    ok(`Postgres reachable, notes count = ${res.rows[0].c}`)
    await client.end()
    return true
  } catch (e) {
    // If the error is due to a self-signed certificate, try again with a relaxed SSL setting
    const msg = e && e.message ? e.message : String(e)
    err('Postgres test failed: ' + msg)
    if (msg.includes('self-signed certificate')) {
      console.warn('\n⚠️  Self-signed certificate detected. Retrying with ssl.rejectUnauthorized=false (INSECURE, for local testing only).')
      const client2Opts = { connectionString: url, ssl: { rejectUnauthorized: false } }
      if (caPath) {
        // If a CA path exists we still attach it but keep rejectUnauthorized false for the retry
        client2Opts.ssl.ca = fs.readFileSync(caPath).toString()
      }
      const client2 = new Client(client2Opts)
      try {
        await client2.connect()
        const res2 = await client2.query('select count(*) as c from public.notes')
        ok(`Postgres reachable (insecure ssl), notes count = ${res2.rows[0].c}`)
        await client2.end()
        return true
      } catch (e2) {
        err('Postgres insecure retry failed: ' + (e2 && e2.message ? e2.message : String(e2)))
        try { await client2.end() } catch (_) {}
        return false
      }
    }
    try { await client.end() } catch (_) {}
    return false
  }
}

async function main(){
  console.log('Loading .env.secrets and testing Supabase + Postgres keys...')
  const pub = await testPublicSupabase()
  const adm = await testAdminSupabase()
  const pg = await testPostgres()
  console.log('\nSummary:')
  console.log('Public anon:', pub ? 'OK' : 'FAIL')
  console.log('Service role:', adm ? 'OK' : 'FAIL')
  console.log('Postgres:', pg ? 'OK' : 'FAIL')
  if (!pub || !adm || !pg) process.exitCode = 2
}

main()
