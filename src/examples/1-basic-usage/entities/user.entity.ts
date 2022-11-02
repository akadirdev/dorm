import { model, property } from "../../../decorators";

@model({ name: "dorm_user" })
export class User {
  @property({
    id: true,
    type: "number",
  })
  id?: number;

  @property({
    type: "string",
    required: true,
  })
  email: string;

  @property({
    name: "full_name",
    type: "string",
    required: true,
  })
  fullName: string;

  @property({
    name: "created_at",
    type: "date",
  })
  createdAt?: Date;

  @property({
    type: "number",
  })
  age?: number;
}
