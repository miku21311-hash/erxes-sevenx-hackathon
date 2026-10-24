import { createGenerateModels } from 'erxes-api-shared/utils';
import { IMainContext } from 'erxes-api-shared/core-types';
import { IClassesDocument } from '@/classes/@types/classes';

import mongoose from 'mongoose';

import { loadClassesClass, IClassesModel } from '@/classes/db/models/Classes';

export interface IModels {
  Classes: IClassesModel;
}

export interface IContext extends IMainContext {
  models: IModels;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.Classes = db.model<IClassesDocument, IClassesModel>(
    'classes',
    loadClassesClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
