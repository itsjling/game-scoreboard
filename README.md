# Game Scoreboard (Ignite + React Native)

Neo-brutalist scoreboard app rebuilt with Ignite (React Native) for iOS, Android, and web.

## Features

- Player and team score tracking
- Per-round and accumulated score modes
- Round navigation with optional max rounds
- Start/Edit game workflow
- Game history with load/delete/clear
- Local-only persistence (`scoreboard.v2.state`)
- Light and dark neo-brutalist themes
- Cross-platform analytics via PostHog (no-op when env vars are missing)

## Tech Stack

- Ignite 11.4.0
- Expo / React Native
- React Navigation
- MMKV persistence
- Jest + React Native Testing Library
- Maestro smoke flow

## Environment Variables

Set these for analytics:

- `EXPO_PUBLIC_POSTHOG_KEY`
- `EXPO_PUBLIC_POSTHOG_HOST`

If unset, analytics calls are skipped safely.

## Development

```bash
pnpm install
pnpm start
```

### Run on platforms

```bash
pnpm ios
pnpm android
pnpm web
```

## Testing

```bash
pnpm test
pnpm compile
pnpm test:maestro
```

## Web Deployment

Generate web output for Vercel:

```bash
pnpm bundle:web
```

Deploy the generated `dist` directory to Vercel.

## Key Paths

- Domain logic: `app/features/scoreboard/`
- Scoreboard UI: `app/features/scoreboard/components/`
- Neo-brutalist design system: `app/theme/neo-brutal/`
- Analytics wrapper: `app/services/analytics/`
- Behavior archive: `docs/parity-spec.md`
- Maestro smoke flow: `maestro/scoreboard-smoke.yaml`
