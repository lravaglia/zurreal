import { Surreal } from "surrealdb.js";
import { z } from "zod";
import table from "@/table";

export default class Zurreal extends Surreal {
  /**
   * When provided with an array of table names and zod object schemas, this method converts the zod schemas to surrealql statements and runs them against the database to create schemafull tables.
   * @param tables An array of table names and the zod object  schema defining fields and contraints.
   * @requires The connection MUST have a user logged in with the authority to create tables to the desired database.
   */
  public async defineTableSchemas(
    tables: { name: string; schema: z.AnyZodObject }[],
  ) {
    const schemas = await Promise.all(
      tables.map(({ name, schema }) => table(name, schema)),
    );
    await Promise.all(schemas.map((s) => this.query(s)));
  }
}
