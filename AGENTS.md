# Repository Guidelines

## Project Structure & Module Organization

This is a Bun/TypeScript Cloudflare Worker API built with Hono, Drizzle, Neon, Better Auth, Zod, and OpenAPI. Source lives in `src/`: `app.ts` mounts middleware and routes, `container.ts` wires dependencies per request, `env.ts` validates bindings, `core/` holds framework-level utilities, `db/` holds the Drizzle client and schema, `auth/` owns Better Auth integration, and `modules/` contains vertical feature slices such as `modules/user/`. Architecture rules and deeper rationale live in `docs/ARCHITECTURE.md`. There are currently no test files.

## Build, Test, and Development Commands

- `bun install`: install dependencies from `bun.lock`.
- `bun run dev`: start the Worker locally with Wrangler.
- `bun run deploy`: deploy and minify the Worker.
- `bun run cf-typegen`: regenerate Cloudflare binding types.
- `bun run db:generate`: generate Drizzle migrations.
- `bun run db:migrate`: apply Drizzle migrations.
- `bun run db:studio`: open Drizzle Studio.
- `bun run typecheck`: run `tsc --noEmit`.
- `bun run lint`: lint `src/`.
- `bun run check`: run typecheck and lint together.

## Coding Style & Naming Conventions

Prettier uses tabs, 2-space tab width, semicolons, trailing commas, bracket spacing, and single quotes. Files and folders under `src/` use `kebab-case`; module files follow `<module>.<layer>.ts` patterns such as `user.repository.ts`. Prefer explicit factory functions like `makeUserService`, derived types such as `ReturnType<typeof makeUserRepository>`, `PascalCaseSchema` names for Zod schemas, and `SCREAMING_SNAKE` for error codes and frozen literals.

## Testing Guidelines

No test framework is configured yet. Until one is added, treat `bun run check` as the required verification step. When adding tests, keep services callable without HTTP, test business logic at the service layer, and name files near the code they cover, for example `src/modules/user/user.service.test.ts`.

## Commit & Pull Request Guidelines

Git history currently only shows `first commit`, so no project-specific commit convention exists yet. Use concise imperative commit subjects, for example `Add user pagination validation`. Pull requests should describe the change, call out schema or migration impacts, link relevant issues, and include verification output such as `bun run check`.

## Security & Configuration Tips

Do not commit `.env`; update `.env.example` when required bindings change. Keep `wrangler.jsonc` variable names aligned with `EnvSchema`. Generate, review, and commit migrations rather than pushing ad hoc production schema changes.
