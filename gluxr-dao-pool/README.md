# gLUXR DAO – Sovereign Liquidity Pool (Solana + Anchor + Next.js)

This scaffold provisions:

- Anchor program (`program/`) implementing a member-gated deposit/withdraw pool for the $gLUXR SPL token.
- Next.js prototype dApp (`app/`) with mock wallet connect placeholder.
- Firebase Cloud Function (`firebase/functions/verifyMember.js`) to verify SPL token holders and store membership status.

## 1. Prerequisites
- Anchor CLI & Solana tool suite
- Node.js 18+
- Firebase CLI (if deploying functions/hosting)

## 2. Build & Deploy (Localnet Example)
```bash
cd program
anchor build
anchor keys list
# Update Anchor.toml + declare_id! in lib.rs with new program id
anchor deploy
```

## 3. Generate IDL & Use in Frontend
After `anchor build`, copy `target/idl/gluxr_dao_pool.json` into `app/` (e.g. `app/idl/`).

## 4. Environment Variables (Frontend)
Create `app/.env.local`:
```
NEXT_PUBLIC_SOLANA_RPC=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_GLUXR_POOL_PROGRAM=YourProgramId
```

## 5. Firebase Function Deploy
```bash
cd firebase/functions
npm install
cd ..
firebase deploy --only functions
```

## 6. verifyMember Function
Callable function: `verifyMember({ wallet })` returns `{ verified, balance }` based on SPL balance.

## 7. Next Steps
- Integrate real wallet adapter UI
- Add PDA derivations for pool vault & member accounts client-side
- Add reward emission logic
- Harden Firestore security rules
- Replace mock connect with actual @solana/wallet-adapter

## 8. License
Sovereign © BFH TRUST DESIGNS / gTek Global Industries

## 9. Development Convenience

From the monorepo root you can enter the dApp directory and install its dependencies separately until a workspace is declared:

```bash
cd gluxr-dao-pool/app
pnpm install
pnpm dev
```

When we convert the root into a pnpm workspace, these steps become:

```bash
pnpm install --filter gluxr-dao-pool-app...
pnpm --filter gluxr-dao-pool-app dev
```

Add an `idl/` folder under `app/` and copy the compiled IDL for typed client usage.
