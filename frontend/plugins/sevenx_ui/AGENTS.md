# `sevenx_ui` Plugin Guide

## Identity

- **Plugin:** `sevenx`
- **Project:** `sevenx_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/sevenx_ui`
- **Last synchronized:** `2026-10-24`

## Scope

### Owns

- The supervisor (erxes team member) UI of the 7x training-center plugin: dashboard, classes with schedule and conflict check, class detail (students, attendance heatmap, assignments, class announcements), weekly schedule calendar, teachers and students lists with invites, locations with rooms, and announcements.
- Its own GraphQL documents, hooks, Zod schemas, `en` / `mn` dictionaries, navigation and routes under `/sevenx/*`.

### Does not own

- `sevenx_api` resolvers, models or permissions (contract: `docs/sevenx-graphql-contract.graphql`).
- The teacher/student portal (`apps/sevenx-portal`), core UI, `erxes-ui`, `ui-modules`, or any other plugin.
- Gateway locale files (`backend/gateway/src/locales/*/sevenx.json`): the host tries to load that namespace, but this plugin ships its own dictionaries.

## Current Capabilities

- Runs as the `sevenx_ui` Module Federation remote on port `3012`; display name "7x", icon `IconSchool`.
- `/sevenx` dashboard: counts (teachers, students, classes, locations), weekly attendance rate, pending invites, today's sessions and the five most recent announcements (`sevenxDashboardStats`, `sevenxAnnouncements(limit: 5)`).
- `/sevenx/classes`: RecordTable of `sevenxClasses` filtered by location and teacher (URL query `locationId`, `teacherId`) and a debounced search; create/edit Sheet (name, description, teacher from `sevenxMembers(role: teacher)`, location + room from `sevenxLocations`, days-of-week checkboxes, start/end time, start/end date). While the form is complete, `sevenxScheduleConflicts` runs debounced (500 ms) and conflicts are shown inline; Save is disabled while conflicts exist. Remove with confirmation.
- `/sevenx/classes/:id`: header with teacher, location, schedule and period, Edit sheet, and tabs: Students (table, add via multi-select of unenrolled `sevenxMembers(role: student)` → `sevenxClassAddStudents`, remove → `sevenxClassRemoveStudent`), Attendance (student × session heatmap from `sevenxClassSessions` + `sevenxAttendanceReport` for a selectable date range, falling back to sessions computed from the schedule when the server returns none; per-student summary from `sevenxClassAttendanceSummary`), Assignments (read-only `sevenxAssignments`), Announcements (class-scoped list and create).
- `/sevenx/schedule`: Monday–Sunday weekly grid of active classes placed by time, week navigation, filter by location; blocks link to the class.
- `/sevenx/teachers` and `/sevenx/students`: RecordTable of `sevenxMembers(role)` with search, Invite Sheet (`sevenxInviteCreate`: email, last/first name, classes) that shows the returned invite `url` with a copy button, pending invites table (`sevenxInvites`, copy link, remove), member remove with confirmation.
- `/sevenx/locations`: RecordTable + Sheet form (name, address, rooms as a tag input) → `sevenxLocationAdd/Edit/Remove`.
- `/sevenx/announcements`: card list with read count and remove; create Sheet with audience (everyone / one class), class select, title, body → `sevenxAnnouncementAdd`.
- Every list has loading skeletons, an empty state with a primary action, and a retryable error state; every mutation shows a success or error toast.

## Architecture

| Area              | Path                                                        | Responsibility                                                                    |
| ----------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Federation config | `frontend/plugins/sevenx_ui/module-federation.config.ts`   | Exposes `./config` and `./sevenx`.                                                |
| Plugin config     | `frontend/plugins/sevenx_ui/src/config.tsx`                 | `IUIConfig` (`name: 'sevenx'`, `i18n: true`, modules) and registers dictionaries. |
| Entry             | `frontend/plugins/sevenx_ui/src/modules/SevenxMain.tsx`     | `AppLayout` with the plugin sidebar and lazy routes under `/sevenx/*`.            |
| Navigation        | `frontend/plugins/sevenx_ui/src/modules/SevenxNavigation.tsx` | Sidebar links for the seven routes.                                             |
| i18n              | `frontend/plugins/sevenx_ui/src/i18n`                       | `en.ts`, `mn.ts` and `registerSevenxLocales()` (adds the `sevenx` namespace).     |
| Shared            | `frontend/plugins/sevenx_ui/src/modules/shared`             | Contract types, schedule/date helpers, page header, empty/error states, confirm dialog, toast hook. |
| Features          | `frontend/plugins/sevenx_ui/src/modules/<feature>`          | `graphql/`, `hooks/`, `components/` per feature: `classes`, `members`, `locations`, `announcements`, `dashboard`, `schedule`. |
| Pages             | `frontend/plugins/sevenx_ui/src/pages`                      | One route component per page.                                                     |

