# Domain docs

Read these before exploring the code:

- `CONTEXT.md` at the repo root, when present.
- ADRs under `docs/adr/` that affect the work.

Missing files need no warning. Domain-modeling work creates them when the team settles terms or decisions.

## Layout

This repo uses one context:

```text
/
├── CONTEXT.md
├── docs/adr/
└── app/
```

Use terms from the `CONTEXT.md` glossary in issues, tests, and code. If a needed term is absent, check whether the code already has a clear name before proposing a glossary change.

Flag any change that conflicts with an ADR and name the ADR.
