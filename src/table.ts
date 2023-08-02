import { z } from "zod";
import field from "@/field";

const table = async (name: string, schema: z.AnyZodObject): Promise<string> =>
  [
    /* surrealql */ `DEFINE TABLE ${name} SCHEMAFULL;`,
    ...(await Promise.all(
      Object.keys(schema.shape).map((property) =>
        field(name, property, schema.shape[property])
      )
    )),
  ].join("\n");

export default table;