## Contracts

### Provides

- Module Federation exposes: `./config`, `./sevenx`.
- Routes: `/sevenx`, `/sevenx/classes`, `/sevenx/classes/:id`, `/sevenx/schedule`, `/sevenx/teachers`, `/sevenx/students`, `/sevenx/locations`, `/sevenx/announcements`.
- i18next namespace `sevenx` (keys in `src/i18n`), including the navigation label key `sevenx` = "7x".

### Consumes

- `sevenx_api` GraphQL per `docs/sevenx-graphql-contract.graphql`: queries `sevenxDashboardStats`, `sevenxLocations`, `sevenxMembers`, `sevenxClasses`, `sevenxClassDetail`, `sevenxScheduleConflicts`, `sevenxAttendanceReport`, `sevenxInvites`, `sevenxAnnouncements`, `sevenxClassSessions`, `sevenxClassAttendanceSummary`, `sevenxAssignments`; mutations `sevenxLocationAdd/Edit/Remove`, `sevenxClassAdd/Edit/Remove`, `sevenxClassAddStudents`, `sevenxClassRemoveStudent`, `sevenxMemberRemove`, `sevenxInviteCreate`, `sevenxInviteRemove`, `sevenxAnnouncementAdd`, `sevenxAnnouncementRemove`.
- Public `erxes-ui` (RecordTable, Sheet, Form, Select, DatePicker, MultipleSelector, StringArrayInput, Tabs, Table, Card, Alert, Empty, toast) and `ui-modules` (`PageHeader`).
- Host `react-i18next` instance (shared singleton) for the `sevenx` namespace.

## Data and State

- Apollo Client owns all server state. Mutations evict `ROOT_QUERY` fields they affect (`sevenxClasses`, `sevenxMembers`, `sevenxInvites`, `sevenxAnnouncements`, `sevenxDashboardStats`) or refetch `sevenxLocationsList`, so lists update without a manual refresh.
- React Hook Form + Zod own form state; filters live in URL query params (`useQueryState` / `useMultiQueryState`) or local state. No Jotai atoms.

## Local Invariants

- GraphQL operation names are prefixed `sevenx` and unique (`sevenxClassesList`, `sevenxClassAddMutation`, …); documents stay in `src/modules/<feature>/graphql/`.
- All user-visible strings go through `useTranslation('sevenx')` with keys present in both `en.ts` and `mn.ts`.
- `registerSevenxLocales()` must be called from both `config.tsx` (so the navigation label resolves) and `SevenxMain.tsx`; it never overwrites keys already loaded.
- Class form: `partialValuesToInput` returns `null` until every schedule field is valid; the conflict query is skipped until then and Save is blocked while conflicts exist.
- `WEEK_DAYS` is Monday-first (`[1,2,3,4,5,6,0]`); `daysOfWeek` values follow the contract (0 = Sunday).
- Pages render the shared `SevenxPageHeader` with a favorite breadcrumb and a Tabler icon name.
- No direct `radix-ui` imports, no `any`, no default exports outside tool configs.

## Validation

- `pnpm nx lint sevenx_ui`
- `pnpm nx build sevenx_ui`
- `pnpm nx test sevenx_ui` (schedule helper unit tests; `tsconfig.spec.json` sets `esModuleInterop` for `dayjs`)
- Smoke: with `sevenx_api` running, open `/sevenx/classes`, create a class whose teacher or room overlaps an existing one and confirm the inline conflict list blocks Save; fix the time and save; open the class, add a student and check the Students tab and `/sevenx/students` update without reload.
