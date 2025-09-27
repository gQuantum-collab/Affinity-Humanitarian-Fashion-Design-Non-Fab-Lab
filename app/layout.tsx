import type { Metadata } from 'next'
import './globals.css'
import IPMark from '../components/IPMark'
import Footer from '../components/Footer'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
export const metadata: Metadata = {
  title: 'Affinity — Fashion for Humanity ™',
  description: 'Humanitarian streetwear. Capsule 001 available now.'
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header style={{padding:'12px 0',borderBottom:'1px solid rgba(255,255,255,.1)'}}>
          <div style={{maxWidth:960,margin:'0 auto',padding:'0 24px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <a href="/" style={{display:'flex',gap:12,alignItems:'center',textDecoration:'none',color:'inherit'}}>
              <img src="/logo.svg" alt="Affinity" width="28" height="28" />
              <strong>AFFINITY</strong>
            </a>
            <nav style={{display:'flex',gap:16}}>
              <a href="/shop">Shop</a><a href="/about">About</a><a href="/contact">Contact</a>
            </nav>
          </div>
        </header>
        <main style={{maxWidth:960,margin:'0 auto',padding:'24px'}}>
          {children}
        </main>
        <Footer />
        <IPMark />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
