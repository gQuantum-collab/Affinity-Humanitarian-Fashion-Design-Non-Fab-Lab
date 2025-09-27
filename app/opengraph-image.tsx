import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OG() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#0A0A0A', color: '#EDEDED', alignItems: 'center', justifyContent: 'space-between', padding: 64, fontFamily: 'Inter, Arial' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: 2 }}>Affinity</div>
          <div style={{ fontSize: 36, opacity: 0.8 }}>Fashion for Humanity</div>
        </div>
        {/* subtle watermark block */}
        <div style={{ position: 'absolute', left: 48, bottom: 48, opacity: 0.12, fontSize: 14, fontFamily: 'monospace', whiteSpace: 'pre' }}>
          {`Jerome Elston Hill Jr.\nCRID: 51509329\nDIV-LA-JHILL-STFL02035`}
        </div>
      </div>
    ),
    size
  )
}
