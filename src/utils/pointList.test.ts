import { describe, expect, it } from "vitest";
import { removePointById, reindexPoints } from "./pointList";

describe("point list utilities", () => {
  it("reindexes points using their current order", () => {
    expect(
      reindexPoints([
        { id: "old-a", x: 10, y: 20 },
        { id: "old-b", x: 30, y: 40 },
      ]),
    ).toEqual([
      { id: "p-1", x: 10, y: 20 },
      { id: "p-2", x: 30, y: 40 },
    ]);
  });

  it("removes a point by id and reindexes the remaining points", () => {
    expect(
      removePointById(
        [
          { id: "p-1", x: 10, y: 20 },
          { id: "p-2", x: 30, y: 40 },
          { id: "p-3", x: 50, y: 60 },
        ],
        "p-2",
      ),
    ).toEqual([
      { id: "p-1", x: 10, y: 20 },
      { id: "p-2", x: 50, y: 60 },
    ]);
  });
});
