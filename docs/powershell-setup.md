## PowerShell Setup (Repo Specific)

This project ships cross-platform PowerShell helper scripts. You can use pwsh instead of bash/zsh.

### Scripts
| Script | Purpose |
| ------ | ------- |
| `scripts/dev-setup.ps1` | Install deps, configure hooks, run IP marks runner |
| `scripts/db-apply.ps1` | Apply SQL to Supabase Postgres (env from `.env.secrets`) |
| `scripts/run-ipmarks.ps1` | Manually run the IP marks runner |
| `scripts/smoke-bypass.ps1` | Vercel deployment smoke with protection bypass |

### Usage Examples
```powershell
pwsh ./scripts/dev-setup.ps1
pwsh ./scripts/db-apply.ps1 -File ops/supabase/payments.sql
pwsh ./scripts/smoke-bypass.ps1 -Url https://your-deploy.vercel.app -Secret $Env:VERCEL_AUTOMATION_BYPASS_SECRET
```

### VS Code Tips
Pin the PowerShell language status icon: open a PowerShell file → click the `{}` language status menu → pin PowerShell.

Add (optional) word separators customization to `.vscode/settings.json`:
```jsonc
{
  "[powershell]": {
    "editor.wordSeparators": "`~!@#$%^&*()=+[{]}\\|;:'\",.<>/?" ,
    "editor.semanticHighlighting.enabled": false
  }
}
```

### Troubleshooting Quick Checks
| Symptom | Check |
| ------- | ----- |
| No completions | Open PowerShell Extension Terminal; ensure `$psEditor` populated |
| Runner fails | `python3 --version` and required env in `.env.secrets` |
| Smoke test fails 403 | Ensure bypass secret & header present |

For deeper extension issues, see upstream PowerShell extension troubleshooting docs.