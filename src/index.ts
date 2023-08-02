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

const table = async (name: string, schema: z.AnyZodObject) => {
  let rvalue = /* surrealql */ `DEFINE TABLE ${name} SCHEMAFULL;\n`;
  for (const field of Object.keys(schema.shape)) {
    const value = schema.shape[field];

    if (value instanceof z.ZodString) {
      rvalue = rvalue.concat(
        /* surrealql */ `DEFINE FIELD ${field} ON ${name} TYPE string;\n`
      );
    } else if (value instanceof z.ZodNumber) {
      const int = value._def.checks.find((v) => v.kind == "int") != undefined;
      const min = value._def.checks.find((v) => v.kind == "min") != undefined;
      const max = value._def.checks.find((v) => v.kind == "max") != undefined;
      const multiple =
        value._def.checks.find((v) => v.kind == "multipleOf") != undefined;

      rvalue = rvalue.concat(
        /* surrealql */ `DEFINE FIELD ${field} ON ${name} TYPE ${
          int ? "int" : "float"
        }`
      );
      if (min || max || multiple)
        rvalue = rvalue.concat(/* surrealql */ ` ASSERT `);
      if (min)
        rvalue = rvalue.concat(
          /* surrealql */ `$value > ${
            (
              value._def.checks.filter(
                (v) => v.kind == "min"
              )[0] as z.ZodNumberCheck & {
                value: number;
              }
            ).value
          }`
        );
      if (max)
        rvalue = rvalue.concat(
          /* surrealql */ `$value < ${
            (
              value._def.checks.filter(
                (v) => v.kind == "max"
              )[0] as z.ZodNumberCheck & {
                value: number;
              }
            ).value
          }`
        );

      rvalue = rvalue.concat(";\n");
    }
  }
};
