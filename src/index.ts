import { Surreal } from "surrealdb.js";
import { z } from "zod";

export default class Zurreal extends Surreal {
  /**
   *
   * @param tables An array of table names and the zod object  schema defining fields and contraints.
   * @requires The connection MUST have a user logged in with the authority to create tables to the desired database.
   */
  public async defineTableSchemas(
    tables: { name: string; schema: z.AnyZodObject }[]
  ) {}
}
