import { dbModels } from "../index.js";
import { UsersModel } from "../User.js";
import { ProfileModel } from "../Profile.js";
import { InteractionsModel } from "../Interactions.js";
import { MessagesModel } from "../Messages.js";
import { NotificationsModel } from "../Notifications.js";

describe("models/index.js exports", () => {
  test("exports all expected model keys", () => {
    expect(Object.keys(dbModels).sort()).toEqual(
      ["User", "Profile", "Interactions", "Messages", "Notifications"].sort(),
    );
  });

  test("maps each key to the same direct model export", () => {
    expect(dbModels.User).toBe(UsersModel);
    expect(dbModels.Profile).toBe(ProfileModel);
    expect(dbModels.Interactions).toBe(InteractionsModel);
    expect(dbModels.Messages).toBe(MessagesModel);
    expect(dbModels.Notifications).toBe(NotificationsModel);
  });
});
