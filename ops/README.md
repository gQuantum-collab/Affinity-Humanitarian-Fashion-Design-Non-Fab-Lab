# Ops: add_ip_marks

Small ops helpers for Affinity site.

add_ip_marks.mjs
- Ensures `components/IPMark.tsx` exists and that `app/layout.tsx` imports and mounts it.
- Idempotent: safe to run multiple times.

Usage

```bash
node ops/add_ip_marks.mjs
# or make executable:
chmod +x ops/add_ip_marks.mjs
./ops/add_ip_marks.mjs
```

This script is intentionally simple and does not install packages or modify other files. It helps standardize an on-screen IP mark for legal/branding visibility.

Ops runner usage

```
python3 ops/runner.py --ipmarks   # run the ipmarks inserter
python3 ops/runner.py --icons     # run pnpm icons

Quick local checks

1. Enable the included git hook (recommended):

	git config core.hooksPath .githooks

	The repository includes a minimal pre-commit hook at `.githooks/pre-commit` that runs a local ipmarks check and prevents commits containing `style="..."` in TSX/JSX files.

2. Run the ipmarks checker locally:

	python3 ops/check_ipmarks.py

CI

A GitHub Actions workflow `.github/workflows/ipmarks-enforce.yml` is included. It runs `ops/ipmarks/runner.py` on pull requests and will fail the check if the runner modifies tracked files. This enforces the presence of the required marks and legal docs before merging.

Environment gating

To show the full sovereign UI block on the site, set the environment variable `NEXT_PUBLIC_SOVEREIGN_UI=1` in Vercel or your local env. By default the footer shows only public contact email and phone.
python3 ops/runner.py --dev       # start dev (foreground)
```
