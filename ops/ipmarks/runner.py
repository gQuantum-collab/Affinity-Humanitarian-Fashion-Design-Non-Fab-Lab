#!/usr/bin/env python3
"""
Sovereign IP Marks Runner (Estate Private Use)
- Reads ops/ipmarks/config.json
- Injects disclaimers, LICENSE.md, README.md
- Patches components/Footer.tsx with sovereign block
- Idempotent (safe to re-run)

Policy note:
- gTek address remains in **formal legal docs** (LICENSE, README watermark)
- Website UI footer shows **Jerome email/phone only** unless NEXT_PUBLIC_SOVEREIGN_UI=1
"""
import json, os, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CFG = ROOT / "ops/ipmarks/config.json"

DISCLAIMER = (
    "+--------------------------------------------------+\n"
    "|  For private estate use only — not for           |\n"
    "|  publication or commercial distribution.         |\n"
    "+--------------------------------------------------+\n"
)

LICENSE_HEADER = (
    "gTek Industries OmniLicense v2.2.2.2 — © 2025 gTek Industries, Mighty Mindz Inc., BFH TRUST DESIGNS — FOR PRIVATE USE ONLY.\n"
    + DISCLAIMER
)


def load_cfg():
    if not CFG.exists():
        sys.exit("Missing ops/ipmarks/config.json")
    return json.loads(CFG.read_text())


def write(path: Path, content: str):
    # If file exists and content is identical, do nothing (idempotent)
    if path.exists():
        existing = path.read_text()
        if existing == content:
            print(f"— no change: {path.relative_to(ROOT)}")
            return
        # create timestamped backup
        from datetime import datetime
        ts = datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')
        bak = path.with_name(path.name + f'.bak.{ts}')
        bak.write_bytes(path.read_bytes())
        print(f"🗄 backup: {bak.relative_to(ROOT)}")
    path.write_text(content)
    print(f"✅ wrote {path.relative_to(ROOT)}")


def ensure_license(cfg):
    lic = ROOT / "LICENSE.md"
    body = LICENSE_HEADER + (
        "\nAll rights reserved to estate private-use only.\n\n"
        f"Owner: {cfg['owner']} (CRID {cfg['crid']}, Sovereign {cfg['sovereign_id']})\n"
        f"Primary Contact (formal filings): {cfg.get('contact','')}\n"
        f"Public Email: {cfg.get('email','')}\n"
        f"Public Phone: {cfg.get('phone','')}\n"
    )
    write(lic, body)


def ensure_gitignore():
    gi = ROOT / ".gitignore"
    base = (
        "# === gTek Sovereign Git Ignore Protocol v2.2.2.2 ===\n"
        "# PRIVATE USE ONLY — Estate Sovereign Systems\n"
        "# --------------------------------------------------\n"
        "# For private estate use only — not for publication or commercial distribution.\n"
        "# --------------------------------------------------\n"
        "node_modules/\n.env\n.next/\n.vercel/\n.DS_Store\n"
    )
    if gi.exists():
        txt = gi.read_text()
        if "gTek Sovereign Git Ignore" not in txt:
            txt = base + "\n" + txt
            write(gi, txt)
        else:
            print("ℹ️ .gitignore already contains protocol header")
    else:
        write(gi, base)


def ensure_readme(cfg):
    readme = ROOT / "README.md"
    existing = readme.read_text() if readme.exists() else "# Affinity — Vercel Starter\n"
    header = DISCLAIMER
    footer = DISCLAIMER
    id_block = (
        "\n**Estate Identity**\\\n\n"
        f"- Owner: {cfg['owner']}\\\n\n"
        f"- CRID: {cfg['crid']}\\\n\n"
        f"- Codex Sovereign ID: {cfg['sovereign_id']}\\\n\n"
        f"- Formal Contact: {cfg.get('contact_gtek','')}\\\n\n"
        f"- Public Email: {cfg.get('email','')}\\\n\n"
        f"- Public Phone: {cfg.get('phone','')}\\\n\n"
    )
    # Remove any previous Estate Identity blocks to avoid duplication
    core = existing
    # If a header was previously added, strip it
    if core.startswith(DISCLAIMER):
        core = core[len(DISCLAIMER):]
    # Remove everything from the first occurrence of the Estate Identity marker
    marker = "\n**Estate Identity**"
    if marker in core:
        core = core.split(marker, 1)[0]
    # Remove any trailing disclaimer already present
    if core.endswith(DISCLAIMER):
        core = core[: -len(DISCLAIMER)]
    core = core.rstrip() + "\n\n"
    write(readme, header + core + id_block + footer)


def patch_footer(cfg):
    footer = ROOT / "components/Footer.tsx"
    if not footer.exists():
        print("⚠️ components/Footer.tsx not found; skipping")
        return
    text = footer.read_text()
    # Remove any prior gTek line (to honor UI policy)
    text = text.replace("contact: gTek@gtekglobal.design\n", "")
    text = text.replace("contact: gtek@gtekglobal.design\n", "")
    sovereign_ui = os.getenv("NEXT_PUBLIC_SOVEREIGN_UI", "0") == "1"
    # Determine if footer already contains the block we intend to add
    if sovereign_ui:
        if cfg['crid'] in text and cfg.get('email', '') in text:
            print("ℹ️ Footer already contains sovereign contact block")
            return
    else:
        # minimal public contact check (email and phone)
        if cfg.get('email', '') in text and cfg.get('phone', '') in text:
            print("ℹ️ Footer already contains public contact block")
            return

    sovereign_ui = os.getenv("NEXT_PUBLIC_SOVEREIGN_UI", "0") == "1"
    if sovereign_ui:
        # Full sovereign block inc. IDs, but UI should still only show public email/phone
        block = (
            "\n<div className=\"mt-6 text-xs whitespace-pre-wrap font-mono\">"
            "\n════════════════════════════════════════\n"
            f"Jerome Elston Hill Jr., CRID: {cfg['crid']}\n"
            f"Codex Sovereign ID: {cfg['sovereign_id']}\n"
            f"email: {cfg.get('email','')}\n"
            f"phone: {cfg.get('phone','')}\n"
            "════════════════════════════════════════\n"
            "</div>"
        )
    else:
        # Minimal public contact only (no IDs)
        block = (
            "\n<div className=\"mt-6 text-xs whitespace-pre-wrap font-mono\">"
            f"email: {cfg.get('email','')}  |  phone: {cfg.get('phone','')}"
            "</div>"
        )

    text = text.replace("</footer>", block + "\n</footer>")
    write(footer, text)


def main():
    cfg = load_cfg()
    ensure_license(cfg)
    ensure_gitignore()
    ensure_readme(cfg)
    patch_footer(cfg)
    print("✅ Sovereign IP Marks applied (UI shows public email/phone; gTek kept to formal docs)")

if __name__ == "__main__":
    main()
