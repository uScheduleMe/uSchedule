import {
  AnyColumn,
  AnyTable,
  InferColumnsDataTypes,
  InferSelectModel,
  SQL,
  TableConfig,
  sql,
} from 'drizzle-orm';

// taken from https://gist.github.com/rphlmr/0d1722a794ed5a16da0fdf6652902b15

export function jsonAggBuildObject<T extends Record<string, AnyColumn>>(shape: T) {
  const chunks: SQL[] = [];
  const filters: SQL[] = [];

  Object.entries(shape).forEach(([key, value]) => {
    if (chunks.length > 0) {
      chunks.push(sql.raw(`,`));
    }
    chunks.push(sql.raw(`'${key}',`));
    chunks.push(sql`${value}`);

    if (filters.length > 0) {
      filters.push(sql.raw(' or '));
    }

    filters.push(sql`${value} is not null`);
  });

  return sql<InferColumnsDataTypes<T>[]>`coalesce(json_agg(json_build_object(${sql.join(
    chunks,
  )})) filter (where ${sql.join(filters)}), '[]')`;
}

export function jsonAgg<Table extends AnyTable<TableConfig>>(table: Table) {
  return sql<
    InferSelectModel<Table>[]
  >`coalesce(json_agg(${table}) filter (where ${table} is not null), '[]')`;
}
