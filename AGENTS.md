# Agent instructions

- Read `docs/system-requirements.md` and `CONTRIBUTING.md` before changing product behavior.
- Implement only the requirement the user selected. Do not build the full tracking system from its specifications in one pass.
- Keep this scaffold placeholder-only: no location capture, authentication, device enrollment, map, or product database schema unless a later selected OpenSpec change calls for it.
- Follow the canonical SQL-file rules in `database/README.md`; do not add a separate migration history or commit secrets from `.env`.
- Run component checks from `/workspace` in the development container:
  - `cd /workspace/api && go test ./...`
  - `cd /workspace/android && ./gradlew assembleDebug testDebugUnitTest`
  - `cd /workspace/web && pnpm install --frozen-lockfile && pnpm build`
- Use `openspec validate <change-id> --strict` for OpenSpec changes.
