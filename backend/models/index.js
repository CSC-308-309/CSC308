import { UsersModel } from './User.js';
import { InteractionsModel } from './Interactions.js';
import { MessagesModel } from './Messages.js';
import { NotificationsModel } from "./Notifications.js";
// add more models here as you create them

export const dbModels = {
  User: UsersModel,
  Interactions: InteractionsModel,
  Messages: MessagesModel,
  Notifications: NotificationsModel,
  // add them here as well
};
