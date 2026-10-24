# 7x (`sevenx`) — Сургалтын төвийн plugin · Hackathon төлөвлөгөө (1 өдөр)

> Plugin нэр: generator нь үсгээр эхэлсэн, зөвхөн үсэг/тоо шаарддаг тул код дээр
> **`sevenx`** (`sevenx_api`, `sevenx_ui`), харагдах нэр **"7x"**.

## 1. Шийдвэрүүд (асуулт-хариултаас)

| # | Шийдвэр |
|---|---------|
| Хугацаа | 1 өдөр (~10–12 цаг), 3 track зэрэгцээ |
| Сургалтын төв | 1 workspace = 1 төв, олон **Location** |
| Supervisor | erxes team member → core UI (3001) доторх `sevenx_ui` plugin |
| Багш, сурагч | Хоёулаа **client portal хэрэглэгч (cpUser)**, тусдаа линк (portal). Нэвтрэхдээ role сонгож email+password |
| Portal | `apps/client-portal-template`-ийг хуулж `apps/sevenx-portal` (Next.js) |
| Бүртгэл | Зөвхөн invite (төв эсвэл багш илгээнэ) |
| Анги | 1 багш, давтамжтай 7 хоногийн хуваарь (Да/Лх 18:00–19:30 гэх мэт) |
| Ирц | ирсэн / хоцорсон / тасалсан / чөлөөтэй |
| Даалгавар | текст + олон файл, 0–100 оноо + сэтгэгдэл |
| Хэл | mn + en (`react-i18next`, portal дээр ч json dictionary) |
| Seed | тийм — `sevenx_api` дотор `scripts/seed.ts` |

## 2. erxes client portal хэрхэн ажилладаг (асуулт 5)

- Core-д `clientportal` модуль байна: **ClientPortal** (portal тохиргоо, 1 workspace-д олон байж болно) ба **cpUser** (гадны хэрэглэгч; `email/phone/password/firstName/lastName/type/clientPortalId`).
- Frontend нь gateway руу `x-app-token` header (portal-ийн app token) илгээж аль portal-ийн хэрэглэгч гэдгийг заана. Login амжилттай бол **cookie** тавигдана, дараагийн бүх хүсэлтэд явна.
- Бэлэн mutation-ууд: `clientPortalUserRegister`, `clientPortalUserLoginWithCredentials`, `clientPortalUserVerify`, `clientPortalUserForgotPassword/ResetPassword`, `clientPortalUserChangePassword`, `clientPortalNotifications`… (`backend/core-api/src/modules/clientportal/docs/auth-flows.md`).
- Plugin-ийн resolver бүрт context-оор `cpUser` ирдэг. Resolver-ийг `wrapperConfig = { cpUserRequired: true }` гэж тэмдэглэвэл team-member permission шалгахгүй, харин cpUser шаардана (жишээ: `sales_api/.../ecommerce/.../wishlist.ts`).
- Core-д **invite** mutation байхгүй → invite-ийг plugin өөрөө хийнэ (доор).
- Portal-д OTP/email verify-г demo-д **унтраах** (ClientPortal тохиргоонд verification off) — auto-verify болно.

### Нэвтрэх урсгал (portal)

```
/login  → role tab (Багш | Сурагч) → email+password
        → clientPortalUserLoginWithCredentials
        → sevenxMe  (cpUser → Member{role}) ; role таарахгүй бол "Та багшийн хэсэгт бүртгэлгүй"
/invite/<token> → sevenxInviteCheck(token) → нэр/нууц үг оруулах
        → clientPortalUserRegister(email, password, firstName, lastName)
        → clientPortalUserLoginWithCredentials
        → sevenxInviteAccept(token)   // cpUser._id ↔ Member холбоно
```

## 3. Data model (`sevenx_api`, бүгд subdomain-scoped)

