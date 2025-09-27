import subprocess
import tempfile
import shutil
from pathlib import Path


def run(cmd, cwd):
    p = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
    return p.returncode, p.stdout, p.stderr


def test_runner_idempotent(tmp_path):
    # repo root: two levels up from this test file (ops/tests -> ops -> repo)
    root = Path(__file__).resolve().parents[2]
    # copy the repo to a temp dir
    dst = tmp_path / 'repo'
    shutil.copytree(root, dst)

    # initialize a fresh git repo to make status checks deterministic
    # remove any existing .git if present
    gitdir = dst / '.git'
    if gitdir.exists():
        shutil.rmtree(gitdir)
    rc, out, err = run('git init', dst)
    assert rc == 0, f"git init failed: {err or out}"
    run('git config user.email "test@example.com"', dst)
    run('git config user.name "pytest"', dst)
    rc, out, err = run('git add -A', dst)
    assert rc == 0, f"git add failed: {err or out}"
    rc, out, err = run('git commit -m "initial"', dst)
    assert rc == 0, f"git commit failed: {err or out}"

    # run the runner once
    rc, out, err = run('python3 ops/ipmarks/runner.py', dst)
    assert rc == 0, f"First run failed: {err or out}"

    # capture git status
    rc, out, err = run('git --no-pager status --porcelain', dst)
    assert rc == 0

    # If the first run created changes, commit them so we can test true idempotency
    if out.strip():
        rc, o, e = run('git add -A', dst)
        assert rc == 0, f"git add failed: {e or o}"
        rc, o, e = run('git commit -m "ops/ipmarks: apply changes (test)"', dst)
        assert rc == 0, f"git commit failed: {e or o}"

    # run the runner again
    rc, out2, err2 = run('python3 ops/ipmarks/runner.py', dst)
    assert rc == 0, f"Second run failed: {err2 or out2}"

    # ensure no changes after second run
    rc, out3, err3 = run('git --no-pager status --porcelain', dst)
    assert rc == 0
    assert out3.strip() == '', f"Runner is not idempotent, git status shows: {out3}"
