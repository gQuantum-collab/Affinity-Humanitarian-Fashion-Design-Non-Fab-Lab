#!/usr/bin/env python3
"""
Lightweight checker to run the ipmarks runner and report if it would modify tracked files.
This script runs the runner and then checks `git status --porcelain`.
Return codes:
  0 - no changes
  1 - changes present

Usage: python3 ops/check_ipmarks.py
"""
import subprocess
import sys
import shutil

def run(cmd):
    proc = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return proc.returncode, proc.stdout, proc.stderr

if __name__ == '__main__':
    # Ensure we have git and python
    if not shutil.which('git'):
        print('git not found in PATH', file=sys.stderr)
        sys.exit(2)

    print('Running ops/ipmarks/runner.py...')
    rc, out, err = run('python3 ops/ipmarks/runner.py')
    if rc != 0:
        print('Runner failed:', err or out, file=sys.stderr)
        sys.exit(rc)

    rc, out, err = run('git --no-pager status --porcelain')
    if out.strip():
        print('Repository modified by runner. Uncommitted changes:')
        print(out)
        sys.exit(1)

    print('No modifications detected by runner.')
    sys.exit(0)
