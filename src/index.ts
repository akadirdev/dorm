import { BaseConnector, parseWhereFilter } from "./connectors";
import { PgConnector } from "./connectors/pg.connector";
import { model } from "./decorators/model.decorator";
import { oneToMany } from "./decorators/one-to-many.decorator";
import { property } from "./decorators/property.decorator";
import { Dorm } from "./dorm";
import { DormError } from "./errors/dorm.error";
import { EntityRepository } from "./repository";
import { getModelSchema } from "./schemas/model.schema";

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

  @oneToMany(Book, {
    type: "array",
    refererName: "personId",
  })
  books?: Book[];

  @oneToMany(Pencil, {
    type: "array",
    refererName: "userId",
  })
  pencils?: Pencil[];
}

// @model({
//   name: "school",
// })
// export class Okul {
//   @property({
//     type: "string",
//     id: true,
//   })
//   id?: string;

//   @property({
//     name: "school_name",
//     type: "string",
//     required: true,
//   })
//   name: string;

//   constructor(data?: Partial<Okul>) {
//     Object.assign(this, data ?? {});
//   }
// }

// @model()
// export class User {
//   id?: number;

//   firstName: string;

//   constructor(data?: Partial<User>) {
//     Object.assign(this, data ?? {});
//   }
// }

// @model()
// export class Doctor {
//   id?: number;

//   firstName: string;

//   constructor(data?: Partial<Doctor>) {
//     Object.assign(this, data ?? {});
//   }
// }
export class PersonRepository extends EntityRepository<Person, "id"> {
  constructor(ds: Dorm.Datasource) {
    super(ds, Person);
  }

  async getAllPerson() {}
}

const main = async (): Promise<void> => {
  // const ds = new Dorm.Datasource<PgConnector>({
  //   user: "postgres",
  //   host: "localhost",
  //   database: "speedy",
  //   password: "12345",
  //   port: 5432,
  //   connector: "pg",
  //   pooling: true,
  // });
  // await ds.connect();

  const ds = await Dorm.createDatasource({
    user: "postgres",
    host: "localhost",
    database: "speedy",
    password: "12345",
    port: 5432,
    connector: "pg",
    pooling: true,
  });
  await ds.connect();

  const repo = ds.repository;

  const sc = getModelSchema(Person).getAllSchema();
  console.dir(sc, {
    depth: null,
  });

  const persons = await repo.updateAll(
    Person,
    {
      name: "john",
    },
    {
      pencils: {
        color: {
          inq: ["red", "blue"],
        },
      },
      books: {
        name: "but",
      },
    }
  );

  console.dir(persons, { depth: null });

  // // const tx = await repo.begin();

  // // const tx2 = await repo.begin();
  // try {
  //   // const person = await repo.create(
  //   //   Person,
  //   //   {
  //   //     name: "ad",
  //   //     email: "akd@akd.com",
  //   //     age: 100,
  //   //     books: [
  //   //       {
  //   //         name: "War and Peace",
  //   //       },
  //   //     ],
  //   //   },
  //   //   {
  //   //     transaction: tx,
  //   //   }
  //   // );
  //   // console.log("p", person);

  //   // const person2 = await repo.create(
  //   //   Person,
  //   //   {
  //   //     name: "ad",
  //   //     email: "akd@akd.com",
  //   //     age: 101,
  //   //   },
  //   //   {
  //   //     transaction: tx2,
  //   //   }
  //   // );
  //   // console.log("p2", person2);

  //   // const persons = await repo.createAll(
  //   //   Person,
  //   //   [
  //   //     {
  //   //       name: "akd",
  //   //       email: "akd@akd.com",
  //   //       age: 110,
  //   //     },
  //   //     {
  //   //       name: "akd2",
  //   //       email: "akd@akd.com2",
  //   //       age: 120,
  //   //     },
  //   //   ],
  //   //   {
  //   //     transaction: tx,
  //   //   }
  //   // );
  //   // console.log("p2", persons);

  //   // await repo.deleteById(Person, 111, {
  //   //   transaction: tx,
  //   // });

  //   await tx.commit();
  // } catch (e: unknown) {
  //   await tx.rollback();
  //   console.error(e);
  //   // if (DormError.isDormError(e)) {
  //   //   console.log((e as DormError).stack);
  //   //   console.log((e as DormError).name);
  //   //   console.log((e as DormError).message);
  //   //   console.log((e as DormError).code);
  //   // }
  // }

  // Transactional process
  // const tx = await repo.begin();
  // try {
  //   const savedPerson = await repo.create(Person, {} as Person, {
  //     transaction: tx,
  //   });

  //   savedPerson.age = 36;

  //   await repo.update(Person, savedPerson, {
  //     transaction: tx,
  //   });
  //   await tx.commit();
  // } catch (e) {
  //   await tx.rollback();
  // }

  // await repo.create({ a: 1 });
  // await repo.find(Person, {
  //   age: {
  //     inq: [24, 25],
  //   },
  //   name: {
  //     neq: "akadirdev",
  //   },
  // });
  // await repo.findById(Person, 3);
  // await repo.update(Person, { id: 2, name: "dev" } as Person);
  // await repo.updateAll(Person, { name: "akadir" } as Person, { name: "dev" });

  // await repo.findField(Person, {
  //   inc: ["age", "email"],
  // });

  /**
   * Entity Repository
   * */
  //  const prep = new PersonRepository(ds);
  //  await prep.findById(123);

  //  const prep2 = ds.getEntityRepository(Person, "id");
  //  await prep2.findById(123);

  // const querier = repo.querier(Person);
  // querier.query("SELECT").fields(["id", "name"]).exec();
  ///////////////
  // const modelSchema = getModelSchema(Person);

  // const prepo = new PersonRepository()
  // console.log(modelSchema.getTableName());
  ///////////////
  // const pr = ds.getEntityRepository(Person);
  // await pr.findById();
  // await repo.findById(Person, 2);
  // const pr = new PersonRepository();
  // pr.getId(123);
  await ds.disconnect();
};

main();

// export * from "./dorm";
// export * from "./connectors";
// export * from "./decorators";
// export * from "./filters";

// export class EntityRepository<T, K extends keyof T> {
//   constructor() {}
//   getId(id: T[K]): void {
//     console.log(id);
//   }
// }

// export class PersonRepository extends EntityRepository<Person, "id"> {
//   constructor() {
//     super();
//   }
// }
