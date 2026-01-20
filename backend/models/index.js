<<<<<<< HEAD
import { ProfileModel } from "./Profile.js";
import { InteractionsModel } from "./Interactions.js";
=======
import { ProfileModel } from './Profile.js';
import { InteractionsModel } from './Interactions.js';
import { MessagesModel } from './Messages.js';
>>>>>>> 7ae9366 (backend implementation of messaging api routes. setup mock data too)
// add more models here as you create them

export const dbModels = {
  Profile: ProfileModel,
  Interactions: InteractionsModel,
  Messages: MessagesModel,
  // add them here as well
};
