import UserDB from "../../models/user.js";
import ChatDB from "../../models/chat.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

export default async function addUsersToGroup(req, res, next) {
  try {
    const userId = req.userId;
    const { groupId, userIds } = req.body;

    const [userExists, dbChat] = await Promise.all([
      UserDB.exists({ _id: userId }),
      ChatDB.findById(groupId),
    ]);
    if (!userExists) throw resError(401, "Authenticated user not found!");
    if (!dbChat) throw resError(404, "Chat not found!");

    // Parse and validate userIds
    const arrayUserIds = Array.isArray(userIds) ? userIds : JSON.parse(userIds);

    // Check if all userIds exist in DB
    const count = await UserDB.countDocuments({ _id: { $in: arrayUserIds } });
    if (count !== arrayUserIds.length)
      throw resError(404, "One or more users not found.");

    const alreadyUsers = arrayUserIds.filter((id) =>
      dbChat.users.some((u) => u.user?.toString() === id)
    );

    if (alreadyUsers.length) {
      throw resError(
        409,
        `User with id ${arrayUserIds.join(", ")} already member!`
      );
    }

    const newUsers = arrayUserIds.map((id) => ({
      user: id,
      joinedAt: new Date(),
    }));

    const updatedChat = await ChatDB.findByIdAndUpdate(
      groupId,
      { $addToSet: { users: { $each: newUsers } } },

      { new: true }
    ).populate({
      path: "users.user groupAdmins.user",
      select: "-password",
    });

    resJson(res, 200, "Success add user to group chat.", updatedChat);
  } catch (error) {
    next(error);
  }
}
