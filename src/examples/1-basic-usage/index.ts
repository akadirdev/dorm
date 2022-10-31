import { dorm } from "./dorm";

export const basicUsage = async (): Promise<void> => {
  await dorm.connect();

  const repo = dorm.getRepository();
  console.log("finish");
};
