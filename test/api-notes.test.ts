import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/supabaseAdmin', () => ({
  getSupabaseAdmin: () => ({
    from: () => ({
      select: () => ({
        order: async () => ({ data: [{ id: 1, title: 'one' }] })
      }),
      insert: (rows: any) => ({
        select: async () => ({ data: rows })
      })
    })
  })
}))

import { GET, POST } from '@/app/api/notes/route'

describe('api/notes route (server)', () => {
  it('GET returns 401 without token', async () => {
    const res = await GET(new Request('http://localhost') as any)
    expect((res as any).status).toBe(401)
  })

  it('GET returns notes with token', async () => {
    process.env.ADMIN_API_TOKEN = 'tok'
    const headers = new Headers({ 'x-admin-token': 'tok' })
    const req = new Request('http://localhost', { headers })
    const res: any = await GET(req as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body)).toBeTruthy()
  })

  it('POST creates a note with token', async () => {
    process.env.ADMIN_API_TOKEN = 'tok'
    const headers = new Headers({ 'x-admin-token': 'tok', 'content-type': 'application/json' })
    const req = new Request('http://localhost', { method: 'POST', headers, body: JSON.stringify({ title: 't', content: 'c' }) })
    const res: any = await POST(req as any)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(Array.isArray(body)).toBeTruthy()
  })
})
