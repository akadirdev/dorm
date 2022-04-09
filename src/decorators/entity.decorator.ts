import { EntitySpec } from '../specs/entity.spec';

export function entity(entitySpec?: string | EntitySpec) {
  return function (ctr: Function) {
    if (!entitySpec) {
      ctr.prototype.name = ctr.name.toLowerCase();
    } else {
      if (typeof entitySpec === 'string') ctr.prototype.name = entitySpec;
      else ctr.prototype.name = entitySpec.name;
    }
  };
}
