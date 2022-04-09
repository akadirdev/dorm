import { ClassMissions } from '../enums';

export function repository() {
  return function (ctr: Function) {
    ctr.prototype.mission = ClassMissions.REPOSITORY;
  };
}
