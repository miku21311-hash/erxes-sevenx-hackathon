/**
 * Demo seed for the 7x plugin.
 *
 *   pnpm --filter sevenx_api seed
 *
 * Creates (idempotently, wiping previous 7x demo data first):
 *  - a ClientPortal "7x Portal" and prints its app token (NEXT_PUBLIC_ERXES_CP_TOKEN)
 *  - 2 locations, 2 teachers, 20 students (client portal users, password below)
 *  - 3 classes with recurring schedules, two weeks of attendance
 *  - assignments, submissions (some graded), announcements, pending invites
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { createHash, createHmac, randomBytes } from 'crypto';
import { loadClasses, IModels } from '../src/connectionResolvers';
import { ISevenxMemberDocument, ISevenxInviteDocument } from '../src/modules/members/@types/members';
import { ISevenxAttendance } from '../src/modules/attendance/@types/attendance';
import { ISevenxSubmission } from '../src/modules/assignments/@types/assignments';
import { generateSessions, toDateString } from '../src/modules/common/schedule';
import { ISevenxSchedule, SevenxAttendanceStatus } from '../src/modules/common/types';

const MONGO_URL =
  process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/erxes?directConnection=true';
const JWT_SECRET = process.env.JWT_TOKEN_SECRET || 'SECRET';
const DEMO_PASSWORD = process.env.SEVENX_SEED_PASSWORD || 'Pass1234';
const DEMO_DOMAIN = '7x.demo';
const PORTAL_NAME = '7x Portal';

const randomId = () => randomBytes(8).toString('hex');

/** HS256 JWT identical to what the gateway verifies with JWT_TOKEN_SECRET. */
const signJwt = (payload: Record<string, unknown>, secret: string) => {
  const enc = (v: object) => Buffer.from(JSON.stringify(v)).toString('base64url');
  const body = `${enc({ alg: 'HS256', typ: 'JWT' })}.${enc({ ...payload, iat: Math.floor(Date.now() / 1000) })}`;
  const sig = createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
};

const hashPassword = async (password: string) =>
  bcrypt.hash(createHash('sha256').update(password).digest('hex'), 10);

const addDays = (d: Date, days: number) => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const TEACHERS = [
  { firstName: 'Сарнай', lastName: 'Батболд', email: `sarnai@${DEMO_DOMAIN}` },
  { firstName: 'Тэмүүлэн', lastName: 'Ганбат', email: `temuulen@${DEMO_DOMAIN}` },
];

const STUDENT_NAMES = [
  ['Анар', 'Бат'], ['Билгүүн', 'Дорж'], ['Номин', 'Эрдэнэ'], ['Хулан', 'Сүхбат'],
  ['Тэмүжин', 'Болд'], ['Мишээл', 'Отгон'], ['Энхжин', 'Баяр'], ['Сүлд', 'Нямаа'],
  ['Ариунаа', 'Пүрэв'], ['Дөлгөөн', 'Цэрэн'], ['Марал', 'Жаргал'], ['Хаш-Эрдэнэ', 'Төмөр'],
  ['Оюунаа', 'Мөнх'], ['Батзаяа', 'Ганзориг'], ['Намуун', 'Алтан'], ['Тэнгис', 'Чулуун'],
  ['Сайнаа', 'Даваа'], ['Гэрэл', 'Лхагва'], ['Индра', 'Баасан'], ['Зол', 'Бямба'],
];