| Collection | Талбарууд |
|---|---|
| `sevenx_locations` | name, address, rooms[] |
| `sevenx_members` | cpUserId?, role: `teacher`\|`student`, firstName, lastName, email, phone, status: `invited`\|`active` |
| `sevenx_invites` | token, email, role, classIds[], invitedBy, expiresAt, acceptedAt |
| `sevenx_classes` | name, teacherId(Member), locationId, room, studentIds[], schedule:{daysOfWeek[], startTime, endTime, startDate, endDate}, status |
| `sevenx_attendances` | classId, date(YYYY-MM-DD), studentId, status: `present`\|`late`\|`absent`\|`excused`, note, markedBy |
| `sevenx_assignments` | classId, title, description, attachments[], dueDate, maxScore(100), createdBy |
| `sevenx_submissions` | assignmentId, studentId, text, attachments[], submittedAt, score?, feedback?, gradedAt? |
| `sevenx_announcements` | scope: `all`\|`class`, classId?, title, body, attachments[], createdBy, readBy[] |

**Хялбарчлал:** хичээлийн "session" collection үүсгэхгүй. Хуваарийн дүрмээс огноог runtime дээр тооцоолж, ирц `classId+date` түлхүүрээр хадгална. Хуваарь зөрчил = ижил `teacherId` эсвэл `locationId+room` дээр өдөр/цаг огтлолцол (энгийн interval check).

Файл: erxes core `files` модулиар upload хийж URL-аа л хадгална.

## 4. GraphQL (`sevenx` prefix, repo даяар давтагдахгүй)

**Supervisor (team member, permission шаардана):**
`sevenxLocations/LocationAdd/Edit/Remove`, `sevenxMembers(role)`, `sevenxInviteCreate(email, role, classIds)`, `sevenxClasses/ClassDetail/ClassAdd/ClassEdit/ClassRemove`, `sevenxClassAddStudents/RemoveStudent`, `sevenxScheduleConflicts(input)`, `sevenxDashboardStats`, `sevenxAnnouncementAdd`, `sevenxAttendanceReport(classId, from, to)`

**Portal (`cpUserRequired: true`):**
`sevenxMe`, `sevenxInviteCheck(token)`, `sevenxInviteAccept(token)`, `sevenxMyClasses`, `sevenxClassSessions(classId, from, to)`, `sevenxAttendanceByDate(classId, date)`, `sevenxAttendanceMark(classId, date, items[])` *(багш)*, `sevenxMyAttendance(classId)` *(сурагч)*, `sevenxAssignments(classId)`, `sevenxAssignmentAdd/Edit` *(багш)*, `sevenxSubmissionUpsert(assignmentId, text, attachments)` *(сурагч)*, `sevenxSubmissions(assignmentId)` + `sevenxSubmissionGrade(id, score, feedback)` *(багш)*, `sevenxAnnouncements(classId?)`, `sevenxAnnouncementMarkRead(id)`, `sevenxInviteCreate` *(багш ч өөрийн ангид сурагч урина)*

Эрхийн дүрэм service давхаргад: багш зөвхөн `teacherId === me` ангид, сурагч зөвхөн `studentIds ∋ me` ангид.

## 5. UI хуудсууд

### A. Supervisor — `frontend/plugins/sevenx_ui` (core UI дотор, `/sevenx/...`)
1. **Dashboard** — нийт багш / сурагч / анги / өнөөдрийн хичээл, 7 хоногийн ирцийн %, сүүлийн зарууд
2. **Classes** — RecordTable; үүсгэх/засах Sheet: нэр, багш, location+room, хуваарь (өдрүүд checkbox, цаг), огноо; зөрчил байвал inline алдаа
3. **Class detail** — сурагчдын жагсаалт (нэмэх/хасах), ирцийн heatmap (сурагч × огноо), даалгаврууд
4. **Schedule** — 7 хоногийн calendar grid, location-оор шүүх
5. **Teachers / Students** — жагсаалт + "Invite" (email, role, анги) → invite линк copy
6. **Locations** — CRUD
7. **Announcements** — all/анги руу зар бичих, хэн уншсан тоо

### B/C. Portal — `apps/sevenx-portal` (Next.js, тусдаа линк)
- `/login` (role tab), `/invite/[token]`
- **Багш:** `/t` dashboard (өнөөдрийн хичээл, шалгах хариу тоо) · `/t/classes/[id]` → tabs: Ирц (огноо сонгож 4 төлөвт toggle, нэг товчоор "бүгд ирсэн") · Даалгавар (үүсгэх, хариу харах, дүгнэх) · Сурагчид (invite) · Зар
- **Сурагч:** `/s` dashboard (дараагийн хичээл, хугацаа дөхсөн даалгавар, уншаагүй зар) · `/s/classes/[id]` → Хуваарь · Миний ирц (% + жагсаалт) · Даалгавар (хариу бичих, файл хавсаргах, оноо харах) · Зар

