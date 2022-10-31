import { dorm } from "./dorm";
import { Person } from "./entities";

export const basicUsage = async (): Promise<void> => {
  await dorm.connect();

  const repo = dorm.getRepository();

  const persons = repo.find(Person, {
    where: {
      name: "john",
    },
  });

  console.log("persons", persons);
};
