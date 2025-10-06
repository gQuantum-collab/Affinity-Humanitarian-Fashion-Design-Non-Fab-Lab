#!/usr/bin/env bash
set -euo pipefail

cat <<'EON'
Bootstrap Steps:
1. cd program && anchor build
2. Replace program id in Anchor.toml + lib.rs (declare_id!)
3. anchor deploy
4. Copy target/idl/gluxr_dao_pool.json to app/idl/
5. cd app && npm install && npm run dev
EON
