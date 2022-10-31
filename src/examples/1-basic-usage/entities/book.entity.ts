import { model, property } from "../../../decorators";

@model({ name: "book" })
export class Book {
  @property({
    type: "string",
    id: true,
  })
  id?: string;

  @property({
    name: "book_name",
    type: "string",
    required: true,
  })
  name: string;

  @property({
    name: "person_id",
    type: "number",
  })
  personId?: number;
}
