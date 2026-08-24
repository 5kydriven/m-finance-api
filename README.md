```txt
npm install
npm run dev
```

```txt
npm run deploy
```

## CI/CD

Pull requests to `main` run GitHub Actions CI:

```txt
bun install --frozen-lockfile
bun run typecheck
bun run check:architecture
bun run db:generate
bun run deploy:dry-run
```

The architecture guard is enforced through ESLint. It checks layer boundaries,
service isolation from HTTP/database concerns, and file/folder naming
conventions. The migration check fails if Drizzle schema changes are not
committed under `drizzle/`.

Pushes to `main` run the same checks, apply committed Drizzle migrations, and
deploy the Worker to Cloudflare. Configure these GitHub repository secrets:

```txt
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
DATABASE_URL
BETTER_AUTH_SECRET
```

The deployment workflow synchronizes `DATABASE_URL` and `BETTER_AUTH_SECRET`
from GitHub secrets into encrypted Cloudflare Worker secrets. Wrangler also
declares both as required, so deployment fails before serving traffic if either
one is missing. After deployment, the workflow verifies `/health` and `/docs`.

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiating `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```
