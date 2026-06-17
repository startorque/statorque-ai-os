# AGENTS.md — Chat agent instructions for StarTorque AI OS

Purpose
- Provide concise, actionable guidance for AI coding agents working on this repository.

Quick context
- Language: TypeScript (strict). Entry point: [src/index.ts](src/index.ts#L1).
- Important folders: [src/agents](src/agents#L1), [src/core](src/core#L1), [src/dashboard](src/dashboard#L1), [src/execution](src/execution#L1).

Quick start (new terminal)
1. Open a new terminal in the project root.
2. Install dependencies:

   npm install

3. Run the development server (hot-run via `ts-node`):

   npm run dev

4. Start the dashboard (separate terminal if needed):

   npm run dashboard

5. Build for production (compile TypeScript):

   npm run build

Notes on scripts
- `dev` runs `ts-node src/index.ts` — good for iterative development.
- `dashboard` runs `ts-node src/dashboard/server.ts` to launch the dashboard UI.
- `start` runs the compiled `dist/index.js`; run after `npm run build` for production.

What agents should know (short)
- Agent implementations live in [src/agents/implementations](src/agents/implementations#L1) and are registered via [src/agents/registry.ts](src/agents/registry.ts#L1).
- The `Kernel` ([src/core/kernel.ts](src/core/kernel.ts#L1)) manages execution lifecycles; prefer small, reversible changes when modifying it.
- The `Router` ([src/core/router.ts](src/core/router.ts#L1)) contains routing logic — update with unit-style guards.

Conventions and checks
- Keep TypeScript types strict; run `npm run build` to validate compilation errors.
- No automated tests are present (see `test` script placeholder) — run the app locally after changes.
- Preserve existing public API in `src/agents/base-agent.ts` unless implementing a major refactor.

Links
- Repository README: [README.md](README.md#L1)
- TypeScript config: [tsconfig.json](tsconfig.json#L1)

If you want, I can also add a short `copilot-instructions.md` under `.github/` with a trimmed version of this guidance.
