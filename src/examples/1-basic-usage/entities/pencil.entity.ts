import { model, property } from "../../../decorators";

@model()
export class Pencil {
  @property({
    type: "string",
    id: true,
  })
  id?: string;

  @property({
    name: "seri_no",
    type: "string",
    required: true,
  })
  seriNo: string;

  @property({
    type: "string",
    required: true,
  })
  color: string;

  @property({
    name: "p_lenght",
    type: "number",
    required: true,
  })
  lenght: number;

  @property({
    name: "user_id",
    type: "number",
  })
  userId?: number;
}
