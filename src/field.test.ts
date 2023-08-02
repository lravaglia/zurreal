import { expect, test, suite } from "vitest";
import field from "@/field";
import { z } from "zod";

const tableName = "table";
const fieldName = "field";

suite("null and undefined", async () => {
  test("allows explicit null", async () => {
    expect(await field(tableName, fieldName, z.string(), false, true)).toBe(
      /* surrealql */ `DEFINE FIELD ${fieldName} ON ${tableName} TYPE string ASSERT $value != NONE;`
    );
  });

  test("allows explicit undefined", async () => {
    expect(await field(tableName, fieldName, z.string(), true)).toBe(
      /* surrealql */ `DEFINE FIELD ${fieldName} ON ${tableName} TYPE string ASSERT $value != NULL;`
    );
  });

  test("both undefined and null", async () => {
    expect(await field(tableName, fieldName, z.string(), true, true)).toBe(
      /* surrealql */ `DEFINE FIELD ${fieldName} ON ${tableName} TYPE string;`
    );
  });

  suite("rejects wrapper types", async () => {
    test("optional", () =>
      expect(() =>
        field(tableName, fieldName, z.string().optional())
      ).rejects.toThrowError());

    test("nullable", () =>
      expect(() =>
        field(tableName, fieldName, z.string().nullable())
      ).rejects.toThrowError());

    test("nullish", () =>
      expect(() =>
        field(tableName, fieldName, z.string().nullish())
      ).rejects.toThrowError());
  });
});

suite("strings", async () => {
  test("basic string", async () => {
    expect(await field(tableName, fieldName, z.string())).toMatch(
      /* surrealql */ `DEFINE FIELD ${fieldName} ON ${tableName} TYPE string ASSERT $value != NONE AND $value != NULL;`
    );
  });

  test("minimum length", async () => {
    const minimums = [...Array(128).keys()];
    await Promise.all(
      minimums.map(async (m) =>
        expect(await field(tableName, fieldName, z.string().min(m))).toMatch(
          /* surrealql */ `DEFINE FIELD ${fieldName} ON ${tableName} TYPE string ASSERT $value != NONE AND $value != NULL AND string::len($value) > ${m};`
        )
      )
    );
  });

  test("maximum length", async () => {
    const maximums = [...Array(128).keys()];
    await Promise.all(
      maximums.map(async (m) =>
        expect(await field(tableName, fieldName, z.string().max(m))).toMatch(
          /* surrealql */ `DEFINE FIELD ${fieldName} ON ${tableName} TYPE string ASSERT $value != NONE AND $value != NULL AND string::len($value) < ${m};`
        )
      )
    );
  });

  test("email", async () => {
    expect(await field(tableName, fieldName, z.string().email())).toMatch(
      /* surrealql */ `DEFINE FIELD ${fieldName} ON ${tableName} TYPE string ASSERT $value != NONE AND $value != NULL AND is::email($value);`
    );
  });

  test("uuid", async () => {
    expect(await field(tableName, fieldName, z.string().uuid())).toMatch(
      /* surrealql */ `DEFINE FIELD ${fieldName} ON ${tableName} TYPE string ASSERT $value != NONE AND $value != NULL AND is::uuid($value);`
    );
  });

  test("combinations", async () => {
    expect(await field(tableName, fieldName, z.string().min(3).max(4))).toBe(
      /* surrealql */ `DEFINE FIELD ${fieldName} ON ${tableName} TYPE string ASSERT $value != NONE AND $value != NULL AND string::len($value) > 3 AND string::len($value) < 4;`
    );
  });

  test("throws on umplimented extensions", () => {
    expect(() =>
      field(tableName, fieldName, z.string().url())
    ).rejects.toThrowError();
  });
});

suite("numbers", async () => {
  test("float", async () => {
    expect(await field(tableName, fieldName, z.number())).toMatch(
      /* surrealql */ `DEFINE FIELD ${fieldName} ON ${tableName} TYPE float ASSERT $value != NONE AND $value != NULL;`
    );
  });
  test("int", async () => {
    expect(await field(tableName, fieldName, z.number().int())).toMatch(
      /* surrealql */ `DEFINE FIELD ${fieldName} ON ${tableName} TYPE int ASSERT $value != NONE AND $value != NULL;`
    );
  });
  test("exclusive min", async () => {
    expect(await field(tableName, fieldName, z.number().gt(5))).toMatch(
      /* surrealql */ `DEFINE FIELD ${fieldName} ON ${tableName} TYPE float ASSERT $value != NONE AND $value != NULL AND $value > 5;`
    );
  });
  test("exclusive max", async () => {
    expect(await field(tableName, fieldName, z.number().lt(5))).toMatch(
      /* surrealql */ `DEFINE FIELD ${fieldName} ON ${tableName} TYPE float ASSERT $value != NONE AND $value != NULL AND $value < 5;`
    );
  });
  test("inclusive min", async () => {
    expect(await field(tableName, fieldName, z.number().gte(5))).toMatch(
      /* surrealql */ `DEFINE FIELD ${fieldName} ON ${tableName} TYPE float ASSERT $value != NONE AND $value != NULL AND $value >= 5;`
    );
  });
  test("inclusive max", async () => {
    expect(await field(tableName, fieldName, z.number().lte(5))).toMatch(
      /* surrealql */ `DEFINE FIELD ${fieldName} ON ${tableName} TYPE float ASSERT $value != NONE AND $value != NULL AND $value <= 5;`
    );
  });
  test("throws on umplimented extension", () => {
    expect(() =>
      field(tableName, fieldName, z.number().finite())
    ).rejects.toThrowError();
    expect(() =>
      field(tableName, fieldName, z.number().multipleOf(5))
    ).rejects.toThrowError();
  });
});

test("booleans", async () => {
  expect(await field(tableName, fieldName, z.boolean())).toMatch(
    /* surrealql */ `DEFINE FIELD ${fieldName} ON ${tableName} TYPE bool ASSERT $value != NONE AND $value != NULL;`
  );
});

test("throws on unrecognized type", () => {
  expect(() =>
    field(tableName, fieldName, z.enum(["a", "b"]))
  ).rejects.toThrowError();
});
