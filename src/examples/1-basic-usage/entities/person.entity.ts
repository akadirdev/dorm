import { model, property } from "../../../decorators";

@model({
  name: "personel",
})
export class Person {
  @property({
    type: "number",
    id: true,
    nullable: true,
  })
  id?: number;

  @property({
    type: "string",
    required: true,
  })
  name: string;

  @property({
    type: "string",
    required: true,
  })
  email: string;

  @property({
    name: "p_age",
    type: "number",
    nullable: true,
    required: false,
  })
  age: number;
}
