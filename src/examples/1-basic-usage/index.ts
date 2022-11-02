import { dorm } from "./dorm";
import { User } from "./entities";

export const basicUsage = async (): Promise<void> => {
  await dorm.connect();

  const repo = dorm.getRepository();

  const users = await repo.find(User, {
    where: {
      email: "john",
    },
  });

  console.log("users", users);

  await dorm.disconnect();
};
