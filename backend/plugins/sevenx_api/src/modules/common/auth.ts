import { ExpectedError } from 'erxes-api-shared/utils';
import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';
import { ISevenxMemberDocument } from '@/members/@types/members';
import { ISevenxClassDocument } from '@/classes/@types/classes';
import { SevenxArgs, SevenxRole } from './types';

/** Resolver signature with this plugin's models in context. */
export type SevenxResolver = Resolver<unknown, SevenxArgs, IContext>;

export type SevenxActor =
  | { kind: 'supervisor'; userId: string; name: string }
  | { kind: 'member'; member: ISevenxMemberDocument; name: string };

const fullName = (first?: string, last?: string) =>
  [first, last].filter(Boolean).join(' ').trim();

/** Resolves who is calling: a team member (supervisor) or a portal member. */
export const getActor = async (context: IContext): Promise<SevenxActor> => {
  const { user, cpUser, models } = context;

  if (user?._id) {
    return {
      kind: 'supervisor',
      userId: user._id,
      name: fullName(user.details?.firstName, user.details?.lastName) || user.email || 'Supervisor',
    };
  }

  if (cpUser?._id) {
    const member = await models.Members.getMemberByCpUser(cpUser._id);
    if (!member) {
      throw new ExpectedError('Your account is not linked to 7x', 'FORBIDDEN');
    }
    return { kind: 'member', member, name: fullName(member.firstName, member.lastName) };
  }

  throw new ExpectedError('Login required', 'UNAUTHORIZED');
};

export const requireMember = async (
  context: IContext,
  role?: SevenxRole,
): Promise<ISevenxMemberDocument> => {
  const actor = await getActor(context);
  if (actor.kind !== 'member') {
    throw new ExpectedError('Portal user required', 'FORBIDDEN');
  }
  if (role && actor.member.role !== role) {
    throw new ExpectedError(`Only ${role}s can do this`, 'FORBIDDEN');
  }
  return actor.member;
};

export const canAccessClass = (actor: SevenxActor, cls: ISevenxClassDocument): boolean => {
  if (actor.kind === 'supervisor') return true;
  const id = actor.member._id;
  return cls.teacherId === id || cls.studentIds.includes(id);
};

export const isTeacherOf = (actor: SevenxActor, cls: ISevenxClassDocument): boolean =>
  actor.kind === 'supervisor' ||
  (actor.member.role === 'teacher' && cls.teacherId === actor.member._id);

/** Loads a class and checks the actor belongs to it. */
export const requireClassAccess = async (
  context: IContext,
  classId: string,
  mode: 'any' | 'teacher' = 'any',
): Promise<{ actor: SevenxActor; cls: ISevenxClassDocument }> => {
  const actor = await getActor(context);
  const cls = await context.models.Classes.getClass(classId);
  const ok = mode === 'teacher' ? isTeacherOf(actor, cls) : canAccessClass(actor, cls);
  if (!ok) {
    throw new ExpectedError('You do not have access to this class', 'FORBIDDEN');
  }
  return { actor, cls };
};

/** Class ids visible to the actor; null means everything (supervisor). */
export const visibleClassIds = async (context: IContext, actor: SevenxActor): Promise<string[] | null> => {
  if (actor.kind === 'supervisor') return null;
  const id = actor.member._id;
  const classes = await context.models.Classes.find(
    { $or: [{ teacherId: id }, { studentIds: id }] },
    { _id: 1 },
  ).lean();
  return classes.map((c) => c._id);
};

/** Resolver reachable by both supervisors and portal members (auth checked inside). */
export const shared = (resolver: SevenxResolver): SevenxResolver =>
  Object.assign(resolver, { wrapperConfig: { skipPermission: true } });

/** Resolver reachable only with a client-portal user cookie. */
export const portal = (resolver: SevenxResolver): SevenxResolver =>
  Object.assign(resolver, { wrapperConfig: { forClientPortal: true, cpUserRequired: true } });

/** Resolver reachable without any login (invite check). */
export const publicResolver = (resolver: SevenxResolver): SevenxResolver =>
  Object.assign(resolver, { wrapperConfig: { skipPermission: true } });
