# Game Scoreboard

Neo-brutalist scoreboard app built with Ignite and Expo (React Native) for iOS, Android, and web.

## Layout

App paths:

- Domain logic: `app/features/scoreboard/`
- Scoreboard UI: `app/features/scoreboard/components/`
- Neo-brutalist design system: `app/theme/neo-brutal/`
- Analytics wrapper: `app/services/analytics/`
- Maestro smoke flow: `maestro/scoreboard-smoke.yaml`

Docs:

- Behavior archive: `docs/parity-spec.md`
- Issue tracker: `docs/agents/issue-tracker.md`
- Triage labels: `docs/agents/triage-labels.md`
- Domain docs: `docs/agents/domain.md`

Run, platform, and web deploy steps are in `README.md`.

## Verify

```bash
pnpm install
pnpm test
pnpm compile
pnpm lint:check
pnpm check
```

`pnpm lint:check` and `pnpm check` both run the Ultracite check.

Optional Maestro smoke (needs Maestro and a running app):

```bash
pnpm test:maestro
```

## Formatting

Lint and format go through Ultracite (Biome): `pnpm fix` or `pnpm lint` applies fixes. Prefer the `package.json` scripts over `pnpm dlx ultracite`.
