import { assertEquals, assertMatch } from "@std/assert";
import { afterAll, afterEach, beforeAll, describe, it } from "@std/testing/bdd";
import { server } from "./main.ts";

describe("Chat", () => {
  let api: ReturnType<typeof server>;
  let response: Response;

  beforeAll(async () => {
    api = await server(0);
  });

  afterAll(async () => {
    await api?.shutdown();
  });

  afterEach(async () => {
    if (response) {
      if (!response.bodyUsed) {
        // ensure body is consumed to avoir memory leak
        await response.arrayBuffer();
      }
    }
  });

  describe("POST /api/rooms", () => {
    it("should create a new room", async () => {
      response = await fetch(`http://localhost:${api.addr.port}/api/rooms`, {
        method: "POST",
        body: JSON.stringify({ label: "This is a name" }),
      });
      assertEquals(response.status, 201);
      const room = await response.json();
      assertMatch(room.id, /\w{16}/);
      assertEquals(room.label, "This is a name");
    });
    (["", "+", "something with #", "//", "; SELECT", null!] satisfies string[])
      .forEach((label) => {
        it(`should reject invalid label: "${label}"`, async () => {
          response = await fetch(
            `http://localhost:${api.addr.port}/api/rooms`,
            {
            method: "POST",
            body: JSON.stringify({ label }),
            },
          );
          assertEquals(response.status, 400);
        });
      });
  });
});
