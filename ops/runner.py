#!/usr/bin/env python3
"""
Simple ops runner wrapper. Supports:
  --ipmarks   -> run ops/ipmarks/runner.py
  --build     -> pnpm build
  --dev       -> pnpm dev
  --icons     -> pnpm icons

This file intentionally stays lightweight and delegates to underlying scripts.
"""
import subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def sh(cmd, check=True):
    print('RUN:', cmd)
    subprocess.run(cmd, shell=True, check=check)

def main():
    if '--ipmarks' in sys.argv:
        sh('python3 ops/ipmarks/runner.py')
    if '--icons' in sys.argv:
        sh('pnpm icons')
    if '--build' in sys.argv:
        sh('pnpm build')
    if '--dev' in sys.argv:
        # run dev in foreground
        sh('pnpm dev', check=False)

if __name__ == '__main__':
    main()
