import { Connection, PublicKey } from '@solana/web3.js'
import { Program, AnchorProvider, Idl } from '@project-serum/anchor'
// Placeholder IDL path – supply generated IDL after anchor build
// import idl from '../idl/gluxr_dao_pool.json'

export const getProgram = (wallet: any, idl: Idl) => {
  const programID = new PublicKey((idl as any).metadata.address)
  const network = process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.mainnet-beta.solana.com'
  const connection = new Connection(network, 'processed')
  const provider = new AnchorProvider(connection, wallet, { preflightCommitment: 'processed' })
  return new Program(idl, programID, provider)
}
