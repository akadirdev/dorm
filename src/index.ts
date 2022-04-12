import { DataSource } from './core/datasource';
import { DefaultRepository } from './core/default.repository';
import { client } from './datasource/connector';
import { column } from './decorators/column.decorator';
import { entity } from './decorators/entity.decorator';

console.log('hello dorm');

@entity({ name: 'commodity' })
export class Commodity {
  @column({
    id: true,
  })
  id?: number;

  @column({
    name: 'article_code',
    required: true,
  })
  article: string;

  constructor(data: Commodity) {
    this.id = data.id;
    this.article = data.article;
  }
}

const com = new Commodity({
  article: 'SNR200',
});

console.log(com.id);
console.log(com.article);

export class CommodityRepository extends DefaultRepository<Commodity> {}

async function main() {
  const commodityRepository = new CommodityRepository(new DataSource());
  const commodities = await commodityRepository.findAll();
  console.log(commodities);

  await client.connect();
  const res = await client.query('SELECT * from dorm_test');
  await client.end();
  console.log(res.rows);
}

main();
