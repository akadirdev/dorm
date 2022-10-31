import { Constructor, Options } from "./definitions";
import { Dorm } from "./dorm";
import { Repository } from "./repository";

export class EntityRepository<T, K extends keyof T> {
  private readonly _entity: Constructor<T>;
  private readonly _repo: Repository;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(ds: Dorm, entity: Constructor<T>, id?: K) {
    this._repo = ds.getRepository();
    this._entity = entity;
  }

  async findById(id: T[K], options?: Options): Promise<T> {
    return this._repo.findById(this._entity, id, {}, options);
  }
}
