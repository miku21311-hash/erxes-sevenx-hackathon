# sevenx-portal — 7x teacher/student portal

Next.js (App Router) + Apollo Client + Tailwind portal for the `sevenx` erxes
plugin. Teachers and students are erxes client portal users (cpUser); the
plugin links them to a `SevenxMember` with a role.

```bash
cp .env.sample .env.local   # fill NEXT_PUBLIC_ERXES_CP_TOKEN
pnpm install --ignore-workspace
pnpm dev                    # http://localhost:3800
pnpm build                  # type-checks and builds
```

The app is not part of the pnpm workspace; install inside this folder.

## Routes

| Route                | Who     | Content                                                       |
| -------------------- | ------- | ------------------------------------------------------------- |
| `/`                  | any     | redirects to `/t`, `/s` or `/login` based on `sevenxMe`       |
| `/login`             | any     | role tabs (Багш / Сурагч), email + password                    |
| `/invite/[token]`    | any     | invite check → register → login → `sevenxInviteAccept`         |
| `/t`                 | teacher | today's sessions, ungraded submissions, classes, announcements |
| `/t/classes/[id]`    | teacher | tabs: Ирц, Даалгавар, Сурагчид, Зар (`?tab=`)                 |
| `/s`                 | student | next session, assignments due soon, classes, announcements     |
| `/s/classes/[id]`    | student | tabs: Хуваарь, Миний ирц, Даалгавар, Зар (`?tab=`)            |

GraphQL contract: `docs/sevenx-graphql-contract.graphql` (repo root).
File uploads go to `POST {ERXES_API_URL}/upload-file?kind=main`.
