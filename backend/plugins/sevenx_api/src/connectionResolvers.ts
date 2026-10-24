import mongoose from 'mongoose';
import { createGenerateModels } from 'erxes-api-shared/utils';
import { IMainContext } from 'erxes-api-shared/core-types';

import { ISevenxLocationDocument } from '@/locations/@types/locations';
import { ISevenxLocationModel, loadSevenxLocationClass } from '@/locations/db/models/Locations';
import { ISevenxInviteDocument, ISevenxMemberDocument } from '@/members/@types/members';
import { ISevenxMemberModel, loadSevenxMemberClass } from '@/members/db/models/Members';
import { ISevenxInviteModel, loadSevenxInviteClass } from '@/members/db/models/Invites';
import { ISevenxClassDocument } from '@/classes/@types/classes';
import { ISevenxClassModel, loadSevenxClassClass } from '@/classes/db/models/Classes';
import { ISevenxAttendanceDocument } from '@/attendance/@types/attendance';
import { ISevenxAttendanceModel, loadSevenxAttendanceClass } from '@/attendance/db/models/Attendances';
import {
  ISevenxAssignmentDocument,
  ISevenxSubmissionDocument,
} from '@/assignments/@types/assignments';
import { ISevenxAssignmentModel, loadSevenxAssignmentClass } from '@/assignments/db/models/Assignments';
import { ISevenxSubmissionModel, loadSevenxSubmissionClass } from '@/assignments/db/models/Submissions';
import { ISevenxAnnouncementDocument } from '@/announcements/@types/announcements';
import {
  ISevenxAnnouncementModel,
  loadSevenxAnnouncementClass,
} from '@/announcements/db/models/Announcements';

export interface IModels {
  Locations: ISevenxLocationModel;
  Members: ISevenxMemberModel;
  Invites: ISevenxInviteModel;
  Classes: ISevenxClassModel;
  Attendances: ISevenxAttendanceModel;
  Assignments: ISevenxAssignmentModel;
  Submissions: ISevenxSubmissionModel;
  Announcements: ISevenxAnnouncementModel;
}

export interface IContext extends IMainContext {
  models: IModels;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.Locations = db.model<ISevenxLocationDocument, ISevenxLocationModel>(
    'sevenx_locations',
    loadSevenxLocationClass(models),
  );
  models.Members = db.model<ISevenxMemberDocument, ISevenxMemberModel>(
    'sevenx_members',
    loadSevenxMemberClass(models),
  );
  models.Invites = db.model<ISevenxInviteDocument, ISevenxInviteModel>(
    'sevenx_invites',
    loadSevenxInviteClass(models),
  );
  models.Classes = db.model<ISevenxClassDocument, ISevenxClassModel>(
    'sevenx_classes',
    loadSevenxClassClass(models),
  );
  models.Attendances = db.model<ISevenxAttendanceDocument, ISevenxAttendanceModel>(
    'sevenx_attendances',
    loadSevenxAttendanceClass(models),
  );
  models.Assignments = db.model<ISevenxAssignmentDocument, ISevenxAssignmentModel>(
    'sevenx_assignments',
    loadSevenxAssignmentClass(models),
  );
  models.Submissions = db.model<ISevenxSubmissionDocument, ISevenxSubmissionModel>(
    'sevenx_submissions',
    loadSevenxSubmissionClass(models),
  );
  models.Announcements = db.model<ISevenxAnnouncementDocument, ISevenxAnnouncementModel>(
    'sevenx_announcements',
    loadSevenxAnnouncementClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
