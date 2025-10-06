# Firebase Hosting Deployment (Affinity Site)

This project can deploy the exported static Next.js site to Firebase Hosting.

## Prerequisites

* Firebase CLI installed: `npm i -g firebase-tools`
* Logged in: `firebase login`
* A Firebase project created (console) named or aliased as `affinity-site` (adjust in `.firebaserc` if different).

## One-Time Setup

```bash
pnpm install
firebase use --add  # if you want to alias a different project id
```

## Export & Deploy

Use the package script:

```bash
pnpm deploy:firebase
```

This runs `next build && next export` (through the `export` script) and deploys the static output in `.next/export`.

## Manual Steps (Alternative)

```bash
pnpm export
firebase deploy --only hosting
```

## Hosting Config

Defined in `firebase.json`:

* Serves from `.next/export`
* Adds basic cache-control headers for js/css/png

## Dynamic API Caveat

Firebase static hosting will not run Next.js Server / Edge functions. API routes present in the project will not function in this static deployment. For dynamic features (Stripe webhooks, Supabase server actions) keep Vercel deployment or implement Firebase Cloud Functions rewrites.

## Adding Functions Later

If you add Firebase Functions:

```bash
firebase init functions
firebase deploy --only functions,hosting
```

Then adjust `firebase.json` rewrites if you need to map paths.

## Environment Variables

Static export in Next.js inlines only `NEXT_PUBLIC_*` variables. Ensure you define any public runtime values accordingly.

## Troubleshooting

* 404s: Ensure `next export` produced files in `.next/export`.
* Stale assets: Adjust cache headers in `firebase.json`.
* Project mismatch: Update `.firebaserc` or run `firebase use <projectId>`.

## License

Sovereign © BFH TRUST DESIGNS / gTek Global Industries
