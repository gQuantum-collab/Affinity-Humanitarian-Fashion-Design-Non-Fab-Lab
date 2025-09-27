# Vercel: Protection Bypass for Automation

This repository supports automated testing and smoke tests against Vercel deployments that are protected by Vercel Deployment Protection (passwords, authenticated preview, trusted IPs). Use the Protection Bypass for Automation feature to let CI/E2E tooling bypass protection temporarily.

Summary
- Generate a Protection Bypass secret in your Vercel Project Settings (Team → Project → Protection Bypass for Automation).
- When a deployment is built, Vercel injects the value as `VERCEL_AUTOMATION_BYPASS_SECRET` into that deployment's environment.
- Your automation tool must set an HTTP header named `x-vercel-protection-bypass` with the secret value to bypass protections. Optionally set `x-vercel-set-bypass-cookie: true` to set a cookie for follow-up in-browser tests.

Playwright example
```ts
// playwright.config.ts (snippet)
import { defineConfig } from '@playwright/test'

export default defineConfig({
  use: {
    extraHTTPHeaders: {
      'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET || '',
      // optional to set a bypass cookie for subsequent in-browser requests
      'x-vercel-set-bypass-cookie': 'true'
    }
  }
})
```

Curl example (smoke test)
```bash
curl -I -sS \
  -H "x-vercel-protection-bypass: $VERCEL_AUTOMATION_BYPASS_SECRET" \
  -H "x-vercel-set-bypass-cookie: true" \
  "$DEPLOYMENT_URL"
```

GitHub Actions example
- Create a repository secret `VERCEL_AUTOMATION_BYPASS_SECRET` (value generated in Vercel) and a `DEPLOYMENT_URL` secret (the deployment URL or production URL).
- Use the example workflow in `.github/workflows/e2e-bypass.yml` to run a smoke test that sends the bypass header.

Notes
- Regenerating the bypass secret in Vercel invalidates previous deployments' bypass value. If you regenerate the secret, rebuild/redeploy to use the new value.
- Using a header is recommended over query params for security.
