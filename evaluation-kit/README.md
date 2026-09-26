# Digital Memory Vault: evaluation kit

Everything used to produce the numbers in Sections 5–7 of the paper. Tests were run on 23 September 2026.

## Contents

- `scripts/functional-tests.mjs`: the 33 functional test cases (Section 6.2, Table 5).
- `scripts/perf.mjs`: response-time and scalability measurements (Sections 6.3–6.4, Tables 6–7).
- `scripts/querycount.mjs`: creates a user with N resolved decisions, used to count database queries from the PostgreSQL log.
- `scripts/sample.mjs`: enters the 10 hypothetical decisions of the worked example (Section 5) and prints the scores the app returns.
- `results/`: raw output (`functional-results.json`, `perf-baseline.json`, `perf-optimized.json`, `build.log`).
- `local-testing/lib-db-index.local.ts`: database client used for local testing (node-postgres instead of the Neon HTTP driver).
- `optimisation/`: the two files changed in the optimisation experiment (one query for all outcomes instead of one per decision).

## How to rerun

1. Install PostgreSQL 16 and create a database, e.g. `postgres://dmv:dmv@localhost:5432/dmv_eval`.
2. In a copy of the project, replace `lib/db/index.ts` with `local-testing/lib-db-index.local.ts` and run `npm install pg`.
3. Create `.env.local` with `DATABASE_URL=<your local database>` and any long `JWT_SECRET`.
4. Run `npx drizzle-kit push`, then `npx next build` and `NODE_ENV=production npx next start -p 3000`.
5. Run `node scripts/functional-tests.mjs`, `node scripts/sample.mjs` and `node scripts/perf.mjs` (perf.mjs expects the same database URL as in step 1).
6. For the optimised results, copy the files from `optimisation/` into `lib/analytics/index.ts` and `app/dashboard/page.tsx`, rebuild, and run `LABEL=optimized node scripts/perf.mjs`.

Absolute timings depend on the machine. The paper's numbers came from a 1-vCPU Linux container with 4 GB RAM, Node.js 22.22 and PostgreSQL 16.15.
