import { describe, it, expect, vi } from 'vitest'

// Mock the supabase admin factory
vi.mock('../lib/supabaseAdmin', () => ({
  getSupabaseAdmin: () => ({
    from: () => ({ select: async () => ({ data: [{ id: 1, title: 'test' }] }) })
  })
}))

import { GET } from '../app/api/notes/route'

describe('notes API', () => {
  it('returns unauthorized when no token', async () => {
    const req = new Request('http://localhost')
    const res = await GET(req as any)
    // NextResponse.json returns a Response-like object. We check status.
    // In this environment, GET will return a NextResponse with status 401
    expect((res as any).status).toBe(401)
  })
})
