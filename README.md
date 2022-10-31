<p align="center">
  <img src="./public/logo-dormjs.png">
</p>

<p align="center">
  <img src="https://img.shields.io/github/license/akadirdev/dorm">
  <img src="https://img.shields.io/github/package-json/v/akadirdev/dorm">
  <img src="https://img.shields.io/npm/dw/@dormjs/core">
  <img src="https://img.shields.io/github/last-commit/akadirdev/dorm">
  <a href="https://gitter.im/dorm-js/community">
    <img src="https://badges.gitter.im/dorm-js/community.svg" >
  </a>
  <img src="https://dl.circleci.com/status-badge/img/gh/akadirdev/dorm/tree/master.svg?style=shield">
</p>

A light-weight ORM tool written with `Typescript` for Node.js based on `Data Mapper` pattern. Supports `PostgreSQL` for now.

## Features (for now)

- Decorators for Entities
- Repository
- Transactions
- Custom Entity Repository
- Connection pooling

## Installation

Install `dormjs` with database driver:

`npm i @dormjs/core pg`

And add below to `compilerOptions` in `tsconfig.json` for decorator usages:

```json
"experimentalDecorators": true
```

## Usage

### Dorm Initialization

Init `dorm` with database connection infos:

`dorm.ts`

```TypeScript
const dorm = Dorm.init<PgConnector>({
  user: "postgres",
  host: "localhost",
  database: "speedy",
  password: "12345",
  port: 5432,
  connector: "pg",
  pooling: true,
})

await dorm.connect();
```

### Entity Definition

```sql
create table book (
    id serial primary key,
    book_name text not null,
    release_date timestamp default now(),
    author_id integer not null
);
```

Create the entity class of the book table given above.

`book.entity.ts`

```TypeScript
@model()
export class Book {
  @property({
    type: "number",
    id: true,
  })
  id?: number;

  @property({
    name: "book_name",
    type: "string",
    required: true,
  })
  name: string;

  @property({
    name: "release_date",
    type: "date",
  })
  releaseDate?: string;

  @property({
    name: "author_id",
    type: "number",
  })
  authorId: number;
}
```

We started class definition with `@model` decorator and class properties with `@property` decorator.

In `@property` decorator, we used name property for declare table real column name.

> If table column name is same as class property name, no need to specify `name` property of `@property` decorator.

In `@model` decorator, we can specify table name if table name is different from class name.

> While comparing table and class name, class name is `case-insensitive`.

### Repository

Get repository from dorm instance and use it for all CRUD operations of all defined entities.

```TypeScript
const repo = dorm.getRepository();
```

```TypeScript
const book = await repo.find(Book, {
    where: {
      name: "1984",
    },
  });
```

### Transactions

Start transactional operations with `.begin()`. Use returned object from function in repository's other functions as parameter.

```TypeScript
const tx = await repo.begin();
```

Transaction object has two main methods:

- commit
- rollback

Example usage of transactions:

```TypeScript
const tx = await repo.begin();

try {
  await repo.create(
    Book,
    { name: "Robinson Crusoe", authorId: 99 },
    { transaction: tx }
  );

  await repo.deleteById(Book, 1000, { transaction: tx });

  // write changes to db
  await tx.commit();
} catch (e) {
  // An error occured, rollback all changes!
  await tx.rollback();
}
```

## What's next?

- Relation support
- Joinable queries
- Increase test coverages
- Custom Entity Repositories documentation

## License

Copyright © 2022 Abdulkadir Dede.

This project is licensed under the MIT License - see the [LICENSE file](https://github.com/akadirdev/dorm/blob/master/LICENSE.md "LICENSE") for details.
