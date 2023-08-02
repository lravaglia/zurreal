import { expect, test } from "vitest";
import table from "@/table";
import { z } from "zod";

const tableName = "tableName";

test("basic object", async () => {
  expect(
    await table(
      tableName,
      z.object({
        stringName: z.string(),
        floatName: z.number(),
        intName: z.number().int(),
        boolName: z.boolean(),
      })
    )
  ).toMatch(/* surrealql */ `DEFINE TABLE ${tableName} SCHEMAFULL;
DEFINE FIELD stringName ON ${tableName} TYPE string ASSERT $value != NONE AND $value != NULL;
DEFINE FIELD floatName ON ${tableName} TYPE float ASSERT $value != NONE AND $value != NULL;
DEFINE FIELD intName ON ${tableName} TYPE int ASSERT $value != NONE AND $value != NULL;
DEFINE FIELD boolName ON ${tableName} TYPE bool ASSERT $value != NONE AND $value != NULL;`);
});
