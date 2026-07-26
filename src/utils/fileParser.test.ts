import { describe, expect, it } from "vitest";
import { parseDatasetText } from "./fileParser";

describe("file parser", () => {
  it("parses comma-separated point data and skips a header row", () => {
    const result = parseDatasetText("x,y\n10,20\n30,40");

    expect(result).toEqual({
      points: [
        { id: "p-1", x: 10, y: 20 },
        { id: "p-2", x: 30, y: 40 },
      ],
      rejectedRows: [],
    });
  });

  it("parses whitespace-separated point data", () => {
    const result = parseDatasetText("10 20\n30 40");

    expect(result.points).toEqual([
      { id: "p-1", x: 10, y: 20 },
      { id: "p-2", x: 30, y: 40 },
    ]);
  });

  it("deduplicates coordinates and reports invalid rows", () => {
    const result = parseDatasetText("10,20\nbad,row\n10,20\n50,60,extra");

    expect(result.points).toEqual([
      { id: "p-1", x: 10, y: 20 },
      { id: "p-2", x: 50, y: 60 },
    ]);
    expect(result.rejectedRows).toEqual([2]);
  });
});
