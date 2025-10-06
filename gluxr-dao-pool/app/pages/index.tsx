import dynamic from 'next/dynamic'
import { useState } from 'react'

function Home() {
  const [connected, setConnected] = useState(false)
  return (
    <main style={{display:'flex',flexDirection:'column',gap:24,alignItems:'center',justifyContent:'center',minHeight:'100vh'}}>
      <h1 style={{fontSize:32}}>gLUXR DAO Liquidity Pool</h1>
      <p>Member-only staking interface (prototype)</p>
      {!connected && <button onClick={()=>setConnected(true)} style={{padding:'8px 20px',border:'1px solid #00FFD0',borderRadius:8}}>Connect Wallet (mock)</button>}
      {connected && <div style={{display:'flex',flexDirection:'column',gap:16,border:'1px solid #00FFD0',padding:24,borderRadius:12,minWidth:320}}>
        <strong>Status: Connected ✅</strong>
        <button style={{padding:'6px 16px',border:'1px solid #00FFD0',borderRadius:8}}>Deposit</button>
        <button style={{padding:'6px 16px',border:'1px solid #00FFD0',borderRadius:8}}>Withdraw</button>
      </div>}
    </main>
  )
}
export default dynamic(()=>Promise.resolve(Home), { ssr:false })