Хоёр role нэг Next.js app, layout нь `sevenxMe.role`-оор салаална.

## 6. Цагийн хуваарь (3 track, ~11 цаг)

| Цаг | Track A — Backend (`sevenx_api`) | Track B — Supervisor UI (`sevenx_ui`) | Track C — Portal (Next.js) |
|---|---|---|---|
| 0–1 | `pnpm create-plugin --plugin-name=sevenx --module-name=classes`, port сонгох (api 3315, ui 3012 — зөвшөөрөгдсөн эсэхийг шалгах), scaffold цэвэрлэх, ClientPortal үүсгэж app token авах | generated UI цэвэрлэх, routes/config.tsx, nav, i18n суурь | template хуулах, Apollo client (`x-app-token`, cookie), login + role tab |
| 1–3 | Models + schema: Location, Member, Invite, Class, conflict check | Locations, Classes CRUD + schedule form | `/invite/[token]` register → login → accept; `/t`, `/s` layout |
| 3–5 | Attendance, Assignment, Submission, Announcement models + cpUser resolvers + эрхийн дүрэм | Class detail (сурагч нэмэх), Teachers/Students + Invite link | Багш: ирцийн grid; Сурагч: миний ирц |
| 5–6 | **Seed script** (2 location, 3 анги, 2 багш, 20 сурагч, 2 долоо хоногийн ирц, 4 даалгавар, 3 зар) | Dashboard stats | Даалгавар: үүсгэх / хариу / дүгнэх (файл upload) |
| 6–8 | Bug fix, `lint/build/test`, AGENTS.md | Schedule calendar, Announcements | Зар + уншсан, dashboard-ууд |
| 8–9 | — Integration: 3 track-ийг нэг демо урсгалд холбох — |||
| 9–10 | i18n en/mn гүйцээх, empty/loading states, demo polish |||
| 10–11 | Demo бэлтгэл, rehearsal ×2 |||

**Хасах дараалал (цаг хүрэхгүй бол):** Schedule calendar grid → announcement readBy → файл хавсралт (зөвхөн текст) → dashboard stats (тоонууд static биш, гэхдээ энгийн count).

**Stretch (цаг үлдвэл л):** QR ирц · тасалсан 3 удаа → notification · эцэг эхийн read-only линк · AI асуулт (schema цэвэр бол agent өөрөө ажилладаг).

## 7. Демо скрипт (5 мин)

1. Supervisor: dashboard → шинэ анги үүсгэх, багш/байр давхцсан тохиолдолд зөрчлийн алдаа харуулах → засаж хадгалах
2. Supervisor: сурагч invite → линк copy
3. Сурагчийн portal (өөр browser/incognito): invite линкээр бүртгүүлж орох → dashboard
4. Багшийн portal: өнөөдрийн хичээлийн ирц бүртгэх → даалгавар оруулах
5. Сурагч: ирц шууд харагдана, даалгаварт хариу + файл илгээх
6. Багш: дүгнэх → Сурагч оноо + сэтгэгдэл харна
7. Supervisor: зар явуулах → хоёр portal дээр гарч ирэх; dashboard ирцийн %

## 8. Хүрээний тэмдэглэл

- `backend/plugins/sevenx_api`, `frontend/plugins/sevenx_ui`, `apps/sevenx-portal` — зөвхөн эдгээр хавтас. Core/shared өөрчлөхгүй.
- Хоёр plugin-д `AGENTS.md` үүсгэж, дуусахад sync хийх (repo дүрэм).
- Validation: `pnpm nx lint|build sevenx_api`, `pnpm nx lint|build sevenx_ui`, portal: `pnpm build`.
- `.env`: `ENABLED_PLUGINS=sevenx`, portal `.env.local`: `ERXES_API_URL`, `NEXT_PUBLIC_ERXES_CP_TOKEN`.
