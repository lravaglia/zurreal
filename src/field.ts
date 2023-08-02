import { z } from "zod";

const field = async (
  table: string,
  field: string,
  primitive: z.ZodTypeAny,
  optional = false,
  nullable = false
): Promise<string> => {
  let type: string = "";
  let assertions: string[] = [];
  if (primitive.isNullable() || primitive.isOptional())
    throw new Error("use positional parameters rather than wrapper types");

  if (!optional) assertions.push(/* surrealql */ `$value != NONE`);
  if (!nullable) assertions.push(/* surrealql */ `$value != NULL`);

  if (primitive instanceof z.ZodString) {
    type = "string";

    assertions.push(
      ...primitive._def.checks.map((constraint) => {
        switch (constraint.kind) {
          case "min":
            return /* surrealql */ `string::len($value) > ${constraint.value}`;
          case "max":
            return /* surrealql */ `string::len($value) < ${constraint.value}`;
          case "email":
            return /* surrealql */ `is::email($value)`;
          case "uuid":
            return /* surrealql */ `is::uuid($value)`;
          default:
            throw new Error("unknown contraint");
        }
      })
    );
  } else if (primitive instanceof z.ZodNumber) {
    const checks = primitive._def.checks.filter(
      (c) => c.kind != "int"
    ) as Exclude<z.ZodNumberCheck, { kind: "int"; message?: string }>[];
    if (checks.length != primitive._def.checks.length) type = "int";
    else type = "float";

    assertions.push(
      ...checks.map((c) => {
        switch (c.kind) {
          case "min":
            return /* surrealql */ `$value ${c.inclusive ? ">=" : ">"} ${
              c.value
            }`;
          case "max":
            return /* surrealql */ `$value ${c.inclusive ? "<=" : "<"} ${
              c.value
            }`;
          case "multipleOf":
            throw new Error("not supported");
          case "finite":
            throw new Error("not supported");
        }
      })
    );
  } else if (primitive instanceof z.ZodBoolean) type = "bool";
  else throw new Error("unrecognized type");

  return /* surrealql */ `DEFINE FIELD ${field} ON ${table} TYPE ${type}${
    assertions.length > 0 ? " ASSERT " + assertions.join(" AND ") + ";" : ";"
  }`;
};

export default field;