async function main() {
  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection;
  const models: IModels = loadClasses(db);
  interface IPortalDoc { _id: string; name: string; token?: string }
  const portals = db.collection<IPortalDoc & Record<string, unknown>>('client_portals');
  const cpUsers = db.collection<{ _id: string } & Record<string, unknown>>('client_portal_users');

  // ---- wipe previous demo data
  await Promise.all([
    models.Locations.deleteMany({}),
    models.Members.deleteMany({}),
    models.Invites.deleteMany({}),
    models.Classes.deleteMany({}),
    models.Attendances.deleteMany({}),
    models.Assignments.deleteMany({}),
    models.Submissions.deleteMany({}),
    models.Announcements.deleteMany({}),
    cpUsers.deleteMany({ email: new RegExp(`@${DEMO_DOMAIN.replace('.', '\\.')}$`) }),
  ]);

  // ---- client portal (reuse if present)
  let portal = await portals.findOne({ name: PORTAL_NAME });
  if (!portal) {
    const _id = randomId();
    const token = signJwt({ clientPortalId: _id }, JWT_SECRET);
    await portals.insertOne({
      _id,
      name: PORTAL_NAME,
      description: 'Teacher & student portal for 7x',
      url: process.env.SEVENX_PORTAL_URL || 'http://localhost:3000',
      token,
      securityAuthConfig: {
        otpConfig: { email: { enableEmailVerification: false }, sms: { enablePhoneVerification: false } },
      },
      verificationConfig: { type: 'none' },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    portal = await portals.findOne({ _id });
  }
  if (!portal) throw new Error('Could not create client portal');
  const portalId = String(portal._id);
  const portalToken = portal.token || signJwt({ clientPortalId: portalId }, JWT_SECRET);

  // ---- locations
  const [central, zaisan] = await models.Locations.insertMany([
    { name: 'Төв салбар', address: 'Сүхбаатар дүүрэг, 1-р хороо', rooms: ['101', '102', '201'] },
    { name: 'Зайсан салбар', address: 'Хан-Уул дүүрэг, 11-р хороо', rooms: ['A', 'B'] },
  ]);

  // ---- members + cp users
  const passwordHash = await hashPassword(DEMO_PASSWORD);
  const createMember = async (
    role: 'teacher' | 'student',
    firstName: string,
    lastName: string,
    email: string,
  ) => {
    const cpUserId = randomId();
    await cpUsers.insertOne({
      _id: cpUserId,
      type: 'customer',
      email,
      firstName,
      lastName,
      password: passwordHash,
      clientPortalId: portalId,
      isVerified: true,
      isEmailVerified: true,
      isPhoneVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return models.Members.create({ cpUserId, role, firstName, lastName, email, status: 'active' });
  };

  const teachers: ISevenxMemberDocument[] = [];
  for (const t of TEACHERS) {
    teachers.push(await createMember('teacher', t.firstName, t.lastName, t.email));
  }
  const students: ISevenxMemberDocument[] = [];
  for (let i = 0; i < STUDENT_NAMES.length; i++) {
    const [firstName, lastName] = STUDENT_NAMES[i];
    students.push(
      await createMember('student', firstName, lastName, `student${i + 1}@${DEMO_DOMAIN}`),
    );
  }

  // ---- classes (started 3 weeks ago, run 10 more weeks)
  const start = addDays(new Date(), -21);
  const end = addDays(new Date(), 70);
  const schedule = (daysOfWeek: number[], startTime: string, endTime: string): ISevenxSchedule => ({
    daysOfWeek,
    startTime,
    endTime,
    startDate: start,
    endDate: end,
  });
  const today = new Date().getDay();
  const classes = await models.Classes.insertMany([
    {
      name: 'IELTS 6.5 бэлтгэл',
      description: 'Англи хэлний IELTS-ийн бэлтгэл анги',
      teacherId: teachers[0]._id,
      locationId: central._id,
      room: '101',
      studentIds: students.slice(0, 8).map((s) => s._id),
      schedule: schedule([today, (today + 2) % 7], '18:00', '19:30'),
      status: 'active',
    },
    {
      name: 'Математик 11-р анги',
      description: 'ЭЕШ-ийн математикийн бэлтгэл',
      teacherId: teachers[1]._id,
      locationId: central._id,
      room: '201',
      studentIds: students.slice(8, 15).map((s) => s._id),
      schedule: schedule([today, (today + 3) % 7], '16:00', '17:30'),
      status: 'active',
    },
    {
      name: 'Python эхлэгчдэд',
      description: 'Програмчлалын үндэс, Python',
      teacherId: teachers[0]._id,
      locationId: zaisan._id,
      room: 'A',
      studentIds: students.slice(15, 20).map((s) => s._id),
      schedule: schedule([(today + 1) % 7, (today + 4) % 7], '19:00', '20:30'),
      status: 'active',
    },
  ]);

  // ---- attendance for past sessions
  const statuses: SevenxAttendanceStatus[] = ['present', 'present', 'present', 'present', 'late', 'absent', 'excused'];
  const attendanceDocs: ISevenxAttendance[] = [];
  for (const cls of classes) {
    const past = generateSessions(cls.schedule).filter((s) => s.isPast);
    for (const session of past) {
      for (const studentId of cls.studentIds) {
        attendanceDocs.push({
          classId: cls._id,
          date: session.date,
          studentId,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          markedBy: cls.teacherId,
        });
      }
    }
  }
  if (attendanceDocs.length) await models.Attendances.insertMany(attendanceDocs);

  // ---- assignments + submissions
  const assignments = await models.Assignments.insertMany([
    { classId: classes[0]._id, title: 'Writing Task 2 — Opinion essay', description: 'Write 250+ words on the given topic.', attachments: [], dueDate: addDays(new Date(), -3), maxScore: 100, createdBy: teachers[0]._id },
    { classId: classes[0]._id, title: 'Listening practice set 4', description: 'Complete sections 1–4 and upload your answer sheet.', attachments: [], dueDate: addDays(new Date(), 4), maxScore: 40, createdBy: teachers[0]._id },
    { classId: classes[1]._id, title: 'Тригонометрийн бодлого №1-20', description: 'Сурах бичгийн 112-р хуудас.', attachments: [], dueDate: addDays(new Date(), 2), maxScore: 100, createdBy: teachers[1]._id },
    { classId: classes[2]._id, title: 'Даалгавар 1: Тоо таах тоглоом', description: 'while давталт, input(), random ашиглана.', attachments: [], dueDate: addDays(new Date(), 6), maxScore: 100, createdBy: teachers[0]._id },
  ]);

  const submissionDocs: ISevenxSubmission[] = [];
  for (const [i, studentId] of classes[0].studentIds.entries()) {
    if (i % 4 === 3) continue;
    const graded = i % 2 === 0;
    submissionDocs.push({
      assignmentId: assignments[0]._id,
      studentId,
      text: 'Some people believe that... In my opinion...',
      attachments: [],
      submittedAt: addDays(new Date(), -4 + (i % 3)),
      ...(graded ? { score: 60 + i * 5, feedback: 'Сайн байна, холбоос үгсээ анхаар.', gradedAt: addDays(new Date(), -1) } : {}),
    });
  }
  for (const [i, studentId] of classes[1].studentIds.entries()) {
    if (i % 3 !== 0) continue;
    submissionDocs.push({
      assignmentId: assignments[2]._id,
      studentId,
      text: 'Бодлогуудыг хавсралтаар илгээлээ.',
      attachments: [],
      submittedAt: new Date(),
    });
  }
  if (submissionDocs.length) await models.Submissions.insertMany(submissionDocs);

  // ---- announcements
  await models.Announcements.insertMany([
    { scope: 'all', title: 'Шинэ улирлын хуваарь', body: 'Бүх ангиудын хуваарь энэ долоо хоногоос шинэчлэгдсэн. Portal дээрээс шалгаарай.', attachments: [], createdBy: 'seed', createdByName: 'Сургалтын төв', readBy: students.slice(0, 5).map((s) => s._id) },
    { scope: 'class', classId: classes[0]._id, title: 'Mock test — Бямба гарагт', body: 'Бямба гарагийн 10:00 цагт бүтэн IELTS mock test авна. Үзэг, бичгийн хэрэгслээ авч ирээрэй.', attachments: [], createdBy: teachers[0]._id, createdByName: 'Сарнай Батболд', readBy: [] },
    { scope: 'class', classId: classes[1]._id, title: 'Хичээл цуцлагдана', body: 'Дараагийн Пүрэв гарагийн хичээл багшийн шалтгаанаар цуцлагдана. Нөхөн хичээлийн цагийг тусад нь мэдэгдэх болно.', attachments: [], createdBy: teachers[1]._id, createdByName: 'Тэмүүлэн Ганбат', readBy: [] },
  ]);

  // ---- pending invites (demo of the invite flow)
  const invites: ISevenxInviteDocument[] = [];
  for (const [i, email] of [`new.student1@${DEMO_DOMAIN}`, `new.student2@${DEMO_DOMAIN}`].entries()) {
    invites.push(
      await models.Invites.createInvite({
        email,
        role: 'student',
        classIds: [classes[i]._id],
        firstName: i === 0 ? 'Шинэ' : 'Урилгатай',
        lastName: 'Сурагч',
        invitedBy: 'seed',
      }),
    );
  }

  const portalUrl = (process.env.SEVENX_PORTAL_URL || 'http://localhost:3000').replace(/\/$/, '');
  const lines = [
    '',
    '7x demo data seeded.',
    '',
    `Portal app token (NEXT_PUBLIC_ERXES_CP_TOKEN): ${portalToken}`,
    `Client portal id  (NEXT_PUBLIC_CLIENT_PORTAL_ID): ${portalId}`,
    '',
    `Password for every demo account: ${DEMO_PASSWORD}`,
    `Teachers: ${TEACHERS.map((t) => t.email).join(', ')}`,
    `Students: student1@${DEMO_DOMAIN} … student${STUDENT_NAMES.length}@${DEMO_DOMAIN}`,
    '',
    'Pending invite links:',
    ...invites.map((inv) => `  ${portalUrl}/invite/${inv.token}  (${inv.email})`),
    '',
    `Today is ${toDateString(new Date())}; classes 1 and 2 have a session today.`,
  ];
  process.stdout.write(`${lines.join('\n')}\n`);
  // erxes-api-shared exits with code 1 on 'disconnected', so end the process here instead.
  process.exit(0);
}

main().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.stack || err.message : String(err)}\n`);
  process.exit(1);
});
