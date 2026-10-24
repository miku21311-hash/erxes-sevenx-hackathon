# `sevenx_api` Plugin Guide

## Identity

- **Plugin:** `sevenx` (product name "7x")
- **Project:** `sevenx_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/sevenx_api`
- **Last synchronized:** `2026-10-24`

## Scope

### Owns

- Training-center domain: locations/rooms, classes with a weekly recurring
  schedule, teacher and student members, invites, attendance, assignments,
  submissions and grading, announcements with read tracking.
- Authorization rules for three actors: supervisor (erxes team member),
  teacher and student (both erxes client-portal users linked to a
  `SevenxMember` by `cpUserId`).
- Demo seed (`scripts/seed.ts`).

### Does not own

- Client-portal authentication (register/login/password) — core `clientportal`
  module. The plugin only reads `context.cpUser` and `context.user`.
- File storage — attachments are `{url,name,size,type}` produced by core
  file upload.
- Any UI: supervisor UI lives in `frontend/plugins/sevenx_ui`, the
  teacher/student portal in `apps/sevenx-portal`.

## Current Capabilities

- Full GraphQL API defined in `docs/sevenx-graphql-contract.graphql`
  (repository root) and mirrored in `src/apollo/schema/schema.ts`.
- Schedule conflict detection (same teacher, or same location+room, with
  overlapping weekday/time/date range) on class create/edit and via
  `sevenxScheduleConflicts`.
- Sessions are computed from the schedule at runtime (no session collection);
  attendance rows are keyed by `classId + date (YYYY-MM-DD) + studentId`.
- Attendance summaries count a session once it is in the past or once anyone
  in the class was marked for that date; unmarked sessions count as absent.
- Invite flow: `sevenxInviteCreate` (supervisor, or teacher for own classes)
  creates an `invited` member + token; `sevenxInviteCheck` is public;
  `sevenxInviteAccept` links the calling cpUser and activates the member.
- Dashboard stats (counts, today's sessions, 7-day attendance rate).

## Architecture

| Area            | Path                                              | Responsibility                                   |
| --------------- | ------------------------------------------------- | ------------------------------------------------ |
| Entry           | `src/main.ts`                                     | `startPlugin({ name: 'sevenx', port: 3315 })`    |
| Models registry | `src/connectionResolvers.ts`                      | `IModels`, `IContext`, `generateModels`          |
| Schema          | `src/apollo/schema/schema.ts`                     | All `Sevenx*` types, queries, mutations          |
| Resolver wiring | `src/apollo/resolvers/*.ts`                       | Merges module queries/mutations/custom resolvers |
| Auth helpers    | `src/modules/common/auth.ts`                      | `getActor`, `requireClassAccess`, wrappers       |
| Schedule utils  | `src/modules/common/schedule.ts`                  | Session expansion, overlap, next session         |
| Locations       | `src/modules/locations/**`                        | `sevenx_locations`                               |
| Members/Invites | `src/modules/members/**`                          | `sevenx_members`, `sevenx_invites`               |
| Classes         | `src/modules/classes/**`                          | `sevenx_classes`, conflicts, dashboard stats     |
| Attendance      | `src/modules/attendance/**`                       | `sevenx_attendances`, summaries                  |
| Assignments     | `src/modules/assignments/**`                      | `sevenx_assignments`, `sevenx_submissions`       |
| Announcements   | `src/modules/announcements/**`                    | `sevenx_announcements`                           |
| Seed            | `scripts/seed.ts`                                 | Demo portal, users, classes, data                |

Each module follows `@types/`, `db/definitions/`, `db/models/`,
`graphql/resolvers/{queries,mutations,customResolvers}/`. Business rules and
validation live in the model classes; resolvers only check the actor and
delegate.

## Contracts

### Provides

- GraphQL (gateway, prefix `sevenx`): see `docs/sevenx-graphql-contract.graphql`.
  Three access tiers, chosen per resolver in `src/modules/common/auth.ts`:
  - default wrapper → supervisor (team member login) only;
  - `shared(...)` → `skipPermission`, actor resolved inside (`getActor`);
  - `portal(...)` → `forClientPortal + cpUserRequired` (portal cookie + `x-app-token`);
  - `publicResolver(...)` → no login (`sevenxInviteCheck`).
- tRPC: generated `sevenx.hello` placeholder only.

### Consumes

- `erxes-api-shared/utils`: `startPlugin`, `createGenerateModels`,
  `mongooseStringRandomId`, `ExpectedError`, `randomAlphanumeric`.
- `erxes-api-shared/core-types`: `IMainContext`, `Resolver`.
- Core client portal: `context.cpUser` / `context.clientPortal` headers set by
  the gateway; seed writes `client_portals` and `client_portal_users`
  documents directly (dev only).

## Data and State

- Collections (tenant db via `generateModels(subdomain)`): `sevenx_locations`,
  `sevenx_members` (unique `email+role`), `sevenx_invites` (unique `token`),
  `sevenx_classes`, `sevenx_attendances` (unique `classId+date+studentId`),
  `sevenx_assignments`, `sevenx_submissions` (unique `assignmentId+studentId`),
  `sevenx_announcements`.
- Env: `SEVENX_PORTAL_URL` (invite link base, default `http://localhost:3000`),
  `SEVENX_SEED_PASSWORD` (seed only), `JWT_TOKEN_SECRET` (seed signs the
  portal app token with the same secret the gateway verifies).

## Local Invariants

- Every model operation goes through `models` from `generateModels(subdomain)`.
- Teacher-only mutations check `isTeacherOf`; student data queries check
  `canAccessClass`; teachers may only invite students into their own classes
  and post announcements scoped to their own class.
- A class has exactly one teacher and one recurring weekly schedule;
  `validateSchedule` + `findConflicts` run on every create/edit.
- Removing a class cascades to attendance, assignments, submissions,
  announcements and invite class references; removing a location with
  classes is rejected.
- Graded submissions cannot be re-submitted; scores are bounded by
  `assignment.maxScore`.
- Contract changes go to `docs/sevenx-graphql-contract.graphql` first.

## Validation

- `pnpm nx build sevenx_api`
- `pnpm --filter sevenx_api seed` (needs local Mongo; prints portal token and demo logins)
- Smoke: with `ENABLED_PLUGINS=sevenx`, run core-api + gateway + `pnpm nx serve sevenx_api`;
  `sevenxDashboardStats` as a team member returns 3 classes; portal login as
  `sarnai@7x.demo` then `sevenxMe` returns a `teacher` member.
